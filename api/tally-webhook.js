import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SERVICE_ROLE  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_SECRET= process.env.TALLY_WEBHOOK_SECRET;

const supa = createClient(SUPABASE_URL, SERVICE_ROLE);

// Leer raw body sin librerías externas
function readRaw(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => (data += c));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('METHOD_NOT_ALLOWED');
  if (!WEBHOOK_SECRET) return res.status(500).json({ error: 'MISSING_WEBHOOK_SECRET' });

  try {
    // 1) RAW + HMAC
    const raw = await readRaw(req);
    const sig = (req.headers['tally-signature'] || req.headers['x-tally-signature'] || '').toString();
    const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex');
    if (!sig || sig !== expected) {
      console.error('[webhook] INVALID_SIGNATURE');
      return res.status(401).json({ error: 'INVALID_SIGNATURE' });
    }

    // 2) Payload
    const body = JSON.parse(raw);
    const eventId    = body?.eventId || body?.event_id || null;
    const formId     = body?.formId  || body?.form_id  || null;
    const data       = body?.data || body;
    const responseId = data?.responseId || data?.response_id || null;

    // Debug logs para el payload completo
    console.log('[tally-webhook] Received payload:', {
      eventId,
      formId,
      responseId,
      dataKeys: Object.keys(data || {}),
      bodyKeys: Object.keys(body || {}),
      rawData: data
    });

    const hidden = data?.hidden || data?.hiddenFields || {};

    // Múltiples fallbacks para diferentes formatos de campos
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
        "data['hidden[otk]']": data['hidden[otk]']
      }
    });

    // 3) Guardar EVENTO (idempotente)
    const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || null;
    const ua = (req.headers['user-agent'] || '').toString();

    const { error: evtErr } = await supa
      .schema('maity')
      .from('tally_events')
      .upsert(
        { event_id: eventId, form_id: formId, signature: sig, ip, user_agent: ua, payload: body },
        { onConflict: 'event_id' }
      );
    if (evtErr) {
      console.error('[webhook] SAVE_EVENT_FAILED', evtErr);
      return res.status(500).json({ error: 'SAVE_EVENT_FAILED' });
    }

    // 4) Validaciones mínimas
    if (!authId || !otk) {
      console.error('[webhook] MISSING_HIDDEN_FIELDS', {
        authId,
        otk,
        hidden,
        dataKeys: Object.keys(data || {}),
        fullPayload: body
      });
      return res.status(400).json({ error: 'MISSING_HIDDEN_FIELDS' });
    }

    // 5) Validar OTK vigente
    const { data: u, error: uErr } = await supa
      .schema('maity')
      .from('users')
      .select('id, onboarding_token, onboarding_token_expires_at')
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
      .upsert(
        { user_id: u.id, submission_data: data, tally_response_id: responseId, event_id: eventId },
        { onConflict: 'tally_response_id' }
      )
      .select('id')
      .maybeSingle();
    if (subErr) {
      console.error('[webhook] SUBMISSION_SAVE_FAILED', subErr);
      return res.status(500).json({ error: 'SUBMISSION_SAVE_FAILED' });
    }

    // 7) Enlazar evento → submission (opcional)
    if (eventId && sub?.id) {
      await supa.schema('maity').from('tally_events').update({ submission_id: sub.id }).eq('event_id', eventId);
    }

    // 8) Marcar usuario y revocar OTK
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
    if (updErr) {
      console.error('[webhook] USER_UPDATE_FAILED', updErr);
      return res.status(500).json({ error: 'USER_UPDATE_FAILED' });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[webhook] INTERNAL', e);
    return res.status(500).json({ error: 'INTERNAL' });
  }
}