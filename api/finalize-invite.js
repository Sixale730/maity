// api/finalize-invite.js
import { createClient } from '@supabase/supabase-js';
import { parse } from 'cookie';

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Permite varios orígenes separados por coma
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
  // Preflight
  if (req.method === 'OPTIONS') {
    setCors(req, res);
    return res.status(204).end();
  }

  setCors(req, res);

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 1) Auth del usuario
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization' });
    }
    const accessToken = auth.slice('Bearer '.length);

    const { data: userResp, error: userErr } = await admin.auth.getUser(accessToken);
    if (userErr || !userResp?.user) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    const user = userResp.user;

    // 2) Invite cookie
    const cookies = parse(req.headers.cookie || '');
    const inviteToken = cookies.invite_token;
    if (!inviteToken) return res.status(400).json({ error: 'Missing invite cookie' });

    // 3) Validar invite
    const { data: invite, error: invErr } = await admin
      .schema('maity')
      .from('invite_links')
      .select('id, company_id, audience, is_revoked, expires_at, max_uses, used_count')
      .eq('token', inviteToken)
      .single();

    if (invErr || !invite) return res.status(400).json({ error: 'Invalid invite' });
    if (invite.is_revoked) return res.status(400).json({ error: 'Invite revoked' });
    if (invite.expires_at && new Date(invite.expires_at) < new Date())
      return res.status(400).json({ error: 'Invite expired' });
    if (invite.max_uses && invite.used_count >= invite.max_uses)
      return res.status(400).json({ error: 'Invite exhausted' });

    // 4) Buscar fila de usuario
    const { data: row, error: findErr } = await admin
      .schema('maity')
      .from('users')
      .select('id, company_id')
      .eq('auth_id', user.id)
      .single();
    if (findErr || !row) return res.status(500).json({ error: 'User row not found' });

    // 5) Asignar company si falta + aumentar used_count
    let assigned = false;
    if (!row.company_id) {
      const { error: updErr } = await admin
        .schema('maity')
        .from('users')
        .update({ company_id: invite.company_id })
        .eq('auth_id', user.id);
      if (updErr) return res.status(500).json({ error: 'Could not assign company' });
      assigned = true;

      await admin
        .schema('maity')
        .from('invite_links')
        .update({ used_count: (invite.used_count || 0) + 1 })
        .eq('id', invite.id);
    }

    // 6) Borrar cookie
    const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || '.maity.com.mx';
    const sameSite = process.env.COOKIE_SAMESITE || 'Lax';
    res.setHeader(
      'Set-Cookie',
      `invite_token=; HttpOnly; Secure; SameSite=${sameSite}; Path=/; Max-Age=0; Domain=${COOKIE_DOMAIN}`
    );

    const redirect = invite.audience === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard';
    return res.json({ success: true, audience: invite.audience, assigned, redirect });
  } catch (e) {
    console.error('finalize-invite error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}