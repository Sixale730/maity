/**
 * useAudioCapture Hook
 *
 * Provides audio capture functionality with state management.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  AudioCapture,
  AudioCaptureState,
  AudioCaptureConfig,
  isAudioCaptureSupported,
  requestMicrophonePermission,
} from '../lib/audioCapture';

interface UseAudioCaptureOptions {
  config?: Partial<AudioCaptureConfig>;
  onAudioData?: (data: ArrayBuffer) => void;
  onAudioLevel?: (level: number) => void;
}

interface UseAudioCaptureReturn {
  state: AudioCaptureState;
  audioLevel: number;
  sampleRate: number;
  isSupported: boolean;
  hasPermission: boolean | null;
  initialize: () => Promise<void>;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  stop: () => void;
  requestPermission: () => Promise<boolean>;
}

export function useAudioCapture(options: UseAudioCaptureOptions = {}): UseAudioCaptureReturn {
  const { config, onAudioData, onAudioLevel } = options;

  const [state, setState] = useState<AudioCaptureState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [sampleRate, setSampleRate] = useState(16000);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const captureRef = useRef<AudioCapture | null>(null);
  const isSupported = isAudioCaptureSupported();

  // Initialize audio capture
  const initialize = useCallback(async () => {
    if (captureRef.current) {
      return;
    }

    captureRef.current = new AudioCapture(
      {
        onAudioData: (data) => {
          onAudioData?.(data);
        },
        onAudioLevel: (level) => {
          setAudioLevel(level);
          onAudioLevel?.(level);
        },
        onError: (error) => {
          console.error('[useAudioCapture] Error:', error);
          setState('error');
        },
        onStateChange: (newState) => {
          setState(newState);
        },
      },
      config
    );

    await captureRef.current.initialize();
    setSampleRate(captureRef.current.getSampleRate());
    setHasPermission(true);
  }, [config, onAudioData, onAudioLevel]);

  // Start recording
  const start = useCallback(async () => {
    if (!captureRef.current) {
      await initialize();
    }
    await captureRef.current?.start();
  }, [initialize]);

  // Pause recording
  const pause = useCallback(() => {
    captureRef.current?.pause();
  }, []);

  // Resume recording
  const resume = useCallback(async () => {
    await captureRef.current?.resume();
  }, []);

  // Stop recording
  const stop = useCallback(() => {
    captureRef.current?.stop();
    captureRef.current = null;
    setAudioLevel(0);
  }, []);

  // Request permission only (without starting)
  const requestPermission = useCallback(async () => {
    const granted = await requestMicrophonePermission();
    setHasPermission(granted);
    return granted;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      captureRef.current?.stop();
      captureRef.current = null;
    };
  }, []);

  return {
    state,
    audioLevel,
    sampleRate,
    isSupported,
    hasPermission,
    initialize,
    start,
    pause,
    resume,
    stop,
    requestPermission,
  };
}
