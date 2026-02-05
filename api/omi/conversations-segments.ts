/**
 * Append Segments to Conversation Endpoint
 *
 * Appends transcript segments to an existing draft conversation.
 * Called periodically during recording (e.g., every 10 segments).
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { ApiError, withErrorHandler, validateMethod } from '../../lib/types/api/errors.js';
import { getEnv } from '../../lib/types/api/common.js';

// ============================================================================
// SCHEMAS
// ============================================================================

const segmentSchema = z.object({
  text: z.string(),
  speaker: z.string().optional(),
  speaker_id: z.number().optional(),
  is_user: z.boolean().default(true),
  start_time: z.number().optional(), // seconds from start
  end_time: z.number().optional(),
});

const appendSegmentsSchema = z.object({
  conversation_id: z.string().uuid(),
  segments: z.array(segmentSchema).min(1),
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
// MAIN HANDLER
// ============================================================================

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (setCors(req, res)) return;
  validateMethod(req.method, ['POST']);

  // Parse request
  let body;
  try {
    body = appendSegmentsSchema.parse(req.body);
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

  // Get current segment count for ordering
  const { count: existingCount } = await supabase
    .schema('maity')
    .from('omi_transcript_segments')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', body.conversation_id);

  const startIndex = existingCount || 0;

  // Insert segments with ON CONFLICT DO NOTHING for idempotency
  const segmentsToInsert = body.segments.map((seg, i) => ({
    conversation_id: body.conversation_id,
    text: seg.text,
    speaker: seg.speaker || (seg.is_user ? 'Usuario' : 'Otro'),
    speaker_id: seg.speaker_id,
    is_user: seg.is_user,
    start_time: seg.start_time,
    end_time: seg.end_time,
    segment_index: startIndex + i,
  }));

  const { error: insertError } = await supabase
    .schema('maity')
    .from('omi_transcript_segments')
    .insert(segmentsToInsert);

  if (insertError) {
    console.error('[conversations-segments] Error inserting segments:', insertError);
    throw ApiError.database('Failed to insert segments', insertError);
  }

  console.log('[conversations-segments] Appended segments:', {
    conversationId: body.conversation_id,
    segmentsAdded: body.segments.length,
    totalSegments: startIndex + body.segments.length,
  });

  res.status(200).json({
    ok: true,
    segments_added: body.segments.length,
    total_segments: startIndex + body.segments.length,
  });
}

export default withErrorHandler(handler);
