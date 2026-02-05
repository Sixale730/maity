/**
 * Communication Analyzer Service
 *
 * Analyzes user communication style from conversation segments using GPT-4o-mini.
 * Ported from maity-mobile/api/services/communication_analyzer.py
 */

import OpenAI from 'openai';

// ============================================================================
// CONSTANTS
// ============================================================================

const MODEL = 'gpt-4o-mini';
const MAX_TOKENS = 800;
const TEMPERATURE = 0.7;
const TIMEOUT_MS = 20000;
const MIN_USER_WORDS = 15;
const MAX_TRANSCRIPT_CHARS = 4000;

// ============================================================================
// TYPES
// ============================================================================

export interface TranscriptSegment {
  text: string;
  speaker?: string;
  speaker_id?: number;
  is_user?: boolean;
  start?: number;
  end?: number;
}

export interface CommunicationObservations {
  clarity: string;
  structure: string;
  calls_to_action: string;
  objections: string;
}

export interface CommunicationCounters {
  pero_count: number;
  objection_words: Record<string, number>;
  objections_received: string[];
  objections_made: string[];
  filler_words: Record<string, number>;
}

export interface CommunicationFeedback {
  strengths: string[];
  areas_to_improve: string[];
  observations: CommunicationObservations;
  summary: string;
  counters?: CommunicationCounters;
  overall_score?: number;
  clarity?: number;
  engagement?: number;
  structure?: number;
  feedback?: string;
}

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const SYSTEM_PROMPT = `Eres un coach experto en comunicación efectiva. Analiza las intervenciones del USUARIO en la siguiente conversación y proporciona feedback constructivo en español.

IMPORTANTE: Solo analiza los mensajes del USUARIO, no los de otros participantes.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:

{
  "strengths": ["fortaleza1", "fortaleza2", "fortaleza3"],
  "areas_to_improve": ["area1", "area2", "area3"],
  "observations": {
    "clarity": "Observación sobre claridad del mensaje (1-2 oraciones)",
    "structure": "Observación sobre estructura del mensaje (1-2 oraciones)",
    "calls_to_action": "Observación sobre llamados a la acción (1-2 oraciones)",
    "objections": "Observación sobre manejo de objeciones (1-2 oraciones)"
  },
  "summary": "Resumen de 1 oración (max 300 chars)",
  "counters": {
    "pero_count": 0,
    "objection_words": {"pero": 0, "sin embargo": 0, "aunque": 0, "no obstante": 0},
    "objections_received": ["objeción1"],
    "objections_made": ["objeción1"],
    "filler_words": {"este": 0, "o sea": 0, "como que": 0, "bueno": 0, "eh": 0, "mmm": 0}
  },
  "overall_score": 7,
  "clarity": 8,
  "engagement": 7,
  "structure": 6,
  "feedback": "Feedback general breve"
}

Reglas:
- strengths: 2-4 items máximo 5
- areas_to_improve: 2-4 items máximo 5
- Cada observación: 1-2 oraciones
- summary: máximo 300 caracteres
- Scores: 0-10
- Si hay muy poco contenido, devuelve scores bajos y menciona la falta de datos`;

// ============================================================================
// UTILITIES
// ============================================================================

function buildTranscript(segments: TranscriptSegment[]): { transcript: string; userWordCount: number } {
  // Filter user segments if marked, otherwise assume all are from user
  const hasUserMarks = segments.some((s) => s.is_user !== undefined);

  const lines: string[] = [];
  let userWordCount = 0;

  for (const segment of segments) {
    const isUser = hasUserMarks ? segment.is_user : true;
    const label = isUser ? 'Usuario' : 'Otro';
    lines.push(`${label}: ${segment.text}`);

    if (isUser) {
      userWordCount += segment.text.split(/\s+/).length;
    }
  }

  return {
    transcript: lines.join('\n'),
    userWordCount,
  };
}

function truncateTranscript(transcript: string, maxChars: number = MAX_TRANSCRIPT_CHARS): string {
  if (transcript.length <= maxChars) return transcript;
  return transcript.slice(0, maxChars) + '\n[Transcripción truncada...]';
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Analyze communication from transcript segments.
 * Returns null on error or insufficient content.
 */
export async function analyzeCommunication(
  segments: TranscriptSegment[]
): Promise<CommunicationFeedback | null> {
  if (!segments || segments.length === 0) {
    console.log('[communication-analyzer] No segments provided');
    return null;
  }

  const { transcript, userWordCount } = buildTranscript(segments);

  // Check minimum content
  if (userWordCount < MIN_USER_WORDS) {
    console.log(`[communication-analyzer] Insufficient user words: ${userWordCount}/${MIN_USER_WORDS}`);
    return {
      strengths: ['Participación en la conversación'],
      areas_to_improve: ['Proporcionar más contenido para un análisis completo'],
      observations: {
        clarity: 'Contenido insuficiente para evaluar claridad.',
        structure: 'Contenido insuficiente para evaluar estructura.',
        calls_to_action: 'Contenido insuficiente para evaluar llamados a la acción.',
        objections: 'Contenido insuficiente para evaluar manejo de objeciones.',
      },
      summary: 'Conversación muy breve para un análisis detallado.',
      overall_score: 5,
      clarity: 5,
      engagement: 5,
      structure: 5,
    };
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const truncated = truncateTranscript(transcript);

    const completion = await openai.chat.completions.create(
      {
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: truncated },
        ],
        response_format: { type: 'json_object' },
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
      },
      {
        timeout: TIMEOUT_MS,
      }
    );

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error('[communication-analyzer] Empty response from OpenAI');
      return null;
    }

    const result = JSON.parse(content) as CommunicationFeedback;

    console.log('[communication-analyzer] Analysis completed', {
      userWords: userWordCount,
      overallScore: result.overall_score,
    });

    return result;
  } catch (error) {
    console.error('[communication-analyzer] Error analyzing communication:', error);
    return null;
  }
}

/**
 * Aggregate feedback from multiple conversations.
 */
export function aggregateFeedback(
  feedbackList: CommunicationFeedback[]
): {
  top_strengths: string[];
  top_areas_to_improve: string[];
  conversations_analyzed: number;
} {
  const strengthsCount: Record<string, number> = {};
  const areasCount: Record<string, number> = {};

  for (const feedback of feedbackList) {
    for (const strength of feedback.strengths || []) {
      strengthsCount[strength] = (strengthsCount[strength] || 0) + 1;
    }
    for (const area of feedback.areas_to_improve || []) {
      areasCount[area] = (areasCount[area] || 0) + 1;
    }
  }

  // Sort by frequency and take top 5
  const topStrengths = Object.entries(strengthsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key]) => key);

  const topAreas = Object.entries(areasCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key]) => key);

  return {
    top_strengths: topStrengths,
    top_areas_to_improve: topAreas,
    conversations_analyzed: feedbackList.length,
  };
}
