/**
 * Chunked Processor Service
 *
 * Handles long transcripts by splitting into chunks, processing each,
 * then merging results.
 * Ported from maity-mobile/api/services/chunked_processor.py
 */

import OpenAI from 'openai';

// ============================================================================
// CONSTANTS
// ============================================================================

const MODEL = 'gpt-4o-mini';
const MAX_CHUNK_CHARS = 5000;
const CHUNK_TIMEOUT_MS = 30000;
const MERGE_TIMEOUT_MS = 30000;
const MAX_CONCURRENT_CHUNKS = 3;

// Available categories matching maity-mobile
const CATEGORIES = [
  'personal', 'education', 'health', 'finance', 'legal', 'philosophy',
  'spiritual', 'science', 'entrepreneurship', 'parenting', 'romantic',
  'travel', 'inspiration', 'technology', 'business', 'social', 'work',
  'sports', 'politics', 'literature', 'history', 'architecture', 'music',
  'weather', 'news', 'entertainment', 'psychology', 'design', 'family',
  'economics', 'environment', 'other'
];

// ============================================================================
// TYPES
// ============================================================================

export interface ActionItem {
  description: string;
}

export interface ConversationEvent {
  title: string;
  start?: string;
  end?: string;
  description?: string;
}

export interface ChunkResult {
  partial_summary: string;
  category: string;
  action_items: ActionItem[];
  events: ConversationEvent[];
  discarded: boolean;
  key_topics: string[];
}

export interface ProcessedConversation {
  title: string;
  emoji: string;
  overview: string;
  category: string;
  action_items: ActionItem[];
  events: ConversationEvent[];
  discarded: boolean;
}

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

const CHUNK_SYSTEM_PROMPT = `Eres un asistente experto en analizar conversaciones.

Analiza el fragmento de conversación proporcionado y extrae:

1. partial_summary: Resumen de 2-3 oraciones de este fragmento
2. category: Una categoría de la lista: ${CATEGORIES.join(', ')}
3. action_items: Array de tareas/acciones mencionadas
4. events: Array de eventos mencionados (reuniones, fechas, etc.)
5. discarded: true SOLO si el fragmento es irrelevante (ruido, sin contenido)
6. key_topics: Array de 2-4 temas principales

Responde ÚNICAMENTE con JSON válido:

{
  "partial_summary": "Resumen del fragmento...",
  "category": "business",
  "action_items": [{"description": "Tarea 1"}],
  "events": [],
  "discarded": false,
  "key_topics": ["tema1", "tema2"]
}`;

const MERGE_SYSTEM_PROMPT = `Eres un asistente experto en sintetizar información.

Recibirás múltiples análisis parciales de una conversación. Tu tarea es unificarlos en un análisis final coherente.

Reglas:
1. title: Título corto (máximo 50 caracteres) que capture la esencia
2. emoji: Un emoji representativo
3. overview: Resumen de 3-5 oraciones cubriendo todos los fragmentos
4. category: La categoría más apropiada para toda la conversación
5. action_items: Combina todas las tareas sin duplicar
6. events: Combina todos los eventos
7. discarded: true SOLO si TODOS los fragmentos son irrelevantes

Responde ÚNICAMENTE con JSON válido:

{
  "title": "Título corto",
  "emoji": "📝",
  "overview": "Resumen completo...",
  "category": "business",
  "action_items": [{"description": "Tarea"}],
  "events": [],
  "discarded": false
}`;

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Split text at sentence boundaries.
 */
