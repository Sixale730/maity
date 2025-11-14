import React from 'react';
import { Card } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { Progress } from '@/ui/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/ui/components/ui/chart';
import {
  Trophy,
  Target,
  TrendingUp,
  Brain,
  RefreshCw,
  ArrowRight,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Building2,
  Calendar,
  Copy,
  Check,
  Download,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PDFService } from '@maity/shared';
import { toast } from '@/shared/hooks/use-toast';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts';

interface SessionResultsProps {
  sessionId: string;
  profile: 'CEO' | 'CTO' | 'CFO';
  scenarioName: string;
  score: number | null;
  passed: boolean | null;
  duration: number;
  objectives?: string;
  isProcessing?: boolean;
  requestId?: string;
  evaluation?: any;
  error?: string;
  transcript?: string | null;
  onRetry: () => void;
  onViewTranscript: () => void;
  onReEvaluate?: () => void;
  isReEvaluating?: boolean;
  canProceedNext: boolean;
  onNextScenario?: () => void;
  showRetryButton?: boolean; // Optional, defaults to true
  // Admin viewing other user's session
  isViewingOtherUser?: boolean;
  sessionUserName?: string;
  sessionUserEmail?: string;
  sessionCompanyName?: string;
  sessionStartedAt?: string;
}

const chartConfig = {
  value: {
    label: "Puntuación",
    color: "#3b82f6",
  },
};

// Descripciones de dimensiones principales
const DIMENSION_DESCRIPTIONS = {
  clarity: "Evalúa qué tan comprensible y directa fue tu comunicación",
  structure: "Mide la organización lógica de tus ideas y argumentos",
  connection: "Valora tu capacidad para conectar emocionalmente con el interlocutor",
  influence: "Determina tu efectividad para persuadir y generar acción"
};

// Descripciones de subdimensiones
const SUBDIMENSION_DESCRIPTIONS: Record<string, string> = {
  // Claridad
  "Vocabulario_Sencillo": "Uso de palabras claras y fáciles de entender",
  "Mensajes_Directos": "Comunicación sin rodeos ni ambigüedades",
  "Sin_Jerga": "Evitar términos técnicos innecesarios",
  "Concision": "Expresar ideas de forma breve y precisa",
  "Ejemplos_Claros": "Uso de ilustraciones concretas para explicar conceptos",

  // Estructura
  "Inicio_Claro": "Apertura efectiva de la conversación",
  "Desarrollo_Logico": "Progresión coherente de ideas",
  "Cierre_Efectivo": "Conclusión clara con llamado a la acción",
  "Transiciones_Fluidas": "Conexión natural entre temas",
  "Organizacion_Ideas": "Presentación ordenada de argumentos",

  // Alineación Emocional
  "Empatia": "Comprensión de sentimientos y necesidades",
  "Conexion_Necesidades": "Vinculación con pain points del cliente",
  "Tono_Apropiado": "Ajuste del lenguaje al contexto emocional",
  "Escucha_Activa": "Demostración de atención a lo que dice el interlocutor",
  "Rapport": "Construcción de confianza y conexión personal",

  // Influencia
  "Argumento_Persuasivo": "Construcción de casos convincentes",
  "Manejo_Objeciones": "Respuesta efectiva a resistencias",
  "Cierre_Accion": "Capacidad para generar compromisos",
  "Valor_Propuesto": "Presentación clara de beneficios",
  "Urgencia": "Creación de motivación para actuar ahora"
};

