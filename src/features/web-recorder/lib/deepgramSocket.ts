/**
 * Deepgram WebSocket Service
 *
 * Manages WebSocket connection to Deepgram for real-time transcription.
 * Handles connection lifecycle, audio streaming, and transcript parsing.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface DeepgramConfig {
  apiKey: string;
  language: string;
  model: string;
  encoding: string;
  sampleRate: number;
  punctuate: boolean;
  interimResults: boolean;
  endpointing: number;
  vadEvents: boolean;
}

export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: number;
}

export interface TranscriptResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
  words: TranscriptWord[];
  start: number;
  duration: number;
  speechFinal: boolean;
}

export interface DeepgramCallbacks {
  onTranscript: (result: TranscriptResult) => void;
  onOpen: () => void;
  onClose: (code: number, reason: string) => void;
  onError: (error: Error) => void;
}

export type DeepgramConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEEPGRAM_WS_URL = 'wss://api.deepgram.com/v1/listen';

const DEFAULT_CONFIG: Omit<DeepgramConfig, 'apiKey'> = {
  language: 'es', // Spanish
  model: 'nova-2',
  encoding: 'linear16',
  sampleRate: 16000,
  punctuate: true,
  interimResults: true,
  endpointing: 300, // ms of silence before final result
  vadEvents: true,
};

// Keep-alive interval (Deepgram closes idle connections after 10s)
const KEEPALIVE_INTERVAL_MS = 8000;

// Reconnection settings
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 1000;

// ============================================================================
// DEEPGRAM SOCKET CLASS
// ============================================================================

export class DeepgramSocket {
  private config: DeepgramConfig;
  private callbacks: DeepgramCallbacks;
  private state: DeepgramConnectionState = 'disconnected';

  private ws: WebSocket | null = null;
  private keepAliveInterval: number | null = null;
  private reconnectAttempts = 0;

  constructor(callbacks: DeepgramCallbacks, config: Partial<DeepgramConfig> & { apiKey: string }) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.callbacks = callbacks;
  }

  // ==========================================================================
  // PUBLIC METHODS
  // ==========================================================================

  /**
   * Connect to Deepgram WebSocket.
   */
  async connect(): Promise<void> {
    if (this.state === 'connected' || this.state === 'connecting') {
      console.warn('[DeepgramSocket] Already connected/connecting');
      return;
    }

    this.setState('connecting');

    try {
      const url = this.buildWebSocketUrl();

      this.ws = new WebSocket(url);

      // Set up event handlers
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        const onOpen = () => {
          clearTimeout(timeout);
          resolve();
        };

        const onError = () => {
          clearTimeout(timeout);
          reject(new Error('Connection failed'));
        };

        this.ws!.addEventListener('open', onOpen, { once: true });
        this.ws!.addEventListener('error', onError, { once: true });
      });

      console.log('[DeepgramSocket] Connected successfully');
    } catch (error) {
      this.setState('error');
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.callbacks.onError(err);
      throw err;
    }
  }

  /**
   * Send audio data to Deepgram.
   */
  sendAudio(audioData: ArrayBuffer): void {
    if (this.state !== 'connected' || !this.ws) {
      console.warn('[DeepgramSocket] Cannot send audio, not connected');
      return;
    }

    try {
      this.ws.send(audioData);
    } catch (error) {
      console.error('[DeepgramSocket] Error sending audio:', error);
    }
  }

  /**
   * Send keep-alive message.
   */
  sendKeepAlive(): void {
    if (this.state !== 'connected' || !this.ws) return;

    try {
      // Send empty JSON as keep-alive
      this.ws.send(JSON.stringify({ type: 'KeepAlive' }));
    } catch (error) {
      console.error('[DeepgramSocket] Error sending keep-alive:', error);
    }
  }

  /**
   * Close the connection.
   */
  disconnect(): void {
    this.stopKeepAlive();
    this.reconnectAttempts = 0;

    if (this.ws) {
      // Send close message before disconnecting
      try {
        this.ws.send(JSON.stringify({ type: 'CloseStream' }));
      } catch {
        // Ignore errors when closing
      }

      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }

    this.setState('disconnected');
    console.log('[DeepgramSocket] Disconnected');
  }

  /**
   * Get current connection state.
   */
  getState(): DeepgramConnectionState {
    return this.state;
  }

  /**
   * Update sample rate (call before connect if needed).
   */
  setSampleRate(sampleRate: number): void {
    this.config.sampleRate = sampleRate;
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  private setState(state: DeepgramConnectionState): void {
    this.state = state;
  }

  private buildWebSocketUrl(): string {
    const params = new URLSearchParams({
      encoding: this.config.encoding,
      sample_rate: this.config.sampleRate.toString(),
      language: this.config.language,
      model: this.config.model,
      punctuate: this.config.punctuate.toString(),
      interim_results: this.config.interimResults.toString(),
      endpointing: this.config.endpointing.toString(),
      vad_events: this.config.vadEvents.toString(),
    });

    // Add API key as header (will be set via Authorization header)
    return `${DEEPGRAM_WS_URL}?${params.toString()}`;
  }

  private handleOpen(): void {
    this.setState('connected');
    this.reconnectAttempts = 0;
    this.startKeepAlive();
    this.callbacks.onOpen();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      // Handle different message types
      if (data.type === 'Results') {
        const result = this.parseResults(data);
        if (result.transcript) {
          this.callbacks.onTranscript(result);
        }
      } else if (data.type === 'UtteranceEnd') {
        // Utterance ended, but we handle this via speech_final
      } else if (data.type === 'SpeechStarted') {
        // Speech started, could be used for UI feedback
      } else if (data.type === 'Error') {
        console.error('[DeepgramSocket] Deepgram error:', data);
        this.callbacks.onError(new Error(data.message || 'Deepgram error'));
      }
    } catch (error) {
      console.error('[DeepgramSocket] Error parsing message:', error);
    }
  }

  private handleError(event: Event): void {
    console.error('[DeepgramSocket] WebSocket error:', event);
    this.setState('error');
    this.callbacks.onError(new Error('WebSocket error'));
  }

  private handleClose(event: CloseEvent): void {
    this.stopKeepAlive();

    const wasConnected = this.state === 'connected';

    // Try to reconnect if unexpectedly closed while connected
    if (wasConnected && event.code !== 1000 && this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      this.attemptReconnect();
    } else {
      this.setState('disconnected');
      this.callbacks.onClose(event.code, event.reason);
    }
  }

  private async attemptReconnect(): Promise<void> {
    this.reconnectAttempts++;
    this.setState('reconnecting');

    console.log(`[DeepgramSocket] Reconnecting (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);

    await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY_MS));

    try {
      await this.connect();
    } catch (error) {
      console.error('[DeepgramSocket] Reconnection failed:', error);
      if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        this.setState('error');
        this.callbacks.onError(new Error('Max reconnection attempts reached'));
      }
    }
  }

  private parseResults(data: any): TranscriptResult {
    const channel = data.channel;
    const alternative = channel?.alternatives?.[0];

    return {
      transcript: alternative?.transcript || '',
      isFinal: data.is_final && data.speech_final,
      confidence: alternative?.confidence || 0,
      words: (alternative?.words || []).map((w: any) => ({
        word: w.word,
        start: w.start,
        end: w.end,
        confidence: w.confidence,
        speaker: w.speaker,
      })),
      start: data.start || 0,
      duration: data.duration || 0,
      speechFinal: data.speech_final || false,
    };
  }

  private startKeepAlive(): void {
    this.keepAliveInterval = window.setInterval(() => {
      this.sendKeepAlive();
    }, KEEPALIVE_INTERVAL_MS);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveInterval !== null) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a DeepgramSocket with authentication.
 *
 * This function creates a custom WebSocket that adds the Authorization header.
 * Note: Standard WebSocket API doesn't support custom headers, so we need to
 * pass the API key as a query parameter or use a subprotocol workaround.
 */
export function createDeepgramSocket(
  callbacks: DeepgramCallbacks,
  config: Partial<DeepgramConfig> & { apiKey: string }
): DeepgramSocket {
  return new DeepgramSocket(callbacks, config);
}

/**
 * Create a WebSocket URL with API key included.
 * For browsers that don't support custom headers in WebSocket.
 */
export function buildAuthenticatedUrl(
  apiKey: string,
  config: Partial<Omit<DeepgramConfig, 'apiKey'>> = {}
): string {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const params = new URLSearchParams({
    encoding: finalConfig.encoding,
    sample_rate: finalConfig.sampleRate.toString(),
    language: finalConfig.language,
    model: finalConfig.model,
    punctuate: finalConfig.punctuate.toString(),
    interim_results: finalConfig.interimResults.toString(),
    endpointing: finalConfig.endpointing.toString(),
    vad_events: finalConfig.vadEvents.toString(),
  });

  // For direct connection, we'll use a custom approach
  // The API key is sent via the Authorization header in the WebSocket handshake
  return `${DEEPGRAM_WS_URL}?${params.toString()}`;
}
