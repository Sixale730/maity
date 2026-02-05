/**
 * useDeepgramSocket Hook
 *
 * Manages WebSocket connection to Deepgram for real-time transcription.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  buildDeepgramParams,
  createAuthenticatedDeepgramWebSocket,
  DeepgramUrlParams,
} from '../lib/authenticatedWebSocket';

export interface TranscriptSegment {
  text: string;
  isFinal: boolean;
  confidence: number;
  start: number;
  duration: number;
}

export type DeepgramConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

interface UseDeepgramSocketOptions {
  apiKey: string;
  config?: DeepgramUrlParams;
  onTranscript?: (segment: TranscriptSegment) => void;
  onInterim?: (text: string) => void;
}

interface UseDeepgramSocketReturn {
  connectionState: DeepgramConnectionState;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendAudio: (data: ArrayBuffer) => void;
}

const KEEPALIVE_INTERVAL = 8000; // 8 seconds

export function useDeepgramSocket(options: UseDeepgramSocketOptions): UseDeepgramSocketReturn {
  const { apiKey, config, onTranscript, onInterim } = options;

  const [connectionState, setConnectionState] = useState<DeepgramConnectionState>('disconnected');

  const wsRef = useRef<WebSocket | null>(null);
  const keepAliveRef = useRef<number | null>(null);

  // Handle incoming messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type !== 'Results') return;

        const channel = data.channel;
        const alternative = channel?.alternatives?.[0];
        const transcript = alternative?.transcript || '';

        if (!transcript) return;

        const isFinal = data.is_final && data.speech_final;

        if (isFinal) {
          onTranscript?.({
            text: transcript,
            isFinal: true,
            confidence: alternative?.confidence || 0,
            start: data.start || 0,
            duration: data.duration || 0,
          });
        } else {
          onInterim?.(transcript);
        }
      } catch (error) {
        console.error('[useDeepgramSocket] Error parsing message:', error);
      }
    },
    [onTranscript, onInterim]
  );

  // Start keep-alive timer
  const startKeepAlive = useCallback(() => {
    keepAliveRef.current = window.setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'KeepAlive' }));
      }
    }, KEEPALIVE_INTERVAL);
  }, []);

  // Stop keep-alive timer
  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current !== null) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  // Connect to Deepgram
  const connect = useCallback(async () => {
    if (wsRef.current) {
      console.warn('[useDeepgramSocket] Already connected');
      return;
    }

    setConnectionState('connecting');

    try {
      const params = buildDeepgramParams(config);
      const ws = createAuthenticatedDeepgramWebSocket(apiKey, params);

      ws.onopen = () => {
        console.log('[useDeepgramSocket] Connected');
        setConnectionState('connected');
        startKeepAlive();
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        console.error('[useDeepgramSocket] Error:', error);
        setConnectionState('error');
      };

      ws.onclose = () => {
        console.log('[useDeepgramSocket] Closed');
        setConnectionState('disconnected');
        stopKeepAlive();
        wsRef.current = null;
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[useDeepgramSocket] Connection error:', error);
      setConnectionState('error');
    }
  }, [apiKey, config, handleMessage, startKeepAlive, stopKeepAlive]);

  // Disconnect from Deepgram
  const disconnect = useCallback(() => {
    stopKeepAlive();

    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'CloseStream' }));
      } catch {
        // Ignore errors when closing
      }
      wsRef.current.close(1000, 'Normal closure');
      wsRef.current = null;
    }

    setConnectionState('disconnected');
  }, [stopKeepAlive]);

  // Send audio data
  const sendAudio = useCallback((data: ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionState,
    connect,
    disconnect,
    sendAudio,
  };
}
