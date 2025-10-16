import { useState, useRef, useEffect } from 'react';
import { Button } from '@/ui/components/ui/button';
import { Phone, PhoneOff, Mic, Volume2, Loader2, MessageCircle } from 'lucide-react';
import { Conversation } from '@elevenlabs/client';
import { ParticleSphere } from './ParticleSphere';
import { MAITY_COLORS } from '@maity/shared';

export function MaityVoiceAssistant() {
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

  // Ref para el scroll del chat
  const chatEndRef = useRef<HTMLDivElement>(null);

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
      setTranscript('');
      setAgentResponse('');
      setConversationHistory([]);
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
            Habla con Maity
          </h2>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
            Tu coach personal en habilidades blandas
          </p>
        </div>

        {/* Main Button Area */}
        <div className="flex justify-center">
          {!isConnected ? (
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
                      <span className="text-xs sm:text-sm font-semibold">Iniciar Sesión</span>
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
                <span>Conversación natural</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: MAITY_COLORS.primary,
                    boxShadow: `0 0 5px ${MAITY_COLORS.primary}80`
                  }}
                />
                <span>Coaching personalizado</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: MAITY_COLORS.primary,
                    boxShadow: `0 0 5px ${MAITY_COLORS.primary}80`
                  }}
                />
                <span>Respuestas inmediatas</span>
              </div>
            </div>
          </div>
        )}

        {/* Active Connection Info */}
        {isConnected && conversationHistory.length === 0 && (
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Háblame sobre tus desafíos en liderazgo, comunicación o trabajo en equipo
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
              <h3 className="text-lg font-semibold text-white">Conversación</h3>
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
                      Maity hablando...
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