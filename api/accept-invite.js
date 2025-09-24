// api/accept-invite.js
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function cookieString(name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts.maxAge) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.domain) parts.push(`Domain=${opts.domain}`);
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (opts.httpOnly) parts.push('HttpOnly');
  if (opts.secure) parts.push('Secure');
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  return parts.join('; ');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('METHOD_NOT_ALLOWED');

  const token = (req.query?.invite || '').toString().trim();
  if (!token) return res.status(400).send('MISSING_INVITE');

  const { data: invite, error } = await admin
    .schema('maity')
    .from('invite_links')
    .select('id, company_id, audience, is_revoked, expires_at, max_uses, used_count')
    .eq('token', token)
    .maybeSingle();

  if (error || !invite) return res.status(400).send('INVALID_INVITE');
  if (invite.is_revoked) return res.status(400).send('INVITE_REVOKED');
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) return res.status(400).send('INVITE_EXPIRED');
  if (invite.max_uses && invite.used_count >= invite.max_uses) return res.status(400).send('INVITE_EXHAUSTED');

  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://www.maity.com.mx';
  const COOKIE_DOMAIN   = process.env.COOKIE_DOMAIN   || '.maity.com.mx';

  // 1) Set-Cookie ANTES del redirect
  res.setHeader('Set-Cookie', cookieString('invite_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    domain: COOKIE_DOMAIN,
    path: '/',
    maxAge: 60 * 30, // 30 min
  }));

  // Endpoints de API no deberían cachearse
  res.setHeader('Cache-Control', 'no-store');

  // 2) Un solo redirect
  res.statusCode = 302;
  res.setHeader('Location', `${FRONTEND_ORIGIN}/auth`);
  res.end();
}
