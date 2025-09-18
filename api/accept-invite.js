import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const token = req.query.invite;
  if (!token) return res.status(400).send('Missing invite');

  const { data: invite, error } = await supabase
    .from('maity.invite_links')
    .select('id, company_id, audience, is_revoked, expires_at, max_uses, used_count')
    .eq('token', token)
    .single();

  if (error || !invite) return res.status(400).send('Invalid invite');
  if (invite.is_revoked) return res.status(400).send('Invite revoked');
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) return res.status(400).send('Invite expired');
  if (invite.max_uses && invite.used_count >= invite.max_uses) return res.status(400).send('Invite exhausted');

  const domain = process.env.COOKIE_DOMAIN || 'maity.com.mx';
  res.setHeader('Set-Cookie', `invite_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1800; Domain=${domain}`);

  res.writeHead(302, { Location: 'https://maity.com.mx/auth' });
  res.end();
}
