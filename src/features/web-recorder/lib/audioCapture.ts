/**
 * Audio Capture Service
 *
 * Handles microphone access and audio processing for browser-based recording.
 * Optimized for iOS Safari and real-time streaming to Deepgram.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface AudioCaptureConfig {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface AudioCaptureCallbacks {
  onAudioData: (pcm16Data: ArrayBuffer) => void;
  onAudioLevel: (level: number) => void;
  onError: (error: Error) => void;
  onStateChange: (state: AudioCaptureState) => void;
}

export type AudioCaptureState =
  | 'idle'
  | 'requesting-permission'
  | 'ready'
  | 'recording'
  | 'paused'
  | 'error';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CONFIG: AudioCaptureConfig = {
  sampleRate: 16000, // Deepgram optimal
  channelCount: 1,   // Mono
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

// Buffer size for ScriptProcessor (must be power of 2)
const BUFFER_SIZE = 4096;

// ============================================================================
// AUDIO CAPTURE CLASS
// ============================================================================

export class AudioCapture {
  private config: AudioCaptureConfig;
  private callbacks: AudioCaptureCallbacks;
  private state: AudioCaptureState = 'idle';

  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  private levelCheckInterval: number | null = null;

  constructor(callbacks: AudioCaptureCallbacks, config: Partial<AudioCaptureConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.callbacks = callbacks;
  }

  // ==========================================================================
  // PUBLIC METHODS
  // ==========================================================================

  /**
   * Request microphone permission and initialize audio context.
   */
  async initialize(): Promise<void> {
    if (this.state !== 'idle' && this.state !== 'error') {
      console.warn('[AudioCapture] Already initialized');
      return;
    }

    this.setState('requesting-permission');

    try {
      // Request microphone access
      const constraints: MediaStreamConstraints = {
        audio: {
          channelCount: this.config.channelCount,
          sampleRate: this.config.sampleRate,
          echoCancellation: this.config.echoCancellation,
          noiseSuppression: this.config.noiseSuppression,
          autoGainControl: this.config.autoGainControl,
        },
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create AudioContext (with webkit prefix for Safari)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass({
        sampleRate: this.config.sampleRate,
      });

      // Handle Safari's sample rate override
      const actualSampleRate = this.audioContext.sampleRate;
      if (actualSampleRate !== this.config.sampleRate) {
        console.warn(`[AudioCapture] Browser forced sample rate: ${actualSampleRate}Hz (requested: ${this.config.sampleRate}Hz)`);
      }

      // Create source node
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Create analyser for level monitoring
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.5;

      // Create processor node for PCM data
      // Note: ScriptProcessorNode is deprecated but AudioWorklet has limited Safari support
      this.processorNode = this.audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);
      this.processorNode.onaudioprocess = this.handleAudioProcess.bind(this);

      // Connect nodes: source -> analyser -> processor -> destination
      this.sourceNode.connect(this.analyserNode);
      this.analyserNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      this.setState('ready');
      console.log('[AudioCapture] Initialized successfully', {
        sampleRate: actualSampleRate,
        channelCount: this.config.channelCount,
      });
    } catch (error) {
      this.setState('error');
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.callbacks.onError(err);
      throw err;
    }
  }

  /**
   * Start recording and streaming audio data.
   */
  async start(): Promise<void> {
    if (this.state === 'idle') {
      await this.initialize();
    }

    if (this.state !== 'ready' && this.state !== 'paused') {
      console.warn('[AudioCapture] Cannot start from state:', this.state);
      return;
    }

    // Resume AudioContext if suspended (required for iOS Safari)
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Start level monitoring
    this.startLevelMonitoring();

    this.setState('recording');
    console.log('[AudioCapture] Recording started');
  }

  /**
   * Pause recording (keeps audio context active).
   */
  pause(): void {
    if (this.state !== 'recording') {
      console.warn('[AudioCapture] Cannot pause from state:', this.state);
      return;
    }

    this.stopLevelMonitoring();
    this.setState('paused');
    console.log('[AudioCapture] Recording paused');
  }

  /**
   * Resume recording after pause.
   */
  async resume(): Promise<void> {
    if (this.state !== 'paused') {
      console.warn('[AudioCapture] Cannot resume from state:', this.state);
      return;
    }

    // Resume AudioContext if suspended
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.startLevelMonitoring();
    this.setState('recording');
    console.log('[AudioCapture] Recording resumed');
  }

  /**
   * Stop recording and release resources.
   */
  stop(): void {
    this.stopLevelMonitoring();

    // Disconnect nodes
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    // Stop media tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    // Close AudioContext
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.setState('idle');
    console.log('[AudioCapture] Recording stopped');
  }

  /**
   * Get current state.
   */
  getState(): AudioCaptureState {
    return this.state;
  }

  /**
   * Get actual sample rate (may differ from requested on Safari).
   */
  getSampleRate(): number {
    return this.audioContext?.sampleRate || this.config.sampleRate;
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  private setState(state: AudioCaptureState): void {
    this.state = state;
    this.callbacks.onStateChange(state);
  }

  private handleAudioProcess(event: AudioProcessingEvent): void {
    if (this.state !== 'recording') return;

    const inputData = event.inputBuffer.getChannelData(0);

    // Convert Float32 to PCM16 (16-bit signed integer)
    const pcm16 = this.float32ToPcm16(inputData);

    this.callbacks.onAudioData(pcm16.buffer);
  }

  private float32ToPcm16(float32Array: Float32Array): Int16Array {
    const pcm16 = new Int16Array(float32Array.length);

    for (let i = 0; i < float32Array.length; i++) {
      // Clamp to [-1, 1]
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      // Convert to 16-bit signed integer
      pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }

    return pcm16;
  }

  private startLevelMonitoring(): void {
    if (!this.analyserNode) return;

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

    const checkLevel = () => {
      if (!this.analyserNode || this.state !== 'recording') return;

      this.analyserNode.getByteFrequencyData(dataArray);

      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);

      // Normalize to 0-1
      const level = Math.min(1, rms / 128);

      this.callbacks.onAudioLevel(level);
    };

    // Check level every 50ms
    this.levelCheckInterval = window.setInterval(checkLevel, 50);
  }

  private stopLevelMonitoring(): void {
    if (this.levelCheckInterval !== null) {
      clearInterval(this.levelCheckInterval);
      this.levelCheckInterval = null;
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if the browser supports audio recording.
 */
export function isAudioCaptureSupported(): boolean {
  return !!(
    navigator.mediaDevices?.getUserMedia &&
    (window.AudioContext || (window as any).webkitAudioContext)
  );
}

/**
 * Check if running on iOS Safari.
 */
export function isIOSSafari(): boolean {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua);
}

/**
 * Request microphone permission without starting capture.
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
}
