import { useCallback, useEffect, useRef, useState } from 'react';
import { env } from '@/lib/env';

interface ConversationState {
  status: 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'error';
  isSpeaking: boolean;
  isListening: boolean;
  error: string | null;
  transcript: string;
}

export function useElevenLabsConversation() {
  const [state, setState] = useState<ConversationState>({
    status: 'idle',
    isSpeaking: false,
    isListening: false,
    error: null,
    transcript: '',
  });

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play audio from queue
  const playAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isPlayingRef.current = true;
    const audioContext = initAudioContext();

    while (audioQueueRef.current.length > 0) {
      const audioData = audioQueueRef.current.shift();
      if (!audioData) continue;

      try {
        const audioBuffer = await audioContext.decodeAudioData(audioData);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        await new Promise<void>((resolve) => {
          source.onended = () => resolve();
          source.start();
        });
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }

    isPlayingRef.current = false;
    setState(prev => ({ ...prev, isSpeaking: false }));
  }, [initAudioContext]);

  // Start microphone recording
  const startMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Convert blob to base64 and send
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result && typeof reader.result === 'string') {
              const base64Audio = reader.result.split(',')[1];
              wsRef.current?.send(JSON.stringify({
                type: 'audio_input',
                audio: base64Audio
              }));
            }
          };
          reader.readAsDataURL(event.data);
        }
      };

      mediaRecorder.start(100); // Send data every 100ms
      setState(prev => ({ ...prev, isListening: true }));
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setState(prev => ({
        ...prev,
        error: 'No se pudo acceder al micrófono'
      }));
    }
  }, []);

  // Stop microphone recording
  const stopMicrophone = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  // Setup WebSocket handlers
  const setupWebSocket = useCallback((ws: WebSocket) => {
    ws.onopen = () => {
      console.log('WebSocket connected (alternative method)');
      setState(prev => ({
        ...prev,
        status: 'connected',
        error: null
      }));
      startMicrophone();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Error de conexión WebSocket'
      }));
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setState(prev => ({
        ...prev,
        status: 'idle',
        isListening: false,
        isSpeaking: false
      }));
      stopMicrophone();
    };
  }, [startMicrophone, stopMicrophone]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'audio':
        if (data.audio) {
          const audioBuffer = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0)).buffer;
          audioQueueRef.current.push(audioBuffer);
          setState(prev => ({ ...prev, isSpeaking: true }));
          playAudioQueue();
        }
        break;

      case 'transcript':
        if (data.role === 'user') {
          setState(prev => ({ ...prev, transcript: data.text }));
        }
        break;

      case 'error':
        console.error('ElevenLabs error:', data);
        setState(prev => ({
          ...prev,
          error: data.message || 'Error en la conversación'
        }));
        break;
    }
  }, [playAudioQueue]);

  // Alternative connection method using different WebSocket URLs
  const connectAlternative = useCallback(async () => {
    console.log('Trying alternative connection methods...');

    try {
      // Try different WebSocket endpoint patterns
      const alternativeUrls = [
        // Try with conversational endpoint
        `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${env.elevenLabsAgentId}&xi_api_key=${env.elevenLabsApiKey}`,
        // Try with direct agent WebSocket
        `wss://api.elevenlabs.io/agent/${env.elevenLabsAgentId}?xi_api_key=${env.elevenLabsApiKey}`,
        // Try with WebSocket text-to-speech streaming (fallback)
        `wss://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL/stream-input?xi_api_key=${env.elevenLabsApiKey}`,
      ];

      for (const url of alternativeUrls) {
        console.log('Trying alternative URL:', url.split('?')[0] + '?...');

        try {
          const ws = new WebSocket(url);

          await new Promise<boolean>((resolve) => {
            const timeout = setTimeout(() => {
              ws.close();
              resolve(false);
            }, 5000); // 5 second timeout

            ws.onopen = () => {
              clearTimeout(timeout);
              console.log('Alternative WebSocket connected!');
              wsRef.current = ws;
              setupWebSocket(ws);
              resolve(true);
            };

            ws.onerror = () => {
              clearTimeout(timeout);
              resolve(false);
            };
          }).then((success) => {
            if (success) {
              return; // Exit if successful
            }
          });
        } catch (err) {
          console.log('Failed with this URL, trying next...');
        }
      }

      // If all WebSocket attempts fail, show configuration message
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'No se pudo establecer conexión con ElevenLabs. Verifica que tu agente esté configurado correctamente en https://elevenlabs.io/app/conversational-ai'
      }));
    } catch (error) {
      console.error('All connection attempts failed:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Error al conectar. Verifica tu API key y Agent ID.'
      }));
    }
  }, [setupWebSocket]);

  // Connect to ElevenLabs - Alternative approach
  const connect = useCallback(async () => {
    if (!env.elevenLabsApiKey || !env.elevenLabsAgentId) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'API key o Agent ID no configurados'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      status: 'connecting',
      error: null
    }));

    try {
      console.log('Attempting connection with Agent ID:', env.elevenLabsAgentId);

      // Try different approaches based on documentation
      // Approach 1: Direct WebSocket with agent ID and API key in URL
      const wsUrl = `wss://api.elevenlabs.io/v1/convai/agents/${env.elevenLabsAgentId}/conversation?xi_api_key=${env.elevenLabsApiKey}`;

      console.log('Trying WebSocket URL (with auth in query)');

      const ws = new WebSocket(wsUrl);

      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setState(prev => ({
          ...prev,
          status: 'connected',
          error: null
        }));

        // Send authentication
        ws.send(JSON.stringify({
          type: 'auth',
          api_key: env.elevenLabsApiKey,
        }));

        // Start microphone after connection
        startMicrophone();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data.type);

          switch (data.type) {
            case 'audio':
              if (data.audio) {
                const audioBuffer = Uint8Array.from(atob(data.audio), c => c.charCodeAt(0)).buffer;
                audioQueueRef.current.push(audioBuffer);
                setState(prev => ({ ...prev, isSpeaking: true }));
                playAudioQueue();
              }
              break;

            case 'transcript':
              if (data.role === 'user') {
                setState(prev => ({ ...prev, transcript: data.text }));
              }
              break;

            case 'error':
              console.error('ElevenLabs error:', data);
              setState(prev => ({
                ...prev,
                error: data.message || 'Error en la conversación'
              }));
              break;
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);

        // If direct WebSocket fails, try alternative approach
        connectAlternative();
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setState(prev => ({
          ...prev,
          status: 'idle',
          isListening: false,
          isSpeaking: false
        }));
        stopMicrophone();
      };

    } catch (error) {
      console.error('Connection error:', error);

      // Try alternative connection method
      connectAlternative();
    }
  }, [startMicrophone, stopMicrophone, playAudioQueue]);

  // Disconnect from ElevenLabs
  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'disconnecting'
    }));

    stopMicrophone();

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    audioQueueRef.current = [];
    isPlayingRef.current = false;

    setState(prev => ({
      ...prev,
      status: 'idle',
      isListening: false,
      isSpeaking: false,
      transcript: ''
    }));
  }, [stopMicrophone]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    isConnected: state.status === 'connected',
  };
}