import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Target,
  TrendingUp,
  MessageSquare,
  Brain,
  RefreshCw,
  ArrowRight,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SessionResultsProps {
  sessionId: string;
  profile: 'CEO' | 'CTO' | 'CFO';
  scenarioName: string;
  score: number | null;
  passed: boolean | null;
  duration: number;
  isProcessing?: boolean;
  requestId?: string;
  evaluation?: any;
  error?: string;
  transcript?: string | null;
  onRetry: () => void;
  onViewTranscript: () => void;
  canProceedNext: boolean;
  onNextScenario?: () => void;
}

export function SessionResults({
  sessionId,
  profile,
  scenarioName,
  score,
  passed,
  duration,
  isProcessing = false,
  requestId,
  evaluation,
  error,
  transcript,
  onRetry,
  onViewTranscript,
  canProceedNext,
  onNextScenario
}: SessionResultsProps) {
  const navigate = useNavigate();

  // Calcular conteo de palabras del usuario desde la transcripción
  const userWordCount = React.useMemo(() => {
    if (!transcript) return 0;

    // Filtrar solo las líneas del usuario
    const userLines = transcript
      .split('\n')
      .filter(line => line.trim().startsWith('Usuario:'))
      .map(line => line.replace('Usuario:', '').trim())
      .join(' ');

    // Contar palabras
    return userLines
      ? userLines.trim().split(/\s+/).filter(word => word.length > 0).length
      : 0;
  }, [transcript]);

  // Usar datos reales de la evaluación si están disponibles
  // Nueva estructura: dimension_scores (escala 1-10)
  const metrics = {
    clarity: evaluation?.dimension_scores?.clarity ?? evaluation?.clarity ?? null,
    structure: evaluation?.dimension_scores?.structure ?? evaluation?.structure ?? null,
    connection: evaluation?.dimension_scores?.connection ?? evaluation?.connection ?? null,
    influence: evaluation?.dimension_scores?.influence ?? evaluation?.influence ?? null
  };

  // Detectar si estamos usando la nueva escala (1-10) o la vieja (0-100)
  const isNewScale = evaluation?.dimension_scores !== undefined;

  // Calcular score desde las métricas si no viene explícito
  let calculatedScore = score;
  if (calculatedScore === null && (metrics.clarity !== null || metrics.structure !== null || metrics.connection !== null || metrics.influence !== null)) {
    const values = [metrics.clarity, metrics.structure, metrics.connection, metrics.influence].filter(v => v !== null);
    if (values.length === 4) {
      if (isNewScale) {
        // Nueva escala: promediar 1-10 y convertir a 0-100
        const avg = values.reduce((sum, val) => sum + val, 0) / 4;
        calculatedScore = Math.round((avg / 10) * 100);
      } else {
        // Vieja escala: promediar 0-100
        calculatedScore = Math.round(values.reduce((sum, val) => sum + val, 0) / 4);
      }
    }
  }

  // Usar feedback real si está disponible - nueva estructura
  const fortalezas = evaluation?.Fortalezas || null;
  const errores = evaluation?.Errores || null;
  const recomendaciones = evaluation?.Recomendaciones || null;

  // Fallback a estructura vieja para compatibilidad
  const strengths = evaluation?.strengths || (
    !isProcessing ? [
      "Excelente rapport inicial con el cliente",
      "Buena identificación de pain points",
      "Comunicación clara y concisa"
    ] : []
  );

  // Procesar improvements - puede venir como array o string separado por comas
  let improvements = [];
  if (evaluation?.improvements) {
    if (Array.isArray(evaluation.improvements)) {
      improvements = evaluation.improvements;
    } else if (typeof evaluation.improvements === 'string') {
      // Dividir por comas y limpiar espacios
      improvements = evaluation.improvements
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
  } else if (!isProcessing) {
    improvements = [
      "Profundizar más en las necesidades específicas del negocio",
      "Ser más específico con los beneficios cuantificables",
      "Mejorar el manejo de objeciones de precio"
    ];
  }

  // Score real o temporal mientras se procesa
  const displayScore = calculatedScore !== null ? calculatedScore : (isProcessing ? null : 75);

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

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Resultados de la Sesión</h1>
          <p className="text-gray-400">
            {scenarioName} • Perfil {profile}
          </p>
        </div>

        {/* Score Principal */}
        <Card className={`bg-gray-900/50 border ${isProcessing ? 'border-blue-500/20' : getScoreBg(displayScore || 0)} p-8`}>
          <div className="text-center space-y-4">
            {isProcessing ? (
              <>
                <div className="flex justify-center">
                  <div className="p-4 bg-blue-500/10 rounded-full animate-pulse">
                    <Brain className="h-12 w-12 text-blue-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-400">
                    Procesando evaluación...
                  </div>
                  <p className="text-gray-400">
                    Nuestro agente AI está analizando tu conversación
                  </p>
                  <div className="flex justify-center">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-400 border-t-transparent rounded-full" />
                  </div>
                </div>
              </>
            ) : error ? (
              <>
                <div className="flex justify-center">
                  <div className="p-4 bg-red-500/10 rounded-full">
                    <XCircle className="h-12 w-12 text-red-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-red-400">
                    Error al procesar evaluación
                  </div>
                  <p className="text-gray-400">
                    {error}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  {passed ? (
                    <div className="p-4 bg-green-500/10 rounded-full">
                      <Trophy className="h-12 w-12 text-green-400" />
                    </div>
                  ) : (
                    <div className="p-4 bg-red-500/10 rounded-full">
                      <AlertCircle className="h-12 w-12 text-red-400" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-6xl font-bold">
                    <span className={getScoreColor(displayScore || 0)}>{displayScore || '—'}</span>
                    <span className="text-gray-500">/100</span>
                  </div>
                  <p className="text-xl mt-2">
                    {passed ? (
                      <span className="text-green-400">¡Aprobado!</span>
                    ) : passed === false ? (
                      <span className="text-red-400">Necesitas 60 puntos para aprobar</span>
                    ) : (
                      <span className="text-gray-400">Evaluación pendiente</span>
                    )}
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-center gap-8 text-sm text-gray-400 flex-wrap">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Duración: {formatDuration(duration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Score mínimo: 60</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Conteo de Palabras del Usuario */}
        {userWordCount > 0 && (
          <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <FileText className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Palabras Pronunciadas</h3>
                  <p className="text-sm text-gray-400">Total de palabras que expresaste durante la sesión</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-purple-400">
                  {userWordCount.toLocaleString()}
                </div>
                <p className="text-sm text-gray-400 mt-1">palabras</p>
              </div>
            </div>
          </Card>
        )}

        {/* Métricas Detalladas */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-400" />
              Análisis por Categoría
            </h3>
            {isProcessing ? (
              <div className="space-y-4">
                {['Claridad', 'Estructura', 'Alineación Emocional', 'Influencia'].map((label) => (
                  <div key={label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-gray-600">—</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(metrics).map(([key, value]) => {
                  // Calcular el valor normalizado para la barra de progreso (0-100)
                  const progressValue = value !== null
                    ? (isNewScale ? (value / 10) * 100 : value)
                    : 0;

                  // Determinar el color basado en el score normalizado
                  const scoreColor = value !== null ? getScoreColor(progressValue) : 'text-gray-600';

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {key === 'clarity' && 'Claridad'}
                          {key === 'structure' && 'Estructura'}
                          {key === 'connection' && 'Alineación Emocional'}
                          {key === 'influence' && 'Influencia'}
                        </span>
                        <span className={`font-medium ${scoreColor}`}>
                          {value !== null
                            ? isNewScale
                              ? `${value.toFixed(1)}/10`
                              : `${value}/100`
                            : '—'}
                        </span>
                      </div>
                      <Progress value={progressValue} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Feedback del Agente
            </h3>

            {isProcessing ? (
              <div className="space-y-4">
                <div className="h-4 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-800 rounded animate-pulse w-5/6" />
                <div className="mt-4 h-4 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 bg-gray-800 rounded animate-pulse w-4/5" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Nueva estructura: Fortalezas */}
                {fortalezas && (
                  <div>
                    <p className="text-base font-medium text-green-400 mb-2">Fortalezas</p>
                    {fortalezas.Cita && (
                      <blockquote className="border-l-2 border-green-500/50 pl-3 py-1 mb-2">
                        <p className="text-sm italic text-gray-300">{fortalezas.Cita}</p>
                      </blockquote>
                    )}
                    {fortalezas.Feedback && (
                      <p className="text-base text-gray-300">{fortalezas.Feedback}</p>
                    )}
                  </div>
                )}

                {/* Nueva estructura: Errores */}
                {errores && (
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-base font-medium text-red-400 mb-2">Errores</p>
                    {errores.Cita && (
                      <blockquote className="border-l-2 border-red-500/50 pl-3 py-1 mb-2">
                        <p className="text-sm italic text-gray-300">{errores.Cita}</p>
                      </blockquote>
                    )}
                    {errores.Feedback && (
                      <p className="text-base text-gray-300">{errores.Feedback}</p>
                    )}
                  </div>
                )}

                {/* Nueva estructura: Recomendaciones */}
                {recomendaciones && (
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-base font-medium text-yellow-400 mb-2">Recomendaciones</p>
                    {recomendaciones.Cita && (
                      <blockquote className="border-l-2 border-yellow-500/50 pl-3 py-1 mb-2">
                        <p className="text-sm italic text-gray-300">{recomendaciones.Cita}</p>
                      </blockquote>
                    )}
                    {recomendaciones.Feedback && (
                      <p className="text-base text-gray-300">{recomendaciones.Feedback}</p>
                    )}
                  </div>
                )}

                {/* Fallback: estructura vieja - Áreas de Mejora */}
                {!fortalezas && !errores && !recomendaciones && improvements.length > 0 && (
                  <div>
                    <p className="text-base font-medium text-yellow-400 mb-3">Áreas de Mejora</p>
                    <ul className="space-y-2">
                      {improvements.map((improvement, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-base text-gray-300">
                          <AlertCircle className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Feedback general si está disponible (estructura vieja) */}
                {!fortalezas && !errores && !recomendaciones && evaluation?.feedback && (
                  <div className="pt-3 border-t border-gray-700 mt-4">
                    <p className="text-base text-gray-300">{evaluation.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Acciones */}
        <Card className="bg-gray-900/50 border-gray-800 p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onRetry}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Repetir Escenario
            </Button>

            <Button
              onClick={onViewTranscript}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Ver Transcripción
            </Button>

            {passed && canProceedNext && (
              <Button
                onClick={onNextScenario}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <ArrowRight className="h-4 w-4" />
                Siguiente Escenario
              </Button>
            )}

            {passed && !canProceedNext && (
              <Button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Trophy className="h-4 w-4" />
                ¡Perfil Completado!
              </Button>
            )}
          </div>
        </Card>

        {/* Nota informativa */}
        {isProcessing && (
          <Card className="bg-blue-900/20 border-blue-500/20 p-4">
            <p className="text-sm text-blue-400 text-center">
              💡 La evaluación está siendo procesada por nuestro agente AI. Los resultados completos estarán disponibles en unos momentos.
              {requestId && (
                <span className="block mt-1 text-xs text-gray-500">
                  ID de evaluación: {requestId}
                </span>
              )}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}