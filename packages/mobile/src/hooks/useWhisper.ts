import { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import RNFS from 'react-native-fs';

export type WhisperMode = 'api'; // Simplified to only API mode

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://www.maity.com.mx';

export interface WhisperConfig {
  apiKey?: string;
  language?: string;
}

export interface WhisperResult {
  transcript: string;
  duration: number;      // ms
  error?: string;
}

export interface UseWhisperReturn {
  transcribe: (audioFileUri: string) => Promise<WhisperResult>;
  isTranscribing: boolean;
  error: string | null;
}

/**
 * Hook for audio transcription using OpenAI Whisper API
 * Uses Expo FileSystem for native file upload (no Buffer polyfills needed)
 */
export function useWhisper({
  apiKey,
  language = 'es',
}: WhisperConfig): UseWhisperReturn {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Decode OPUS file to WAV using backend API
   */
  const decodeOpus = useCallback(async (opusFileUri: string): Promise<string> => {
    console.log('[useWhisper] Decoding OPUS file via backend:', opusFileUri);

    try {
      // Read OPUS file as base64
      const opusData = await RNFS.readFile(opusFileUri, 'base64');
      console.log('[useWhisper] OPUS data loaded, size:', opusData.length);

      // Send to backend for decoding
      const response = await fetch(`${API_URL}/api/decode-opus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ opusData }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Backend decode failed: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      if (!result.ok || !result.wavData) {
        throw new Error('Invalid response from decode API');
      }

      console.log('[useWhisper] OPUS decoded successfully, WAV size:', result.stats?.wavSize || 'unknown');

      // Save WAV to temp file
      const timestamp = Date.now();
      const wavFilePath = `${RNFS.CachesDirectoryPath}/decoded_${timestamp}.wav`;
      await RNFS.writeFile(wavFilePath, result.wavData, 'base64');

      console.log('[useWhisper] WAV file saved:', wavFilePath);
      return wavFilePath;
    } catch (error: any) {
      console.error('[useWhisper] OPUS decode error:', error);
      throw new Error(`Failed to decode OPUS: ${error.message}`);
    }
  }, []);

  /**
   * Transcribe using OpenAI Whisper API with FileSystem.uploadAsync
   * This is the native React Native/Expo way to upload files
   * Automatically handles OPUS files by decoding them first via backend
   */
  const transcribe = useCallback(
    async (audioFileUri: string): Promise<WhisperResult> => {
      console.log('[useWhisper] Starting API transcription...');
      const startTime = Date.now();

      setIsTranscribing(true);
      setError(null);

      try {
        if (!apiKey) {
          throw new Error('OpenAI API key not configured');
        }

        // Check if file is OPUS and needs decoding
        let fileToTranscribe = audioFileUri;
        if (audioFileUri.toLowerCase().endsWith('.opus')) {
          console.log('[useWhisper] OPUS file detected, decoding first...');
          fileToTranscribe = await decodeOpus(audioFileUri);
        }

        // Check if file exists
        const fileInfo = await FileSystem.getInfoAsync(fileToTranscribe);
        if (!fileInfo.exists) {
          throw new Error('Audio file not found');
        }

        console.log('[useWhisper] Uploading file:', fileToTranscribe);
        console.log('[useWhisper] File size:', fileInfo.size, 'bytes');

        // Upload file directly to OpenAI API using native FileSystem
        const response = await FileSystem.uploadAsync(
          'https://api.openai.com/v1/audio/transcriptions',
          audioFileUri,
          {
            httpMethod: 'POST',
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            fieldName: 'file',
            parameters: {
              model: 'whisper-1',
              language: language,
            },
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          }
        );

        const duration = Date.now() - startTime;

        // Parse response
        if (response.status !== 200) {
          console.error('[useWhisper] API error:', response.status, response.body);
          throw new Error(`API returned status ${response.status}: ${response.body}`);
        }

        const result = JSON.parse(response.body);

        console.log(`[useWhisper] API transcription complete in ${duration}ms`);
        console.log(`[useWhisper] Transcript: "${result.text}"`);

        return {
          transcript: result.text || '',
          duration,
        };
      } catch (err: any) {
        console.error('[useWhisper] API transcription error:', err);
        const errorMessage = err.message || 'API transcription failed';
        setError(errorMessage);

        return {
          transcript: '',
          duration: Date.now() - startTime,
          error: errorMessage,
        };
      } finally {
        setIsTranscribing(false);
      }
    },
    [apiKey, language, decodeOpus]
  );

  return {
    transcribe,
    isTranscribing,
    error,
  };
}
