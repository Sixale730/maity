/**
 * TechWeekSessionResults - Display evaluation results for Tech Week sessions
 *
 * Pink-themed version of SessionResults for Tech Week feature.
 * Uses Tech Week color palette: #FF69B4 (hot pink), #FFB6C1 (light pink),
 * #FF1493 (deep pink), #DB7093 (pale violet red)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { Progress } from '@/ui/components/ui/progress';
import { Badge } from '@/ui/components/ui/badge';
import { PDFService } from '@maity/shared';
import { toast } from '@/shared/hooks/use-toast';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Loader2,
  ChevronDown,
  ChevronRight,
  Zap,
  Target,
  Quote,
  AlertCircle,
  TrendingUp,
  User,
  Building2,
  Copy,
  Check,
  FileText,
  Download,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';

// Tech Week Pink Color Palette
const PINK_COLORS = {
  hotPink: '#FF69B4',
  lightPink: '#FFB6C1',
  deepPink: '#FF1493',
  paleVioletRed: '#DB7093',
  pinkAlpha: (alpha: number) => `rgba(255, 105, 180, ${alpha})`,
  lightPinkAlpha: (alpha: number) => `rgba(255, 182, 193, ${alpha})`,
};

interface TechWeekSessionResultsProps {
  sessionId: string;
  sessionData?: any;
  evaluationData?: any;
  isEvaluationLoading?: boolean;
  onRetry?: () => void;
  isViewingOtherUser?: boolean;
}

/**
 * Get score color based on value (pink theme)
 */
function getScoreColor(score: number): string {
  if (score >= 90) return PINK_COLORS.deepPink;
  if (score >= 80) return PINK_COLORS.hotPink;
  if (score >= 70) return PINK_COLORS.lightPink;
  if (score >= 60) return PINK_COLORS.paleVioletRed;
  return '#ef4444'; // red for failing scores
}

/**
 * Get score background color (pink theme)
 */
function getScoreBg(score: number): string {
  if (score >= 90) return PINK_COLORS.pinkAlpha(0.1);
  if (score >= 80) return PINK_COLORS.pinkAlpha(0.08);
  if (score >= 70) return PINK_COLORS.lightPinkAlpha(0.1);
  if (score >= 60) return PINK_COLORS.lightPinkAlpha(0.08);
  return 'rgba(239, 68, 68, 0.1)';
}

/**
 * Format duration in minutes and seconds
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate word count from transcript
 */
function countWords(text: string): number {
  return text?.trim().split(/\s+/).filter(Boolean).length || 0;
}

