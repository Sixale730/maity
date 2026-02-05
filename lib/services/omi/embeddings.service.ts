/**
 * Embeddings Service for Omi Conversations
 *
 * Generates OpenAI embeddings for semantic search using text-embedding-3-small.
 * Ported from maity-mobile/api/services/embeddings.py
 */

import OpenAI from 'openai';

// ============================================================================
// CONSTANTS
// ============================================================================

const MODEL = 'text-embedding-3-small';
const DIMENSIONS = 1536;
const MIN_TEXT_LENGTH = 3;
const MAX_TEXT_LENGTH = 8000;

// ============================================================================
// TYPES
// ============================================================================

export type Embedding = number[];

// ============================================================================
// UTILITIES
// ============================================================================

function truncateText(text: string, maxLength: number = MAX_TEXT_LENGTH): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength);
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Generate a single embedding for text.
 * Returns null if text is too short or on error.
 */
export async function generateEmbedding(text: string): Promise<Embedding | null> {
  if (!text || text.length < MIN_TEXT_LENGTH) {
    console.log('[embeddings] Text too short, skipping embedding');
    return null;
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const truncated = truncateText(text);

    const response = await openai.embeddings.create({
      model: MODEL,
      input: truncated,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('[embeddings] Error generating embedding:', error);
    return null;
  }
}

/**
 * Generate embeddings for multiple texts in a single batch call.
 * Returns array of embeddings preserving original indices (null for failed texts).
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<(Embedding | null)[]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  // Filter and prepare texts
  const validTexts: { index: number; text: string }[] = [];
  const results: (Embedding | null)[] = new Array(texts.length).fill(null);

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    if (text && text.length >= MIN_TEXT_LENGTH) {
      validTexts.push({
        index: i,
        text: truncateText(text),
      });
    }
  }

  if (validTexts.length === 0) {
    console.log('[embeddings] No valid texts for batch embedding');
    return results;
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.embeddings.create({
      model: MODEL,
      input: validTexts.map((t) => t.text),
    });

    // Map embeddings back to original indices
    for (let i = 0; i < response.data.length; i++) {
      const originalIndex = validTexts[i].index;
      results[originalIndex] = response.data[i].embedding;
    }

    console.log(`[embeddings] Generated ${response.data.length} embeddings in batch`);
    return results;
  } catch (error) {
    console.error('[embeddings] Error generating batch embeddings:', error);
    return results;
  }
}

export { DIMENSIONS as EMBEDDING_DIMENSIONS };
