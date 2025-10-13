import { useState, useRef, useCallback, useEffect } from 'react';
import { omiBluetoothService, AudioDataListener } from '../services/omiBluetoothService';
import RNFS from 'react-native-fs';

// Reuse interfaces from useVAD for compatibility
export interface OmiStreamConfig {
  silenceDuration?: number;    // ms (default: 2000)
  sampleRate?: number;         // Hz (default: 16000)
}

export interface OmiStreamState {
  isRecording: boolean;
  isVoiceDetected: boolean;
  confidence: number;
  audioDuration: number;
  error: string | null;
}

export interface OmiAudioSegment {
  duration: number;
  startTime: Date;
  endTime: Date;
  fileUri: string;
}

export interface UseOmiAudioStreamReturn {
  state: OmiStreamState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  resetState: () => void;
}

interface UseOmiAudioStreamProps {
  config?: OmiStreamConfig;
  onVoiceStart?: () => void;
  onVoiceEnd?: (segment: OmiAudioSegment) => void;
  onError?: (error: Error) => void;
}

export function useOmiAudioStream({
  config = {},
  onVoiceStart,
  onVoiceEnd,
  onError,
}: UseOmiAudioStreamProps): UseOmiAudioStreamReturn {
  const {
    silenceDuration = 2000,
    sampleRate = 16000,
  } = config;

  // State
  const [state, setState] = useState<OmiStreamState>({
    isRecording: false,
    isVoiceDetected: false,
    confidence: 0,
    audioDuration: 0,
    error: null,
  });

  // Refs
  const opusPacketsRef = useRef<string[]>([]);
  const recordingStartTimeRef = useRef<Date | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioDataListenerRef = useRef<AudioDataListener | null>(null);
  const lastPacketTimeRef = useRef<number>(0);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle audio data from BLE
   */
  const handleAudioData = useCallback((audioData: string) => {
    try {
      // Store raw OPUS packet (base64)
      opusPacketsRef.current.push(audioData);

      const packetCount = opusPacketsRef.current.length;
      if (packetCount % 10 === 0 || packetCount === 1) {
        console.log(`[OmiStream] Received ${packetCount} audio packets`);
      }

      // Update last packet time
      lastPacketTimeRef.current = Date.now();

      // Set voice detected
      setState(prev => ({
        ...prev,
        isVoiceDetected: true,
        confidence: 1.0,
      }));

      // Reset silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // Start new silence timer
      silenceTimerRef.current = setTimeout(() => {
        console.log('[OmiStream] Silence detected');
        setState(prev => ({
          ...prev,
          isVoiceDetected: false,
          confidence: 0,
        }));
      }, silenceDuration);
    } catch (error: any) {
      console.error('[OmiStream] Error processing audio data:', error);
    }
  }, [silenceDuration]);

  /**
   * Save raw OPUS packets to file
   */
  const saveOpusToFile = useCallback(async (opusPackets: string[]): Promise<string> => {
    try {
      console.log('[OmiStream] Saving OPUS packets to file...');
      console.log(`[OmiStream] Total packets: ${opusPackets.length}`);

      if (opusPackets.length === 0) {
        throw new Error('No OPUS packets to save');
      }

      // Decode each base64 packet to binary and concatenate
      const binaryChunks: Uint8Array[] = [];
      let totalLength = 0;

      for (let i = 0; i < opusPackets.length; i++) {
        const packet = opusPackets[i];

        // Decode base64 to binary
        const binaryString = atob(packet);
        const bytes = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) {
          bytes[j] = binaryString.charCodeAt(j);
        }

        binaryChunks.push(bytes);
        totalLength += bytes.length;
      }

      console.log(`[OmiStream] Total binary size: ${totalLength} bytes`);

      // Concatenate all binary chunks
      const concatenated = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of binaryChunks) {
        concatenated.set(chunk, offset);
        offset += chunk.length;
      }

      // Convert concatenated binary to base64
      const base64 = btoa(String.fromCharCode(...concatenated));

      // Save to file
      const timestamp = Date.now();
      const filename = `omi_audio_${timestamp}.opus`;
      const filepath = `${RNFS.CachesDirectoryPath}/${filename}`;

      await RNFS.writeFile(filepath, base64, 'base64');

      console.log(`[OmiStream] OPUS file saved: ${filepath}`);
      console.log(`[OmiStream] File size: ${(totalLength / 1024).toFixed(2)} KB`);

      return filepath;
    } catch (error: any) {
      console.error('[OmiStream] Error saving OPUS file:', error);
      throw new Error(`Failed to save OPUS: ${error.message}`);
    }
  }, []);

  /**
   * Start recording from Omi device
   */
  const startRecording = useCallback(async () => {
    try {
      console.log('[OmiStream] Starting Omi audio streaming...');

      // Check if Omi is connected
      if (!omiBluetoothService.isConnected()) {
        throw new Error('Dispositivo Omi no está conectado');
      }

      // Clear previous packets
      opusPacketsRef.current = [];

      // Create audio data listener
      audioDataListenerRef.current = handleAudioData;
      omiBluetoothService.addAudioDataListener(audioDataListenerRef.current);

      // Start streaming
      await omiBluetoothService.startAudioStreaming();

      recordingStartTimeRef.current = new Date();

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        if (recordingStartTimeRef.current) {
          const duration = (Date.now() - recordingStartTimeRef.current.getTime()) / 1000;
          setState(prev => ({
            ...prev,
            audioDuration: duration,
          }));
        }
      }, 100);

      setState(prev => ({
        ...prev,
        isRecording: true,
        error: null,
      }));

      // Trigger onVoiceStart callback
      if (onVoiceStart) {
        onVoiceStart();
      }

      console.log('[OmiStream] Streaming started successfully');
    } catch (error: any) {
      console.error('[OmiStream] Start streaming error:', error);
      const errorMessage = error?.message || 'Failed to start streaming';

      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));

      if (onError) {
        onError(error);
      }
    }
  }, [handleAudioData, onVoiceStart, onError]);

  /**
   * Stop recording and save audio
   */
  const stopRecording = useCallback(async () => {
    try {
      console.log('[OmiStream] Stopping streaming...');

      // Stop BLE streaming
      omiBluetoothService.stopAudioStreaming();

      // Remove listener
      if (audioDataListenerRef.current) {
        omiBluetoothService.removeAudioDataListener(audioDataListenerRef.current);
        audioDataListenerRef.current = null;
      }

      // Clear timers
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Get accumulated OPUS packets
      const opusPackets = [...opusPacketsRef.current];
      opusPacketsRef.current = [];

      if (opusPackets.length === 0) {
        console.log('[OmiStream] No audio data captured');
        setState(prev => ({
          ...prev,
          isRecording: false,
          isVoiceDetected: false,
          confidence: 0,
          audioDuration: 0,
        }));
        return;
      }

      // Save raw OPUS to file
      const filepath = await saveOpusToFile(opusPackets);

      const endTime = new Date();
      const duration = recordingStartTimeRef.current
        ? (endTime.getTime() - recordingStartTimeRef.current.getTime()) / 1000
        : 0;

      const segment: OmiAudioSegment = {
        duration,
        startTime: recordingStartTimeRef.current || new Date(),
        endTime,
        fileUri: filepath,
      };

      console.log(`[OmiStream] Recording complete - duration: ${duration.toFixed(2)}s`);

      // Reset refs
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

      console.log('[OmiStream] Streaming stopped successfully');
    } catch (error: any) {
      console.error('[OmiStream] Stop streaming error:', error);
      if (onError) {
        onError(error);
      }
    }
  }, [saveOpusToFile, onVoiceEnd, onError]);

  /**
   * Reset state
   */
  const resetState = useCallback(() => {
    opusPacketsRef.current = [];
    recordingStartTimeRef.current = null;

    setState({
      isRecording: false,
      isVoiceDetected: false,
      confidence: 0,
      audioDuration: 0,
      error: null,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (audioDataListenerRef.current) {
        omiBluetoothService.removeAudioDataListener(audioDataListenerRef.current);
      }
      omiBluetoothService.stopAudioStreaming();
    };
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    resetState,
  };
}
