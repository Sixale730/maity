import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Phone, PhoneOff, Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';
import { Conversation } from '@elevenlabs/client';

interface ElevenLabsConvAIProps {
  onMessageReceived?: (message: string, sender: 'user' | 'agent') => void;
}

export function ElevenLabsConvAI({ onMessageReceived }: ElevenLabsConvAIProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Desconectado');

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setError('No se pudo acceder al micrófono. Por favor, permite el acceso.');
      return false;
    }
  };

  // Get signed URL from API endpoint
  const getSignedUrl = async (): Promise<string | null> => {
    try {
      // For development, we'll call the ElevenLabs API directly
      // In production, this should go through a backend endpoint
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

      if (!apiKey || !agentId) {
        throw new Error('API key or Agent ID not configured');
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
        const errorData = await response.text();
        console.error('ElevenLabs API error:', errorData);
        throw new Error('Failed to get signed URL');
      }

      const data = await response.json();
      return data.signed_url;
    } catch (err) {
      console.error('Error getting signed URL:', err);
      setError('Error al obtener URL de conexión: ' + (err instanceof Error ? err.message : 'Unknown error'));
      return null;
    }
  };

  // Start conversation
  const startConversation = async () => {
    setIsConnecting(true);
    setError(null);
    setStatus('Conectando...');

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
      setStatus('Error al conectar');
      return;
    }

    try {
      // Start conversation session
      const newConversation = await Conversation.startSession({
        signedUrl: signedUrl,
        onConnect: () => {
          console.log('Connected to ElevenLabs');
          setIsConnected(true);
          setIsConnecting(false);
          setStatus('Conectado');
          setError(null);
        },
        onDisconnect: () => {
          console.log('Disconnected from ElevenLabs');
          setIsConnected(false);
          setStatus('Desconectado');
        },
        onError: (error) => {
          console.error('Conversation error:', error);
          setError('Error en la conversación: ' + error.message);
          setIsConnecting(false);
          setIsConnected(false);
          setStatus('Error');
        },
        onModeChange: ({ mode }) => {
          // Update speaking/listening status
          setIsSpeaking(mode === 'speaking');
          setStatus(mode === 'speaking' ? 'Coach hablando...' : 'Escuchando...');
        },
        onMessage: (message) => {
          console.log('Message:', message);
          if (message.type === 'transcript' && onMessageReceived) {
            onMessageReceived(message.text, message.role as 'user' | 'agent');
          }
        }
      });

      setConversation(newConversation);
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('No se pudo iniciar la conversación: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setIsConnecting(false);
      setStatus('Error al conectar');
    }
  };

  // End conversation
  const endConversation = async () => {
    if (conversation) {
      await conversation.endSession();
      setConversation(null);
      setIsConnected(false);
      setIsSpeaking(false);
      setStatus('Desconectado');
    }
  };

  const getStatusColor = () => {
    if (isConnected) return 'bg-green-400';
    if (isConnecting) return 'bg-yellow-400';
    if (error) return 'bg-red-400';
    return 'bg-gray-400';
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-lg border-white/10 p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Coach de Voz con IA
          </h2>
          <p className="text-white/60 text-sm">
            Conversación natural con ElevenLabs AI
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-3 py-4">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${
            isConnected || isConnecting ? 'animate-pulse' : ''
          }`} />
          <span className="text-white/80 font-medium">{status}</span>
        </div>

        {/* Main Control Button */}
        <div className="flex justify-center">
          {!isConnected ? (
            <Button
              onClick={startConversation}
              disabled={isConnecting}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-6 text-lg rounded-full shadow-lg transform transition hover:scale-105"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Phone className="w-6 h-6 mr-3" />
                  Iniciar Conversación
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={endConversation}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-full shadow-lg transform transition hover:scale-105"
            >
              <PhoneOff className="w-6 h-6 mr-3" />
              Finalizar Conversación
            </Button>
          )}
        </div>

        {/* Audio Indicators */}
        {isConnected && (
          <div className="flex justify-center gap-8">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              !isSpeaking ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5 border border-white/10'
            }`}>
              <Mic className={`w-4 h-4 ${!isSpeaking ? 'text-green-400' : 'text-white/40'}`} />
              <span className={`text-sm ${!isSpeaking ? 'text-green-400' : 'text-white/40'}`}>
                Escuchando
              </span>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isSpeaking ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white/5 border border-white/10'
            }`}>
              <div className={`w-4 h-4 rounded-full ${
                isSpeaking ? 'bg-blue-400 animate-pulse' : 'bg-white/20'
              }`} />
              <span className={`text-sm ${isSpeaking ? 'text-blue-400' : 'text-white/40'}`}>
                Hablando
              </span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium text-sm">Error</p>
              <p className="text-red-300/80 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isConnected && !error && (
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <p className="text-white/70 text-sm flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Conversación natural en español
            </p>
            <p className="text-white/70 text-sm flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Coach especializado en bienestar profesional
            </p>
            <p className="text-white/70 text-sm flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Respuestas con voz realista de IA
            </p>
            <p className="text-white/70 text-sm flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Interrumpe en cualquier momento para hablar
            </p>
          </div>
        )}

        {/* Active Conversation Tips */}
        {isConnected && (
          <div className="text-center space-y-2">
            <p className="text-white/50 text-xs">
              💡 Habla de forma natural, el coach te escucha y responde
            </p>
            <div className="flex justify-center gap-4 text-white/40 text-xs">
              <span>🎯 Productividad</span>
              <span>😌 Estrés</span>
              <span>👥 Liderazgo</span>
              <span>⚖️ Balance</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}