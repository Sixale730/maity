import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);

// Initialize Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

/**
 * POST /api/complete-short-evaluation
 *
 * Completes an evaluation for sessions with too few user messages.
 * This endpoint is called directly from the frontend when a session
 * has less than the minimum required interactions.
 *
 * Security: Validates user authentication and ownership of the evaluation.
 *
 * Example:
 * ```bash
 * curl -X POST https://api.maity.com.mx/api/complete-short-evaluation \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer <user-token>" \
 *   -d '{
 *     "request_id": "abc-123-def-456",
 *     "user_message_count": 3
 *   }'
 * ```
 */
export default async function handler(req, res) {
  const startTime = Date.now();
  console.log('[complete-short-evaluation] 🚀 Request received', {
    method: req.method,
    url: req.url,
    headers: {
      origin: req.headers.origin,
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? '***PRESENT***' : '***MISSING***'
    }
  });

  // CORS headers
  const origin = req.headers.origin || req.headers.referer || '';
  const allowed = CORS_ORIGINS.some(o => origin.includes(o));
  console.log('[complete-short-evaluation] 🌐 CORS check', { origin, allowed, configuredOrigins: CORS_ORIGINS });

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    console.log('[complete-short-evaluation] ✅ OPTIONS preflight handled');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.error('[complete-short-evaluation] ❌ Invalid method:', req.method);
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  // Validate environment
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error('[complete-short-evaluation] ❌ Missing Supabase configuration', {
      hasUrl: !!SUPABASE_URL,
      hasServiceRole: !!SERVICE_ROLE
    });
    return res.status(500).json({ error: 'SERVER_CONFIGURATION_ERROR' });
  }

  console.log('[complete-short-evaluation] ✅ Environment validated');

  // Extract and validate Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[complete-short-evaluation] ❌ Missing or invalid authorization header');
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authorization header required' });
  }

  const token = authHeader.replace('Bearer ', '');

  // Verify user authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    console.error('[complete-short-evaluation] ❌ Authentication failed:', authError);
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }

  console.log('[complete-short-evaluation] ✅ User authenticated:', {
    userId: user.id,
    email: user.email
  });

  // Parse body
  const { request_id, user_message_count } = req.body || {};

  if (!request_id) {
    console.error('[complete-short-evaluation] ❌ Missing request_id in body');
    return res.status(400).json({ error: 'MISSING_REQUEST_ID', message: 'request_id must be provided in the request body' });
  }

  if (user_message_count === undefined || user_message_count === null) {
    console.error('[complete-short-evaluation] ❌ Missing user_message_count in body');
    return res.status(400).json({ error: 'MISSING_USER_MESSAGE_COUNT', message: 'user_message_count must be provided' });
  }

  console.log('[complete-short-evaluation] 📝 Request details:', {
    request_id,
    user_message_count,
    authenticated_user: user.id
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
      return res.status(500).json({ error: 'DATABASE_ERROR', details: fetchError.message });
    }

    if (!evaluation) {
      console.error('[complete-short-evaluation] ❌ Evaluation not found', { request_id });
      return res.status(404).json({ error: 'EVALUATION_NOT_FOUND' });
    }

    console.log('[complete-short-evaluation] ✅ Evaluation found', {
      request_id: evaluation.request_id,
      currentStatus: evaluation.status,
      evaluation_user_id: evaluation.user_id,
      session_id: evaluation.session_id || 'none'
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
      return res.status(403).json({ error: 'FORBIDDEN', message: 'User not found in maity schema' });
    }

    if (evaluation.user_id !== maityUser.id) {
      console.error('[complete-short-evaluation] ❌ User does not own this evaluation', {
        evaluation_user_id: evaluation.user_id,
        authenticated_maity_user_id: maityUser.id
      });
      return res.status(403).json({ error: 'FORBIDDEN', message: 'You do not own this evaluation' });
    }

    console.log('[complete-short-evaluation] ✅ User ownership verified');

    // Idempotency check: only allow updates from pending or processing
    const allowedCurrentStatuses = ['pending', 'processing'];
    if (!allowedCurrentStatuses.includes(evaluation.status)) {
      console.warn('[complete-short-evaluation] ⚠️ Attempted to update already finalized evaluation', {
        request_id,
        currentStatus: evaluation.status
      });
      return res.status(409).json({
        error: 'ALREADY_FINALIZED',
        current_status: evaluation.status
      });
    }

    console.log('[complete-short-evaluation] ✅ Idempotency check passed, updating...');

    // Update evaluation with short session result
    const updatePayload = {
      status: 'complete',
      result: {
        score: 0,
        feedback: 'La interacción fue muy breve y limitada a un saludo inicial. No hay suficiente contenido para evaluar técnicas de ventas ni conocimiento del producto.',
        metadata: {
          user_message_count,
          skipped_n8n: true,
          reason: 'insufficient_user_messages'
        }
      },
      updated_at: new Date().toISOString()
    };

    console.log('[complete-short-evaluation] 💾 Update payload prepared', {
      status: updatePayload.status,
      score: updatePayload.result.score,
      user_message_count
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
      return res.status(500).json({ error: 'DATABASE_UPDATE_ERROR', details: updateError.message });
    }

    const duration = Date.now() - startTime;
    console.log('[complete-short-evaluation] ✅ Successfully updated evaluation', {
      request_id: updated.request_id,
      status: updated.status,
      updated_at: updated.updated_at,
      durationMs: duration
    });

    return res.status(200).json({
      ok: true,
      evaluation: {
        request_id: updated.request_id,
        status: updated.status,
        result: updated.result,
        updated_at: updated.updated_at
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[complete-short-evaluation] ❌ Internal error:', {
      error: error.message,
      stack: error.stack,
      durationMs: duration
    });
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
  }
}
