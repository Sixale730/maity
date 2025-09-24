// /api/tally-webhook.js
import { createClient } from '@supabase/supabase-js';
import getRawBody from 'raw-body';
import crypto from 'crypto';

// ENVs necesarias
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_SECRET = process.env.TALLY_WEBHOOK_SECRET; // Signing secret de Tally

const supa = createClient(SUPABASE_URL, SERVICE_ROLE);

export default async function handler(req, res) {
  // Tally pega server→server; no necesitas CORS aquí
  if (req.method !== 'POST') return res.status(405).send('METHOD_NOT_ALLOWED');
  if (!WEBHOOK_SECRET) return res.status(500).json({ error: 'MISSING_WEBHOOK_SECRET' });

  try {
    // 1) Leer RAW body y verificar HMAC (Tally-Signature)
    const raw = (await getRawBody(req)).toString('utf8');
    const signature = req.headers['tally-signature'] || req.headers['x-tally-signature'];
    const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex');
    if (!signature || signature !== expected) {
      return res.status(401).json({ error: 'INVALID_SIGNATURE' });
    }

    // 2) Parsear payload
    const body = JSON.parse(raw);
    const eventId     = body?.eventId || body?.event_id || null;
    const formId      = body?.formId  || body?.form_id  || null;
    const data        = body?.data || body;
    const responseId  = data?.responseId || data?.response_id || null;

    // Hidden fields (los mandas en el Tally Link)
    const hidden = data?.hidden || data?.hiddenFields || {};
    const authId = hidden.auth_id || hidden.user_id || null;
    const otk    = hidden.otk || hidden.token || null;

    // 3) Guardar el EVENTO crudo (idempotente por event_id)
    const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || null;
    const ua = (req.headers['user-agent'] || '').toString();

    await supa
      .schema('maity')
      .from('tally_events')
      .upsert({
        event_id: eventId,
        form_id: formId,
        signature: signature.toString(),
        ip,
        user_agent: ua,
        payload: body,        // guardamos TODO el payload crudo
      }, { onConflict: 'event_id' });

    // 4) Validaciones mínimas
    if (!authId || !otk) return res.status(400).json({ error: 'MISSING_HIDDEN_FIELDS' });

    // 5) Validar OTK del usuario (y vigencia)
    const { data: u, error: uErr } = await supa
      .schema('maity')
      .from('users')
      .select('id, onboarding_token, onboarding_token_expires_at, registration_form_completed')
      .eq('auth_id', authId)
      .eq('onboarding_token', otk)
      .maybeSingle();

    if (uErr || !u) return res.status(400).json({ error: 'INVALID_TOKEN' });

    const exp = u.onboarding_token_expires_at ? new Date(u.onboarding_token_expires_at).getTime() : 0;
    if (exp && exp < Date.now()) return res.status(400).json({ error: 'TOKEN_EXPIRED' });

    // 6) Guardar SUBMISSION (idempotente por responseId)
    const { data: sub, error: subErr } = await supa
      .schema('maity')
      .from('tally_submissions')
      .upsert({
        user_id: u.id,
        submission_data: data,       // <<— AQUÍ quedan todas las respuestas en JSONB
        tally_response_id: responseId,
        event_id: eventId,
      }, { onConflict: 'tally_response_id' })
      .select('id')
      .maybeSingle();
    if (subErr) return res.status(500).json({ error: 'SUBMISSION_SAVE_FAILED', details: subErr.message });

    // 7) (Opcional) Enlazar evento→submission
    if (eventId && sub?.id) {
      await supa
        .schema('maity')
        .from('tally_events')
        .update({ submission_id: sub.id })
        .eq('event_id', eventId);
    }

    // 8) Marcar usuario como completado y revocar OTK
    const { error: updErr } = await supa
      .schema('maity')
      .from('users')
      .update({
        registration_form_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        onboarding_token: null,
        onboarding_token_expires_at: null,
      })
      .eq('id', u.id);
    if (updErr) return res.status(500).json({ error: 'USER_UPDATE_FAILED', details: updErr.message });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[tally-webhook] INTERNAL', e);
    return res.status(500).json({ error: 'INTERNAL' });
  }
}