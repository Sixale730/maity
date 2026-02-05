/**
 * Deepgram Service
 *
 * Utilities for generating temporary Deepgram API tokens for browser-based
 * speech-to-text streaming.
 *
 * NOTE: The Deepgram temporary token API requires a paid account.
 * With the $200 demo credits, you can use the API key directly via
 * a server-side proxy endpoint instead of temporary tokens.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const DEEPGRAM_API_BASE = 'https://api.deepgram.com/v1';
const TOKEN_TTL_SECONDS = 600; // 10 minutes

// ============================================================================
// TYPES
// ============================================================================

export interface DeepgramTokenResponse {
  token: string;
  expires_at: string;
}

export interface DeepgramConfig {
  encoding: 'linear16' | 'opus' | 'mp3' | 'flac';
  sample_rate: number;
  language: string;
  model: string;
  punctuate: boolean;
  interim_results: boolean;
  endpointing: number;
  vad_events: boolean;
}

// Default config optimized for real-time transcription
export const DEFAULT_DEEPGRAM_CONFIG: DeepgramConfig = {
  encoding: 'linear16',
  sample_rate: 16000,
  language: 'es', // Spanish
  model: 'nova-2',
  punctuate: true,
  interim_results: true,
  endpointing: 300, // ms of silence before final result
  vad_events: true,
};

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Generate a temporary Deepgram token.
 *
 * IMPORTANT: This requires a paid Deepgram account.
 * For accounts with only demo credits ($200), use the API key
 * directly via a server-side WebSocket proxy.
 *
 * @param apiKey - Deepgram API key (server-side only)
 * @returns Temporary token and expiration time
 */
export async function generateDeepgramToken(apiKey: string): Promise<DeepgramTokenResponse> {
  const response = await fetch(`${DEEPGRAM_API_BASE}/auth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ttl_seconds: TOKEN_TTL_SECONDS,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[deepgram] Token generation failed:', {
      status: response.status,
      error: errorText,
    });

    // Check for common errors
    if (response.status === 403) {
      throw new Error('Deepgram temporary tokens require a paid account. Use API key proxy instead.');
    }

    throw new Error(`Failed to generate Deepgram token: ${response.status}`);
  }

  const data = await response.json();

  return {
    token: data.key || data.token,
    expires_at: new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString(),
  };
}

// ============================================================================
// WEBSOCKET URL BUILDER
// ============================================================================

/**
 * Build the Deepgram WebSocket URL with configuration parameters.
 *
 * Can be used with either:
 * 1. Temporary token (for paid accounts)
 * 2. API key via server-side proxy (for demo accounts)
 */
export function buildDeepgramWebSocketUrl(config: Partial<DeepgramConfig> = {}): string {
  const finalConfig = { ...DEFAULT_DEEPGRAM_CONFIG, ...config };

  const params = new URLSearchParams({
    encoding: finalConfig.encoding,
    sample_rate: finalConfig.sample_rate.toString(),
    language: finalConfig.language,
    model: finalConfig.model,
    punctuate: finalConfig.punctuate.toString(),
    interim_results: finalConfig.interim_results.toString(),
    endpointing: finalConfig.endpointing.toString(),
    vad_events: finalConfig.vad_events.toString(),
  });

  return `wss://api.deepgram.com/v1/listen?${params.toString()}`;
}

// ============================================================================
// TRANSCRIPT PARSING
// ============================================================================

export interface DeepgramWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: number;
}

export interface DeepgramAlternative {
  transcript: string;
  confidence: number;
  words: DeepgramWord[];
}

export interface DeepgramChannel {
  alternatives: DeepgramAlternative[];
}

export interface DeepgramResult {
  type: 'Results' | 'UtteranceEnd' | 'SpeechStarted' | 'Metadata';
  channel_index: number[];
  duration: number;
  start: number;
  is_final: boolean;
  speech_final: boolean;
  channel: DeepgramChannel;
}

/**
 * Parse a Deepgram WebSocket message.
 */
export function parseDeepgramMessage(data: string): DeepgramResult | null {
  try {
    const parsed = JSON.parse(data);

    // Only process Results type
    if (parsed.type !== 'Results') {
      return null;
    }

    return parsed as DeepgramResult;
  } catch {
    return null;
  }
}

/**
 * Extract the best transcript from a Deepgram result.
 */
export function extractTranscript(result: DeepgramResult): {
  transcript: string;
  isFinal: boolean;
  confidence: number;
  words: DeepgramWord[];
} {
  const alternative = result.channel?.alternatives?.[0];

  return {
    transcript: alternative?.transcript || '',
    isFinal: result.is_final && result.speech_final,
    confidence: alternative?.confidence || 0,
    words: alternative?.words || [],
  };
}
