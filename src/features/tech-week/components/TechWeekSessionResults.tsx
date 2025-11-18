/**
 * TechWeekSessionResults - Display evaluation results for Tech Week sessions
 *
 * Pink-themed version of SessionResults for Tech Week feature.
 * Uses Tech Week color palette: #FF69B4 (hot pink), #9b4dca (purple),
 * #FFB6C1 (light pink), #DB7093 (pale violet red)
 */

import React from 'react';
import { Card } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { Progress } from '@/ui/components/ui/progress';
import { Input } from '@/ui/components/ui/input';
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
  Loader2,
  Zap
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

interface TechWeekSessionResultsProps {
  sessionId: string;
  sessionData?: any;
  evaluationData?: any;
  isEvaluationLoading?: boolean;
  onReEvaluate?: () => void;
  isReEvaluating?: boolean;
  isViewingOtherUser?: boolean;
  onViewTranscript?: () => void;
  customName?: string;
  onCustomNameChange?: (name: string) => void;
}

// Pink/Purple color palette for Tech Week
const PINK_COLORS = {
  hotPink: '#FF69B4',
  purple: '#9b4dca',
  lightPink: '#FFB6C1',
  paleVioletRed: '#DB7093',
  deepPink: '#FF1493',
};

const chartConfig = {
  value: {
    label: "Puntuación",
    color: PINK_COLORS.hotPink,
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

export function TechWeekSessionResults({
  sessionId,
  sessionData,
  evaluationData,
  isEvaluationLoading = false,
  onReEvaluate,
  isReEvaluating = false,
  isViewingOtherUser = false,
  onViewTranscript,
  customName = '',
  onCustomNameChange,
}: TechWeekSessionResultsProps) {
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

  // Extract evaluation result
  const evaluation = evaluationData?.result?.Evaluacion || evaluationData?.result;
  const hasEvaluation = !!evaluation && evaluationData?.status === 'complete';
  const isProcessing = isEvaluationLoading || evaluationData?.status === 'processing' || evaluationData?.status === 'pending';
  const error = evaluationData?.status === 'error' ? (evaluationData?.error_message || 'Error al procesar evaluación') : null;

  // Session data
  const score = sessionData?.score ?? evaluationData?.score ?? 0;
  const passed = sessionData?.passed ?? evaluationData?.passed ?? false;
  const duration = sessionData?.duration_seconds ?? 0;
  const transcript = sessionData?.transcript ?? '';

  // Calcular conteo de palabras del usuario desde la transcripción
  const userWordCount = React.useMemo(() => {
    if (!transcript) return 0;

    // Filtrar solo las líneas del usuario
    const userLines = transcript
      .split('\n')
      .filter((line: string) => line.trim().startsWith('Usuario:'))
      .map((line: string) => line.replace('Usuario:', '').trim())
      .join(' ');

    // Contar palabras
    return userLines
      ? userLines.trim().split(/\s+/).filter((word: string) => word.length > 0).length
      : 0;
  }, [transcript]);

  // Calculate dimension scores from Evaluacion structure
  const calculateMainDimensionScore = (dimension: any): number | null => {
    if (!dimension) return null;
    const scores: number[] = [];

    Object.entries(dimension).forEach(([key, value]) => {
      if (key === 'Puntuacion_Total' || key === 'Comentarios') return;
      const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
      if (!isNaN(numValue as number)) {
        scores.push((numValue as number) * 10);
      }
    });

    if (scores.length === 0) return null;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  // Usar datos reales de la evaluación
  // dimension_scores está en result directamente, no dentro de Evaluacion
  const metrics = {
    clarity: evaluationData?.result?.dimension_scores?.clarity ??
             evaluation?.dimension_scores?.clarity ??
             evaluation?.clarity ??
             calculateMainDimensionScore(evaluation?.Claridad),
    structure: evaluationData?.result?.dimension_scores?.structure ??
               evaluation?.dimension_scores?.structure ??
               evaluation?.structure ??
               calculateMainDimensionScore(evaluation?.Estructura),
    connection: evaluationData?.result?.dimension_scores?.connection ??
                evaluation?.dimension_scores?.connection ??
                evaluation?.connection ??
                calculateMainDimensionScore(evaluation?.Alineacion_Emocional),
    influence: evaluationData?.result?.dimension_scores?.influence ??
               evaluation?.dimension_scores?.influence ??
               evaluation?.influence ??
               calculateMainDimensionScore(evaluation?.Influencia)
  };

  // Calcular score desde las métricas si no viene explícito
  let calculatedScore = score;
  if (calculatedScore === null && (metrics.clarity !== null || metrics.structure !== null || metrics.connection !== null || metrics.influence !== null)) {
    const values = [metrics.clarity, metrics.structure, metrics.connection, metrics.influence].filter(v => v !== null);
    if (values.length > 0) {
      calculatedScore = Math.round(values.reduce((sum, val) => sum + (val as number), 0) / values.length);
    }
  }

  // Usar feedback real si está disponible
  // Los campos Fortalezas, Errores, Recomendaciones están en evaluationData.result, no en Evaluacion
  const fortalezas = evaluationData?.result?.Fortalezas || evaluation?.Fortalezas || null;
  const errores = evaluationData?.result?.Errores || evaluation?.Errores || null;
  const recomendaciones = evaluationData?.result?.Recomendaciones || evaluation?.Recomendaciones || null;
  const objectiveFeedback = evaluationData?.result?.Objetivo || evaluation?.Objetivo || evaluation?.objective_feedback || null;

  // El desglose puede estar en evaluation directamente o en evaluationData.result.Evaluacion
  const evaluacionSource = evaluation || evaluationData?.result?.Evaluacion;
  const evaluacionDesglose = evaluacionSource ? {
    Claridad: evaluacionSource.Claridad || null,
    Estructura: evaluacionSource.Estructura || null,
    Alineacion_Emocional: evaluacionSource.Alineacion_Emocional || null,
    Influencia: evaluacionSource.Influencia || null
  } : null;

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

  // Preparar datos para el radar de subdimensiones
  const radarSubdimensionsData = React.useMemo(() => {
    if (isProcessing || !evaluacionDesglose) return [];

    const data: Array<{ dimension: string; value: number }> = [];

    // Claridad
    if (evaluacionDesglose.Claridad) {
      Object.entries(evaluacionDesglose.Claridad).forEach(([key, value]) => {
        if (key !== 'Puntuacion_Total' && key !== 'Comentarios') {
          const numValue = parseFloat(String(value));
          if (!isNaN(numValue)) {
            data.push({
              dimension: key.replace(/_/g, ' '),
              value: numValue * 10
            });
          }
        }
      });
    }

    // Estructura
    if (evaluacionDesglose.Estructura) {
      Object.entries(evaluacionDesglose.Estructura).forEach(([key, value]) => {
        if (key !== 'Puntuacion_Total' && key !== 'Comentarios') {
          const numValue = parseFloat(String(value));
          if (!isNaN(numValue)) {
            data.push({
              dimension: key.replace(/_/g, ' '),
              value: numValue * 10
            });
          }
        }
      });
    }

    // Alineación Emocional
    if (evaluacionDesglose.Alineacion_Emocional) {
      Object.entries(evaluacionDesglose.Alineacion_Emocional).forEach(([key, value]) => {
        if (key !== 'Puntuacion_Total' && key !== 'Comentarios') {
          const numValue = parseFloat(String(value));
          if (!isNaN(numValue)) {
            data.push({
              dimension: key.replace(/_/g, ' '),
              value: numValue * 10
            });
          }
        }
      });
    }

    // Influencia
    if (evaluacionDesglose.Influencia) {
      Object.entries(evaluacionDesglose.Influencia).forEach(([key, value]) => {
        if (key !== 'Puntuacion_Total' && key !== 'Comentarios') {
          const numValue = parseFloat(String(value));
          if (!isNaN(numValue)) {
            data.push({
              dimension: key.replace(/_/g, ' '),
              value: numValue * 10
            });
          }
        }
      });
    }

    return data;
  }, [evaluacionDesglose, isProcessing]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return `text-[${PINK_COLORS.deepPink}]`;
    if (score >= 60) return `text-[${PINK_COLORS.hotPink}]`;
    return 'text-red-400';
  };

  const getScoreColorHex = (score: number) => {
    if (score >= 80) return PINK_COLORS.deepPink;
    if (score >= 60) return PINK_COLORS.hotPink;
    return '#ef4444';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return `bg-[${PINK_COLORS.hotPink}]/10 border-[${PINK_COLORS.hotPink}]/20`;
    if (score >= 60) return `bg-[${PINK_COLORS.lightPink}]/10 border-[${PINK_COLORS.lightPink}]/20`;
    return 'bg-red-500/10 border-red-500/20';
  };

  // Función para generar PDF
  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);

      // Prepare dimensions data
      const dimensions: import('@maity/shared').DimensionData[] = [];

      if (hasEvaluation && evaluacionDesglose) {
        // Claridad
        if (metrics.clarity !== null) {
          const subdimensions: Array<{ name: string; score: number }> = [];
          const claridadData = evaluacionDesglose.Claridad;
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
          const estructuraData = evaluacionDesglose.Estructura;
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
          const alineacionData = evaluacionDesglose.Alineacion_Emocional;
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
          const influenciaData = evaluacionDesglose.Influencia;
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
          sessionType: 'tech_week',
          profileName: 'Tech Week',
          scenarioName: 'Práctica General',
          score: calculatedScore,
          duration,
          startedAt: sessionData?.started_at,
          wordCount: userWordCount,
          dimensions: dimensions.length > 0 ? dimensions : undefined,
          // Tech Week specific
          customName: customName || undefined,
          feedback: {
            fortalezas: fortalezas || undefined,
            errores: errores || undefined,
            recomendaciones: recomendaciones || undefined,
          },
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

  return (
    <div className="min-h-screen bg-black p-3 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center gap-2">
            <Zap className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: PINK_COLORS.hotPink }} />
            Resultados Tech Week
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Análisis detallado de tu sesión de práctica
          </p>
        </div>

        {/* User Info Banner for Admins - Below Title */}
        {isViewingOtherUser && sessionData && (
          <Card className="bg-gradient-to-br from-pink-900/30 to-purple-800/20 border-pink-600/40 p-5 sm:p-6">
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2" style={{ color: PINK_COLORS.hotPink }}>
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
                    {sessionData.user_name || sessionData.user_email}
                  </div>
                  {sessionData.user_name && sessionData.user_email && (
                    <div className="text-gray-400 text-sm">{sessionData.user_email}</div>
                  )}
                </div>

                {/* Empresa */}
                {sessionData.company_name && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Building2 className="h-4 w-4" />
                      <span>Empresa</span>
                    </div>
                    <div className="text-white text-lg font-semibold">
                      {sessionData.company_name}
                    </div>
                  </div>
                )}

                {/* Fecha y Hora */}
                {sessionData.started_at && (
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Fecha y Hora</span>
                    </div>
                    <div className="text-white text-lg font-semibold">
                      {new Date(sessionData.started_at).toLocaleString('es-MX', {
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
                      className="shrink-0 border-pink-600/40 hover:bg-pink-900/30"
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
        <Card className={`bg-gray-900/50 border ${isProcessing ? 'border-pink-500/20' : getScoreBg(displayScore || 0)} p-4 sm:p-6 lg:p-8`}>
          <div className="text-center space-y-3 sm:space-y-4">
            {isProcessing ? (
              <>
                <div className="flex justify-center">
                  <div className="p-3 sm:p-4 bg-pink-500/10 rounded-full animate-pulse">
                    <Brain className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12" style={{ color: PINK_COLORS.hotPink }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: PINK_COLORS.hotPink }}>
                    Procesando evaluación...
                  </div>
                  <p className="text-sm sm:text-base text-gray-400">
                    Nuestro agente AI está analizando tu conversación
                  </p>
                  <div className="flex justify-center">
                    <div className="animate-spin h-5 w-5 sm:h-6 sm:w-6 border-2 border-t-transparent rounded-full" style={{ borderColor: PINK_COLORS.hotPink }} />
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
                  <div className="p-3 sm:p-4 rounded-full" style={{ backgroundColor: `${PINK_COLORS.hotPink}1A` }}>
                    <Trophy className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12" style={{ color: PINK_COLORS.hotPink }} />
                  </div>
                </div>

                <div>
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                    <span style={{ color: getScoreColorHex(displayScore || 0) }}>{displayScore || '—'}</span>
                    <span className="text-gray-500">/100</span>
                  </div>
                  <p className="text-base sm:text-lg lg:text-xl mt-2 text-gray-400">
                    Puntuación obtenida
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Métricas de Sesión: Palabras y Duración */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Palabras Pronunciadas */}
          <Card className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 border-pink-500/20 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-pink-500/10 rounded-lg flex-shrink-0">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: PINK_COLORS.hotPink }} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Palabras Pronunciadas</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Total de palabras expresadas</p>
                </div>
              </div>
              <div className="text-left sm:text-right pl-11 sm:pl-0">
                <div className="text-3xl sm:text-4xl font-bold" style={{ color: PINK_COLORS.hotPink }}>
                  {userWordCount.toLocaleString()}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">palabras</p>
              </div>
            </div>
          </Card>

          {/* Duración de la Sesión */}
          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/20 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-purple-500/10 rounded-lg flex-shrink-0">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: PINK_COLORS.purple }} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Duración de Sesión</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Tiempo total de conversación</p>
                </div>
              </div>
              <div className="text-left sm:text-right pl-11 sm:pl-0">
                <div className="text-3xl sm:text-4xl font-bold" style={{ color: PINK_COLORS.purple }}>
                  {formatDuration(duration)}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">minutos</p>
              </div>
            </div>
          </Card>
        </div>

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
                        stroke={PINK_COLORS.hotPink}
                        fill={PINK_COLORS.hotPink}
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
                          stroke={PINK_COLORS.purple}
                          fill={PINK_COLORS.purple}
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
              <Brain className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: PINK_COLORS.hotPink }} />
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
                  const progressValue = value !== null ? value : 0;

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
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PINK_COLORS.hotPink }} />
                              <span className="font-medium text-white text-sm sm:text-base">{dimensionName}</span>
                              <span className="text-xs sm:text-sm font-medium" style={{ color: value !== null ? getScoreColorHex(value) : '#6b7280' }}>
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
                            if (subKey === 'Puntuacion_Total' || subKey === 'Comentarios') return null;
                            const valueNum = parseFloat(String(subValue)) * 10;
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
                                  <span className="font-medium flex-shrink-0" style={{ color: PINK_COLORS.hotPink }}>
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
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: PINK_COLORS.hotPink }} />
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
                {/* Fortalezas */}
                {fortalezas && (
                  <div>
                    <p className="text-sm sm:text-base font-medium mb-2" style={{ color: PINK_COLORS.hotPink }}>Fortalezas</p>
                    {fortalezas.Cita && (
                      <blockquote className="border-l-2 pl-2 sm:pl-3 py-1 mb-2" style={{ borderColor: `${PINK_COLORS.hotPink}80` }}>
                        <p className="text-xs sm:text-sm italic text-gray-300">{fortalezas.Cita}</p>
                      </blockquote>
                    )}
                    {(fortalezas.Feedback || fortalezas.feedback) && (
                      <p className="text-sm sm:text-base text-gray-300">{fortalezas.Feedback || fortalezas.feedback}</p>
                    )}
                    {typeof fortalezas === 'string' && (
                      <p className="text-sm sm:text-base text-gray-300">{fortalezas}</p>
                    )}
                    {Array.isArray(fortalezas) && fortalezas.map((item: string, idx: number) => (
                      <p key={idx} className="text-sm sm:text-base text-gray-300">{item}</p>
                    ))}
                  </div>
                )}

                {/* Errores */}
                {errores && (
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-sm sm:text-base font-medium text-red-400 mb-2">Errores</p>
                    {errores.Cita && (
                      <blockquote className="border-l-2 border-red-500/50 pl-2 sm:pl-3 py-1 mb-2">
                        <p className="text-xs sm:text-sm italic text-gray-300">{errores.Cita}</p>
                      </blockquote>
                    )}
                    {(errores.Feedback || errores.feedback) && (
                      <p className="text-sm sm:text-base text-gray-300">{errores.Feedback || errores.feedback}</p>
                    )}
                    {typeof errores === 'string' && (
                      <p className="text-sm sm:text-base text-gray-300">{errores}</p>
                    )}
                    {Array.isArray(errores) && errores.map((item: string, idx: number) => (
                      <p key={idx} className="text-sm sm:text-base text-gray-300">{item}</p>
                    ))}
                  </div>
                )}

                {/* Recomendaciones */}
                {recomendaciones && (
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-sm sm:text-base font-medium mb-2" style={{ color: PINK_COLORS.purple }}>Recomendaciones</p>
                    {recomendaciones.Cita && (
                      <blockquote className="border-l-2 pl-2 sm:pl-3 py-1 mb-2" style={{ borderColor: `${PINK_COLORS.purple}80` }}>
                        <p className="text-xs sm:text-sm italic text-gray-300">{recomendaciones.Cita}</p>
                      </blockquote>
                    )}
                    {(recomendaciones.Feedback || recomendaciones.feedback) && (
                      <p className="text-sm sm:text-base text-gray-300">{recomendaciones.Feedback || recomendaciones.feedback}</p>
                    )}
                    {typeof recomendaciones === 'string' && (
                      <p className="text-sm sm:text-base text-gray-300">{recomendaciones}</p>
                    )}
                    {Array.isArray(recomendaciones) && recomendaciones.map((item: string, idx: number) => (
                      <p key={idx} className="text-sm sm:text-base text-gray-300">{item}</p>
                    ))}
                  </div>
                )}

                {/* No feedback available */}
                {!fortalezas && !errores && !recomendaciones && (
                  <p className="text-sm text-gray-500 italic">
                    No hay feedback disponible para esta sesión.
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Acciones */}
        <Card className="bg-gray-900/50 border-gray-800 p-4 sm:p-6">
          <div className="space-y-4">
            {/* Custom Name Input for PDF */}
            {onCustomNameChange && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label className="text-sm text-gray-400 whitespace-nowrap">
                  Nombre para el PDF:
                </label>
                <Input
                  type="text"
                  placeholder="Ingresa el nombre del participante"
                  value={customName}
                  onChange={(e) => onCustomNameChange(e.target.value)}
                  className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                onClick={() => navigate('/tech-week')}
                variant="outline"
                className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                Nueva Práctica
              </Button>

              <Button
                onClick={() => navigate('/tech-week/sessions')}
                variant="outline"
                className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                Ver Historial
              </Button>

              {onViewTranscript && (
                <Button
                  onClick={onViewTranscript}
                  variant="outline"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  Ver Transcripción
                </Button>
              )}

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

              {/* Re-evaluate Button */}
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
            </div>
          </div>
        </Card>

        {/* Nota informativa */}
        {isProcessing && (
          <Card className="bg-pink-900/20 border-pink-500/20 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-center" style={{ color: PINK_COLORS.hotPink }}>
              La evaluación está siendo procesada por nuestro agente AI. Los resultados completos estarán disponibles en unos momentos.
              {evaluationData?.request_id && (
                <span className="block mt-1 text-xs text-gray-500">
                  ID de evaluación: {evaluationData.request_id}
                </span>
              )}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
