// api/finalize-invite.js
import { createClient } from '@supabase/supabase-js';
import { parse } from 'cookie';
import crypto from 'crypto';

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const RAW_ORIGINS =
  process.env.CORS_ORIGINS ||
  'https://www.maity.com.mx,https://maity.com.mx,https://api.maity.com.mx,http://localhost:5173,http://localhost:8080';
const ALLOWED = new Set(RAW_ORIGINS.split(',').map(s => s.trim()).filter(Boolean));

function setCors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED.has(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
}

function clearInviteCookie(res) {
  const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || '.maity.com.mx';
  res.setHeader(
    'Set-Cookie',
    `invite_token=; Max-Age=0; Path=/; Domain=${COOKIE_DOMAIN}; HttpOnly; Secure; SameSite=Lax`
  );
}

export default async function handler(req, res) {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    setCors(req, res);
    return res.status(204).end();
  }

  setCors(req, res);
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

    // 1) Auth (Bearer)
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'MISSING_AUTH' });
    const bearer = auth.slice('Bearer '.length);

    const { data: userResp, error: uErr } = await admin.auth.getUser(bearer);
    if (uErr || !userResp?.user) return res.status(401).json({ error: 'INVALID_SESSION' });
    const authId = userResp.user.id;

    // 2) Cookie de invitación (HttpOnly)
    const cookies = parse(req.headers.cookie || '');
    const inviteToken = cookies.invite_token;
    if (!inviteToken) {
      // flujo normal: no hay invitación pendiente
      return res.status(200).json({ success: true, note: 'NO_INVITE_COOKIE', redirect: '/dashboard' });
    }

    // 3) RPC transaccional (idempotente): aceptar invitación y (si corresponde) asignar company
    const { data, error: rpcErr } = await admin.rpc('accept_invite_and_assign', {
      p_auth_id: authId,
      p_token: inviteToken,
    });

    // Siempre limpiar la cookie de invite, tenga éxito o no
    clearInviteCookie(res);

    if (rpcErr) {
      const msg = (rpcErr.message || '').toUpperCase();
      const map = { INVALID_INVITE: 400, INVITE_REVOKED: 400, INVITE_EXPIRED: 400, INVITE_EXHAUSTED: 400 };
      return res.status(map[msg] ?? 500).json({ error: msg || 'RPC_ERROR' });
    }

    const rpcRow = Array.isArray(data) ? data[0] : data;

    // 4) ¿El usuario ya completó el registro? Si no, genera/renueva OTK y redirige a /registration
    const { data: uRow, error: uErr2 } = await admin
      .schema('maity')
      .from('users')
      .select('registration_form_completed, onboarding_token, onboarding_token_expires_at')
      .eq('auth_id', authId)
      .single();

    if (uErr2 || !uRow) {
      return res.status(500).json({ error: 'USER_STATUS_READ_FAILED' });
    }

    if (!uRow.registration_form_completed) {
      let token = uRow.onboarding_token || null;
      const expMs = uRow.onboarding_token_expires_at ? new Date(uRow.onboarding_token_expires_at).getTime() : 0;
      const stillValid = expMs > Date.now();

      if (!token || !stillValid) {
        token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(); // 24h
        const { error: tokErr } = await admin
          .schema('maity')
          .from('users')
          .update({ onboarding_token: token, onboarding_token_expires_at: expiresAt })
          .eq('auth_id', authId);
        if (tokErr) return res.status(500).json({ error: 'ONBOARDING_TOKEN_SAVE_FAILED' });
      }

      const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://www.maity.com.mx';
      return res.status(200).json({
        success: true,
        assigned: !!(rpcRow && rpcRow.assigned),
        redirect: `${FRONTEND_ORIGIN}/registration?otk=${token}`,
      });
    }

    // 5) Si ya completó el formulario, directo a /dashboard
    return res.status(200).json({
      success: true,
      assigned: !!(rpcRow && rpcRow.assigned),
      redirect: '/dashboard',
    });
  } catch (e) {
    console.error('[finalize] INTERNAL', e);
    return res.status(500).json({ error: 'INTERNAL' });
  }
}