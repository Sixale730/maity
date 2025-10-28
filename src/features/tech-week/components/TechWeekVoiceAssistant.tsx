/**
 * TechWeekVoiceAssistant Component
 *
 * This is a specialized version of RoleplayVoiceAssistant for Tech Week events.
 * Key differences:
 * - Uses TechWeekParticleSphere with pink/rose colors
 * - Fixed Tech Week agent ID
 * - Simplified for single scenario use
 *
 * NOTE: This component is >400 lines and should be refactored in the future.
 * Consider extracting reusable logic into hooks and smaller components.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/ui/components/ui/button';
import { Phone, PhoneOff, Mic, Volume2, Loader2, MessageCircle } from 'lucide-react';
import { Conversation } from '@elevenlabs/client';
import { TechWeekParticleSphere } from './TechWeekParticleSphere';
import { env } from '@/lib/env';

// Tech Week Pink/Rose Color Palette
const TECH_WEEK_COLORS = {
  lightPink: '#FFB6C1',
  hotPink: '#FF69B4',
  deepPink: '#FF1493',
  paleVioletRed: '#DB7093',
};

interface TechWeekVoiceAssistantProps {
  userName?: string;
  userId?: string;
  sessionId?: string;
  onSessionStart?: () => Promise<string | null>;
  onSessionEnd?: (transcript: string, duration: number, sessionId?: string, messages?: Array<{
    id: string;
    timestamp: Date;
    source: 'user' | 'ai';
    message: string;
  }>) => void;
  scenarioName?: string;
  scenarioDescription?: string;
  objectives?: string;
}

export function TechWeekVoiceAssistant({
  userName,
  userId: _userId,
  sessionId,
  onSessionStart,
  onSessionEnd,
  scenarioName = 'Tech Week - Sesión General',
  scenarioDescription = 'Práctica de presentaciones técnicas y pitch sessions',
  objectives
}: TechWeekVoiceAssistantProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_transcript, setTranscript] = useState<string>('');
  const [_agentResponse, setAgentResponse] = useState<string>('');

  // Historial completo de la conversación
  const [conversationHistory, setConversationHistory] = useState<Array<{
    id: string;
    timestamp: Date;
    source: 'user' | 'ai';
    message: string;
  }>>([]);

  // Estado para el proceso de finalización
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const sessionStartTimeRef = useRef<Date | null>(null);
  const fullTranscriptRef = useRef<string>('');
  const [_isConnectionStable, setIsConnectionStable] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const userEndedSessionRef = useRef(false);

  // State para la sesión actual
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);

  // Auto scroll al final del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Actualizar currentSessionId cuando cambie el prop sessionId
  React.useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      console.log('📝 [TechWeekVoiceAssistant] Actualizando sessionId desde props:', sessionId);
      setCurrentSessionId(sessionId);
    }
  }, [sessionId, currentSessionId]);

  // Función para añadir mensaje al historial
  const addMessageToHistory = (source: 'user' | 'ai', message: string) => {
    const newMessage = {
      id: Date.now().toString(),
      timestamp: new Date(),
      source,
      message
    };
    setConversationHistory(prev => [...prev, newMessage]);

    // Agregar a la transcripción completa
    if (source === 'user') {
      fullTranscriptRef.current += `Usuario: ${message}\n`;
    } else {
      fullTranscriptRef.current += `Agente Tech Week: ${message}\n`;
    }
  };

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

  // Get signed URL for Tech Week agent
  const getSignedUrl = async (): Promise<string | null> => {
    try {
      const apiKey = env.elevenLabsApiKey;
      const agentId = env.elevenLabsTechWeekAgentId; // Tech Week specific agent ID

      if (!apiKey || !agentId) {
        throw new Error('Configuración de Tech Week incompleta');
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
      setError('Error al conectar con el servicio de Tech Week');
      return null;
    }
  };

  // Start conversation
  const startConversation = async () => {
    console.log('🚀 [TechWeekVoiceAssistant] startConversation iniciado');

    userEndedSessionRef.current = false;
    setConversationHistory([]);
    fullTranscriptRef.current = '';
    setTranscript('');
    setAgentResponse('');
    setSessionStartTime(null);
    sessionStartTimeRef.current = null;
    setIsConnecting(true);
    setError(null);

    // Check microphone permission
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      setIsConnecting(false);
      return;
    }

    // Crear sesión de práctica
    if (onSessionStart && !currentSessionId) {
      console.log('🎯 [TechWeekVoiceAssistant] Creando sesión Tech Week...');
      const newSessionId = await onSessionStart();

      if (newSessionId) {
        console.log('✅ [TechWeekVoiceAssistant] Sesión creada:', newSessionId);
        setCurrentSessionId(newSessionId);
      }
    }

    // Get signed URL
    const signedUrl = await getSignedUrl();
    if (!signedUrl) {
      setIsConnecting(false);
      return;
    }

    try {
      // Dynamic variables for Tech Week
      const dynamicVars = {
        user_name: userName || 'Usuario',
        scenario_name: scenarioName,
        objectives: objectives || '',
        session_id: sessionId || ''
      };

      console.log('🚀 Enviando variables dinámicas a ElevenLabs (Tech Week):', dynamicVars);

      // Start conversation session
      const newConversation = await Conversation.startSession({
        signedUrl: signedUrl,
        dynamicVariables: dynamicVars,
        onConnect: () => {
          console.log('✅ Connected to Tech Week Agent');
          const now = new Date();
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
          setSessionStartTime(now);
          sessionStartTimeRef.current = now;

          setTimeout(() => {
            setIsConnectionStable(true);
          }, 1000);
        },
        onDisconnect: (error?: any) => {
          console.log('🔌 Disconnected from Tech Week Agent', error);
          setIsConnected(false);
          setIsSpeaking(false);
          setIsConnectionStable(false);

          if (userEndedSessionRef.current || isProcessing) {
            return;
          }

          setTimeout(() => {
            const sessionDuration = sessionStartTimeRef.current
              ? Math.floor((new Date().getTime() - sessionStartTimeRef.current.getTime()) / 1000)
              : 0;

            const hasValidTranscript = fullTranscriptRef.current &&
                                       fullTranscriptRef.current.trim().length > 50;

            if (hasValidTranscript) {
              setIsProcessing(true);

              setTimeout(() => {
                setIsProcessing(false);
                if (onSessionEnd) {
                  onSessionEnd(fullTranscriptRef.current, sessionDuration, currentSessionId || undefined, conversationHistory);
                }
              }, 100);

              return;
            }

            if (!hasValidTranscript) {
              setError('⚠️ No se detectó contenido en la conversación. Por favor, intenta nuevamente.');
            } else if (error) {
              setError('La conexión se cerró inesperadamente. Por favor, intenta nuevamente.');
            }
          }, 500);
        },
        onError: (error: unknown) => {
          console.error('❌ Conversation error:', error);

          const errorMessage = typeof error === 'object' && error && 'message' in error && typeof error.message === 'string'
            ? error.message
            : String(error);

          if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
            setError('Se ha alcanzado el límite de uso de ElevenLabs. Por favor, intenta más tarde.');
          } else {
            setError('Error en la conversación. Verifica tu conexión y límites de uso.');
          }

          setIsConnecting(false);
          setIsConnected(false);
        },
        onModeChange: ({ mode }) => {
          setIsSpeaking(mode === 'speaking');
        },
        onMessage: ({ source, message }) => {
          if (source === 'user') {
            setTranscript(message);
            addMessageToHistory('user', message);
          } else if (source === 'ai') {
            setAgentResponse(message);
            addMessageToHistory('ai', message);
          }
        },
        onStatusChange: ({ status: _e }) => {
          console.log('📊 Status changed to:', _e);
        }
      });

      setConversation(newConversation);
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('No se pudo iniciar la conversación de Tech Week');
      setIsConnecting(false);
    }
  };

  // End conversation
  const endConversation = async () => {
    if (conversation) {
      userEndedSessionRef.current = true;
      setIsProcessing(true);

      const duration = sessionStartTimeRef.current
        ? Math.floor((new Date().getTime() - sessionStartTimeRef.current.getTime()) / 1000)
        : 0;

      try {
        await conversation.endSession();
      } catch (error) {
        console.warn('⚠️ Error al terminar sesión:', error);
      }

      setConversation(null);
      setIsConnected(false);
      setIsSpeaking(false);

      setTimeout(() => {
        setIsProcessing(false);
        if (onSessionEnd) {
          onSessionEnd(fullTranscriptRef.current, duration, currentSessionId || undefined, conversationHistory);
        }
        userEndedSessionRef.current = false;
      }, 500);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-120px)] px-3 sm:px-6 w-full gap-4 lg:gap-8">
      {/* Columna izquierda - Agente de voz */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg space-y-6 sm:space-y-8 lg:space-y-12">
          {/* Title */}
          <div className="text-center space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              {scenarioName}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
              {scenarioDescription}
            </p>
          </div>

          {/* Main Button Area */}
          <div className="flex justify-center">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-6">
                <div className="p-8 bg-pink-500/10 rounded-full">
                  <Loader2 className="w-16 h-16 text-pink-400 animate-spin" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-white">Procesando tu sesión...</h3>
                  <p className="text-gray-400">Analizando la conversación y calculando resultados</p>
                </div>
              </div>
            ) : !isConnected ? (
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full blur-2xl animate-pulse"
                  style={{ backgroundColor: `${TECH_WEEK_COLORS.hotPink}20` }}
                />

                <Button
                  onClick={startConversation}
                  disabled={isConnecting}
                  className="relative bg-black hover:bg-gray-900 text-white px-8 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12 rounded-full transition-all duration-300 hover:scale-105 group"
                  style={{
                    borderWidth: '2px',
                    borderColor: TECH_WEEK_COLORS.hotPink,
                    boxShadow: isConnecting ? 'none' : `0 0 0 rgba(255, 105, 180, 0)`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isConnecting) {
                      e.currentTarget.style.boxShadow = `0 0 30px ${TECH_WEEK_COLORS.hotPink}80`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isConnecting) {
                      e.currentTarget.style.boxShadow = '0 0 0 rgba(255, 105, 180, 0)';
                    }
                  }}
                >
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    {isConnecting ? (
                      <>
                        <Loader2
                          className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 animate-spin"
                          style={{ color: TECH_WEEK_COLORS.hotPink }}
                        />
                        <span
                          className="text-xs sm:text-sm font-semibold"
                          style={{ color: TECH_WEEK_COLORS.hotPink }}
                        >
                          Conectando...
                        </span>
                      </>
                    ) : (
                      <>
                        <Phone
                          className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 transition-colors"
                          style={{ color: TECH_WEEK_COLORS.hotPink }}
                        />
                        <span className="text-xs sm:text-sm font-semibold">Iniciar Práctica</span>
                      </>
                    )}
                  </div>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-8">
                {/* Tech Week Particle Sphere with Pink Colors */}
                <div className="mb-4 sm:mb-6 lg:mb-8">
                  <TechWeekParticleSphere isListening={!isSpeaking} isSpeaking={isSpeaking} />
                </div>

                {/* Active Call Button */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500/30 blur-xl animate-pulse" />

                  <Button
                    onClick={endConversation}
                    className="relative bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500 text-white px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.7)]"
                  >
                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                      <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-red-500" />
                      <span className="text-xs font-semibold text-red-500">Finalizar</span>
                    </div>
                  </Button>
                </div>

                {/* Status Indicators with Pink Theme */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
                  <div
                    className={`flex items-center gap-3 px-5 py-3 rounded-full border transition-all ${
                      !isSpeaking ? 'bg-opacity-10' : 'border-gray-700 bg-gray-900/50'
                    }`}
                    style={{
                      borderColor: !isSpeaking ? TECH_WEEK_COLORS.hotPink : 'rgb(55, 65, 81)',
                      backgroundColor: !isSpeaking ? `${TECH_WEEK_COLORS.hotPink}10` : 'rgb(17, 24, 39, 0.5)',
                      boxShadow: !isSpeaking ? `0 0 20px ${TECH_WEEK_COLORS.hotPink}30` : 'none'
                    }}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${!isSpeaking ? 'animate-pulse' : ''}`}
                      style={{
                        backgroundColor: !isSpeaking ? TECH_WEEK_COLORS.hotPink : 'rgb(75, 85, 99)',
                        boxShadow: !isSpeaking ? `0 0 10px ${TECH_WEEK_COLORS.hotPink}80` : 'none'
                      }}
                    />
                    <Mic
                      className="w-5 h-5"
                      style={{ color: !isSpeaking ? TECH_WEEK_COLORS.hotPink : 'rgb(107, 114, 128)' }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: !isSpeaking ? TECH_WEEK_COLORS.hotPink : 'rgb(107, 114, 128)' }}
                    >
                      Escuchando
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-3 px-5 py-3 rounded-full border transition-all ${
                      isSpeaking ? 'bg-opacity-10' : 'border-gray-700 bg-gray-900/50'
                    }`}
                    style={{
                      borderColor: isSpeaking ? TECH_WEEK_COLORS.deepPink : 'rgb(55, 65, 81)',
                      backgroundColor: isSpeaking ? `${TECH_WEEK_COLORS.deepPink}10` : 'rgb(17, 24, 39, 0.5)',
                      boxShadow: isSpeaking ? `0 0 20px ${TECH_WEEK_COLORS.deepPink}30` : 'none'
                    }}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${isSpeaking ? 'animate-pulse' : ''}`}
                      style={{
                        backgroundColor: isSpeaking ? TECH_WEEK_COLORS.deepPink : 'rgb(75, 85, 99)',
                        boxShadow: isSpeaking ? `0 0 10px ${TECH_WEEK_COLORS.deepPink}80` : 'none'
                      }}
                    />
                    <Volume2
                      className="w-5 h-5"
                      style={{ color: isSpeaking ? TECH_WEEK_COLORS.deepPink : 'rgb(107, 114, 128)' }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: isSpeaking ? TECH_WEEK_COLORS.deepPink : 'rgb(107, 114, 128)' }}
                    >
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
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-gray-500 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: TECH_WEEK_COLORS.hotPink,
                      boxShadow: `0 0 5px ${TECH_WEEK_COLORS.hotPink}80`
                    }}
                  />
                  <span>Práctica intensiva</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: TECH_WEEK_COLORS.hotPink,
                      boxShadow: `0 0 5px ${TECH_WEEK_COLORS.hotPink}80`
                    }}
                  />
                  <span>Pitch & presentaciones</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: TECH_WEEK_COLORS.hotPink,
                      boxShadow: `0 0 5px ${TECH_WEEK_COLORS.hotPink}80`
                    }}
                  />
                  <span>Feedback técnico</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat de conversación */}
      {isConnected && (
        <div className="w-full lg:w-96 flex flex-col bg-gray-900/30 border border-gray-700 rounded-xl max-h-[50vh] lg:max-h-none">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <MessageCircle
                className="w-5 h-5"
                style={{ color: TECH_WEEK_COLORS.hotPink }}
              />
              <h3 className="text-lg font-semibold text-white">Conversación Tech Week</h3>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0 max-h-[40vh] lg:max-h-[600px]">
            {conversationHistory.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  La conversación aparecerá aquí...
                </p>
              </div>
            ) : (
              conversationHistory.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.source === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg ${
                      message.source === 'user'
                        ? 'text-white rounded-br-none'
                        : 'bg-gray-700 text-white rounded-bl-none'
                    }`}
                    style={{
                      backgroundColor: message.source === 'user' ? TECH_WEEK_COLORS.deepPink : undefined
                    }}
                  >
                    <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.message}</p>
                    <p className={`text-xs mt-1 opacity-70 ${
                      message.source === 'user' ? 'text-pink-200' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isSpeaking ? (
                  <>
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: TECH_WEEK_COLORS.hotPink }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: TECH_WEEK_COLORS.hotPink }}
                    >
                      Escuchando...
                    </span>
                  </>
                ) : (
                  <>
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: TECH_WEEK_COLORS.deepPink }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: TECH_WEEK_COLORS.deepPink }}
                    >
                      Agente hablando...
                    </span>
                  </>
                )}
              </div>
              <span className="text-gray-500 text-xs">
                {conversationHistory.length} mensajes
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
