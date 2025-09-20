// api/finalize-invite.js
import { createClient } from '@supabase/supabase-js';
import { parse } from 'cookie';

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Orígenes permitidos (uno o varios separados por comas)
const RAW_ORIGINS =
  process.env.CORS_ORIGINS ||
  'https://www.maity.com.mx,https://maity.com.mx,https://api.maity.com.mx,http://localhost:5173,http://localhost:8080';
const ALLOWED = new Set(RAW_ORIGINS.split(',').map(s => s.trim()).filter(Boolean));

function setCors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    setCors(req, res);
    return res.status(204).end();
  }

  setCors(req, res);
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    }

    // Logs útiles en Vercel → Functions → Logs
    console.log('[finalize] hit', {
      origin: req.headers.origin,
      authLen: (req.headers.authorization || '').length,
      hasCookie: !!req.headers.cookie,
    });

    // 1) Auth del usuario (Bearer del cliente)
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'MISSING_AUTH' });
    }
    const accessToken = auth.slice('Bearer '.length);

    const { data: userResp, error: userErr } = await admin.auth.getUser(accessToken);
    if (userErr || !userResp?.user) {
      console.error('[finalize] INVALID_SESSION', userErr);
      return res.status(401).json({ error: 'INVALID_SESSION' });
    }
    const user = userResp.user;

    // 2) Invite desde cookie (HttpOnly)
    const cookies = parse(req.headers.cookie || '');
    const inviteToken = cookies.invite_token;
    if (!inviteToken) {
      return res.status(200).json({ success: true, redirect: '/dashboard', note: 'NO_INVITE_COOKIE' });
    }

    // 3) Validar invitación
    const { data: invite, error: invErr } = await admin
      .schema('maity')
      .from('invite_links')
      .select('id, company_id, audience, is_revoked, expires_at, max_uses, used_count')
      .eq('token', inviteToken)
      .maybeSingle();

    if (invErr || !invite) return res.status(400).json({ error: 'INVALID_INVITE' });
    if (invite.is_revoked) return res.status(400).json({ error: 'INVITE_REVOKED' });
    if (invite.expires_at && new Date(invite.expires_at) < new Date())
      return res.status(400).json({ error: 'INVITE_EXPIRED' });
    if (invite.max_uses && invite.used_count >= invite.max_uses)
      return res.status(400).json({ error: 'INVITE_EXHAUSTED' });

    // 4) Fila de usuario
    const { data: row, error: findErr } = await admin
      .schema('maity')
      .from('users')
      .select('id, company_id, auth_id')
      .eq('auth_id', user.id)
      .maybeSingle();

    console.log('[finalize] userRow', { hasRow: !!row, findErr });

    let assigned = false;

    if (!row) {
      // Si no existe, crear + asignar
      const { error: insErr } = await admin
        .schema('maity')
        .from('users')
        .insert({ auth_id: user.id, company_id: invite.company_id })
        .single();
      if (insErr) {
        console.error('[finalize] USER_INSERT_FAILED', insErr);
        return res.status(500).json({ error: 'USER_INSERT_FAILED' });
      }
      assigned = true;
    } else if (!row.company_id) {
      // Existe sin company → asignar
      const { error: updErr } = await admin
        .schema('maity')
        .from('users')
        .update({ company_id: invite.company_id })
        .eq('auth_id', user.id);
      if (updErr) {
        console.error('[finalize] USER_ASSIGN_FAILED', updErr);
        return res.status(500).json({ error: 'USER_ASSIGN_FAILED' });
      }
      assigned = true;
    }

    // 5) Si asignó, subir used_count (idempotente: una sola vez)
    if (assigned) {
      const next = (invite.used_count || 0) + 1;
      const { error: cntErr } = await admin
        .schema('maity')
        .from('invite_links')
        .update({ used_count: next })
        .eq('id', invite.id);
      if (cntErr) console.error('[finalize] used_count update error', cntErr);
    }

    // 6) Borrar cookie
    const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || '.maity.com.mx';
    res.setHeader(
      'Set-Cookie',
      `invite_token=; Max-Age=0; Path=/; Domain=${COOKIE_DOMAIN}; HttpOnly; Secure; SameSite=Lax`
    );

    // 7) Redirect según audiencia
    const redirect = invite.audience === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard';
    console.log('[finalize] done', { assigned, redirect });
    return res.status(200).json({ success: true, assigned, redirect });
  } catch (e) {
    console.error('[finalize] INTERNAL', e);
    return res.status(500).json({ error: 'INTERNAL' });
  }
}