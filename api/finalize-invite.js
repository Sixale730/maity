import { createClient } from '@supabase/supabase-js';
import cookie from 'cookie';

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization' });
  const accessToken = auth.replace('Bearer ', '');

  const supabaseUser = createClient(process.env.SUPABASE_URL, accessToken);
  const { data: userResp, error: userErr } = await supabaseUser.auth.getUser();
  if (userErr || !userResp?.user) return res.status(401).json({ error: 'Invalid session' });
  const user = userResp.user;

  const cookies = cookie.parse(req.headers.cookie || '');
  const inviteToken = cookies.invite_token;
  if (!inviteToken) return res.status(400).json({ error: 'Missing invite cookie' });

  const { data: invite, error } = await supabaseAdmin
    .from('maity.invite_links')
    .select('id, company_id, audience, is_revoked, expires_at, max_uses, used_count')
    .eq('token', inviteToken)
    .single();

  if (error || !invite) return res.status(400).json({ error: 'Invalid invite' });

  const { data: row } = await supabaseAdmin
    .from('maity.users')
    .select('id, company_id')
    .eq('auth_id', user.id)
    .single();

  let assigned = false;
  if (row && !row.company_id) {
    await supabaseAdmin
      .from('maity.users')
      .update({ company_id: invite.company_id })
      .eq('auth_id', user.id);
    assigned = true;

    await supabaseAdmin
      .from('maity.invite_links')
      .update({ used_count: (invite.used_count || 0) + 1 })
      .eq('id', invite.id);
  }

  const domain = process.env.COOKIE_DOMAIN || 'maity.com.mx';
  res.setHeader('Set-Cookie', `invite_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0; Domain=${domain}`);

  const redirect = invite.audience === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard';
  res.json({ success: true, audience: invite.audience, assigned, redirect });
}