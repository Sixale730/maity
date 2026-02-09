/**
 * Authenticated WebSocket for Deepgram
 *
 * Since the standard WebSocket API doesn't support custom headers,
 * we need a workaround for authentication. This module provides
 * a solution using the Deepgram API key.
 *
 * Approach: Use a custom WebSocket wrapper that injects the API key
 * into the connection URL as supported by Deepgram's API.
 */

// ============================================================================
// AUTHENTICATED WEBSOCKET
// ============================================================================

/**
 * Create an authenticated WebSocket connection to Deepgram.
 *
 * Deepgram supports API key authentication via:
 * 1. HTTP header (not supported by browser WebSocket)
 * 2. Query parameter (supported but less secure)
 *
 * We use approach #2 for browser compatibility.
 * Security is maintained by only providing the key to authenticated users
 * and the key being short-lived in memory.
 */
export function createAuthenticatedDeepgramWebSocket(
  apiKey: string,
  params: URLSearchParams
): WebSocket {
  const baseUrl = 'wss://api.deepgram.com/v1/listen';
  const url = `${baseUrl}?${params.toString()}`;

  // Create WebSocket with Deepgram protocol
  // The API key is sent via a subprotocol header workaround
  const ws = new WebSocket(url, [`token`, apiKey]);

  return ws;
}

/**
 * Alternative: Create WebSocket that uses token authentication.
 * This works if you have a temporary token from Deepgram (paid accounts only).
 */
export function createTokenAuthenticatedWebSocket(
  token: string,
  params: URLSearchParams
): WebSocket {
  const baseUrl = 'wss://api.deepgram.com/v1/listen';
  const url = `${baseUrl}?${params.toString()}`;

  // Use token as subprotocol
  const ws = new WebSocket(url, [`token`, token]);

  return ws;
}

// ============================================================================
// DEEPGRAM URL BUILDER
// ============================================================================

export interface DeepgramUrlParams {
  encoding?: 'linear16' | 'opus' | 'mp3' | 'flac';
  sampleRate?: number;
  language?: string;
  model?: string;
  punctuate?: boolean;
  interimResults?: boolean;
  endpointing?: number;
  vadEvents?: boolean;
  diarize?: boolean;
  smartFormat?: boolean;
}

const DEFAULT_PARAMS: DeepgramUrlParams = {
  encoding: 'linear16',
  sampleRate: 16000,
  language: 'es',
  model: 'nova-2',
  punctuate: true,
  interimResults: true,
  endpointing: 300,
  vadEvents: true,
  diarize: true,
  smartFormat: false,
};

/**
 * Build URL parameters for Deepgram WebSocket connection.
 */
export function buildDeepgramParams(config: DeepgramUrlParams = {}): URLSearchParams {
  const finalConfig = { ...DEFAULT_PARAMS, ...config };

  const params = new URLSearchParams();

  params.set('encoding', finalConfig.encoding!);
  params.set('sample_rate', finalConfig.sampleRate!.toString());
  params.set('language', finalConfig.language!);
  params.set('model', finalConfig.model!);
  params.set('punctuate', finalConfig.punctuate!.toString());
  params.set('interim_results', finalConfig.interimResults!.toString());
  params.set('endpointing', finalConfig.endpointing!.toString());
  params.set('vad_events', finalConfig.vadEvents!.toString());

  if (finalConfig.diarize) {
    params.set('diarize', 'true');
  }

  if (finalConfig.smartFormat) {
    params.set('smart_format', 'true');
  }

  return params;
}
