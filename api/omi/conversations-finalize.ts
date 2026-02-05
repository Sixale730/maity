/**
 * Finalize Conversation Endpoint
 *
 * Finalizes a draft conversation by:
 * 1. Building transcript from segments
 * 2. Generating title/overview/category (chunked if long)
 * 3. Generating embeddings
 * 4. Running communication analysis
 * 5. Extracting memories
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { ApiError, withErrorHandler, validateMethod } from '../../lib/types/api/errors.js';
import { getEnv } from '../../lib/types/api/common.js';
import {
  generateEmbedding,
  generateEmbeddingsBatch,
  analyzeCommunication,
  extractMemoriesFromTranscript,
  processLongTranscript,
  type TranscriptSegment,
} from '../../lib/services/omi/index.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const LONG_TRANSCRIPT_THRESHOLD = 6000; // chars
const MIN_WORDS_FOR_ANALYSIS = 5;
const MIN_DURATION_FOR_ANALYSIS = 10; // seconds
const MIN_CONTENT_FOR_MEMORIES = 50; // chars

// ============================================================================
// SCHEMAS
// ============================================================================

const finalizeSchema = z.object({
  conversation_id: z.string().uuid(),
  // Optional structured data (if provided by client)
  structured: z.object({
    title: z.string().optional(),
    overview: z.string().optional(),
    emoji: z.string().optional(),
    category: z.string().optional(),
    action_items: z.array(z.object({ description: z.string() })).optional(),
    events: z.array(z.any()).optional(),
  }).optional(),
  // Recording metadata
  duration_seconds: z.number().optional(),
});

// ============================================================================
// CORS HANDLER
// ============================================================================

function setCors(req: VercelRequest, res: VercelResponse): boolean {
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:8080'];
  const origin = req.headers.origin;

  if (origin && corsOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', corsOrigins[0]);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

// ============================================================================
// UTILITIES
// ============================================================================

function shouldAutoDiscard(wordsCount: number, durationSeconds: number, segmentCount: number): boolean {
  // Less than 5 words total
  if (wordsCount < 5) return true;

  // Less than 10 seconds AND less than 10 words
  if (durationSeconds < 10 && wordsCount < 10) return true;

  // Single segment with less than 3 words
  if (segmentCount === 1 && wordsCount < 3) return true;

  return false;
}

function buildTranscriptText(segments: Array<{ text: string; speaker?: string; is_user?: boolean }>): string {
  return segments
    .map((s) => {
      const speaker = s.speaker || (s.is_user ? 'Usuario' : 'Otro');
      return `${speaker}: ${s.text}`;
    })
    .join('\n');
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (setCors(req, res)) return;
  validateMethod(req.method, ['POST']);

  const startTime = Date.now();

  // Parse request
  let body;
  try {
    body = finalizeSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid request body', error.errors);
    }
    throw error;
  }

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or invalid authorization header');
  }
  const accessToken = authHeader.substring(7);

  // Initialize Supabase
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verify user
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  // Get maity user_id
  const { data: maityUser, error: userError } = await supabase
    .schema('maity')
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (userError || !maityUser) {
    throw ApiError.notFound('User');
  }

  // Verify conversation exists and belongs to user
  const { data: conversation, error: convError } = await supabase
    .schema('maity')
    .from('omi_conversations')
    .select('id, user_id')
    .eq('id', body.conversation_id)
    .single();

  if (convError || !conversation) {
    throw ApiError.notFound('Conversation');
  }

  if (conversation.user_id !== maityUser.id) {
    throw ApiError.forbidden('Conversation does not belong to user');
  }

  // Fetch all segments
  const { data: segments, error: segError } = await supabase
    .schema('maity')
    .from('omi_transcript_segments')
    .select('*')
    .eq('conversation_id', body.conversation_id)
    .order('segment_index', { ascending: true });

  if (segError) {
    throw ApiError.database('Failed to fetch segments', segError);
  }

  if (!segments || segments.length === 0) {
    throw ApiError.badRequest('No segments found for conversation');
  }

  // Build transcript text
  const transcriptText = buildTranscriptText(segments);
  const wordsCount = transcriptText.split(/\s+/).length;
  const durationSeconds = body.duration_seconds || 0;

  console.log('[conversations-finalize] Processing:', {
    conversationId: body.conversation_id,
    segments: segments.length,
    words: wordsCount,
    duration: durationSeconds,
    transcriptLength: transcriptText.length,
  });

  // Check auto-discard
  const discarded = shouldAutoDiscard(wordsCount, durationSeconds, segments.length);

  // Prepare structured data
  let structuredData = body.structured || null;

  // If no structured data and transcript is long, use chunked processing
  if (!structuredData && transcriptText.length > LONG_TRANSCRIPT_THRESHOLD) {
    console.log('[conversations-finalize] Using chunked processing for long transcript');
    const processed = await processLongTranscript(transcriptText);
    if (processed) {
      structuredData = {
        title: processed.title,
        overview: processed.overview,
        emoji: processed.emoji,
        category: processed.category,
        action_items: processed.action_items,
        events: processed.events,
      };
    }
  }

  // Generate embeddings
  let conversationEmbedding = null;
  let segmentEmbeddings: (number[] | null)[] = [];

  try {
    // Generate conversation embedding
    conversationEmbedding = await generateEmbedding(transcriptText);

    // Generate segment embeddings in batch
    const segmentTexts = segments.map((s) => s.text);
    segmentEmbeddings = await generateEmbeddingsBatch(segmentTexts);
  } catch (error) {
    console.error('[conversations-finalize] Error generating embeddings:', error);
    // Continue without embeddings
  }

  // Update conversation
  const updateData: Record<string, unknown> = {
    transcript_text: transcriptText,
    discarded,
    duration_seconds: durationSeconds,
    updated_at: new Date().toISOString(),
  };

  if (conversationEmbedding) {
    updateData.embedding = conversationEmbedding;
  }

  if (structuredData) {
    if (structuredData.title) updateData.title = structuredData.title;
    if (structuredData.overview) updateData.overview = structuredData.overview;
    if (structuredData.emoji) updateData.emoji = structuredData.emoji;
    if (structuredData.category) updateData.category = structuredData.category;
    if (structuredData.action_items) updateData.action_items = structuredData.action_items;
    if (structuredData.events) updateData.events = structuredData.events;
  }

  const { error: updateError } = await supabase
    .schema('maity')
    .from('omi_conversations')
    .update(updateData)
    .eq('id', body.conversation_id);

  if (updateError) {
    console.error('[conversations-finalize] Error updating conversation:', updateError);
    throw ApiError.database('Failed to update conversation', updateError);
  }

  // Update segment embeddings
  for (let i = 0; i < segments.length; i++) {
    if (segmentEmbeddings[i]) {
      await supabase
        .schema('maity')
        .from('omi_transcript_segments')
        .update({ embedding: segmentEmbeddings[i] })
        .eq('id', segments[i].id);
    }
  }

  // Run communication analysis (non-blocking)
  let communicationFeedback = null;
  if (!discarded) {
    try {
      const transcriptSegments: TranscriptSegment[] = segments.map((s) => ({
        text: s.text,
        speaker: s.speaker,
        is_user: s.is_user,
        start: s.start_time,
        end: s.end_time,
      }));

      communicationFeedback = await analyzeCommunication(transcriptSegments);

      if (communicationFeedback) {
        await supabase
          .schema('maity')
          .from('omi_conversations')
          .update({ communication_feedback: communicationFeedback })
          .eq('id', body.conversation_id);
      }
    } catch (error) {
      console.error('[conversations-finalize] Error analyzing communication:', error);
      // Continue without analysis
    }
  }

  // Extract memories (non-blocking)
  if (!discarded && transcriptText.length >= MIN_CONTENT_FOR_MEMORIES) {
    try {
      const memories = await extractMemoriesFromTranscript(transcriptText, body.conversation_id);

      if (memories.length > 0) {
        const memoriesToInsert = memories.map((m) => ({
          user_id: maityUser.id,
          conversation_id: body.conversation_id,
          content: m.content,
          category: m.category,
          manually_added: false,
          reviewed: false,
          deleted: false,
        }));

        await supabase
          .schema('maity')
          .from('omi_memories')
          .insert(memoriesToInsert);

        console.log('[conversations-finalize] Extracted memories:', memories.length);
      }
    } catch (error) {
      console.error('[conversations-finalize] Error extracting memories:', error);
      // Continue without memories
    }
  }

  const duration = Date.now() - startTime;

  console.log('[conversations-finalize] Completed:', {
    conversationId: body.conversation_id,
    duration_ms: duration,
    discarded,
    hasEmbedding: !!conversationEmbedding,
    hasAnalysis: !!communicationFeedback,
  });

  return res.status(200).json({
    ok: true,
    conversation_id: body.conversation_id,
    discarded,
    words_count: wordsCount,
    duration_seconds: durationSeconds,
    segments_count: segments.length,
    embedding_generated: !!conversationEmbedding,
    analysis_generated: !!communicationFeedback,
    processing_time_ms: duration,
  });
}

export default withErrorHandler(handler);
