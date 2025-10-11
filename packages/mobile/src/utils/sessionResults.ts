// Utility functions for session results processing
// Adapted from web SessionResults component

export interface DimensionScores {
  clarity: number | null;
  structure: number | null;
  connection: number | null;
  influence: number | null;
}

export interface SubdimensionScores {
  [key: string]: number;
}

export interface DimensionBreakdown {
  Claridad?: SubdimensionScores;
  Estructura?: SubdimensionScores;
  Alineacion_Emocional?: SubdimensionScores;
  Influencia?: SubdimensionScores;
}

export interface FeedbackSection {
  Cita?: string;
  Feedback?: string;
}

export interface ParsedEvaluation {
  dimensionScores: DimensionScores;
  subdimensionData: DimensionBreakdown | null;
  fortalezas: FeedbackSection | null;
  errores: FeedbackSection | null;
  recomendaciones: FeedbackSection | null;
  objectiveFeedback: string | null;
  calculatedScore: number | null;
}

export interface RadarDataPoint {
  dimension: string;
  value: number;
}

/**
 * Get color for score (0-100 scale)
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981'; // green
  if (score >= 60) return '#F59E0B'; // yellow
  return '#EF4444'; // red
}

/**
 * Get background color for score card
 */
export function getScoreBg(score: number): string {
  if (score >= 80) return 'rgba(16, 185, 129, 0.1)'; // green/10
  if (score >= 60) return 'rgba(245, 158, 11, 0.1)'; // yellow/10
  return 'rgba(239, 68, 68, 0.1)'; // red/10
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate user word count from transcript
 * Filters only lines starting with "Usuario:" and counts words
 */
export function calculateWordCount(transcript: string | null): number {
  if (!transcript) return 0;

  // Filter only user lines
  const userLines = transcript
    .split('\n')
    .filter(line => line.trim().startsWith('Usuario:'))
    .map(line => line.replace('Usuario:', '').trim())
    .join(' ');

  // Count words
  return userLines
    ? userLines.trim().split(/\s+/).filter(word => word.length > 0).length
    : 0;
}

/**
 * Parse evaluation data from processed_feedback JSONB
 */
export function parseEvaluationData(
  processedFeedback: any,
  score: number | null
): ParsedEvaluation {
  const evaluation = processedFeedback || {};

  // Extract dimension scores (0-100 scale)
  const dimensionScores: DimensionScores = {
    clarity: evaluation?.dimension_scores?.clarity ?? evaluation?.clarity ?? null,
    structure: evaluation?.dimension_scores?.structure ?? evaluation?.structure ?? null,
    connection: evaluation?.dimension_scores?.connection ?? evaluation?.connection ?? null,
    influence: evaluation?.dimension_scores?.influence ?? evaluation?.influence ?? null
  };

  // Calculate score from dimensions if not provided
  let calculatedScore = score;
  if (calculatedScore === null && (
    dimensionScores.clarity !== null ||
    dimensionScores.structure !== null ||
    dimensionScores.connection !== null ||
    dimensionScores.influence !== null
  )) {
    const values = [
      dimensionScores.clarity,
      dimensionScores.structure,
      dimensionScores.connection,
      dimensionScores.influence
    ].filter(v => v !== null) as number[];

    if (values.length === 4) {
      calculatedScore = Math.round(values.reduce((sum, val) => sum + val, 0) / 4);
    }
  }

  // Extract subdimension breakdown
  const subdimensionData = evaluation?.Evaluacion ? {
    Claridad: evaluation.Evaluacion.Claridad || null,
    Estructura: evaluation.Evaluacion.Estructura || null,
    Alineacion_Emocional: evaluation.Evaluacion.Alineacion_Emocional || null,
    Influencia: evaluation.Evaluacion.Influencia || null
  } : null;

  // Extract feedback sections
  const fortalezas = evaluation?.Fortalezas || null;
  const errores = evaluation?.Errores || null;
  const recomendaciones = evaluation?.Recomendaciones || null;
  const objectiveFeedback = evaluation?.objective_feedback || null;

  return {
    dimensionScores,
    subdimensionData,
    fortalezas,
    errores,
    recomendaciones,
    objectiveFeedback,
    calculatedScore
  };
}

/**
 * Prepare radar chart data for main dimensions (4 points)
 */
export function prepareRadarData(dimensionScores: DimensionScores): RadarDataPoint[] {
  return [
    { dimension: 'Claridad', value: dimensionScores.clarity ?? 0 },
    { dimension: 'Estructura', value: dimensionScores.structure ?? 0 },
    { dimension: 'Alineación Emocional', value: dimensionScores.connection ?? 0 },
    { dimension: 'Influencia', value: dimensionScores.influence ?? 0 }
  ];
}

/**
 * Prepare radar chart data for subdimensions
 */
export function prepareSubdimensionsRadarData(
  subdimensionData: DimensionBreakdown | null
): RadarDataPoint[] {
  if (!subdimensionData) return [];

  const data: RadarDataPoint[] = [];

  // Process each main dimension
  const dimensions = [
    subdimensionData.Claridad,
    subdimensionData.Estructura,
    subdimensionData.Alineacion_Emocional,
    subdimensionData.Influencia
  ];

  dimensions.forEach(dimension => {
    if (dimension) {
      Object.entries(dimension).forEach(([key, value]) => {
        // Convert from 1-10 scale to 0-100 scale
        data.push({
          dimension: key,
          value: parseFloat(String(value)) * 10
        });
      });
    }
  });

  return data;
}
