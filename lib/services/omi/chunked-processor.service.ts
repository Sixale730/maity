/**
 * Chunked Processor Service
 *
 * Handles long transcripts by splitting into chunks, processing each,
 * then merging results.
 * Ported from maity-mobile/api/services/chunked_processor.py
 */

import OpenAI from 'openai';

// ============================================================================
// LLM PROVIDER REGISTRY (DeepSeek first, then OpenAI fallback)
// ============================================================================

interface ProviderConfig {
  envKey: string;
  baseURL?: string;
  defaultModel: string;
  modelEnvKey: string;
}

const PROVIDER_REGISTRY: Record<string, ProviderConfig> = {
  deepseek: { envKey: 'DEEPSEEK_API_KEY', baseURL: 'https://api.deepseek.com', defaultModel: 'deepseek-chat', modelEnvKey: 'DEEPSEEK_MODEL' },
  openai:   { envKey: 'OPENAI_API_KEY',   baseURL: undefined,                  defaultModel: 'gpt-4o-mini',   modelEnvKey: 'OPENAI_MODEL' },
};

interface LLMClient {
  client: OpenAI;
  provider: string;
  model: string;
}

function getProviders(): LLMClient[] {
  const order = process.env.LLM_PROVIDERS
    ? process.env.LLM_PROVIDERS.split(',').map((s) => s.trim().toLowerCase())
    : ['deepseek', 'openai'];

  const clients: LLMClient[] = [];
  for (const name of order) {
    const config = PROVIDER_REGISTRY[name];
    if (!config) continue;
    const apiKey = process.env[config.envKey];
    if (!apiKey) continue;
    clients.push({
      client: new OpenAI({ apiKey, ...(config.baseURL ? { baseURL: config.baseURL } : {}) }),
      provider: name,
      model: process.env[config.modelEnvKey] || config.defaultModel,
    });
  }
  return clients;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_CHUNK_CHARS = 5000;
const CHUNK_TIMEOUT_MS = 30000;
const MERGE_TIMEOUT_MS = 30000;
const MAX_CONCURRENT_CHUNKS = 3;
const SIMPLE_TIMEOUT_MS = 20000;
const SIMPLE_MAX_TOKENS = 300;

// Available categories in Spanish
const CATEGORIES = [
  'personal', 'educación', 'salud', 'finanzas', 'legal', 'filosofía',
  'espiritual', 'ciencia', 'emprendimiento', 'crianza', 'romántico',
  'viajes', 'inspiración', 'tecnología', 'negocios', 'social', 'trabajo',
  'deportes', 'política', 'literatura', 'historia', 'arquitectura', 'música',
  'clima', 'noticias', 'entretenimiento', 'psicología', 'diseño', 'familia',
  'economía', 'medio ambiente', 'otro'
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
  "category": "trabajo",
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
  "category": "trabajo",
  "action_items": [{"description": "Tarea"}],
  "events": [],
  "discarded": false
}`;

const SIMPLE_SYSTEM_PROMPT = `Eres un asistente que analiza conversaciones.

Genera un resumen estructurado de la siguiente conversación.

Responde ÚNICAMENTE con JSON válido:
{
  "title": "Título corto (máximo 50 caracteres)",
  "overview": "Resumen de 1-2 oraciones",
  "emoji": "Un emoji representativo",
  "category": "Una categoría de: ${CATEGORIES.join(', ')}"
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
// SIMPLE STRUCTURED DATA (for short transcripts)
// ============================================================================

export interface SimpleStructuredData {
  title: string;
  overview: string;
  emoji: string;
  category: string;
}

/**
 * Generate simple structured data (title, overview, emoji, category) for short transcripts.
 * Uses LLM provider priority from LLM_PROVIDERS env (default: deepseek,openai).
 */
export async function generateSimpleStructured(transcriptText: string): Promise<SimpleStructuredData | null> {
  if (!transcriptText || transcriptText.length < 20) {
    console.log('[chunked-processor] Transcript too short for simple structured generation');
    return null;
  }

  const providers = getProviders();

  if (providers.length === 0) {
    console.error('[chunked-processor] No LLM providers available');
    return null;
  }

  for (const llm of providers) {
    try {
      const response = await llm.client.chat.completions.create(
        {
          model: llm.model,
          messages: [
            { role: 'system', content: SIMPLE_SYSTEM_PROMPT },
            { role: 'user', content: transcriptText.slice(0, 4000) },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: SIMPLE_MAX_TOKENS,
        },
        { timeout: SIMPLE_TIMEOUT_MS }
      );

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.warn(`[chunked-processor] Empty response from ${llm.provider}`);
        continue;
      }

      const result = JSON.parse(content) as SimpleStructuredData;
      console.log(`[chunked-processor] generateSimpleStructured completed with ${llm.provider}`);
      return result;
    } catch (error) {
      console.warn(`[chunked-processor] ${llm.provider} failed for simple structured, trying next...`, error);
    }
  }

  console.error('[chunked-processor] All providers failed for generateSimpleStructured');
  return null;
}

// ============================================================================
// CHUNK PROCESSING
// ============================================================================

async function processChunk(
  llm: LLMClient,
  chunk: string,
  chunkNumber: number,
  totalChunks: number
): Promise<ChunkResult | null> {
  try {
    const userMessage = `Fragmento ${chunkNumber} de ${totalChunks}:\n\n${chunk}`;

    const completion = await llm.client.chat.completions.create(
      {
        model: llm.model,
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
  llm: LLMClient,
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

    const completion = await llm.client.chat.completions.create(
      {
        model: llm.model,
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
 * Uses LLM provider priority from LLM_PROVIDERS env (default: deepseek,openai).
 */
export async function processLongTranscript(
  transcript: string
): Promise<ProcessedConversation | null> {
  const startTime = Date.now();

  // Split into chunks
  const chunks = splitAtSentenceBoundaries(transcript);
  console.log(`[chunked-processor] Split into ${chunks.length} chunks`);

  if (chunks.length === 0) {
    return null;
  }

  const providers = getProviders();

  if (providers.length === 0) {
    console.error('[chunked-processor] No LLM providers available');
    return null;
  }

  // Use first available provider for chunk processing
  const llm = providers[0];
  console.log(`[chunked-processor] Using ${llm.provider} for processing`);

  // Process chunks with concurrency limit
  const chunkResults: ChunkResult[] = [];

  // Process in batches of MAX_CONCURRENT_CHUNKS
  for (let i = 0; i < chunks.length; i += MAX_CONCURRENT_CHUNKS) {
    const batch = chunks.slice(i, i + MAX_CONCURRENT_CHUNKS);
    const batchPromises = batch.map((chunk, batchIndex) =>
      processChunk(llm, chunk, i + batchIndex + 1, chunks.length)
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
    console.log(`[chunked-processor] Single chunk completed with ${llm.provider}`);
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
  const merged = await mergeResults(llm, chunkResults);

  const duration = Date.now() - startTime;
  console.log(`[chunked-processor] Completed in ${duration}ms with ${llm.provider}`, {
    chunks: chunks.length,
    successfulChunks: chunkResults.length,
    discarded: merged?.discarded,
  });

  return merged;
}
