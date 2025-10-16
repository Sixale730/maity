/**
 * Complete Short Evaluation Endpoint
 *
 * Completes evaluations for sessions with too few user messages.
 * Called directly from the frontend when a session has less than
 * the minimum required interactions.
 *
 * Security: Validates user authentication and ownership of the evaluation.
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { ApiError, withErrorHandler, validateMethod } from './types/errors.js';
import { getEnv } from './types/common.js';
import { completeShortEvaluationRequestSchema } from './types/schemas.js';

/**
 * Custom CORS handler for this endpoint
 */
function setCorsForShortEval(req: VercelRequest, res: VercelResponse): boolean {
  const corsOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const origin = req.headers.origin || req.headers.referer || '';
  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
  const allowed = isLocalhost || corsOrigins.some((o) => origin.includes(o));

  console.log('[complete-short-evaluation] 🌐 CORS check', {
    origin,
    allowed,
    isLocalhost,
    configuredOrigins: corsOrigins,
  });

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    console.log('[complete-short-evaluation] ✅ OPTIONS preflight handled');
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Handler for completing short evaluations
 */
async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const startTime = Date.now();
  console.log('[complete-short-evaluation] 🚀 Request received', {
    method: req.method,
    url: req.url,
    headers: {
      origin: req.headers.origin,
      'content-type': req.headers['content-type'],
      authorization: req.headers.authorization ? '***PRESENT***' : '***MISSING***',
    },
  });

  // Handle CORS
  if (setCorsForShortEval(req, res)) return;

  // Validate method
  validateMethod(req.method, ['POST']);

  // Get environment variables
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  console.log('[complete-short-evaluation] ✅ Environment validated');

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Extract and validate Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[complete-short-evaluation] ❌ Missing or invalid authorization header');
    throw ApiError.unauthorized('Authorization header required');
  }

  const token = authHeader.replace('Bearer ', '');

  // Verify user authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    console.error('[complete-short-evaluation] ❌ Authentication failed:', authError);
    throw ApiError.unauthorized('Invalid or expired token');
  }

  console.log('[complete-short-evaluation] ✅ User authenticated:', {
    userId: user.id,
    email: user.email,
  });

  // Parse and validate request body
  const body = completeShortEvaluationRequestSchema.parse(req.body);
  const { request_id } = body;
  const user_message_count = (req.body as any).user_message_count;

  if (user_message_count === undefined || user_message_count === null) {
    throw ApiError.invalidRequest('user_message_count must be provided');
  }

  console.log('[complete-short-evaluation] 📝 Request details:', {
    request_id,
    user_message_count,
    authenticated_user: user.id,
  });

  try {
    // Fetch evaluation from database
    console.log('[complete-short-evaluation] 🔍 Fetching evaluation from database...');
    const { data: evaluation, error: fetchError } = await supabase
      .schema('maity')
      .from('evaluations')
      .select('request_id, status, user_id, session_id')
      .eq('request_id', request_id)
      .maybeSingle();

    if (fetchError) {
      console.error('[complete-short-evaluation] ❌ Database fetch error:', fetchError);
      throw ApiError.database('Failed to fetch evaluation', fetchError);
    }

    if (!evaluation) {
      console.error('[complete-short-evaluation] ❌ Evaluation not found', { request_id });
      throw ApiError.notFound('Evaluation');
    }

    console.log('[complete-short-evaluation] ✅ Evaluation found', {
      request_id: evaluation.request_id,
      currentStatus: evaluation.status,
      evaluation_user_id: evaluation.user_id,
      session_id: evaluation.session_id || 'none',
    });

    // Verify that the evaluation belongs to the authenticated user
    const { data: maityUser, error: userError } = await supabase
      .schema('maity')
      .from('users')
      .select('id, auth_id')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (userError || !maityUser) {
      console.error('[complete-short-evaluation] ❌ Could not find maity user:', userError);
      throw ApiError.invalidRequest('User not found in maity schema');
    }

    if (evaluation.user_id !== maityUser.id) {
      console.error('[complete-short-evaluation] ❌ User does not own this evaluation', {
        evaluation_user_id: evaluation.user_id,
        authenticated_maity_user_id: maityUser.id,
      });
      throw ApiError.unauthorized('You do not own this evaluation');
    }

    console.log('[complete-short-evaluation] ✅ User ownership verified');

    // Idempotency check: only allow updates from pending or processing
    const allowedCurrentStatuses = ['pending', 'processing'];
    if (!allowedCurrentStatuses.includes(evaluation.status)) {
      console.warn(
        '[complete-short-evaluation] ⚠️ Attempted to update already finalized evaluation',
        {
          request_id,
          currentStatus: evaluation.status,
        }
      );
      res.status(409).json({
        error: 'ALREADY_FINALIZED',
        current_status: evaluation.status,
      });
      return;
    }

    console.log('[complete-short-evaluation] ✅ Idempotency check passed, updating...');

    // Update evaluation with short session result
    const updatePayload = {
      status: 'complete' as const,
      result: {
        score: 0,
        feedback:
          'La interacción fue muy breve y limitada a un saludo inicial. No hay suficiente contenido para evaluar técnicas de ventas ni conocimiento del producto.',
        metadata: {
          user_message_count,
          skipped_n8n: true,
          reason: 'insufficient_user_messages',
        },
      },
      updated_at: new Date().toISOString(),
    };

    console.log('[complete-short-evaluation] 💾 Update payload prepared', {
      status: updatePayload.status,
      score: updatePayload.result.score,
      user_message_count,
    });

    const { data: updated, error: updateError } = await supabase
      .schema('maity')
      .from('evaluations')
      .update(updatePayload)
      .eq('request_id', request_id)
      .select()
      .single();

    if (updateError) {
      console.error('[complete-short-evaluation] ❌ Database update error:', updateError);
      throw ApiError.database('Failed to update evaluation', updateError);
    }

    console.log('[complete-short-evaluation] ✅ Evaluation updated successfully');

    // Update associated voice_session if it exists
    if (evaluation.session_id) {
      console.log(
        '[complete-short-evaluation] 🔄 Updating associated voice_session:',
        evaluation.session_id
      );

      const { error: sessionUpdateError } = await supabase
        .schema('maity')
        .from('voice_sessions')
        .update({
          score: 0, // Short sessions always get 0
          passed: false, // Short sessions always fail
          processed_feedback: updatePayload.result,
          status: 'completed',
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', evaluation.session_id);

      if (sessionUpdateError) {
        console.error(
          '[complete-short-evaluation] ⚠️ Failed to update voice_session:',
          sessionUpdateError
        );
        // Don't return error here because the evaluation was already updated correctly
      } else {
        console.log(
          '[complete-short-evaluation] ✅ Voice session updated successfully (passed: false)'
        );
      }
    }

    const duration = Date.now() - startTime;
    console.log('[complete-short-evaluation] ✅ Process completed', {
      request_id: updated.request_id,
      status: updated.status,
      updated_at: updated.updated_at,
      session_updated: !!evaluation.session_id,
      durationMs: duration,
    });

    res.status(200).json({
      ok: true,
      evaluation: {
        request_id: updated.request_id,
        status: updated.status,
        result: updated.result,
        updated_at: updated.updated_at,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const err = error as Error;
    const duration = Date.now() - startTime;
    console.error('[complete-short-evaluation] ❌ Internal error:', {
      error: err.message,
      stack: err.stack,
      durationMs: duration,
    });
    throw ApiError.internal('Failed to complete short evaluation', { message: err.message });
  }
}

export default withErrorHandler(handler);
