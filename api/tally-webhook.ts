/**
 * Tally Webhook Endpoint
 *
 * Receives form submissions from Tally with HMAC signature verification.
 * Processes user registration completion and validates one-time keys (OTK).
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { ApiError, withErrorHandler, validateMethod } from '../lib/types/api/errors';
import { getEnv } from '../lib/types/api/common';

/**
 * Read raw request body (needed for HMAC verification)
 */
function readRaw(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

/**
 * Handler for Tally webhook
 */
async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Validate method
  validateMethod(req.method, ['POST']);

  // Get environment variables
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  const webhookSecret = getEnv('TALLY_WEBHOOK_SECRET');

  // Create Supabase admin client
  const supa = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1) Read raw body and verify HMAC signature
    const raw = await readRaw(req);
    const sig =
      (req.headers['tally-signature'] || req.headers['x-tally-signature'] || '').toString();
    const expected = crypto.createHmac('sha256', webhookSecret).update(raw).digest('hex');

    if (!sig || sig !== expected) {
      console.error('[tally-webhook] INVALID_SIGNATURE');
      throw ApiError.invalidSignature();
    }

    // 2) Parse payload
    const body = JSON.parse(raw) as Record<string, any>;
    const eventId = body?.eventId || body?.event_id || null;
    const formId = body?.formId || body?.form_id || null;
    const data = body?.data || body;
    const responseId = data?.responseId || data?.response_id || null;

    // Debug logs for complete payload
    console.log('[tally-webhook] Received payload:', {
      eventId,
      formId,
      responseId,
      dataKeys: Object.keys(data || {}),
      bodyKeys: Object.keys(body || {}),
      rawData: data,
    });

    const hidden = data?.hidden || data?.hiddenFields || {};

    // Multiple fallbacks for different field formats
    const authId =
      hidden.auth_id ||
      hidden.user_id ||
      data.auth_id ||
      data.user_id ||
      data['hidden[auth_id]'] ||
      data['hidden[user_id]'] ||
      null;

    const otk =
      hidden.otk ||
      hidden.token ||
      data.otk ||
      data.token ||
      data['hidden[otk]'] ||
      data['hidden[token]'] ||
      null;

    const email =
      hidden.email ||
      data.email ||
      data['hidden[email]'] ||
      null;

    console.log('[tally-webhook] Extracted fields:', {
      authId,
      otk,
      email,
      hiddenKeys: Object.keys(hidden || {}),
      hiddenData: hidden,
      allDataKeys: Object.keys(data || {}),
      searchedPaths: {
        'hidden.auth_id': hidden.auth_id,
        'data.auth_id': data.auth_id,
        "data['hidden[auth_id]']": data['hidden[auth_id]'],
        'hidden.otk': hidden.otk,
        'data.otk': data.otk,
        "data['hidden[otk]']": data['hidden[otk]'],
      },
    });

    // 3) Save EVENT (idempotent)
    const ip =
      (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || null;
    const ua = (req.headers['user-agent'] || '').toString();

    const { error: evtErr } = await supa
      .schema('maity')
      .from('tally_events')
      .upsert(
        {
          event_id: eventId,
          form_id: formId,
          signature: sig,
          ip,
          user_agent: ua,
          payload: body,
        },
        { onConflict: 'event_id' }
      );

    if (evtErr) {
      console.error('[tally-webhook] SAVE_EVENT_FAILED', evtErr);
      throw ApiError.database('Failed to save event', evtErr);
    }

    // 4) Minimum validations
    if (!authId || !otk) {
      console.error('[tally-webhook] MISSING_HIDDEN_FIELDS', {
        authId,
        otk,
        hidden,
        dataKeys: Object.keys(data || {}),
        fullPayload: body,
      });
      throw ApiError.invalidRequest('Missing required hidden fields (auth_id or otk)');
    }

    // 5) Validate active OTK
    const { data: user, error: uErr } = await supa
      .schema('maity')
      .from('users')
      .select('id, onboarding_token, onboarding_token_expires_at')
      .eq('auth_id', authId)
      .eq('onboarding_token', otk)
      .maybeSingle();

    if (uErr || !user) {
      throw ApiError.invalidRequest('Invalid token');
    }

    const exp = user.onboarding_token_expires_at
      ? new Date(user.onboarding_token_expires_at).getTime()
      : 0;
    if (exp && exp < Date.now()) {
      throw ApiError.expired('Token');
    }

    // 6) Save SUBMISSION (idempotent by responseId)
    const { data: sub, error: subErr } = await supa
      .schema('maity')
      .from('tally_submissions')
      .upsert(
        {
          user_id: user.id,
          submission_data: data,
          tally_response_id: responseId,
          event_id: eventId,
        },
        { onConflict: 'tally_response_id' }
      )
      .select('id')
      .maybeSingle();

    if (subErr) {
      console.error('[tally-webhook] SUBMISSION_SAVE_FAILED', subErr);
      throw ApiError.database('Failed to save submission', subErr);
    }

    // 7) Link event → submission (optional)
    if (eventId && sub?.id) {
      await supa
        .schema('maity')
        .from('tally_events')
        .update({ submission_id: sub.id })
        .eq('event_id', eventId);
    }

    // 8) Mark user and revoke OTK
    const { error: updErr } = await supa
      .schema('maity')
      .from('users')
      .update({
        registration_form_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        onboarding_token: null,
        onboarding_token_expires_at: null,
      })
      .eq('id', user.id);

    if (updErr) {
      console.error('[tally-webhook] USER_UPDATE_FAILED', updErr);
      throw ApiError.database('Failed to update user', updErr);
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('[tally-webhook] INTERNAL', error);
    throw ApiError.internal('Webhook processing failed');
  }
}

export default withErrorHandler(handler);
