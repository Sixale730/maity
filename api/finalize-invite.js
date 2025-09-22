// api/finalize-invite.js
import { createClient } from '@supabase/supabase-js';
import { parse } from 'cookie';
import { env } from '../src/lib/env.js';

const admin = createClient(env.supabaseUrl, env.supabaseServiceKey);

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

    // 3) Validar token de invitación
    const { data: invite, error: inviteErr } = await admin
      .schema('maity')
      .from('invite_links')
      .select('id, company_id, audience, is_revoked, expires_at, max_uses, used_count')
      .eq('token', inviteToken)
      .single();

    // Siempre limpiar la cookie de invite, tenga éxito o no
    clearInviteCookie(res);

    if (inviteErr || !invite) {
      return res.status(400).json({ error: 'INVALID_INVITE' });
    }

    if (invite.is_revoked) {
      return res.status(400).json({ error: 'INVITE_REVOKED' });
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({ error: 'INVITE_EXPIRED' });
    }

    if (invite.max_uses && invite.used_count >= invite.max_uses) {
      return res.status(400).json({ error: 'INVITE_EXHAUSTED' });
    }

    // 4) Determinar rol según audience
    let roleToAssign = 'user'; // default
    if (invite.audience === 'admin') {
      roleToAssign = 'admin';
    } else if (invite.audience === 'manager') {
      roleToAssign = 'manager';
    }

    // 5) Vincular usuario con empresa
    const { error: userUpdateErr } = await admin
      .schema('maity')
      .from('users')
      .upsert({
        auth_id: authId,
        email: userResp.user.email,
        company_id: invite.company_id,
        registration_form_completed: false, // Siempre false inicialmente
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'auth_id',
        ignoreDuplicates: false
      });

    if (userUpdateErr) {
      console.error('[finalize] User update error:', userUpdateErr);
      return res.status(500).json({ error: 'USER_UPDATE_FAILED' });
    }

    // 6) Asignar rol al usuario
    const { error: roleErr } = await admin
      .schema('maity')
      .from('user_roles')
      .upsert({
        user_id: authId,
        role: roleToAssign,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (roleErr) {
      console.error('[finalize] Role assignment error:', roleErr);
      return res.status(500).json({ error: 'ROLE_ASSIGNMENT_FAILED' });
    }

    // 7) Incrementar contador de uso del invite
    await admin
      .schema('maity')
      .from('invite_links')
      .update({
        used_count: invite.used_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', invite.id);

    // 8) Respuesta exitosa (sin redirect, el frontend decide)
    return res.status(200).json({
      success: true,
      message: 'Invite processed successfully',
      company_id: invite.company_id,
      role_assigned: roleToAssign,
      user_id: authId
    });
  } catch (e) {
    console.error('[finalize] INTERNAL', e);
    return res.status(500).json({ error: 'INTERNAL' });
  }
}