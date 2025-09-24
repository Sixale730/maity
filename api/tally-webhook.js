// api/tally-webhook.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const WEBHOOK_SECRET = process.env.TALLY_WEBHOOK_SECRET || 'f88c5139-5bc6-42e7-aee2-4fab8ead044b';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    // Verify webhook secret
    const secret = req.query?.secret;
    if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
      console.log('[tally-webhook] Invalid secret:', secret);
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log('[tally-webhook] Received webhook:', {
      eventId: body?.eventId,
      eventType: body?.eventType,
      createdAt: body?.createdAt
    });

    // Extract hidden fields from Tally webhook
    // Tally sends them in data.fields array or data.hidden
    const fields = body?.data?.fields || [];
    const hiddenData = body?.data?.hidden || {};

    // Try to get values from fields array first
    let authId = null;
    let otk = null;

    // Check fields array
    for (const field of fields) {
      if (field.key === 'auth_id' || field.label === 'auth_id') {
        authId = field.value;
      }
      if (field.key === 'otk' || field.label === 'otk') {
        otk = field.value;
      }
    }

    // Fallback to hidden data
    authId = authId || hiddenData.auth_id || hiddenData.user_id;
    otk = otk || hiddenData.otk || hiddenData.token;

    console.log('[tally-webhook] Extracted data:', { authId, hasOtk: !!otk });

    if (!authId || !otk) {
      console.error('[tally-webhook] Missing required fields');
      return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    // Verify token is valid
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, registration_form_completed, onboarding_token, onboarding_token_expires_at')
      .eq('auth_id', authId)
      .eq('onboarding_token', otk)
      .single();

    if (userError || !userData) {
      console.error('[tally-webhook] Invalid token or user not found:', userError);
      return res.status(400).json({ error: 'INVALID_TOKEN' });
    }

    // Check if token is expired
    if (userData.onboarding_token_expires_at) {
      const expiresAt = new Date(userData.onboarding_token_expires_at).getTime();
      if (expiresAt < Date.now()) {
        console.error('[tally-webhook] Token expired');
        return res.status(400).json({ error: 'TOKEN_EXPIRED' });
      }
    }

    // Mark registration as completed
    const { error: updateError } = await supabase
      .from('users')
      .update({
        registration_form_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        onboarding_token: null,
        onboarding_token_expires_at: null
      })
      .eq('id', userData.id);

    if (updateError) {
      console.error('[tally-webhook] Update failed:', updateError);
      return res.status(500).json({ error: 'UPDATE_FAILED' });
    }

    console.log('[tally-webhook] Successfully marked registration as completed for user:', userData.id);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('[tally-webhook] Error:', error);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
}