export function splitAtSentenceBoundaries(text: string, maxChars: number = MAX_CHUNK_CHARS): string[] {
  if (text.length <= maxChars) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunk = '';

  // Split on Spanish sentence endings
  const sentences = text.split(/(?<=[.!?¿¡])\s+/);

  for (const sentence of sentences) {
    // If single sentence exceeds max, split at word boundaries
    if (sentence.length > maxChars) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      // Split long sentence at word boundaries
      const words = sentence.split(/\s+/);
      let wordChunk = '';
      for (const word of words) {
        if ((wordChunk + ' ' + word).length > maxChars) {
          if (wordChunk) chunks.push(wordChunk.trim());
          wordChunk = word;
        } else {
          wordChunk = wordChunk ? wordChunk + ' ' + word : word;
        }
      }
      if (wordChunk) currentChunk = wordChunk;
      continue;
    }

    // Check if adding sentence exceeds max
    if ((currentChunk + ' ' + sentence).length > maxChars) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
    }
  }

  // Add remaining content
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// ============================================================================
// CHUNK PROCESSING
// ============================================================================

async function processChunk(
  openai: OpenAI,
  chunk: string,
  chunkNumber: number,
  totalChunks: number
): Promise<ChunkResult | null> {
  try {
    const userMessage = `Fragmento ${chunkNumber} de ${totalChunks}:\n\n${chunk}`;

    const completion = await openai.chat.completions.create(
      {
        model: MODEL,
        messages: [
          { role: 'system', content: CHUNK_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      },
      {
        timeout: CHUNK_TIMEOUT_MS,
      }
    );

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as ChunkResult;
  } catch (error) {
    console.error(`[chunked-processor] Error processing chunk ${chunkNumber}:`, error);
    return null;
  }
}

async function mergeResults(
  openai: OpenAI,
  chunkResults: ChunkResult[]
): Promise<ProcessedConversation | null> {
  try {
    const summaries = chunkResults.map((r, i) => ({
      fragment: i + 1,
      summary: r.partial_summary,
      category: r.category,
      topics: r.key_topics,
      action_items: r.action_items,
      events: r.events,
      discarded: r.discarded,
    }));

    const userMessage = `Análisis parciales a unificar:\n\n${JSON.stringify(summaries, null, 2)}`;

    const completion = await openai.chat.completions.create(
      {
        model: MODEL,
        messages: [
          { role: 'system', content: MERGE_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      },
      {
        timeout: MERGE_TIMEOUT_MS,
      }
    );

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as ProcessedConversation;
  } catch (error) {
    console.error('[chunked-processor] Error merging results:', error);
    return null;
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Process a long transcript by chunking, parallel processing, and merging.
 */
export async function processLongTranscript(
  transcript: string,
  model: string = MODEL
): Promise<ProcessedConversation | null> {
  const startTime = Date.now();

  // Split into chunks
  const chunks = splitAtSentenceBoundaries(transcript);
  console.log(`[chunked-processor] Split into ${chunks.length} chunks`);

  if (chunks.length === 0) {
    return null;
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Process chunks with concurrency limit
  const chunkResults: ChunkResult[] = [];

  // Process in batches of MAX_CONCURRENT_CHUNKS
  for (let i = 0; i < chunks.length; i += MAX_CONCURRENT_CHUNKS) {
    const batch = chunks.slice(i, i + MAX_CONCURRENT_CHUNKS);
    const batchPromises = batch.map((chunk, batchIndex) =>
      processChunk(openai, chunk, i + batchIndex + 1, chunks.length)
    );

    const batchResults = await Promise.all(batchPromises);

    for (const result of batchResults) {
      if (result) {
        chunkResults.push(result);
      }
    }
  }

  if (chunkResults.length === 0) {
    console.error('[chunked-processor] All chunks failed');
    return null;
  }

  // If only one chunk succeeded, format directly
  if (chunkResults.length === 1) {
    const r = chunkResults[0];
    return {
      title: r.key_topics[0] || 'Conversación',
      emoji: '💬',
      overview: r.partial_summary,
      category: r.category,
      action_items: r.action_items,
      events: r.events,
      discarded: r.discarded,
    };
  }

  // Merge multiple chunks
  const merged = await mergeResults(openai, chunkResults);

  const duration = Date.now() - startTime;
  console.log(`[chunked-processor] Completed in ${duration}ms`, {
    chunks: chunks.length,
    successfulChunks: chunkResults.length,
    discarded: merged?.discarded,
  });

  return merged;
}
