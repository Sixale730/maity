/**
 * Memory Extractor Service
 *
 * Extracts interesting facts and insights from conversation transcripts.
 * Ported from maity-mobile/api/services/memory_extractor.py
 */

import OpenAI from 'openai';

// ============================================================================
// CONSTANTS
// ============================================================================

const MODEL = 'gpt-4o-mini';
const MAX_TOKENS = 600;
const TEMPERATURE = 0.7;
const TIMEOUT_MS = 20000;
const MIN_TRANSCRIPT_CHARS = 50;
const MAX_TRANSCRIPT_CHARS = 4000;

// ============================================================================
// TYPES
// ============================================================================

export enum MemoryCategory {
  INTERESTING = 'interesting',
  ACTION = 'action',
  DECISION = 'decision',
  COMMITMENT = 'commitment',
}

export interface ExtractedMemory {
  content: string;
  category: MemoryCategory;
  conversation_id?: string;
  manually_added: boolean;
  reviewed: boolean;
}

export interface TranscriptSegment {
  text: string;
  speaker?: string;
  is_user?: boolean;
}

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const SYSTEM_PROMPT = `Eres un asistente experto en extraer información relevante de conversaciones.

Tu tarea es identificar y extraer datos INTERESANTES y ÚTILES que vale la pena recordar.

QUÉ EXTRAER:
- Información factual (fechas, nombres, lugares, decisiones)
- Insights o aprendizajes
- Compromisos, promesas o acuerdos
- Datos específicos para recordar (precios, direcciones, nombres)
- Recomendaciones

QUÉ NO EXTRAER:
- Saludos o despedidas genéricas
- Información obvia o trivial
- Fragmentos sin contexto
- Opiniones sin fundamento

Responde ÚNICAMENTE con un JSON válido:

{
  "memories": [
    {
      "content": "Hecho o insight específico en 1-2 oraciones claras"
    }
  ]
}

Reglas:
- Extrae entre 2 y 5 memorias relevantes
- Cada memoria debe ser clara y autocontenida
- Si no hay información relevante, devuelve un array vacío
- Escribe en español`;

// ============================================================================
// UTILITIES
// ============================================================================

function truncateTranscript(transcript: string, maxChars: number = MAX_TRANSCRIPT_CHARS): string {
  if (transcript.length <= maxChars) return transcript;
  return transcript.slice(0, maxChars) + '\n[Transcripción truncada...]';
}

function buildTranscriptFromSegments(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => {
      const label = s.is_user ? 'Usuario' : (s.speaker || 'Otro');
      return `${label}: ${s.text}`;
    })
    .join('\n');
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Extract memories from a transcript string.
 */
export async function extractMemoriesFromTranscript(
  transcript: string,
  conversationId?: string
): Promise<ExtractedMemory[]> {
  if (!transcript || transcript.length < MIN_TRANSCRIPT_CHARS) {
    console.log('[memory-extractor] Transcript too short');
    return [];
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
      console.error('[memory-extractor] Empty response from OpenAI');
      return [];
    }

    const parsed = JSON.parse(content) as { memories: { content: string }[] };

    if (!parsed.memories || !Array.isArray(parsed.memories)) {
      console.log('[memory-extractor] No memories extracted');
      return [];
    }

    const memories: ExtractedMemory[] = parsed.memories.map((m) => ({
      content: m.content,
      category: MemoryCategory.INTERESTING,
      conversation_id: conversationId,
      manually_added: false,
      reviewed: false,
    }));

    console.log(`[memory-extractor] Extracted ${memories.length} memories`);
    return memories;
  } catch (error) {
    console.error('[memory-extractor] Error extracting memories:', error);
    return [];
  }
}

/**
 * Extract memories from transcript segments.
 */
export async function extractMemoriesFromSegments(
  segments: TranscriptSegment[],
  conversationId?: string
): Promise<ExtractedMemory[]> {
  if (!segments || segments.length === 0) {
    return [];
  }

  const transcript = buildTranscriptFromSegments(segments);
  return extractMemoriesFromTranscript(transcript, conversationId);
}
