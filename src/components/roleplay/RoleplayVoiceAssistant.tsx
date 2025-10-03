import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Mic, Volume2, Loader2, MessageCircle } from 'lucide-react';
import { Conversation } from '@elevenlabs/client';
import { ParticleSphere } from '../coach/ParticleSphere';
import { MAITY_COLORS } from '@/lib/colors';

interface RoleplayVoiceAssistantProps {
  selectedProfile?: 'CEO' | 'CTO' | 'CFO';
  questionnaireId?: string;
  userName?: string;
  userId?: string;
  scenarioCode?: string;
  scenarioName?: string;
  sessionId?: string;
  onSessionStart?: () => Promise<string | null>;
  onSessionEnd?: (transcript: string, duration: number, sessionId?: string, messages?: Array<{
    id: string;
    timestamp: Date;
    source: 'user' | 'ai';
    message: string;
  }>) => void;
  // Información adicional del perfil y escenario
  profileDescription?: string;
  profileKeyFocus?: string;
  profileCommunicationStyle?: string;
  difficultyLevel?: number;
  difficultyName?: string;
  difficultyMood?: string;
}

export function RoleplayVoiceAssistant({
  selectedProfile = 'CEO',
  questionnaireId,
  userName,
  userId,
  scenarioCode = 'first_visit',
  scenarioName = 'Primera Visita',
  sessionId,
  onSessionStart,
  onSessionEnd,
  profileDescription,
  profileKeyFocus,
  profileCommunicationStyle,
  difficultyLevel = 1,
  difficultyName = 'Fácil',
  difficultyMood = 'neutral'
}: RoleplayVoiceAssistantProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [agentResponse, setAgentResponse] = useState<string>('');

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
  const fullTranscriptRef = useRef<string>('');

  // Estado para rastrear si la conexión es segura
  const [isConnectionStable, setIsConnectionStable] = useState(false);

  // Ref para el scroll del chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Flag para saber si el usuario clickeó "Finalizar"
  const userEndedSessionRef = useRef(false);

  // Auto scroll al final del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

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
      fullTranscriptRef.current += `Agente ${selectedProfile}: ${message}\n`;
    }
  };

  // DEPRECATED: El webhook ahora se envía desde RoleplayPage con request_id
  // Esta función se mantiene comentada por si se necesita en el futuro
  /*
  const sendTranscriptionToWebhook = async (transcript: string, duration: number) => {
    try {
      const payload = {
        session_id: sessionId || 'test-session-id',
        user_id: userId || 'test-user-id',
        user_name: userName || 'Usuario',
        profile: selectedProfile,
        scenario_code: scenarioCode,
        scenario_name: scenarioName,
        transcript: transcript || 'No transcript available',
        duration_seconds: duration,
        timestamp: new Date().toISOString()
      };

      console.log('📤 Enviando transcripción al webhook:', {
        url: 'https://aca-maity.lemonglacier-45d07388.eastus2.azurecontainerapps.io/webhook/transcription',
        payload
      });

      const response = await fetch('https://aca-maity.lemonglacier-45d07388.eastus2.azurecontainerapps.io/webhook/transcription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        mode: 'cors'
      });

      console.log('📥 Respuesta del webhook:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error enviando transcripción al webhook:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
      } else {
        console.log('✅ Transcripción enviada exitosamente al webhook');
      }
    } catch (error) {
      console.error('❌ Error enviando transcripción:', error);
    }
  };
  */

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

  // Get signed URL - USANDO VARIABLES DE TEST
  const getSignedUrl = async (): Promise<string | null> => {
    try {
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY_TEST;
      const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID_TEST;

      if (!apiKey || !agentId) {
        throw new Error('Configuración de prueba incompleta');
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
      setError('Error al conectar con el servicio de roleplay');
      return null;
    }
  };

  // State para la sesión actual - actualizar cuando cambie el prop
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);

  // Actualizar currentSessionId cuando cambie el prop sessionId
  React.useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      console.log('📝 [RoleplayVoiceAssistant] Actualizando sessionId desde props:', sessionId);
      setCurrentSessionId(sessionId);
    }
  }, [sessionId]);

  // Start conversation
  const startConversation = async () => {
    console.log('🚀 [RoleplayVoiceAssistant] startConversation iniciado', {
      hasOnSessionStart: !!onSessionStart,
      currentSessionId,
      sessionIdFromProps: sessionId
    });

    // Resetear el flag al iniciar una nueva sesión
    userEndedSessionRef.current = false;

    // Limpiar estados anteriores para una nueva sesión
    setConversationHistory([]);
    fullTranscriptRef.current = '';
    setTranscript('');
    setAgentResponse('');
    setSessionStartTime(null);

    setIsConnecting(true);
    setError(null);

    // Check microphone permission
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      setIsConnecting(false);
      return;
    }

    // Crear sesión de práctica si tenemos onSessionStart
    if (onSessionStart && !currentSessionId) {
      console.log('🎯 [RoleplayVoiceAssistant] Creando sesión de práctica...');
      const newSessionId = await onSessionStart();

      if (newSessionId) {
        console.log('✅ [RoleplayVoiceAssistant] Sesión creada:', newSessionId);
        setCurrentSessionId(newSessionId);
      } else {
        console.warn('⚠️ [RoleplayVoiceAssistant] No se pudo crear sesión, continuando sin ella');
      }
    } else {
      console.log('⚠️ [RoleplayVoiceAssistant] No se creará sesión:', {
        hasOnSessionStart: !!onSessionStart,
        currentSessionId,
        skipReason: !onSessionStart ? 'No hay onSessionStart' : 'Ya existe currentSessionId'
      });
    }

    // Get signed URL
    const signedUrl = await getSignedUrl();
    if (!signedUrl) {
      setIsConnecting(false);
      return;
    }

    try {
      // Preparar variables dinámicas con nombres exactos para ElevenLabs
      const dynamicVars = {
        // Usuario
        user_name: userName || 'Usuario',

        // Perfil (voice_agent_profiles)
        profile: selectedProfile,
        profile_description: profileDescription || '',
        profile_key_focus: profileKeyFocus || '',
        profile_style: profileCommunicationStyle || '',

        // Escenario (voice_scenarios) - NOTA: "scenary" con typo intencional
        scenary: scenarioName,  // Typo intencional como especificado
        scenario_code: scenarioCode,

        // Dificultad (voice_difficulty_levels)
        difficulty: difficultyName,
        level: difficultyLevel.toString(),
        mood: difficultyMood || 'neutral',

        // IDs para tracking
        questionnaire_id: questionnaireId || '',
        session_id: sessionId || ''
      };

      console.log('🚀 Enviando variables dinámicas a ElevenLabs:', dynamicVars);

      // Start conversation session
      const newConversation = await Conversation.startSession({
        signedUrl: signedUrl,
        dynamicVariables: dynamicVars,
        onConnect: () => {
          console.log('✅ Connected to Roleplay Agent');
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
          setSessionStartTime(new Date());

          // Marcar la conexión como estable después de un breve retraso
          setTimeout(() => {
            setIsConnectionStable(true);
            console.log('✅ Connection is now stable');
          }, 1000);
        },
        onDisconnect: (error?: any) => {
          console.log('🔌 Disconnected from Roleplay Agent', error);
          setIsConnected(false);
          setIsSpeaking(false);
          setIsConnectionStable(false);

          // Calcular duración de la sesión para diagnosticar
          const sessionDuration = sessionStartTime
            ? Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000)
            : 0;

          console.log(`📊 Sesión terminada después de ${sessionDuration} segundos`);

          // Si el usuario clickeó "Finalizar", no hacer nada (ya se procesó)
          if (userEndedSessionRef.current) {
            console.log('✅ Sesión terminada por el usuario (botón Finalizar)');
            return;
          }

          // Si ya estamos procesando, no hacer nada
          if (isProcessing) {
            console.log('⏳ Ya estamos procesando la sesión');
            return;
          }

          // Si hay transcripción válida Y mensajes en el historial, el agente terminó la sesión
          if (fullTranscriptRef.current && conversationHistory.length > 0) {
            console.log('🤖 El agente terminó la sesión - procesando transcripción...', {
              transcriptLength: fullTranscriptRef.current.length,
              messagesCount: conversationHistory.length,
              duration: sessionDuration
            });

            // Marcar como procesando
            setIsProcessing(true);

            // Procesar la sesión como si el usuario la hubiera terminado
            setTimeout(() => {
              setIsProcessing(false);
              console.log('📤 [onDisconnect] Llamando onSessionEnd con:', {
                hasOnSessionEnd: !!onSessionEnd,
                currentSessionId,
                transcriptLength: fullTranscriptRef.current.length,
                duration: sessionDuration
              });

              if (onSessionEnd) {
                onSessionEnd(fullTranscriptRef.current, sessionDuration, currentSessionId || undefined, conversationHistory);
              } else {
                console.error('❌ [onDisconnect] No hay onSessionEnd callback!');
              }
            }, 500);

            return;
          }

          // Si llegamos aquí, fue una desconexión inesperada o error
          if (error) {
            console.error('❌ Desconexión inesperada:', error);

            // Si se desconectó muy rápido (< 20 segundos), probablemente es límite
            if (sessionDuration > 0 && sessionDuration < 20) {
              setError('⚠️ Sesión terminada prematuramente. Es posible que hayas alcanzado el límite de uso gratuito de ElevenLabs.');
            } else {
              setError('La conexión se cerró inesperadamente. Por favor, intenta nuevamente.');
            }
          }
        },
        onError: (error) => {
          console.error('❌ Conversation error:', error);

          // Manejo específico para errores de cuota/límites
          if (error?.message?.includes('quota') ||
              error?.message?.includes('limit') ||
              error?.message?.includes('rate') ||
              error?.message?.includes('429') ||
              error?.message?.includes('insufficient')) {
            console.error('⚠️ Límite de ElevenLabs alcanzado');
            setError('Se ha alcanzado el límite de uso de ElevenLabs. Por favor, intenta más tarde o contacta al administrador.');
          }
          // Manejo específico para errores de WebSocket
          else if (error?.message?.includes('WebSocket') || error?.message?.includes('CLOSING') || error?.message?.includes('CLOSED')) {
            console.log('🔄 WebSocket error detected, cleaning up...');

            // Si la sesión se cortó muy rápido, probablemente es límite de cuota
            const sessionDuration = sessionStartTime
              ? Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000)
              : 0;

            if (sessionDuration < 30) {
              setError('La sesión se terminó prematuramente. Posible límite de cuota alcanzado.');
            } else {
              setError('Conexión perdida. Por favor, reinicia la práctica.');
            }

            // Limpiar la conexión actual
            if (conversation) {
              try {
                conversation.endSession().catch(e => console.log('Session already ended'));
              } catch (e) {
                console.log('Session cleanup error:', e);
              }
            }
            setConversation(null);
          } else {
            setError('Error en la conversación. Verifica tu conexión y límites de uso.');
          }

          setIsConnecting(false);
          setIsConnected(false);
        },
        onModeChange: ({ mode }) => {
          setIsSpeaking(mode === 'speaking');
          console.log('Mode changed to:', mode);
        },
        onMessage: ({ source, message }) => {
          console.log('📝 Message from:', source, '→', message);
          if (source === 'user') {
            setTranscript(message);
            addMessageToHistory('user', message);
            console.log('🎤 USER TRANSCRIPT:', message);
          } else if (source === 'ai') {
            setAgentResponse(message);
            addMessageToHistory('ai', message);
            console.log('🤖 AGENT RESPONSE:', message);
          }
        },
        onStatusChange: ({ status }) => {
          console.log('📊 Status changed to:', status);

          // Manejar cambios de estado problemáticos
          if (status === 'disconnecting' || status === 'disconnected') {
            console.warn('⚠️ Connection status:', status);

            // Si se desconecta inesperadamente durante una sesión activa
            if (isConnected && !isProcessing && status === 'disconnected') {
              console.error('❌ Unexpected disconnection during active session');
              setIsConnected(false);
              setConversation(null);
              setError('La sesión se desconectó. Por favor, reinicia la práctica.');
            }
          }

          // Log adicional para debugging
          if (status === 'error') {
            console.error('❌ Status error detected');
          }
        }
      });

      setConversation(newConversation);
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('No se pudo iniciar la conversación de roleplay');
      setIsConnecting(false);
    }
  };

  // End conversation
  const endConversation = async () => {
    if (conversation) {
      // Marcar que el usuario terminó la sesión manualmente
      userEndedSessionRef.current = true;

      // Marcar que estamos procesando para evitar errores de desconexión
      setIsProcessing(true);

      // Calcular duración
      const duration = sessionStartTime
        ? Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000)
        : 0;

      try {
        // Terminar sesión de ElevenLabs de forma segura
        console.log('🛑 Terminando sesión de ElevenLabs...');
        await conversation.endSession();
        console.log('✅ Sesión terminada correctamente');
      } catch (error) {
        console.warn('⚠️ Error al terminar sesión (puede ya estar cerrada):', error);
      }

      // Limpiar estado
      setConversation(null);
      setIsConnected(false);
      setIsSpeaking(false);

      // NO enviar webhook aquí - se envía desde RoleplayPage con request_id
      // await sendTranscriptionToWebhook(fullTranscriptRef.current, duration);

      // Transición rápida a resultados (500ms para cerrar suavemente)
      setTimeout(() => {
        setIsProcessing(false);
        // Llamar callback con transcripción y duración
        console.log('📤 [RoleplayVoiceAssistant] Llamando onSessionEnd con:', {
          hasOnSessionEnd: !!onSessionEnd,
          currentSessionId,
          transcriptLength: fullTranscriptRef.current.length,
          duration
        });
        if (onSessionEnd) {
          // Pasar el sessionId y los mensajes como parámetros adicionales
          onSessionEnd(fullTranscriptRef.current, duration, currentSessionId || undefined, conversationHistory);
        } else {
          console.error('❌ [RoleplayVoiceAssistant] No hay onSessionEnd callback!');
        }

        // Resetear el flag después de procesar
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
            Práctica con {selectedProfile}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
            {selectedProfile === 'CEO' && 'Enfocado en visión estratégica y ROI'}
            {selectedProfile === 'CTO' && 'Enfocado en arquitectura técnica y capacidades'}
            {selectedProfile === 'CFO' && 'Enfocado en números y presupuesto'}
          </p>
        </div>

        {/* Main Button Area */}
        <div className="flex justify-center">
          {isProcessing ? (
            // Estado de procesamiento
            <div className="flex flex-col items-center gap-6">
              <div className="p-8 bg-blue-500/10 rounded-full">
                <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">Procesando tu sesión...</h3>
                <p className="text-gray-400">Analizando la conversación y calculando resultados</p>
              </div>
            </div>
          ) : !isConnected ? (
            <div className="relative">
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-full blur-2xl animate-pulse"
                style={{ backgroundColor: `${MAITY_COLORS.primary}20` }}
              />

              <Button
                onClick={startConversation}
                disabled={isConnecting}
                className="relative bg-black hover:bg-gray-900 text-white px-8 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12 rounded-full transition-all duration-300 hover:scale-105 group"
                style={{
                  borderWidth: '2px',
                  borderColor: MAITY_COLORS.primary,
                  boxShadow: isConnecting ? 'none' : `0 0 0 rgba(27, 234, 154, 0)`,
                }}
                onMouseEnter={(e) => {
                  if (!isConnecting) {
                    e.currentTarget.style.borderColor = MAITY_COLORS.primary;
                    e.currentTarget.style.boxShadow = `0 0 30px ${MAITY_COLORS.primary}80`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isConnecting) {
                    e.currentTarget.style.borderColor = MAITY_COLORS.primary;
                    e.currentTarget.style.boxShadow = '0 0 0 rgba(27, 234, 154, 0)';
                  }
                }}
              >
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  {isConnecting ? (
                    <>
                      <Loader2
                        className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 animate-spin"
                        style={{ color: MAITY_COLORS.primary }}
                      />
                      <span
                        className="text-xs sm:text-sm font-semibold"
                        style={{ color: MAITY_COLORS.primary }}
                      >
                        Conectando...
                      </span>
                    </>
                  ) : (
                    <>
                      <Phone
                        className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 transition-colors"
                        style={{ color: MAITY_COLORS.primary }}
                      />
                      <span className="text-xs sm:text-sm font-semibold">Iniciar Práctica</span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {/* Animated Particle Sphere */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <ParticleSphere isListening={!isSpeaking} isSpeaking={isSpeaking} />
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

              {/* Status Indicators */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
                <div
                  className={`flex items-center gap-3 px-5 py-3 rounded-full border transition-all ${
                    !isSpeaking ? 'bg-opacity-10' : 'border-gray-700 bg-gray-900/50'
                  }`}
                  style={{
                    borderColor: !isSpeaking ? MAITY_COLORS.primary : 'rgb(55, 65, 81)',
                    backgroundColor: !isSpeaking ? `${MAITY_COLORS.primary}10` : 'rgb(17, 24, 39, 0.5)',
                    boxShadow: !isSpeaking ? `0 0 20px ${MAITY_COLORS.primary}30` : 'none'
                  }}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${!isSpeaking ? 'animate-pulse' : ''}`}
                    style={{
                      backgroundColor: !isSpeaking ? MAITY_COLORS.primary : 'rgb(75, 85, 99)',
                      boxShadow: !isSpeaking ? `0 0 10px ${MAITY_COLORS.primary}80` : 'none'
                    }}
                  />
                  <Mic
                    className="w-5 h-5"
                    style={{ color: !isSpeaking ? MAITY_COLORS.primary : 'rgb(107, 114, 128)' }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: !isSpeaking ? MAITY_COLORS.primary : 'rgb(107, 114, 128)' }}
                  >
                    Escuchando
                  </span>
                </div>

                <div
                  className={`flex items-center gap-3 px-5 py-3 rounded-full border transition-all ${
                    isSpeaking ? 'bg-opacity-10' : 'border-gray-700 bg-gray-900/50'
                  }`}
                  style={{
                    borderColor: isSpeaking ? MAITY_COLORS.secondary : 'rgb(55, 65, 81)',
                    backgroundColor: isSpeaking ? `${MAITY_COLORS.secondary}10` : 'rgb(17, 24, 39, 0.5)',
                    boxShadow: isSpeaking ? `0 0 20px ${MAITY_COLORS.secondary}30` : 'none'
                  }}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${isSpeaking ? 'animate-pulse' : ''}`}
                    style={{
                      backgroundColor: isSpeaking ? MAITY_COLORS.secondary : 'rgb(75, 85, 99)',
                      boxShadow: isSpeaking ? `0 0 10px ${MAITY_COLORS.secondary}80` : 'none'
                    }}
                  />
                  <Volume2
                    className="w-5 h-5"
                    style={{ color: isSpeaking ? MAITY_COLORS.secondary : 'rgb(107, 114, 128)' }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: isSpeaking ? MAITY_COLORS.secondary : 'rgb(107, 114, 128)' }}
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
                    backgroundColor: MAITY_COLORS.primary,
                    boxShadow: `0 0 5px ${MAITY_COLORS.primary}80`
                  }}
                />
                <span>Simulación realista</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: MAITY_COLORS.primary,
                    boxShadow: `0 0 5px ${MAITY_COLORS.primary}80`
                  }}
                />
                <span>Diferentes perfiles</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: MAITY_COLORS.primary,
                    boxShadow: `0 0 5px ${MAITY_COLORS.primary}80`
                  }}
                />
                <span>Feedback inmediato</span>
              </div>
            </div>
          </div>
        )}

        {/* Active Connection Info */}
        {isConnected && conversationHistory.length === 0 && (
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Practica tu pitch de ventas, manejo de objeciones y técnicas de cierre
            </p>
          </div>
        )}
        </div>
      </div>

      {/* Chat de conversación - Responsive */}
      {isConnected && (
        <div className="w-full lg:w-96 flex flex-col bg-gray-900/30 border border-gray-700 rounded-xl max-h-[50vh] lg:max-h-none">
          {/* Header del chat */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <MessageCircle
                className="w-5 h-5"
                style={{ color: MAITY_COLORS.primary }}
              />
              <h3 className="text-lg font-semibold text-white">Conversación de Práctica</h3>
            </div>
          </div>

          {/* Chat messages */}
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
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-700 text-white rounded-bl-none'
                    }`}
                  >
                    <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.message}</p>
                    <p className={`text-xs mt-1 opacity-70 ${
                      message.source === 'user' ? 'text-blue-200' : 'text-gray-400'
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

          {/* Status bar del chat */}
          <div className="p-3 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isSpeaking ? (
                  <>
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: MAITY_COLORS.primary }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: MAITY_COLORS.primary }}
                    >
                      Escuchando...
                    </span>
                  </>
                ) : (
                  <>
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: MAITY_COLORS.secondary }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: MAITY_COLORS.secondary }}
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