// api/finalize-invite.js
import { createClient } from '@supabase/supabase-js';
import cookie from 'cookie';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // Solo POST (opcional, pero recomendado)
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 1) Auth del usuario (header Authorization: Bearer <access_token>)
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization' });
    }
    const accessToken = auth.replace('Bearer ', '');

    // Validar/obtener usuario autenticado usando el admin client
    const { data: userResp, error: userErr } = await supabaseAdmin.auth.getUser(accessToken);
    if (userErr || !userResp?.user) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    const user = userResp.user;

    // 2) Leer cookie invite_token
    const cookies = cookie.parse(req.headers.cookie || '');
    const inviteToken = cookies.invite_token;
    if (!inviteToken) {
      return res.status(400).json({ error: 'Missing invite cookie' });
    }

    // 3) Validar invite
    const { data: invite, error: invErr } = await supabaseAdmin
      .from('maity.invite_links')
      .select('id, company_id, audience, is_revoked, expires_at, max_uses, used_count')
      .eq('token', inviteToken)
      .single();

    if (invErr || !invite) return res.status(400).json({ error: 'Invalid invite' });
    if (invite.is_revoked) return res.status(400).json({ error: 'Invite revoked' });
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invite expired' });
    }
    if (invite.max_uses && invite.used_count >= invite.max_uses) {
      return res.status(400).json({ error: 'Invite exhausted' });
    }

    // 4) Buscar fila del usuario en tu tabla
    const { data: row, error: findErr } = await supabaseAdmin
      .from('maity.users')
      .select('id, company_id')
      .eq('auth_id', user.id)
      .single();

    if (findErr || !row) {
      return res.status(500).json({ error: 'User row not found' });
    }

    // 5) Asignar company si está vacía
    let assigned = false;
    if (!row.company_id) {
      const { error: updErr } = await supabaseAdmin
        .from('maity.users')
        .update({ company_id: invite.company_id })
        .eq('auth_id', user.id);

      if (updErr) return res.status(500).json({ error: 'Could not assign company' });
      assigned = true;

      // incrementar used_count (opcional: solo si assigned)
      await supabaseAdmin
        .from('maity.invite_links')
        .update({ used_count: (invite.used_count || 0) + 1 })
        .eq('id', invite.id);
    }

    // 6) Borrar cookie
    const domain = process.env.COOKIE_DOMAIN || 'maity.com.mx';
    res.setHeader(
      'Set-Cookie',
      `invite_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0; Domain=${domain}`
    );

    // 7) Redirección por audiencia
    const redirect = invite.audience === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard';

    return res.json({ success: true, audience: invite.audience, assigned, redirect });
  } catch (e) {
    console.error('finalize-invite error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
