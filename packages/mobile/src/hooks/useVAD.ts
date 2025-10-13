import { useState, useRef, useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { Audio } from 'expo-av';

export interface VADConfig {
  threshold?: number;          // Kept for compatibility (not used in manual mode)
  silenceDuration?: number;    // Kept for compatibility (not used in manual mode)
  sampleRate?: number;         // Hz (default: 16000)
}

export interface VADState {
  isRecording: boolean;
  isVoiceDetected: boolean;    // Always true when recording in manual mode
  confidence: number;          // Always 1.0 in manual mode
  audioDuration: number;      // seconds
  error: string | null;
}

export interface VADAudioSegment {
  audioData: Float32Array[];  // Will be empty - file path used instead
  duration: number;           // seconds
  startTime: Date;
  endTime: Date;
  fileUri: string;            // Path to recorded audio file
}

export interface UseVADReturn {
  state: VADState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  resetState: () => void;
}

interface UseVADProps {
  config?: VADConfig;
  onVoiceStart?: () => void;
  onVoiceEnd?: (segment: VADAudioSegment) => void;
  onError?: (error: Error) => void;
}

export function useVAD({
  config = {},
  onVoiceStart,
  onVoiceEnd,
  onError,
}: UseVADProps): UseVADReturn {
  const {
    sampleRate = 16000,
  } = config;

  // State
  const [state, setState] = useState<VADState>({
    isRecording: false,
    isVoiceDetected: false,
    confidence: 0,
    audioDuration: 0,
    error: null,
  });

  // Refs
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingStartTimeRef = useRef<Date | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Request microphone permission
   */
  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Permiso de Micrófono',
            message: 'Necesitamos acceso al micrófono para grabar audio',
            buttonNeutral: 'Preguntar luego',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Permitir',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // iOS
        const { status } = await Audio.requestPermissionsAsync();
        return status === 'granted';
      }
    } catch (error) {
      console.error('[useVAD] Permission error:', error);
      return false;
    }
  };

  /**
   * Start recording with manual control
   */
  const startRecording = useCallback(async () => {
    try {
      console.log('[useVAD] Starting manual recording...');

      // Request permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create recording
      const { recording } = await Audio.Recording.createAsync(
        {
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: 'audio/wav',
            bitsPerSecond: 128000,
          },
        }
      );

      recordingRef.current = recording;
      recordingStartTimeRef.current = new Date();

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        if (recordingStartTimeRef.current) {
          const duration = (Date.now() - recordingStartTimeRef.current.getTime()) / 1000;
          setState(prev => ({
            ...prev,
            audioDuration: duration,
            isVoiceDetected: true,  // Always true when recording
            confidence: 1.0,        // Always 1.0 in manual mode
          }));
        }
      }, 100);

      setState(prev => ({
        ...prev,
        isRecording: true,
        isVoiceDetected: true,
        confidence: 1.0,
        error: null,
      }));

      // Trigger onVoiceStart callback
      if (onVoiceStart) {
        onVoiceStart();
      }

      console.log('[useVAD] Recording started successfully');
    } catch (error: any) {
      console.error('[useVAD] Start recording error:', error);
      const errorMessage = error?.message || 'Failed to start recording';

      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));

      if (onError) {
        onError(error);
      }
    }
  }, [sampleRate, onVoiceStart, onError]);

  /**
   * Stop recording and trigger callback
   */
  const stopRecording = useCallback(async () => {
    try {
      console.log('[useVAD] Stopping recording...');

      if (!recordingRef.current) {
        console.log('[useVAD] No active recording');
        return;
      }

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      // Clear duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      const endTime = new Date();
      const duration = recordingStartTimeRef.current
        ? (endTime.getTime() - recordingStartTimeRef.current.getTime()) / 1000
        : 0;

      const segment: VADAudioSegment = {
        audioData: [],  // Empty - using file instead
        duration,
        startTime: recordingStartTimeRef.current || new Date(),
        endTime,
        fileUri: uri,
      };

      console.log(`[useVAD] Recording complete - duration: ${duration.toFixed(2)}s, uri: ${uri}`);

      // Reset refs
      recordingRef.current = null;
      recordingStartTimeRef.current = null;

      // Update state
      setState(prev => ({
        ...prev,
        isRecording: false,
        isVoiceDetected: false,
        confidence: 0,
        audioDuration: 0,
      }));

      // Trigger callback
      if (onVoiceEnd) {
        onVoiceEnd(segment);
      }

      console.log('[useVAD] Recording stopped successfully');
    } catch (error: any) {
      console.error('[useVAD] Stop recording error:', error);
      if (onError) {
        onError(error);
      }
    }
  }, [onVoiceEnd, onError]);

  /**
   * Reset state
   */
  const resetState = useCallback(() => {
    recordingRef.current = null;
    recordingStartTimeRef.current = null;

    setState({
      isRecording: false,
      isVoiceDetected: false,
      confidence: 0,
      audioDuration: 0,
      error: null,
    });
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    resetState,
  };
}
