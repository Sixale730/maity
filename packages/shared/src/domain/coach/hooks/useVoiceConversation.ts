import { useState, useCallback, useRef, useEffect } from 'react';
import { env } from '../../../constants/env';
import type { AgentState } from '@/components/coach/CoachPage';

interface VoiceConversationConfig {
  onStateChange?: (state: AgentState) => void;
  onError?: (error: string) => void;
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
}

interface VoiceStatus {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isConfigured: boolean;
  error: string | null;
  transcript: string;
  lastResponse: string | null;
}

export function useVoiceConversation(config: VoiceConversationConfig = {}) {
  const [status, setStatus] = useState<VoiceStatus>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    isConfigured: !!env.elevenLabsApiKey,
    error: null,
    transcript: '',
    lastResponse: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const { onStateChange, onError, onTranscript, onResponse } = config;

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'es-ES';

        recognitionRef.current.onstart = () => {
          setStatus(prev => ({ ...prev, isListening: true, error: null }));
          onStateChange?.('listening');
        };

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

          setStatus(prev => ({ ...prev, transcript }));

          if (event.results[event.results.length - 1].isFinal) {
            onTranscript?.(transcript);
            handleUserMessage(transcript);
          }
        };

        recognitionRef.current.onend = () => {
          setStatus(prev => ({ ...prev, isListening: false }));
        };

        recognitionRef.current.onerror = (event) => {
          const errorMessage = `Speech recognition error: ${event.error}`;
          setStatus(prev => ({
            ...prev,
            isListening: false,
            error: errorMessage
          }));
          onError?.(errorMessage);
          onStateChange?.('idle');
        };
      }
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, [onStateChange, onError, onTranscript]);

  // Handle user message and generate response
  const handleUserMessage = useCallback(async (message: string) => {
    setStatus(prev => ({ ...prev, isProcessing: true }));
    onStateChange?.('thinking');

    try {
      // Use our chat logic for generating responses
      const response = await generateCoachResponse(message);

      setStatus(prev => ({
        ...prev,
        lastResponse: response,
        isProcessing: false
      }));

      onResponse?.(response);

      // Convert to speech using ElevenLabs or fallback to browser TTS
      await speakResponse(response);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process message';
      setStatus(prev => ({
        ...prev,
        error: errorMessage,
        isProcessing: false
      }));
      onError?.(errorMessage);
      onStateChange?.('idle');
    }
  }, [onStateChange, onError, onResponse]);

  // Generate response using ElevenLabs TTS API
  const speakResponse = useCallback(async (text: string) => {
    setStatus(prev => ({ ...prev, isSpeaking: true }));
    onStateChange?.('speaking');

    try {
      if (env.elevenLabsApiKey) {
        // Use ElevenLabs TTS API
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': env.elevenLabsApiKey,
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);

          audio.onended = () => {
            setStatus(prev => ({ ...prev, isSpeaking: false }));
            onStateChange?.('idle');
            URL.revokeObjectURL(audioUrl);
          };

          await audio.play();
        } else {
          throw new Error('ElevenLabs API error');
        }
      } else {
        // Fallback to browser speech synthesis
        if (synthRef.current) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'es-ES';
          utterance.rate = 0.9;
          utterance.pitch = 1.0;

          utterance.onend = () => {
            setStatus(prev => ({ ...prev, isSpeaking: false }));
            onStateChange?.('idle');
          };

          synthRef.current.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setStatus(prev => ({ ...prev, isSpeaking: false }));
      onStateChange?.('idle');
    }
  }, [onStateChange]);

  // Start listening
  const startListening = useCallback(() => {
    if (recognitionRef.current && !status.isListening) {
      setStatus(prev => ({ ...prev, transcript: '', error: null }));
      recognitionRef.current.start();
    }
  }, [status.isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && status.isListening) {
      recognitionRef.current.stop();
    }
  }, [status.isListening]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthRef.current && status.isSpeaking) {
      synthRef.current.cancel();
      setStatus(prev => ({ ...prev, isSpeaking: false }));
      onStateChange?.('idle');
    }
  }, [status.isSpeaking, onStateChange]);

  return {
    ...status,
    startListening,
    stopListening,
    stopSpeaking,
    canUseVoice: !!recognitionRef.current,
  };
}

// Generate coaching responses (reuse logic from useElevenLabsChat)
async function generateCoachResponse(userMessage: string): Promise<string> {
  const message = userMessage.toLowerCase();

  if (message.includes('equipo') || message.includes('liderazgo')) {
    return 'El liderazgo efectivo se basa en la comunicación clara y la confianza mutua. ¿Qué desafío específico estás enfrentando con tu equipo?';
  }

  if (message.includes('habilidades') || message.includes('desarrollo')) {
    return 'El desarrollo de habilidades es clave en TI. Te recomiendo enfocarte en competencias tanto técnicas como blandas. ¿Hay alguna habilidad específica que te interese desarrollar?';
  }

  if (message.includes('productividad') || message.includes('tiempo')) {
    return 'La gestión del tiempo es fundamental para el éxito. Te sugiero aplicar técnicas como Pomodoro o time-blocking. ¿Qué actividades te consumen más tiempo?';
  }

  if (message.includes('estrés') || message.includes('balance')) {
    return 'El equilibrio entre vida personal y laboral es esencial. Es importante establecer límites claros y practicar técnicas de manejo del estrés.';
  }

  if (message.includes('hola') || message.includes('hello')) {
    return 'Hola, me alegra escucharte. Soy tu coach personal especializado en desarrollo profesional para líderes de TI. ¿En qué puedo ayudarte hoy?';
  }

  return 'Entiendo tu consulta. Como tu coach, estoy aquí para ayudarte con tu desarrollo profesional. ¿Podrías contarme más detalles sobre lo que necesitas?';
}

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}