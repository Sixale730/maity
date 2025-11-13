import { useState } from 'react';
import { SidebarTrigger } from '@/ui/components/ui/sidebar';
import { MaityVoiceAssistant } from '../components/MaityVoiceAssistant';
import { CoachService, UserService, supabase, MAITY_COLORS } from '@maity/shared';
import { env } from '@/lib/env';
import { toast } from '@/shared/hooks/use-toast';
import { Card } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { Loader2, Trophy, Clock, RefreshCw, FileText, CheckCircle, XCircle, Brain, Target, Eye, Sparkles, BarChart2, TrendingUp } from 'lucide-react';

// Configuración de los 6 rubros (alineados con autoevaluación)
const RUBRIC_CONFIG = {
  claridad: { name: 'Claridad', color: '#485df4', emoji: '💬' },
  adaptacion: { name: 'Adaptación', color: '#1bea9a', emoji: '🎯' },
  persuasion: { name: 'Persuasión', color: '#9b4dca', emoji: '📊' },
  estructura: { name: 'Estructura', color: '#ff8c42', emoji: '📋' },
  proposito: { name: 'Propósito', color: '#ffd93d', emoji: '🌟' },
  empatia: { name: 'Empatía', color: '#ef4444', emoji: '❤️' }
};

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

      // Evaluar con OpenAI - Diagnostic Interview
      const userInfo = await UserService.getUserInfo();

      if (!userInfo) {
        throw new Error('No se pudo obtener información del usuario');
      }

      const { data: { session: authSession } } = await supabase.auth.getSession();

      if (!authSession) {
        throw new Error('No hay sesión de autenticación');
      }

      console.log('📤 [Coach] Llamando a evaluate-diagnostic-interview API...');
      const response = await fetch(`${env.apiUrl}/api/evaluate-diagnostic-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession.access_token}`
        },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [Coach] Error en evaluate-diagnostic-interview:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });

        // Mensajes de error más descriptivos según el código de estado
        let errorMessage = 'Error al evaluar la sesión';
        if (response.status === 400) {
          errorMessage = errorData.error || 'La sesión no es válida para evaluación. Asegúrate de completar una conversación con el Coach.';
        } else if (response.status === 401) {
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
        } else if (response.status === 429) {
          errorMessage = 'Has alcanzado el límite de evaluaciones. Por favor, intenta más tarde.';
        } else if (response.status === 500) {
          errorMessage = 'Error del servidor. Por favor, intenta de nuevo en unos momentos.';
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }

        throw new Error(errorMessage);
      }

      const { interview } = await response.json();
      console.log('✅ [Coach] Entrevista diagnóstica recibida:', interview);

      // Validar que se recibió data válida
      if (!interview || !interview.rubrics) {
        console.error('❌ [Coach] Respuesta inválida del API:', interview);
        throw new Error('La evaluación no contiene los datos esperados. Por favor, intenta de nuevo.');
      }

      // Actualizar con resultados reales de la entrevista diagnóstica
      setEvaluationResults(prev => ({
        ...prev,
        isProcessing: false,
        interview: interview, // Contains: rubrics, amazing_comment, summary, is_complete
        isDiagnosticInterview: true // Flag to identify diagnostic interview
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

          {/* Score Principal o Comentario Asombroso */}
          <Card className={`bg-gray-900/50 border ${evaluationResults.isProcessing ? 'border-blue-500/20' : evaluationResults.isCoachEvaluation ? 'border-cyan-500/20 bg-gradient-to-br from-cyan-900/20 to-blue-900/20' : getScoreBg(evaluationResults.score || 0)} p-4 sm:p-6 lg:p-8`}>
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
                      Analizando tu conversación...
                    </div>
                    <p className="text-sm sm:text-base text-gray-400">
                      Evaluando tu forma de comunicarte con inteligencia artificial
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
              ) : evaluationResults.isDiagnosticInterview && evaluationResults.interview?.amazing_comment ? (
                <>
                  {/* Comentario Asombroso para Entrevista Diagnóstica */}
                  <div className="flex justify-center">
                    <div className="p-3 sm:p-4 bg-cyan-500/10 rounded-full">
                      <Brain className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-cyan-400" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl sm:text-2xl font-bold text-cyan-400">
                      ¡Algo increíble que notamos!
                    </h3>
                    <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
                      {evaluationResults.interview.amazing_comment}
                    </p>
                    {evaluationResults.interview.is_complete && (
                      <div className="flex items-center justify-center gap-2 text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Entrevista completada</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Score para Roleplay o sin comentario */}
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
          {!evaluationResults.isProcessing && (evaluationResults.interview || evaluationResults.result) && (
            <>
              {evaluationResults.isDiagnosticInterview && evaluationResults.interview ? (
                <>
                  {/* Key Observations Section */}
                  {evaluationResults.interview.key_observations && evaluationResults.interview.key_observations.length > 0 && (
                    <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30 p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                          <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-white">
                          Lo que observamos en tu entrevista
                        </h3>
                      </div>
                      <ul className="space-y-3">
                        {evaluationResults.interview.key_observations.map((observation: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="mt-1 p-1.5 bg-indigo-500/20 rounded-full flex-shrink-0">
                              <Sparkles className="h-4 w-4 text-indigo-300" />
                            </div>
                            <p className="text-gray-200 text-sm sm:text-base leading-relaxed flex-1">{observation}</p>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* Summary Section */}
                  {evaluationResults.interview.summary && (
                    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700 p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Resumen General</h3>
                      </div>
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{evaluationResults.interview.summary}</p>
                    </Card>
                  )}

                  {/* Rubrics Grid */}
                  {evaluationResults.interview.rubrics && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                          <BarChart2 className="h-5 w-5 text-cyan-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-white">Evaluación por Competencias</h3>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {Object.entries(RUBRIC_CONFIG).map(([key, config]) => {
                          const rubric = evaluationResults.interview.rubrics[key];
                          if (!rubric) return null;

                          const scorePercentage = (rubric.score / 5) * 100;

                          return (
                            <Card key={key} className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 p-4 hover:border-gray-600 transition-all duration-200">
                              {/* Header del Rubro */}
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${config.color}20` }}>
                                  <span className="text-3xl">{config.emoji}</span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white text-lg">{config.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {/* Score como estrellas */}
                                    <div className="flex gap-0.5">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                          key={star}
                                          className={`text-base ${
                                            star <= rubric.score ? 'text-yellow-400' : 'text-gray-600'
                                          }`}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-sm font-bold" style={{ color: config.color }}>
                                      {rubric.score}/5
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="mb-4">
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${scorePercentage}%`,
                                      backgroundColor: config.color,
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Análisis */}
                              {rubric.analysis && (
                                <div className="mb-4">
                                  <p className="text-gray-300 text-sm leading-relaxed">{rubric.analysis}</p>
                                </div>
                              )}

                              {/* Fortalezas */}
                              {rubric.strengths && rubric.strengths.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="text-xs font-bold text-green-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Fortalezas
                                  </h5>
                                  <ul className="space-y-2">
                                    {rubric.strengths.map((strength: string, idx: number) => (
                                      <li key={idx} className="text-gray-300 text-sm flex items-start gap-2 pl-1">
                                        <span className="text-green-400 mt-0.5">•</span>
                                        <span className="flex-1">{strength}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Áreas de Mejora */}
                              {rubric.areas_for_improvement && rubric.areas_for_improvement.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-bold text-yellow-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    Áreas de Mejora
                                  </h5>
                                  <ul className="space-y-2">
                                    {rubric.areas_for_improvement.map((area: string, idx: number) => (
                                      <li key={idx} className="text-gray-300 text-sm flex items-start gap-2 pl-1">
                                        <span className="text-yellow-400 mt-0.5">→</span>
                                        <span className="flex-1">{area}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Card className="bg-gray-900/50 border-gray-800 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Feedback Detallado</h3>
                  <div className="space-y-4 sm:space-y-6">
                  {/* Roleplay Results */}
                  <>
                    {/* Feedback de Roleplay (formato original) */}
                    {evaluationResults.result.summary && (
                      <div>
                        <h4 className="font-semibold text-white mb-2">Resumen</h4>
                        <p className="text-gray-300 text-sm">{evaluationResults.result.summary}</p>
                      </div>
                    )}

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
                  </>
                  </div>
                </Card>
              )}
            </>
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
