import { useState, useRef, useCallback } from 'react';
import { env } from '../../../constants/env';

interface UseElevenLabsVoiceOptions {
  voiceId?: string;
  modelId?: string;
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
}

export function useElevenLabsVoice(options: UseElevenLabsVoiceOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    voiceId = 'EXAVITQu4vr4xnSDxMaL', // Bella voice - multilingual with good Spanish
    modelId = 'eleven_multilingual_v2',
    onAudioStart,
    onAudioEnd
  } = options;

  const speak = useCallback(async (text: string) => {
    if (!env.elevenLabsApiKey) {
      setError('ElevenLabs API key no configurada');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      // Call ElevenLabs Text-to-Speech API
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': env.elevenLabsApiKey
          },
          body: JSON.stringify({
            text,
            model_id: modelId,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.5,
              use_speaker_boost: true
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail?.message ||
          `Error de API: ${response.status}`
        );
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      // Set up audio element
      audioRef.current.src = audioUrl;

      audioRef.current.onplay = () => {
        setIsSpeaking(true);
        onAudioStart?.();
      };

      audioRef.current.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        onAudioEnd?.();
      };

      audioRef.current.onerror = () => {
        setIsSpeaking(false);
        setError('Error al reproducir el audio');
        URL.revokeObjectURL(audioUrl);
      };

      // Play the audio
      await audioRef.current.play();

    } catch (err) {
      console.error('ElevenLabs TTS error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Error al generar voz con ElevenLabs'
      );
    } finally {
      setIsGenerating(false);
    }
  }, [voiceId, modelId, onAudioStart, onAudioEnd]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
      setIsSpeaking(true);
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isGenerating,
    isSpeaking,
    error
  };
}