export function TechWeekSessionResults({
  sessionId,
  sessionData,
  evaluationData,
  isEvaluationLoading = false,
  onRetry,
  isViewingOtherUser = false,
}: TechWeekSessionResultsProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Helper function for back navigation
  const handleBackNavigation = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/tech-week');
    }
  };

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

      if (hasEvaluation && evaluation) {
        const dimensionsList = [
          { key: 'Claridad', name: 'Claridad', data: evaluation.Claridad },
          { key: 'Estructura', name: 'Estructura', data: evaluation.Estructura },
          { key: 'Alineacion_Emocional', name: 'Alineación Emocional', data: evaluation.Alineacion_Emocional },
          { key: 'Influencia', name: 'Influencia', data: evaluation.Influencia },
        ];

        dimensionsList.forEach((dim) => {
          if (dim.data) {
            const subdimensions: Array<{ name: string; score: number }> = [];
            let totalScore = 0;
            let count = 0;

            Object.entries(dim.data).forEach(([key, value]) => {
              if (key !== 'Puntuacion_Total' && key !== 'Comentarios') {
                const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
                if (typeof numValue === 'number' && !isNaN(numValue)) {
                  const displayName = key.replace(/_/g, ' ');
                  subdimensions.push({ name: displayName, score: numValue * 10 });
                  totalScore += numValue;
                  count++;
                }
              }
            });

            if (count > 0) {
              const avgScore = Math.round((totalScore / count) * 10);
              dimensions.push({ name: dim.name, score: avgScore, subdimensions });
            }
          }
        });
      }

      await PDFService.generateSessionPDF(
        {
          sessionId,
          userName: sessionData?.user_name,
          userEmail: sessionData?.user_email,
          companyName: sessionData?.company_name,
          sessionType: 'tech_week',
          profileName: 'Tech Week',
          scenarioName: 'Práctica General',
          score,
          passed,
          duration,
          startedAt: sessionData?.started_at,
          dimensions: dimensions.length > 0 ? dimensions : undefined,
        },
        {
          includeCharts: hasEvaluation,
          chartElementIds: hasEvaluation ? ['tech-week-radar-chart'] : [],
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

  const [expandedDimensions, setExpandedDimensions] = useState<Record<string, boolean>>({});

  // Extract evaluation result
  const evaluation = evaluationData?.result?.Evaluacion || evaluationData?.result;
  const hasEvaluation = !!evaluation && evaluationData?.status === 'complete';
  const isProcessing = isEvaluationLoading || evaluationData?.status === 'processing' || evaluationData?.status === 'pending';
  const hasError = evaluationData?.status === 'error';

  // Session data
  const score = sessionData?.score ?? evaluationData?.score ?? 0;
  const passed = sessionData?.passed ?? evaluationData?.passed ?? false;
  const duration = sessionData?.duration_seconds ?? 0;
  const transcript = sessionData?.transcript ?? '';
  const wordCount = countWords(transcript);

  // Toggle dimension expansion
  const toggleDimension = (key: string) => {
    setExpandedDimensions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Main dimensions for radar chart
  const mainDimensions = [
    {
      name: 'Claridad',
      key: 'Claridad',
      score: 0,
      data: evaluation?.Claridad,
    },
    {
      name: 'Estructura',
      key: 'Estructura',
      score: 0,
      data: evaluation?.Estructura,
    },
    {
      name: 'Alineación',
      key: 'Alineacion_Emocional',
      score: 0,
      data: evaluation?.Alineacion_Emocional,
    },
    {
      name: 'Influencia',
      key: 'Influencia',
      score: 0,
      data: evaluation?.Influencia,
    },
  ];

  // Calculate average scores for each dimension
  mainDimensions.forEach(dim => {
    if (dim.data) {
      const scores: number[] = [];
      Object.entries(dim.data).forEach(([key, value]) => {
        if (key !== 'Puntuacion_Total' && key !== 'Comentarios') {
          const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
          if (typeof numValue === 'number' && !isNaN(numValue)) {
            scores.push(numValue);
          }
        }
      });
      if (scores.length > 0) {
        dim.score = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
      }
    }
  });

  // Radar chart data
  const radarData = mainDimensions.map(dim => ({
    dimension: dim.name,
    score: dim.score,
    fullMark: 100,
  }));

  // Chart config for Recharts
  const chartConfig = {
    score: {
      label: 'Puntuación',
      color: PINK_COLORS.hotPink,
    },
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackNavigation}
                className="hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tech Week
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: PINK_COLORS.hotPink }}>
                  <Zap className="h-6 w-6" />
                  Resultados Tech Week
                </h1>
                <p className="text-sm text-gray-400">
                  Análisis detallado de tu sesión de práctica
                </p>
              </div>
            </div>
            {/* Download PDF Button */}
            <Button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              variant="outline"
              size="sm"
              className="border-green-600/40 hover:bg-green-900/30 text-green-400 hover:text-green-300"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-green-400 border-t-transparent rounded-full" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* User Info Banner for Admins */}
      {isViewingOtherUser && sessionData && (
        <div className="container mx-auto px-4 pt-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-700/30 rounded-full p-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                    Sesión de Usuario
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{sessionData.user_name || sessionData.user_email}</span>
                    </div>
                    {sessionData.company_name && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{sessionData.company_name}</span>
                      </div>
                    )}
                    {/* ID de Sesión */}
                    <div className="pt-2 border-t border-blue-700/30">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <FileText className="h-3 w-3 flex-shrink-0" />
                        <span>ID de Sesión</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-white text-xs font-mono bg-gray-800/50 px-2 py-1 rounded border border-gray-700 flex-1 overflow-x-auto">
                          {sessionId}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopySessionId}
                          className="shrink-0 h-7 text-xs border-blue-600/40 hover:bg-blue-900/30"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copiar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Processing State */}
          {isProcessing && (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: PINK_COLORS.hotPink }} />
                  <div>
                    <p className="text-lg font-semibold" style={{ color: PINK_COLORS.hotPink }}>
                      Procesando evaluación...
                    </p>
                    <p className="text-sm text-gray-400">
                      La IA está analizando tu sesión. Esto puede tomar unos minutos.
                    </p>
                  </div>
                </div>
                {evaluationData?.request_id && (
                  <p className="text-xs text-gray-500 mt-4">
                    ID de solicitud: {evaluationData.request_id}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {hasError && (
            <Card className="bg-gray-900/50 border-red-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-lg font-semibold text-red-500">
                      Error al procesar evaluación
                    </p>
                    <p className="text-sm text-gray-400">
                      {evaluationData?.error_message || 'Ocurrió un error inesperado'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Score Card */}
          <Card
            className="bg-gray-900/50 border-gray-800"
            style={{
              borderColor: hasEvaluation ? getScoreColor(score) : undefined,
              borderWidth: hasEvaluation ? '2px' : undefined,
            }}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Score Display */}
                <div className="flex items-center gap-6">
                  <div
                    className="relative w-32 h-32 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: hasEvaluation ? getScoreBg(score) : 'rgba(107, 114, 128, 0.1)',
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="text-4xl font-bold"
                        style={{ color: hasEvaluation ? getScoreColor(score) : '#9ca3af' }}
                      >
                        {hasEvaluation ? score : '--'}
                      </div>
                      <div className="text-xs text-gray-400">de 100</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {hasEvaluation ? (
                        passed ? (
                          <CheckCircle2 className="h-6 w-6" style={{ color: PINK_COLORS.hotPink }} />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )
                      ) : (
                        <Clock className="h-6 w-6 text-gray-400" />
                      )}
                      <span className="text-2xl font-semibold">
                        {hasEvaluation ? (passed ? 'Aprobado' : 'No Aprobado') : 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {hasEvaluation
                        ? passed
                          ? '¡Excelente trabajo en tu sesión Tech Week!'
                          : 'Sigue practicando para mejorar tu puntuación'
                        : 'La evaluación se está procesando'}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center min-w-[100px]">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4" style={{ color: PINK_COLORS.lightPink }} />
                      <span className="text-2xl font-bold">{wordCount}</span>
                    </div>
                    <p className="text-xs text-gray-400">palabras</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center min-w-[100px]">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Clock className="h-4 w-4" style={{ color: PINK_COLORS.lightPink }} />
                      <span className="text-2xl font-bold">{formatDuration(duration)}</span>
                    </div>
                    <p className="text-xs text-gray-400">duración</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Details - Only show if evaluation is complete */}
          {hasEvaluation && (
            <>
              {/* Objective/Feedback Card */}
              {evaluation?.Objetivo && (
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: PINK_COLORS.hotPink }}>
                      <Target className="h-5 w-5" />
                      Evaluación del Objetivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed">{evaluation.Objetivo}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Main Radar Chart */}
              <Card id="tech-week-radar-chart" className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle style={{ color: PINK_COLORS.hotPink }}>
                    Análisis por Dimensiones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis
                          dataKey="dimension"
                          tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
                        <Radar
                          name="Puntuación"
                          dataKey="score"
                          stroke={PINK_COLORS.hotPink}
                          fill={PINK_COLORS.hotPink}
                          fillOpacity={0.3}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '0.5rem',
                            color: '#fff',
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Dimension Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {mainDimensions.map(dim => (
                      <div key={dim.key} className="bg-gray-800/50 rounded-lg p-4 text-center">
                        <div
                          className="text-2xl font-bold mb-1"
                          style={{ color: getScoreColor(dim.score) }}
                        >
                          {dim.score}
                        </div>
                        <div className="text-sm text-gray-400">{dim.name}</div>
                        <Progress
                          value={dim.score}
                          className="h-2 mt-2"
                          style={{
                            backgroundColor: 'rgba(55, 65, 81, 0.5)',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Dimension Analysis */}
              {mainDimensions.map(dimension => {
                if (!dimension.data) return null;

                const isExpanded = expandedDimensions[dimension.key];
                const subdimensions: Array<{ key: string; label: string; score: number }> = [];
                let comments = '';

                Object.entries(dimension.data).forEach(([key, value]) => {
                  if (key === 'Comentarios') {
                    comments = value as string;
                  } else if (key !== 'Puntuacion_Total') {
                    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
                    if (typeof numValue === 'number' && !isNaN(numValue)) {
                      subdimensions.push({
                        key,
                        label: key.replace(/_/g, ' '),
                        score: numValue,
                      });
                    }
                  }
                });

                return (
                  <Card key={dimension.key} className="bg-gray-900/50 border-gray-800">
                    <CardHeader
                      className="cursor-pointer hover:bg-gray-800/30 transition-colors"
                      onClick={() => toggleDimension(dimension.key)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2" style={{ color: PINK_COLORS.lightPink }}>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                          {dimension.name}
                        </CardTitle>
                        <Badge
                          style={{
                            backgroundColor: getScoreBg(dimension.score),
                            color: getScoreColor(dimension.score),
                          }}
                        >
                          {dimension.score}/100
                        </Badge>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="space-y-6">
                        {/* Subdimensions */}
                        {subdimensions.length > 0 && (
                          <div className="space-y-3">
                            {subdimensions.map(sub => (
                              <div key={sub.key} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-300 capitalize">{sub.label}</span>
                                  <span
                                    className="font-semibold"
                                    style={{ color: getScoreColor(sub.score) }}
                                  >
                                    {sub.score}/100
                                  </span>
                                </div>
                                <Progress
                                  value={sub.score}
                                  className="h-2"
                                  style={{
                                    backgroundColor: 'rgba(55, 65, 81, 0.5)',
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comments */}
                        {comments && (
                          <div className="bg-gray-800/30 rounded-lg p-4 border-l-4" style={{ borderColor: PINK_COLORS.hotPink }}>
                            <p className="text-sm text-gray-300 leading-relaxed">{comments}</p>
                          </div>
                        )}

                        {/* Subdimension Radar Chart */}
                        {subdimensions.length > 0 && (
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart
                                data={subdimensions.map(sub => ({
                                  dimension: sub.label,
                                  score: sub.score,
                                  fullMark: 100,
                                }))}
                              >
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis
                                  dataKey="dimension"
                                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                                />
                                <PolarRadiusAxis
                                  angle={90}
                                  domain={[0, 100]}
                                  tick={{ fill: '#9ca3af' }}
                                />
                                <Radar
                                  name="Puntuación"
                                  dataKey="score"
                                  stroke={PINK_COLORS.lightPink}
                                  fill={PINK_COLORS.lightPink}
                                  fillOpacity={0.4}
                                />
                                <RechartsTooltip
                                  contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '0.5rem',
                                    color: '#fff',
                                  }}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}

              {/* Feedback Sections */}
              {(evaluation?.Fortalezas || evaluation?.Errores || evaluation?.Recomendaciones) && (
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Fortalezas */}
                  {evaluation?.Fortalezas && (
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2" style={{ color: PINK_COLORS.hotPink }}>
                          <CheckCircle2 className="h-5 w-5" />
                          Fortalezas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Array.isArray(evaluation.Fortalezas) ? (
                            evaluation.Fortalezas.map((item: string, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-sm text-gray-300 bg-gray-800/30 rounded p-3"
                              >
                                <Quote className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: PINK_COLORS.lightPink }} />
                                <span>{item}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-300">{evaluation.Fortalezas}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Errores */}
                  {evaluation?.Errores && (
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-400">
                          <AlertCircle className="h-5 w-5" />
                          Áreas de Mejora
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Array.isArray(evaluation.Errores) ? (
                            evaluation.Errores.map((item: string, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-sm text-gray-300 bg-gray-800/30 rounded p-3"
                              >
                                <Quote className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-400" />
                                <span>{item}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-300">{evaluation.Errores}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recomendaciones */}
                  {evaluation?.Recomendaciones && (
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2" style={{ color: PINK_COLORS.paleVioletRed }}>
                          <TrendingUp className="h-5 w-5" />
                          Recomendaciones
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Array.isArray(evaluation.Recomendaciones) ? (
                            evaluation.Recomendaciones.map((item: string, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-sm text-gray-300 bg-gray-800/30 rounded p-3"
                              >
                                <Quote className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: PINK_COLORS.paleVioletRed }} />
                                <span>{item}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-300">{evaluation.Recomendaciones}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            {!isViewingOtherUser && (
              <Button
                onClick={() => navigate('/tech-week')}
                size="lg"
                style={{
                  backgroundColor: PINK_COLORS.hotPink,
                  color: 'white',
                }}
                className="hover:opacity-90"
              >
                <Zap className="mr-2 h-5 w-5" />
                Nueva Práctica
              </Button>
            )}
            <Button
              onClick={() => navigate('/tech-week/sessions')}
              variant="outline"
              size="lg"
              className="border-gray-700 hover:bg-gray-800"
            >
              Ver Historial
            </Button>
            {transcript && (
              <Button
                onClick={() => {
                  // Could open a modal or navigate to transcript view
                  console.log('View transcript:', transcript);
                }}
                variant="ghost"
                size="lg"
                className="hover:bg-gray-800"
              >
                Ver Transcripción
              </Button>
            )}
          </div>

          {/* Debug Info */}
          {evaluationData?.request_id && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                ID de solicitud: {evaluationData.request_id}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