export function SessionResults({
  sessionId,
  profile,
  scenarioName,
  score,
  passed,
  duration,
  objectives,
  isProcessing = false,
  requestId,
  evaluation,
  error,
  transcript,
  onRetry,
  onViewTranscript,
  onReEvaluate,
  isReEvaluating,
  canProceedNext,
  onNextScenario,
  showRetryButton = true,
  isViewingOtherUser = false,
  sessionUserName,
  sessionUserEmail,
  sessionCompanyName,
  sessionStartedAt
}: SessionResultsProps) {
  const navigate = useNavigate();

  // Estado para controlar qué dimensión está expandida
  const [expandedDimension, setExpandedDimension] = React.useState<string | null>(null);

  // Estado para el botón de copiar
  const [copied, setCopied] = React.useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

  // Función para copiar el ID de sesión
  const handleCopySessionId = async () => {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Función para generar PDF
  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);

      // Prepare dimensions data
      const dimensions: import('@maity/shared').DimensionData[] = [];

      if (hasEvaluation && evaluation?.Evaluacion) {
        // Claridad
        if (metrics.clarity !== null) {
          const subdimensions: Array<{ name: string; score: number }> = [];
          const claridadData = evaluation.Evaluacion.Claridad;
          if (claridadData) {
            Object.entries(claridadData).forEach(([key, value]) => {
              if (key !== 'Puntuacion_Total' && key !== 'Comentarios') {
                const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
                if (!isNaN(numValue as number)) {
                  const displayName = key.replace(/_/g, ' ');
                  subdimensions.push({ name: displayName, score: (numValue as number) * 10 });
                }
              }
            });
          }
          dimensions.push({ name: 'Claridad', score: metrics.clarity, subdimensions });
        }

        // Estructura
        if (metrics.structure !== null) {
          const subdimensions: Array<{ name: string; score: number }> = [];
          const estructuraData = evaluation.Evaluacion.Estructura;
          if (estructuraData) {
            Object.entries(estructuraData).forEach(([key, value]) => {
              if (key !== 'Puntuacion_Total' && key !== 'Comentarios') {
                const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
                if (!isNaN(numValue as number)) {
                  const displayName = key.replace(/_/g, ' ');
                  subdimensions.push({ name: displayName, score: (numValue as number) * 10 });
                }
              }
            });
          }
          dimensions.push({ name: 'Estructura', score: metrics.structure, subdimensions });
        }

        // Alineación Emocional
        if (metrics.connection !== null) {
          const subdimensions: Array<{ name: string; score: number }> = [];
          const alineacionData = evaluation.Evaluacion.Alineacion_Emocional;
          if (alineacionData) {
            Object.entries(alineacionData).forEach(([key, value]) => {
              if (key !== 'Puntuacion_Total' && key !== 'Comentarios') {
                const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
                if (!isNaN(numValue as number)) {
                  const displayName = key.replace(/_/g, ' ');
                  subdimensions.push({ name: displayName, score: (numValue as number) * 10 });
                }
              }
            });
          }
          dimensions.push({ name: 'Alineación Emocional', score: metrics.connection, subdimensions });
        }

        // Influencia
        if (metrics.influence !== null) {
          const subdimensions: Array<{ name: string; score: number }> = [];
          const influenciaData = evaluation.Evaluacion.Influencia;
          if (influenciaData) {
            Object.entries(influenciaData).forEach(([key, value]) => {
              if (key !== 'Puntuacion_Total' && key !== 'Comentarios') {
                const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
                if (!isNaN(numValue as number)) {
                  const displayName = key.replace(/_/g, ' ');
                  subdimensions.push({ name: displayName, score: (numValue as number) * 10 });
                }
              }
            });
          }
          dimensions.push({ name: 'Influencia', score: metrics.influence, subdimensions });
        }
      }

      await PDFService.generateSessionPDF(
        {
          sessionId,
          userName: sessionUserName,
          userEmail: sessionUserEmail,
          companyName: sessionCompanyName,
          sessionType: 'roleplay',
          profileName: profile,
          scenarioName,
          score: calculatedScore,
          passed,
          duration,
          startedAt: sessionStartedAt,
          wordCount: userWordCount,
          dimensions: dimensions.length > 0 ? dimensions : undefined,
        },
        {
          includeCharts: hasEvaluation,
          chartElementIds: hasEvaluation ? ['radar-chart', 'radar-chart-subdimensions'] : [],
        }
      );

      toast({
        title: 'PDF generado',
        description: 'El reporte se ha descargado exitosamente',
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo generar el PDF. Por favor, intenta de nuevo.',
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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

  // Calculate dimension scores from Evaluacion structure (real data from n8n)
  const calculateMainDimensionScore = (dimension: any): number | null => {
    if (!dimension) return null;
    const scores: number[] = [];

    Object.entries(dimension).forEach(([key, value]) => {
      // Skip non-score fields
      if (key === 'Puntuacion_Total' || key === 'Comentarios') return;

      // Convert string to number if needed (scores come as "1"-"10" from n8n)
      const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
      if (!isNaN(numValue)) {
        scores.push(numValue * 10); // Convert 1-10 scale to 0-100
      }
    });

    if (scores.length === 0) return null;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  // Usar datos reales de la evaluación si están disponibles
  // Nueva estructura: dimension_scores (escala 0-100)
  const hasEvaluation = evaluation && (
    evaluation.dimension_scores ||
    evaluation.clarity ||
    evaluation.structure ||
    evaluation.connection ||
    evaluation.influence ||
    evaluation.Evaluacion
  );

  const metrics = {
    clarity: evaluation?.dimension_scores?.clarity ??
             evaluation?.clarity ??
             calculateMainDimensionScore(evaluation?.Evaluacion?.Claridad),
    structure: evaluation?.dimension_scores?.structure ??
               evaluation?.structure ??
               calculateMainDimensionScore(evaluation?.Evaluacion?.Estructura),
    connection: evaluation?.dimension_scores?.connection ??
                evaluation?.connection ??
                calculateMainDimensionScore(evaluation?.Evaluacion?.Alineacion_Emocional),
    influence: evaluation?.dimension_scores?.influence ??
               evaluation?.influence ??
               calculateMainDimensionScore(evaluation?.Evaluacion?.Influencia)
  };

  // Calcular score desde las métricas si no viene explícito
  let calculatedScore = score;
  if (calculatedScore === null && (metrics.clarity !== null || metrics.structure !== null || metrics.connection !== null || metrics.influence !== null)) {
    const values = [metrics.clarity, metrics.structure, metrics.connection, metrics.influence].filter(v => v !== null);
    if (values.length > 0) {
      // Promediar dimensiones disponibles (todas en escala 0-100)
      calculatedScore = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
    }
  }

  // Usar feedback real si está disponible - nueva estructura
  const fortalezas = evaluation?.Fortalezas || null;
  const errores = evaluation?.Errores || null;
  const recomendaciones = evaluation?.Recomendaciones || null;
  const objectiveFeedback = evaluation?.objective_feedback || null;

  // Extraer subdimensiones de Evaluacion para desglose
  console.log('[SessionResults] Raw evaluation prop:', evaluation);
  console.log('[SessionResults] evaluation?.Evaluacion:', evaluation?.Evaluacion);

  const evaluacionDesglose = evaluation?.Evaluacion ? {
    Claridad: evaluation.Evaluacion.Claridad || null,
    Estructura: evaluation.Evaluacion.Estructura || null,
    Alineacion_Emocional: evaluation.Evaluacion.Alineacion_Emocional || null,
    Influencia: evaluation.Evaluacion.Influencia || null
  } : null;

  console.log('[SessionResults] evaluacionDesglose created:', evaluacionDesglose);

  // Fallback removed - using new structure only (Fortalezas, Errores, Recomendaciones)

  // Procesar improvements - puede venir como array o string separado por comas
  let improvements = [];
  if (evaluation?.improvements) {
    if (Array.isArray(evaluation.improvements)) {
      improvements = evaluation.improvements;
    } else if (typeof evaluation.improvements === 'string') {
      // Dividir por comas y limpiar espacios
      improvements = evaluation.improvements
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    }
  } else if (!isProcessing) {
    improvements = [
      "Profundizar más en las necesidades específicas del negocio",
      "Ser más específico con los beneficios cuantificables",
      "Mejorar el manejo de objeciones de precio"
    ];
  }

  // Score real o temporal mientras se procesa
  const displayScore = calculatedScore;

  // Preparar datos para el radar chart (4 dimensiones principales)
  const radarData = React.useMemo(() => {
    if (isProcessing || !metrics.clarity) return [];

    return [
      { dimension: 'Claridad', value: metrics.clarity ?? 0 },
      { dimension: 'Estructura', value: metrics.structure ?? 0 },
      { dimension: 'Alineación Emocional', value: metrics.connection ?? 0 },
      { dimension: 'Influencia', value: metrics.influence ?? 0 }
    ];
  }, [metrics, isProcessing]);

  // Preparar datos para el radar de subdimensiones (12 métricas detalladas)
  const radarSubdimensionsData = React.useMemo(() => {
    if (isProcessing || !evaluacionDesglose) return [];

    const data = [];

    // Debug: Log para ver qué datos tenemos
    console.log('[SessionResults] evaluacionDesglose:', evaluacionDesglose);

    // Claridad
    if (evaluacionDesglose.Claridad) {
      Object.entries(evaluacionDesglose.Claridad).forEach(([key, value]) => {
        // Convertir valor asegurándose de que sea numérico
        const numValue = parseFloat(String(value));
        if (!isNaN(numValue)) {
          data.push({
            dimension: key.replace(/_/g, ' '),
            value: numValue * 10
          });
        }
      });
    }

    // Estructura
    if (evaluacionDesglose.Estructura) {
      Object.entries(evaluacionDesglose.Estructura).forEach(([key, value]) => {
        const numValue = parseFloat(String(value));
        if (!isNaN(numValue)) {
          data.push({
            dimension: key.replace(/_/g, ' '),
            value: numValue * 10
          });
        }
      });
    }

    // Alineación Emocional
    if (evaluacionDesglose.Alineacion_Emocional) {
      Object.entries(evaluacionDesglose.Alineacion_Emocional).forEach(([key, value]) => {
        const numValue = parseFloat(String(value));
        if (!isNaN(numValue)) {
          data.push({
            dimension: key.replace(/_/g, ' '),
            value: numValue * 10
          });
        }
      });
    }

    // Influencia
    if (evaluacionDesglose.Influencia) {
      Object.entries(evaluacionDesglose.Influencia).forEach(([key, value]) => {
        const numValue = parseFloat(String(value));
        if (!isNaN(numValue)) {
          data.push({
            dimension: key.replace(/_/g, ' '),
            value: numValue * 10
          });
        }
      });
    }

    console.log('[SessionResults] radarSubdimensionsData:', data);
    return data;
  }, [evaluacionDesglose, isProcessing]);

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
    <div className="min-h-screen bg-black p-3 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Resultados de la Sesión</h1>
          <p className="text-sm sm:text-base text-gray-400">
            {scenarioName} • Perfil {profile}
          </p>
        </div>

        {/* User Info Banner for Admins - Below Title */}
        {isViewingOtherUser && (
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-600/40 p-5 sm:p-6">
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-blue-300 flex items-center gap-2">
                <User className="h-5 w-5" />
                Sesión de Usuario
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Usuario */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <User className="h-4 w-4" />
                    <span>Usuario</span>
                  </div>
                  <div className="text-white text-lg font-semibold">
                    {sessionUserName || sessionUserEmail}
                  </div>
                  {sessionUserName && sessionUserEmail && (
                    <div className="text-gray-400 text-sm">{sessionUserEmail}</div>
                  )}
                </div>

                {/* Empresa */}
                {sessionCompanyName && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Building2 className="h-4 w-4" />
                      <span>Empresa</span>
                    </div>
                    <div className="text-white text-lg font-semibold">
                      {sessionCompanyName}
                    </div>
                  </div>
                )}

                {/* Fecha y Hora */}
                {sessionStartedAt && (
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Fecha y Hora</span>
                    </div>
                    <div className="text-white text-lg font-semibold">
                      {new Date(sessionStartedAt).toLocaleString('es-MX', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </div>
                  </div>
                )}

                {/* ID de Sesión */}
                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>ID de Sesión</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-white text-sm font-mono bg-gray-800/50 px-3 py-1.5 rounded border border-gray-700 flex-1 overflow-x-auto">
                      {sessionId}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopySessionId}
                      className="shrink-0 border-blue-600/40 hover:bg-blue-900/30"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Score Principal */}
        <Card className={`bg-gray-900/50 border ${isProcessing ? 'border-blue-500/20' : getScoreBg(displayScore || 0)} p-4 sm:p-6 lg:p-8`}>
          <div className="text-center space-y-3 sm:space-y-4">
            {isProcessing ? (
              <>
                <div className="flex justify-center">
                  <div className="p-3 sm:p-4 bg-blue-500/10 rounded-full animate-pulse">
                    <Brain className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400">
                    Procesando evaluación...
                  </div>
                  <p className="text-sm sm:text-base text-gray-400">
                    Nuestro agente AI está analizando tu conversación
                  </p>
                  <div className="flex justify-center">
                    <div className="animate-spin h-5 w-5 sm:h-6 sm:w-6 border-2 border-blue-400 border-t-transparent rounded-full" />
                  </div>
                </div>
              </>
            ) : error ? (
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
                    {error}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  {passed ? (
                    <div className="p-3 sm:p-4 bg-green-500/10 rounded-full">
                      <Trophy className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-green-400" />
                    </div>
                  ) : (
                    <div className="p-3 sm:p-4 bg-red-500/10 rounded-full">
                      <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-red-400" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                    <span className={getScoreColor(displayScore || 0)}>{displayScore || '—'}</span>
                    <span className="text-gray-500">/100</span>
                  </div>
                  <p className="text-base sm:text-lg lg:text-xl mt-2">
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

            <div className="flex justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-400 flex-wrap">
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Score mínimo: 60</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Métricas de Sesión: Palabras y Duración */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Palabras Pronunciadas */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/20 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-purple-500/10 rounded-lg flex-shrink-0">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Palabras Pronunciadas</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Total de palabras expresadas</p>
                </div>
              </div>
              <div className="text-left sm:text-right pl-11 sm:pl-0">
                <div className="text-3xl sm:text-4xl font-bold text-purple-400">
                  {userWordCount.toLocaleString()}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">palabras</p>
              </div>
            </div>
          </Card>

          {/* Duración de la Sesión */}
          <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/20 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg flex-shrink-0">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Duración de Sesión</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Tiempo total de conversación</p>
                </div>
              </div>
              <div className="text-left sm:text-right pl-11 sm:pl-0">
                <div className="text-3xl sm:text-4xl font-bold text-blue-400">
                  {formatDuration(duration)}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">minutos</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Objetivo del Escenario y Feedback */}
        {objectives && (
          <Card className="bg-gradient-to-br from-green-900/30 to-teal-900/30 border-green-500/20 p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg flex-shrink-0">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Objetivo del Escenario</h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{objectives}</p>
                </div>
              </div>

              {/* Feedback del Objetivo */}
              {!isProcessing && objectiveFeedback && (
                <div className="pt-3 sm:pt-4 border-t border-green-500/20">
                  <h4 className="text-sm sm:text-base font-medium text-green-400 mb-2 sm:mb-3">Evaluación del Objetivo</h4>
                  <div className="space-y-2 sm:space-y-3">
                    {/* Indicador visual basado en si pasó la sesión */}
                    {passed !== null && (
                      <div className="flex items-start gap-2 sm:gap-3">
                        {passed ? (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm sm:text-base font-medium text-white">
                            {passed ? 'Objetivo Cumplido' : 'Objetivo No Cumplido'}
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Feedback del objetivo (string directo) */}
                    <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                      {typeof objectiveFeedback === 'string' ? objectiveFeedback : objectiveFeedback.feedback || objectiveFeedback}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Gráfico Radar 360° - Evaluación de Habilidades */}
        {!isProcessing && radarData.length > 0 && (
          <Card className="bg-gray-900/50 border-gray-800 p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">Evaluación 360° de Habilidades</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Visualización de tus competencias evaluadas en esta sesión
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Gráfico de 4 Dimensiones Principales */}
              <div id="radar-chart">
                <h4 className="text-base sm:text-lg font-semibold text-white mb-3 text-center">Dimensiones Principales</h4>
                <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] lg:h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid
                        stroke="hsl(var(--muted-foreground))"
                        strokeDasharray="3 3"
                      />
                      <PolarAngleAxis
                        dataKey="dimension"
                        tick={{
                          fill: 'white',
                          fontSize: 12,
                          fontWeight: 500
                        }}
                      />
                      <PolarRadiusAxis
                        domain={[0, 100]}
                        tick={{
                          fill: 'gray',
                          fontSize: 10
                        }}
                      />
                      <Radar
                        name="Puntuación"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.5}
                        strokeWidth={2}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Gráfico de Subdimensiones Detalladas */}
              {radarSubdimensionsData.length > 0 && (
                <div id="radar-chart-subdimensions">
                  <h4 className="text-base sm:text-lg font-semibold text-white mb-3 text-center">Subdimensiones Detalladas</h4>
                  <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] lg:h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarSubdimensionsData}>
                        <PolarGrid
                          stroke="hsl(var(--muted-foreground))"
                          strokeDasharray="3 3"
                        />
                        <PolarAngleAxis
                          dataKey="dimension"
                          tick={{
                            fill: 'white',
                            fontSize: 9,
                            fontWeight: 400
                          }}
                        />
                        <PolarRadiusAxis
                          domain={[0, 100]}
                          tick={{
                            fill: 'gray',
                            fontSize: 9
                          }}
                        />
                        <Radar
                          name="Puntuación"
                          dataKey="value"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.5}
                          strokeWidth={2}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Métricas Detalladas - Una sola columna */}
        <div className="space-y-4 sm:space-y-6">
          {/* Análisis por Categoría con Desglose Integrado */}
          <Card id="dimensions-section" className="bg-gray-900/50 border-gray-800 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              Análisis por Categoría
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">
              Haz clic en cada dimensión para ver el desglose detallado de subdimensiones
            </p>
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
              <div className="space-y-3">
                {Object.entries(metrics).map(([key, value]) => {
                  // Valor ya está en escala 0-100
                  const progressValue = value !== null ? value : 0;
                  const scoreColor = value !== null ? getScoreColor(value) : 'text-gray-600';

                  const dimensionName =
                    key === 'clarity' ? 'Claridad' :
                    key === 'structure' ? 'Estructura' :
                    key === 'connection' ? 'Alineación Emocional' :
                    'Influencia';

                  const dimensionKey =
                    key === 'clarity' ? 'claridad' :
                    key === 'structure' ? 'estructura' :
                    key === 'connection' ? 'alineacion' :
                    'influencia';

                  const dimensionColor =
                    key === 'clarity' ? 'blue' :
                    key === 'structure' ? 'green' :
                    key === 'connection' ? 'yellow' :
                    'red';

                  const desgloseDimension =
                    key === 'clarity' ? evaluacionDesglose?.Claridad :
                    key === 'structure' ? evaluacionDesglose?.Estructura :
                    key === 'connection' ? evaluacionDesglose?.Alineacion_Emocional :
                    evaluacionDesglose?.Influencia;

                  return (
                    <div key={key} className="border border-gray-700 rounded-lg overflow-hidden">
                      {/* Header de la dimensión */}
                      <button
                        onClick={() => setExpandedDimension(expandedDimension === dimensionKey ? null : dimensionKey)}
                        className="w-full p-3 sm:p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-4">
                          <div className="flex-1 text-left space-y-2">
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                              <div className={`w-2 h-2 rounded-full bg-${dimensionColor}-400 flex-shrink-0`} />
                              <span className="font-medium text-white text-sm sm:text-base">{dimensionName}</span>
                              <span className={`text-xs sm:text-sm font-medium ${scoreColor}`}>
                                {value !== null ? `${Math.round(value)}/100` : '—'}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-400 pl-4 sm:pl-5">
                              {DIMENSION_DESCRIPTIONS[key as keyof typeof DIMENSION_DESCRIPTIONS]}
                            </p>
                            <div className="pl-4 sm:pl-5">
                              <Progress value={progressValue} className="h-1.5 sm:h-2" />
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {desgloseDimension && (
                              expandedDimension === dimensionKey ? (
                                <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                              )
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Desglose de subdimensiones */}
                      {expandedDimension === dimensionKey && desgloseDimension && (
                        <div className="p-3 sm:p-4 bg-gray-900/30 space-y-2 sm:space-y-3 border-t border-gray-700">
                          <p className="text-xs text-gray-500 mb-2 sm:mb-3">Subdimensiones evaluadas:</p>
                          {Object.entries(desgloseDimension).map(([subKey, subValue]) => {
                            const valueNum = parseFloat(String(subValue)) * 10; // Convert 1-10 to 0-100
                            const description = SUBDIMENSION_DESCRIPTIONS[subKey] || '';
                            return (
                              <div key={subKey} className="space-y-1 sm:space-y-2">
                                <div className="flex justify-between items-start text-xs sm:text-sm">
                                  <div className="flex-1 pr-2">
                                    <span className="text-gray-200 font-medium">{subKey.replace(/_/g, ' ')}</span>
                                    {description && (
                                      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                                    )}
                                  </div>
                                  <span className={`text-${dimensionColor}-400 font-medium flex-shrink-0`}>
                                    {Math.round(valueNum)}/100
                                  </span>
                                </div>
                                <Progress value={valueNum} className="h-1 sm:h-1.5" />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Feedback del Agente */}
          <Card className="bg-gray-900/50 border-gray-800 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
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
              <div className="space-y-3 sm:space-y-4">
                {/* Nueva estructura: Fortalezas */}
                {fortalezas && (
                  <div>
                    <p className="text-sm sm:text-base font-medium text-green-400 mb-2">Fortalezas</p>
                    {fortalezas.Cita && (
                      <blockquote className="border-l-2 border-green-500/50 pl-2 sm:pl-3 py-1 mb-2">
                        <p className="text-xs sm:text-sm italic text-gray-300">{fortalezas.Cita}</p>
                      </blockquote>
                    )}
                    {fortalezas.Feedback && (
                      <p className="text-sm sm:text-base text-gray-300">{fortalezas.Feedback}</p>
                    )}
                  </div>
                )}

                {/* Nueva estructura: Errores */}
                {errores && (
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-sm sm:text-base font-medium text-red-400 mb-2">Errores</p>
                    {errores.Cita && (
                      <blockquote className="border-l-2 border-red-500/50 pl-2 sm:pl-3 py-1 mb-2">
                        <p className="text-xs sm:text-sm italic text-gray-300">{errores.Cita}</p>
                      </blockquote>
                    )}
                    {errores.Feedback && (
                      <p className="text-sm sm:text-base text-gray-300">{errores.Feedback}</p>
                    )}
                  </div>
                )}

                {/* Nueva estructura: Recomendaciones */}
                {recomendaciones && (
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-sm sm:text-base font-medium text-yellow-400 mb-2">Recomendaciones</p>
                    {recomendaciones.Cita && (
                      <blockquote className="border-l-2 border-yellow-500/50 pl-2 sm:pl-3 py-1 mb-2">
                        <p className="text-xs sm:text-sm italic text-gray-300">{recomendaciones.Cita}</p>
                      </blockquote>
                    )}
                    {recomendaciones.Feedback && (
                      <p className="text-sm sm:text-base text-gray-300">{recomendaciones.Feedback}</p>
                    )}
                  </div>
                )}

                {/* Fallback: estructura vieja - Áreas de Mejora */}
                {!fortalezas && !errores && !recomendaciones && improvements.length > 0 && (
                  <div>
                    <p className="text-sm sm:text-base font-medium text-yellow-400 mb-2 sm:mb-3">Áreas de Mejora</p>
                    <ul className="space-y-2">
                      {improvements.map((improvement: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm sm:text-base text-gray-300">
                          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 mt-1 flex-shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Feedback general si está disponible (estructura vieja) */}
                {!fortalezas && !errores && !recomendaciones && evaluation?.feedback && (
                  <div className="pt-3 border-t border-gray-700 mt-3 sm:mt-4">
                    <p className="text-sm sm:text-base text-gray-300">{evaluation.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Acciones */}
        <Card className="bg-gray-900/50 border-gray-800 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {showRetryButton && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                Repetir Escenario
              </Button>
            )}

            <Button
              onClick={onViewTranscript}
              variant="outline"
              className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              Ver Transcripción
            </Button>

            {/* Download PDF Button */}
            <Button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              variant="outline"
              className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11 border-green-600/40 hover:bg-green-900/30 text-green-400 hover:text-green-300"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-green-400 border-t-transparent rounded-full" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  Descargar PDF
                </>
              )}
            </Button>

            {/* Re-evaluate Button - Always visible for roleplay sessions */}
            {onReEvaluate && (
              <Button
                onClick={onReEvaluate}
                disabled={isReEvaluating || isProcessing}
                variant="outline"
                className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11 border-yellow-600/40 hover:bg-yellow-900/30 text-yellow-400 hover:text-yellow-300"
              >
                {isReEvaluating || isProcessing ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    {isProcessing ? 'Procesando...' : 'Reevaluando...'}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                    Reevaluar Sesión
                  </>
                )}
              </Button>
            )}

            {passed && canProceedNext && (
              <Button
                onClick={onNextScenario}
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-sm sm:text-base h-10 sm:h-11"
              >
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                Siguiente Escenario
              </Button>
            )}

            {passed && !canProceedNext && (
              <Button
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm sm:text-base h-10 sm:h-11"
              >
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                ¡Nivel Completado!
              </Button>
            )}
          </div>
        </Card>

        {/* Nota informativa */}
        {isProcessing && (
          <Card className="bg-blue-900/20 border-blue-500/20 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-400 text-center">
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