// api/tally-webhook.js
import { createClient } from '@supabase/supabase-js';

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const WEBHOOK_SECRET = process.env.TALLY_WEBHOOK_SECRET || '';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('METHOD_NOT_ALLOWED');

  try {
    const secret = req.query?.secret;
    if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Tally suele mandar hidden fields en data.hidden o data.hiddenFields
    const hidden = body?.data?.hidden || body?.data?.hiddenFields || {};
    const authId = hidden.auth_id || hidden.user_id || null;
    const otk = hidden.otk || hidden.token || null;

    if (!authId || !otk) {
      return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    // Verificar token válido
    const { data: u, error: uErr } = await admin
      .schema('maity')
      .from('users')
      .select('id, registration_form_completed, onboarding_token, onboarding_token_expires_at')
      .eq('auth_id', authId)
      .eq('onboarding_token', otk)
      .maybeSingle();

    if (uErr || !u) return res.status(400).json({ error: 'INVALID_TOKEN' });

    const exp = u.onboarding_token_expires_at ? new Date(u.onboarding_token_expires_at).getTime() : 0;
    if (exp && exp < Date.now()) return res.status(400).json({ error: 'TOKEN_EXPIRED' });

    // Marcar completado
    const { error: updErr } = await admin
      .schema('maity')
      .from('users')
      .update({
        registration_form_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        onboarding_token: null,
        onboarding_token_expires_at: null,
      })
      .eq('id', u.id);

    if (updErr) return res.status(500).json({ error: 'UPDATE_FAILED' });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('tally-webhook err', e);
    return res.status(500).json({ error: 'INTERNAL' });
  }
}
