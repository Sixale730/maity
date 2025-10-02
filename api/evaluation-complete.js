import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const N8N_SECRET = process.env.N8N_BACKEND_SECRET;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);

// Initialize Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

/**
 * POST /api/evaluation-complete
 *
 * Called by n8n to update evaluation results after processing transcript.
 * Validates secret header and enforces idempotent updates.
 *
 * Example curl:
 * ```bash
 * curl -X POST https://api.maity.com.mx/api/evaluation-complete \
 *   -H "Content-Type: application/json" \
 *   -H "X-N8N-Secret: your-secret-here" \
 *   -d '{
 *     "request_id": "abc-123-def-456",
 *     "status": "complete",
 *     "result": {
 *       "score": 85,
 *       "feedback": "Great communication skills"
 *     }
 *   }'
 * ```
 */
export default async function handler(req, res) {
  const startTime = Date.now();
  console.log('[evaluations/complete] 🚀 Request received', {
    method: req.method,
    url: req.url,
    headers: {
      origin: req.headers.origin,
      'content-type': req.headers['content-type'],
      'x-n8n-secret': req.headers['x-n8n-secret'] ? '***PRESENT***' : '***MISSING***'
    }
  });

  // CORS headers
  const origin = req.headers.origin || req.headers.referer || '';
  const allowed = CORS_ORIGINS.some(o => origin.includes(o));
  console.log('[evaluations/complete] 🌐 CORS check', { origin, allowed, configuredOrigins: CORS_ORIGINS });

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-N8N-Secret');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    console.log('[evaluations/complete] ✅ OPTIONS preflight handled');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.error('[evaluations/complete] ❌ Invalid method:', req.method);
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  // Validate environment
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error('[evaluations/complete] ❌ Missing Supabase configuration', {
      hasUrl: !!SUPABASE_URL,
      hasServiceRole: !!SERVICE_ROLE
    });
    return res.status(500).json({ error: 'SERVER_CONFIGURATION_ERROR' });
  }

  if (!N8N_SECRET) {
    console.error('[evaluations/complete] ❌ Missing N8N_BACKEND_SECRET');
    return res.status(500).json({ error: 'SERVER_CONFIGURATION_ERROR' });
  }

  console.log('[evaluations/complete] ✅ Environment validated');

  // Validate secret header
  const providedSecret = req.headers['x-n8n-secret'];
  if (!providedSecret || providedSecret !== N8N_SECRET) {
    console.error('[evaluations/complete] ❌ Invalid secret', {
      provided: providedSecret ? 'PRESENT' : 'MISSING',
      matches: providedSecret === N8N_SECRET
    });
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }

  console.log('[evaluations/complete] ✅ Secret validated');

  // Parse body - request_id now comes in the body
  const { request_id, status, result, error_message } = req.body || {};

  if (!request_id) {
    console.error('[evaluations/complete] ❌ Missing request_id in body');
    return res.status(400).json({ error: 'MISSING_REQUEST_ID', message: 'request_id must be provided in the request body' });
  }

  console.log('[evaluations/complete] 📝 Request ID:', request_id);
  console.log('[evaluations/complete] 📦 Payload received', {
    status,
    hasResult: !!result,
    resultKeys: result ? Object.keys(result) : [],
    hasErrorMessage: !!error_message,
    bodySize: JSON.stringify(req.body).length
  });

  // Validate status
  const validStatuses = ['complete', 'error'];
  if (!status || !validStatuses.includes(status)) {
    console.error('[evaluations/complete] ❌ Invalid status', { status, validStatuses });
    return res.status(400).json({ error: 'INVALID_STATUS', valid: validStatuses });
  }

  // Validate result for complete status
  if (status === 'complete' && !result) {
    console.error('[evaluations/complete] ❌ Missing result for complete status');
    return res.status(400).json({ error: 'MISSING_RESULT' });
  }

  console.log('[evaluations/complete] ✅ Payload validated');

  try {
    // Fetch current evaluation row from maity schema
    console.log('[evaluations/complete] 🔍 Fetching evaluation from database...', { request_id });
    const { data: evaluation, error: fetchError } = await supabase
      .schema('maity')
      .from('evaluations')
      .select('request_id, status, user_id, session_id')
      .eq('request_id', request_id)
      .maybeSingle();

    if (fetchError) {
      console.error('[evaluations/complete] ❌ Database fetch error:', fetchError);
      return res.status(500).json({ error: 'DATABASE_ERROR', details: fetchError.message });
    }

    if (!evaluation) {
      console.error('[evaluations/complete] ❌ Evaluation not found', { request_id });
      return res.status(404).json({ error: 'EVALUATION_NOT_FOUND' });
    }

    console.log('[evaluations/complete] ✅ Evaluation found', {
      request_id: evaluation.request_id,
      currentStatus: evaluation.status,
      user_id: evaluation.user_id,
      session_id: evaluation.session_id || 'none'
    });

    // Idempotency check: only allow updates from pending or processing
    const allowedCurrentStatuses = ['pending', 'processing'];
    if (!allowedCurrentStatuses.includes(evaluation.status)) {
      console.warn(`[evaluations/complete] ⚠️ Attempted to update already finalized evaluation`, {
        request_id,
        currentStatus: evaluation.status,
        newStatus: status
      });
      return res.status(409).json({
        error: 'ALREADY_FINALIZED',
        current_status: evaluation.status
      });
    }

    console.log('[evaluations/complete] ✅ Idempotency check passed, updating...');

    // Update evaluation
    const updatePayload = {
      status,
      result: status === 'complete' ? result : null,
      error_message: status === 'error' ? error_message : null,
      updated_at: new Date().toISOString()
    };

    console.log('[evaluations/complete] 💾 Update payload prepared', {
      status: updatePayload.status,
      hasResult: !!updatePayload.result,
      hasErrorMessage: !!updatePayload.error_message
    });

    const { data: updated, error: updateError } = await supabase
      .schema('maity')
      .from('evaluations')
      .update(updatePayload)
      .eq('request_id', request_id)
      .select()
      .single();

    if (updateError) {
      console.error('[evaluations/complete] ❌ Database update error:', updateError);
      return res.status(500).json({ error: 'DATABASE_UPDATE_ERROR', details: updateError.message });
    }

    console.log(`[evaluations/complete] ✅ Evaluation updated successfully`);

    // Update associated voice_session if it exists
    if (evaluation.session_id && status === 'complete') {
      console.log('[evaluations/complete] 🔄 Updating associated voice_session:', evaluation.session_id);

      const { error: sessionUpdateError } = await supabase
        .schema('maity')
        .from('voice_sessions')
        .update({
          score: result.score || 0,
          processed_feedback: result,
          status: 'completed',
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', evaluation.session_id);

      if (sessionUpdateError) {
        console.error('[evaluations/complete] ⚠️ Failed to update voice_session:', sessionUpdateError);
        // No retornamos error aquí porque la evaluación ya se actualizó correctamente
      } else {
        console.log('[evaluations/complete] ✅ Voice session updated successfully');
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[evaluations/complete] ✅ Process completed`, {
      request_id: updated.request_id,
      status: updated.status,
      updated_at: updated.updated_at,
      session_updated: !!evaluation.session_id,
      durationMs: duration
    });

    return res.status(200).json({
      ok: true,
      evaluation: {
        request_id: updated.request_id,
        status: updated.status,
        updated_at: updated.updated_at
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[evaluations/complete] ❌ Internal error:', {
      error: error.message,
      stack: error.stack,
      durationMs: duration
    });
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
  }
}