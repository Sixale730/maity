import { useState, useRef, useEffect } from 'react';
import { Button } from '@/ui/components/ui/button';
import { Phone, PhoneOff, Mic, Volume2, Loader2, MessageCircle } from 'lucide-react';
import { Conversation } from '@elevenlabs/client';
import { ParticleSphere } from './ParticleSphere';
import { MAITY_COLORS, CoachService, getUserInfo, createEvaluation, supabase } from '@maity/shared';
import { env } from '@/lib/env';
import { toast } from '@/shared/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/components/ui/dialog';

export function MaityVoiceAssistant() {
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

  // Session tracking para evaluación
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Evaluation results
  const [showResults, setShowResults] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<any>(null);

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
      // Create voice session in database
      const userInfo = await getUserInfo();
      if (!userInfo) {
        throw new Error('No se pudo obtener información del usuario');
      }

      const session = await CoachService.createVoiceSession(
        userInfo.id,
        userInfo.company_id || undefined
      );

      setSessionId(session.id);
      setSessionStartTime(new Date());

      console.log('✅ [Coach] Voice session created:', session.id);

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
    if (!conversation) return;

    try {
      // End the ElevenLabs conversation
      await conversation.endSession();
      setConversation(null);
      setIsConnected(false);
      setIsSpeaking(false);

      // Check if we have a valid session and conversation history
      if (!sessionId || !sessionStartTime || conversationHistory.length === 0) {
        console.log('⚠️ [Coach] No session data or conversation history');
        resetState();
        return;
      }

      // Calculate duration
      const duration = Math.round((Date.now() - sessionStartTime.getTime()) / 1000);

      // Format transcript from conversation history
      const transcript = conversationHistory
        .map(msg => {
          const speaker = msg.source === 'user' ? 'Usuario' : 'Maity';
          return `${speaker}: ${msg.message}`;
        })
        .join('\n');

      console.log('📝 [Coach] Formatted transcript:', {
        sessionId,
        duration,
        messageCount: conversationHistory.length,
        transcriptLength: transcript.length
      });

      // Update session with transcript and duration
      await CoachService.updateVoiceSession(sessionId, {
        duration_seconds: duration,
        raw_transcript: transcript,
        status: 'completed',
        ended_at: new Date().toISOString()
      });

      // Check if conversation is too short (less than 3 user messages)
      const userMessageCount = conversationHistory.filter(m => m.source === 'user').length;
      if (userMessageCount < 3) {
        console.log('⚠️ [Coach] Sesión muy corta, no se evaluará');
        toast({
          title: "Sesión completada",
          description: "La sesión fue muy breve para una evaluación completa.",
          variant: "default"
        });
        resetState();
        return;
      }

      // Show evaluating state
      setIsEvaluating(true);

      // Create evaluation record
      const userInfo = await getUserInfo();
      if (!userInfo) {
        throw new Error('No se pudo obtener información del usuario');
      }

      const requestId = crypto.randomUUID();
      const { data: _evaluationData, error: createError } = await createEvaluation(
        requestId,
        userInfo.id,
        sessionId
      );

      if (createError) {
        console.error('❌ [Coach] Error al crear evaluation:', createError);
        throw new Error('Error al crear evaluación');
      }

      console.log('✅ [Coach] Evaluation record created');

      // Get auth session for Bearer token
      const { data: { session: authSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !authSession) {
        console.error('❌ [Coach] Error obteniendo sesión de auth:', sessionError);
        throw new Error('Error de autenticación');
      }

      // Call OpenAI evaluation API
      console.log('🔄 [Coach] Llamando API de evaluación...');

      const evaluationResponse = await fetch(`${env.apiUrl}/api/evaluate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession.access_token}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          request_id: requestId
        })
      });

      if (!evaluationResponse.ok) {
        const errorData = await evaluationResponse.json().catch(() => null);
        console.error('❌ [Coach] Error de API:', {
          status: evaluationResponse.status,
          errorData
        });
        throw new Error(errorData?.message || `Error ${evaluationResponse.status}`);
      }

      const { evaluation } = await evaluationResponse.json();

      console.log('✅ [Coach] Evaluación completada:', {
        score: evaluation.score,
        passed: evaluation.passed
      });

      // Show results
      setEvaluationResults({
        score: evaluation.score,
        passed: evaluation.passed,
        result: evaluation.result,
        duration,
        messageCount: conversationHistory.length
      });
      setShowResults(true);

    } catch (error) {
      console.error('❌ [Coach] Error al finalizar sesión:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al procesar la sesión',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Reset state after session
  const resetState = () => {
    setError(null);
    setTranscript('');
    setAgentResponse('');
    setConversationHistory([]);
    setSessionId(null);
    setSessionStartTime(null);
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

      {/* Evaluating Loading Modal */}
      <Dialog open={isEvaluating} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Evaluando sesión...</DialogTitle>
            <DialogDescription className="text-center pt-4">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: MAITY_COLORS.primary }} />
              <p className="text-gray-400">
                Analizando tu conversación con inteligencia artificial.
                <br />
                Esto puede tomar unos segundos.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Results Modal */}
      <Dialog open={showResults} onOpenChange={(open) => {
        setShowResults(open);
        if (!open) {
          resetState();
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Resultados de la Sesión</DialogTitle>
            <DialogDescription>
              Análisis de tu conversación con Maity
            </DialogDescription>
          </DialogHeader>

          {evaluationResults && (
            <div className="space-y-6 py-4">
              {/* Score Display */}
              <div className="text-center">
                <div className="inline-block p-8 rounded-full" style={{
                  backgroundColor: `${MAITY_COLORS.primary}10`,
                  border: `2px solid ${MAITY_COLORS.primary}`
                }}>
                  <div className="text-5xl font-bold" style={{ color: MAITY_COLORS.primary }}>
                    {evaluationResults.score}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">Puntuación</div>
                </div>
              </div>

              {/* Session Stats */}
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-white">{evaluationResults.duration}s</div>
                  <div className="text-sm text-gray-400">Duración</div>
                </div>
                <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-white">{evaluationResults.messageCount}</div>
                  <div className="text-sm text-gray-400">Mensajes</div>
                </div>
              </div>

              {/* Evaluation Details */}
              {evaluationResults.result && (
                <div className="space-y-4">
                  {/* Summary */}
                  {evaluationResults.result.summary && (
                    <div>
                      <h4 className="font-semibold text-white mb-2">Resumen</h4>
                      <p className="text-gray-300 text-sm">{evaluationResults.result.summary}</p>
                    </div>
                  )}

                  {/* Strengths */}
                  {evaluationResults.result.strengths && evaluationResults.result.strengths.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: MAITY_COLORS.primary }}>
                        Fortalezas
                      </h4>
                      <ul className="space-y-2">
                        {evaluationResults.result.strengths.map((strength: string, idx: number) => (
                          <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                            <span style={{ color: MAITY_COLORS.primary }}>✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {evaluationResults.result.areas_for_improvement && evaluationResults.result.areas_for_improvement.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-yellow-500 mb-2">Áreas de Mejora</h4>
                      <ul className="space-y-2">
                        {evaluationResults.result.areas_for_improvement.map((area: string, idx: number) => (
                          <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-yellow-500">→</span>
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {evaluationResults.result.recommendations && evaluationResults.result.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-400 mb-2">Recomendaciones</h4>
                      <ul className="space-y-2">
                        {evaluationResults.result.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-blue-400">💡</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Close Button */}
              <div className="pt-4">
                <Button
                  onClick={() => {
                    setShowResults(false);
                    resetState();
                  }}
                  className="w-full"
                  style={{ backgroundColor: MAITY_COLORS.primary }}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}