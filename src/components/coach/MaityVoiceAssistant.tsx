import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Mic, Volume2, Loader2 } from 'lucide-react';
import { Conversation } from '@elevenlabs/client';
import { ParticleSphere } from './ParticleSphere';

export function MaityVoiceAssistant() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setError('Por favor, permite el acceso al micrófono para continuar');
      return false;
    }
  };

  // Get signed URL
  const getSignedUrl = async (): Promise<string | null> => {
    try {
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

      if (!apiKey || !agentId) {
        throw new Error('Configuración incompleta');
      }

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener URL de conexión');
      }

      const data = await response.json();
      return data.signed_url;
    } catch (err) {
      console.error('Error getting signed URL:', err);
      setError('Error al conectar con el servicio');
      return null;
    }
  };

  // Start conversation
  const startConversation = async () => {
    setIsConnecting(true);
    setError(null);

    // Check microphone permission
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      setIsConnecting(false);
      return;
    }

    // Get signed URL
    const signedUrl = await getSignedUrl();
    if (!signedUrl) {
      setIsConnecting(false);
      return;
    }

    try {
      // Start conversation session
      const newConversation = await Conversation.startSession({
        signedUrl: signedUrl,
        onConnect: () => {
          console.log('Connected to Maity');
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
        },
        onDisconnect: () => {
          console.log('Disconnected from Maity');
          setIsConnected(false);
        },
        onError: (error) => {
          console.error('Conversation error:', error);
          setError('Error en la conversación');
          setIsConnecting(false);
          setIsConnected(false);
        },
        onModeChange: ({ mode }) => {
          setIsSpeaking(mode === 'speaking');
        }
      });

      setConversation(newConversation);
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('No se pudo iniciar la conversación');
      setIsConnecting(false);
    }
  };

  // End conversation
  const endConversation = async () => {
    if (conversation) {
      await conversation.endSession();
      setConversation(null);
      setIsConnected(false);
      setIsSpeaking(false);
      setError(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 w-full">
      <div className="w-full max-w-lg space-y-12">
        {/* Title */}
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-bold text-white">
            Habla con Maity
          </h2>
          <p className="text-gray-400 text-lg">
            Tu coach personal en habilidades blandas
          </p>
        </div>

        {/* Main Button Area */}
        <div className="flex justify-center">
          {!isConnected ? (
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-green-500/20 blur-2xl animate-pulse" />

              <Button
                onClick={startConversation}
                disabled={isConnecting}
                className="relative bg-black hover:bg-gray-900 border-2 border-green-500 text-white px-12 py-12 rounded-full transition-all duration-300 hover:scale-105 hover:border-green-400 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] group"
              >
                <div className="flex flex-col items-center gap-3">
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-10 h-10 animate-spin text-green-500" />
                      <span className="text-sm font-semibold text-green-500">Conectando...</span>
                    </>
                  ) : (
                    <>
                      <Phone className="w-10 h-10 text-green-500 group-hover:text-green-400 transition-colors" />
                      <span className="text-sm font-semibold">Iniciar Sesión</span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {/* Animated Particle Sphere */}
              <div className="mb-8">
                <ParticleSphere isListening={!isSpeaking} isSpeaking={isSpeaking} />
              </div>

              {/* Active Call Button */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-500/30 blur-xl animate-pulse" />

                <Button
                  onClick={endConversation}
                  className="relative bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500 text-white px-10 py-10 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.7)]"
                >
                  <div className="flex flex-col items-center gap-2">
                    <PhoneOff className="w-8 h-8 text-red-500" />
                    <span className="text-xs font-semibold text-red-500">Finalizar</span>
                  </div>
                </Button>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-8">
                <div className={`flex items-center gap-3 px-5 py-3 rounded-full border transition-all ${
                  !isSpeaking
                    ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                    : 'border-gray-700 bg-gray-900/50'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    !isSpeaking ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-gray-600'
                  }`} />
                  <Mic className={`w-5 h-5 ${!isSpeaking ? 'text-red-500' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${!isSpeaking ? 'text-red-500' : 'text-gray-500'}`}>
                    Escuchando
                  </span>
                </div>

                <div className={`flex items-center gap-3 px-5 py-3 rounded-full border transition-all ${
                  isSpeaking
                    ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                    : 'border-gray-700 bg-gray-900/50'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isSpeaking ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-gray-600'
                  }`} />
                  <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-red-500' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${isSpeaking ? 'text-red-500' : 'text-gray-500'}`}>
                    Hablando
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center">
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-lg inline-block">
              {error}
            </p>
          </div>
        )}

        {/* Instructions */}
        {!isConnected && !error && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-8 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                <span>Conversación natural</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                <span>Coaching personalizado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                <span>Respuestas inmediatas</span>
              </div>
            </div>
          </div>
        )}

        {/* Active Connection Info */}
        {isConnected && (
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Háblame sobre tus desafíos en liderazgo, comunicación o trabajo en equipo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}