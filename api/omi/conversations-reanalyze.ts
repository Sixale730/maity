/**
 * Reanalyze Conversation Endpoint (Admin Only)
 *
 * Re-runs communication analysis on an existing conversation.
 * Useful for testing prompt changes without creating new recordings.
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { ApiError, withErrorHandler, validateMethod } from '../../lib/types/api/errors.js';
import { getEnv } from '../../lib/types/api/common.js';
import {
  analyzeCommunication,
  generateSimpleStructured,
  processLongTranscript,
  type TranscriptSegment,
} from '../../lib/services/omi/index.js';

// ============================================================================
// SCHEMAS
// ============================================================================

const reanalyzeSchema = z.object({
  conversation_id: z.string().uuid(),
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

  const startTime = Date.now();

  // Parse request
  let body;
  try {
    body = reanalyzeSchema.parse(req.body);
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

  // Get maity user and check admin role
  const { data: maityUser, error: userError } = await supabase
    .schema('maity')
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (userError || !maityUser) {
    throw ApiError.notFound('User');
  }

  // Check if user is admin
  const { data: adminRole, error: roleError } = await supabase
    .schema('maity')
    .from('user_roles')
    .select('role')
    .eq('user_id', maityUser.id)
    .eq('role', 'admin')
    .single();

  if (roleError || !adminRole) {
    throw ApiError.forbidden('Only admins can reanalyze conversations');
  }

  // Get conversation
  const { data: conversation, error: convError } = await supabase
    .schema('maity')
    .from('omi_conversations')
    .select('id, transcript_text')
    .eq('id', body.conversation_id)
    .single();

  if (convError || !conversation) {
    throw ApiError.notFound('Conversation');
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

  // Build transcript text from segments
  const transcriptText = segments.map((s) => s.text).join(' ');
  const wordsCount = transcriptText.split(/\s+/).filter(Boolean).length;

  console.log('[conversations-reanalyze] Processing:', {
    conversationId: body.conversation_id,
    segments: segments.length,
    wordsCount,
    adminUserId: maityUser.id,
  });

  // Run communication analysis
  const transcriptSegments: TranscriptSegment[] = segments.map((s) => ({
    text: s.text,
    speaker: s.speaker,
    is_user: s.is_user,
    start: s.start_time,
    end: s.end_time,
  }));

  // Run both analyses in parallel
  const [communicationFeedback, structuredData] = await Promise.all([
    analyzeCommunication(transcriptSegments),
    // Use processLongTranscript for longer texts, generateSimpleStructured for shorter
    transcriptText.length > 5000
      ? processLongTranscript(transcriptText)
      : generateSimpleStructured(transcriptText),
  ]);

  if (!communicationFeedback) {
    throw ApiError.internal('Failed to generate analysis');
  }

  // Build update payload with all regenerated fields
  const updatePayload: Record<string, unknown> = {
    communication_feedback: communicationFeedback,
    words_count: wordsCount,
    updated_at: new Date().toISOString(),
  };

  // Add structured data if available
  if (structuredData) {
    updatePayload.title = structuredData.title;
    updatePayload.overview = structuredData.overview;
    updatePayload.emoji = structuredData.emoji;
    updatePayload.category = structuredData.category;
  }

  console.log('[conversations-reanalyze] Updating with:', {
    hasStructuredData: !!structuredData,
    title: structuredData?.title,
    wordsCount,
  });

  // Update conversation with new analysis
  const { error: updateError } = await supabase
    .schema('maity')
    .from('omi_conversations')
    .update(updatePayload)
    .eq('id', body.conversation_id);

  if (updateError) {
    console.error('[conversations-reanalyze] Error updating conversation:', updateError);
    throw ApiError.database('Failed to update conversation', updateError);
  }

  const duration = Date.now() - startTime;

  console.log('[conversations-reanalyze] Completed:', {
    conversationId: body.conversation_id,
    duration_ms: duration,
  });

  return res.status(200).json({
    ok: true,
    conversation_id: body.conversation_id,
    processing_time_ms: duration,
    communication_feedback: communicationFeedback,
  });
}

export default withErrorHandler(handler);
