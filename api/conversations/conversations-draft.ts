/**
 * Create Draft Conversation Endpoint
 *
 * Creates a new draft conversation for the web recorder.
 * Segments will be appended incrementally during recording.
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { ApiError, withErrorHandler, validateMethod } from '../../lib/types/api/errors.js';
import { getEnv } from '../../lib/types/api/common.js';

// ============================================================================
// SCHEMAS
// ============================================================================

const createDraftSchema = z.object({
  // Optional metadata
  source: z.enum(['web_recorder', 'omi_device', 'mobile_app']).default('web_recorder'),
  language: z.string().default('es'),
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
  const body = createDraftSchema.parse(req.body || {});

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

  // Create draft conversation
  // Note: title and overview are NOT NULL with default '', so we omit them to use the DB default
  // emoji and category are nullable, so we omit them as well (will be null by default)
  const { data: conversation, error: insertError } = await supabase
    .schema('maity')
    .from('omi_conversations')
    .insert({
      user_id: maityUser.id,
      transcript_text: '',
      action_items: [],
      events: [],
      source: body.source,
      language: body.language,
      discarded: false,
      deleted: false,
      starred: false,
      structured_generated: false,
    })
    .select('id, created_at')
    .single();

  if (insertError) {
    console.error('[conversations-draft] Error creating draft:', insertError);
    throw ApiError.database('Failed to create draft conversation', insertError);
  }

  console.log('[conversations-draft] Created draft:', {
    conversationId: conversation.id,
    userId: maityUser.id,
  });

  res.status(201).json({
    ok: true,
    conversation_id: conversation.id,
    created_at: conversation.created_at,
  });
}

export default withErrorHandler(handler);
