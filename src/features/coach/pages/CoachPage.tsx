import { useState } from 'react';
import { SidebarTrigger } from '@/ui/components/ui/sidebar';
import { MaityVoiceAssistant } from '../components/MaityVoiceAssistant';
import { CoachService, UserService, createEvaluation, supabase, MAITY_COLORS } from '@maity/shared';
import { env } from '@/lib/env';
import { toast } from '@/shared/hooks/use-toast';
import { Card } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { Loader2, Trophy, Clock, RefreshCw, FileText, CheckCircle, XCircle, Brain, Target } from 'lucide-react';

export function CoachPage() {
  const [showResults, setShowResults] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
  const [userName, setUserName] = useState<string>('Usuario');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');

  // onSessionStart: Crear sesión en DB
  const handleSessionStart = async (): Promise<string | null> => {
    try {
      const userInfo = await UserService.getUserInfo();
      if (userInfo?.name) {
        setUserName(userInfo.name);
      }
      const session = await CoachService.createVoiceSession(
        userInfo?.company_id || undefined
      );
      console.log('✅ [Coach] Voice session created:', session.id);
      setCurrentSessionId(session.id);
      return session.id;
    } catch (error) {
      console.error('❌ Error creating voice session:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear la sesión',
      });
      return null;
    }
  };

  // onSessionEnd: Actualizar DB + Evaluar con OpenAI
  const handleSessionEnd = async (
    transcript: string,
    duration: number,
    sessionId?: string,
    messages?: Array<{
      id: string;
      timestamp: Date;
      source: 'user' | 'ai';
      message: string;
    }>
  ) => {
    console.log('🎯 [Coach] handleSessionEnd:', {
      sessionId,
      transcriptLength: transcript.length,
      duration,
      messagesCount: messages?.length
    });

    if (!sessionId || !transcript) {
      console.log('⚠️ [Coach] No session data');
      return;
    }

    try {
      // Guardar transcript
      setCurrentTranscript(transcript);

      // Actualizar sesión con transcript
      const updateResult = await CoachService.updateVoiceSession(sessionId, {
        duration_seconds: duration,
        raw_transcript: transcript,
        status: 'completed',
        ended_at: new Date().toISOString()
      });

      console.log('✅ [Coach] Sesión actualizada:', {
        sessionId: updateResult?.id,
        status: updateResult?.status,
        hasTranscript: !!updateResult?.raw_transcript
      });

      // Wait for DB transaction to complete (prevents race condition)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar mínimo 3 mensajes de usuario
      const userMessageCount = messages?.filter(m => m.source === 'user').length || 0;

      // Mostrar resultados inmediatamente con estado de procesamiento
      setEvaluationResults({
        sessionId,
        duration,
        messageCount: messages?.length || 0,
        userMessageCount,
        transcript,
        isProcessing: true,
        score: null,
        passed: null
      });
      setShowResults(true);

      // Si hay muy pocos mensajes, completar sin evaluación
      if (userMessageCount < 3) {
        console.log('⚠️ [Coach] Muy pocos mensajes para evaluación completa');
        setEvaluationResults(prev => ({
          ...prev,
          isProcessing: false,
          score: 0,
          passed: false,
          result: {
            summary: 'La sesión fue muy breve para una evaluación completa.',
            strengths: [],
            areas_for_improvement: ['Extender la duración de la conversación', 'Proporcionar más contexto en las respuestas'],
            recommendations: ['Intenta tener una conversación más larga', 'Profundiza en los temas discutidos']
          }
        }));
        return;
      }

      // Evaluar con OpenAI
      const userInfo = await UserService.getUserInfo();

      if (!userInfo) {
        throw new Error('No se pudo obtener información del usuario');
      }

      const requestId = crypto.randomUUID();

      await createEvaluation(requestId, userInfo.user_id, sessionId);

      const { data: { session: authSession } } = await supabase.auth.getSession();

      if (!authSession) {
        throw new Error('No hay sesión de autenticación');
      }

      console.log('📤 [Coach] Llamando a evaluate-session API...');
      const response = await fetch(`${env.apiUrl}/api/evaluate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession.access_token}`
        },
        body: JSON.stringify({ session_id: sessionId, request_id: requestId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [Coach] Error en evaluate-session:', errorData);
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const { evaluation } = await response.json();
      console.log('✅ [Coach] Evaluación recibida:', evaluation);

      // Actualizar con resultados reales
      setEvaluationResults(prev => ({
        ...prev,
        isProcessing: false,
        score: evaluation.score,
        passed: evaluation.passed,
        result: evaluation.result
      }));

    } catch (error) {
      console.error('❌ [Coach] Error:', error);

      // Actualizar resultados con error
      setEvaluationResults(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Error al evaluar la sesión'
      }));

      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al evaluar la sesión'
      });
    }
  };

  const handleRetry = () => {
    setShowResults(false);
    setEvaluationResults(null);
    setCurrentSessionId(null);
    setCurrentTranscript('');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  // Mostrar pantalla de resultados
  if (showResults && evaluationResults) {
    return (
      <div className="min-h-screen bg-black p-3 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Resultados de Coach</h1>
            <p className="text-sm sm:text-base text-gray-400">
              Tu sesión de coaching con Maity
            </p>
          </div>

          {/* Score Principal */}
          <Card className={`bg-gray-900/50 border ${evaluationResults.isProcessing ? 'border-blue-500/20' : getScoreBg(evaluationResults.score || 0)} p-4 sm:p-6 lg:p-8`}>
            <div className="text-center space-y-3 sm:space-y-4">
              {evaluationResults.isProcessing ? (
                <>
                  <div className="flex justify-center">
                    <div className="p-3 sm:p-4 bg-blue-500/10 rounded-full animate-pulse">
                      <Brain className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400">
                      Evaluando tu sesión...
                    </div>
                    <p className="text-sm sm:text-base text-gray-400">
                      Analizando tu conversación con inteligencia artificial
                    </p>
                    <div className="flex justify-center">
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-blue-400" />
                    </div>
                  </div>
                </>
              ) : evaluationResults.error ? (
                <>
                  <div className="flex justify-center">
                    <div className="p-3 sm:p-4 bg-red-500/10 rounded-full">
                      <XCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-red-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-400">
                      Error al procesar evaluación
                    </div>
                    <p className="text-sm sm:text-base text-gray-400">
                      {evaluationResults.error}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    {evaluationResults.passed ? (
                      <div className="p-3 sm:p-4 bg-green-500/10 rounded-full">
                        <Trophy className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-green-400" />
                      </div>
                    ) : (
                      <div className="p-3 sm:p-4 bg-yellow-500/10 rounded-full">
                        <Target className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-yellow-400" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                      <span className={getScoreColor(evaluationResults.score || 0)}>{evaluationResults.score || '—'}</span>
                      <span className="text-gray-500">/100</span>
                    </div>
                    <p className="text-base sm:text-lg lg:text-xl mt-2">
                      {evaluationResults.passed ? (
                        <span className="text-green-400">¡Excelente sesión!</span>
                      ) : (
                        <span className="text-yellow-400">Sigue practicando</span>
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Métricas de Sesión */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/20 p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Duración</h3>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                    {formatDuration(evaluationResults.duration)}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/20 p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-purple-500/10 rounded-lg">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Mensajes</h3>
                  <div className="text-2xl sm:text-3xl font-bold text-purple-400">
                    {evaluationResults.messageCount}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Resultados Detallados */}
          {!evaluationResults.isProcessing && evaluationResults.result && (
            <Card className="bg-gray-900/50 border-gray-800 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Feedback Detallado</h3>

              <div className="space-y-4">
                {/* Resumen */}
                {evaluationResults.result.summary && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Resumen</h4>
                    <p className="text-gray-300 text-sm">{evaluationResults.result.summary}</p>
                  </div>
                )}

                {/* Fortalezas */}
                {evaluationResults.result.strengths && evaluationResults.result.strengths.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2" style={{ color: MAITY_COLORS.primary }}>
                      Fortalezas
                    </h4>
                    <ul className="space-y-2">
                      {evaluationResults.result.strengths.map((strength: string, idx: number) => (
                        <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: MAITY_COLORS.primary }} />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Áreas de Mejora */}
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

                {/* Recomendaciones */}
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
            </Card>
          )}

          {/* Acciones */}
          <Card className="bg-gray-900/50 border-gray-800 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                onClick={handleRetry}
                variant="outline"
                className="flex items-center justify-center gap-2"
                style={{ borderColor: MAITY_COLORS.primary }}
              >
                <RefreshCw className="h-4 w-4" />
                Nueva Sesión
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Pantalla principal de Coach
  return (
    <div className="flex-1 min-h-screen bg-black">
      <main className="w-full">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-white hover:bg-white/10" />
            <div>
              <h1 className="text-3xl font-bold text-white">Coach Maity</h1>
              <p className="text-white/70">Tu coach en habilidades blandas</p>
            </div>
          </div>
        </div>

        {/* Main Content - Voice Coach */}
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          <MaityVoiceAssistant
            userName={userName}
            onSessionStart={handleSessionStart}
            onSessionEnd={handleSessionEnd}
          />
        </div>
      </main>
    </div>
  );
}
