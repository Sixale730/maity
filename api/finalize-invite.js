// api/finalize-invite.js
import { createClient } from '@supabase/supabase-js';
import { parse } from 'cookie';
import { setCors } from '../lib/cors.js';

const admin = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function clearInviteCookie(res) {
  const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || '.maity.com.mx';
  res.setHeader(
    'Set-Cookie',
    `invite_token=; Max-Age=0; Path=/; Domain=${COOKIE_DOMAIN}; HttpOnly; Secure; SameSite=Lax`
  );
}

export default async function handler(req, res) {
  if (setCors(req, res)) return; // ya respondimos OPTIONS
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
      return res.status(200).json({ success: true, note: 'NO_INVITE_COOKIE', redirect: '/dashboard' });
    }

    // 3) Validar token de invitación
    const { data: invite, error: inviteErr } = await admin
      .schema('maity')
      .from('invite_links')
      .select('id, company_id, audience, is_revoked, expires_at, max_uses, used_count')
      .eq('token', inviteToken)
      .single();

    // Limpia la cookie SIEMPRE
    clearInviteCookie(res);

    if (inviteErr || !invite) return res.status(400).json({ error: 'INVALID_INVITE' });
    if (invite.is_revoked) return res.status(400).json({ error: 'INVITE_REVOKED' });
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({ error: 'INVITE_EXPIRED' });
    }
    if (invite.max_uses && invite.used_count >= invite.max_uses) {
      return res.status(400).json({ error: 'INVITE_EXHAUSTED' });
    }

    // 4) Determinar rol según audience (links viejos ADMIN/USER)
    // ADMIN -> manager; USER -> user; también acepta 'manager'/'admin' por si ya migraste
    const aud = String(invite.audience || '').toLowerCase();
    let roleToAssign = 'user';
    if (aud === 'admin') roleToAssign = 'manager';
    else if (aud === 'manager') roleToAssign = 'manager';
    else if (aud === 'user') roleToAssign = 'user';

    // 5) Check if user exists to preserve ALL existing data
    const { data: existingUser } = await admin
      .schema('maity')
      .from('users')
      .select('name, registration_form_completed')
      .eq('auth_id', authId)
      .single();

    // 5) Upsert de users (por auth_id) y obtener users.id para user_roles
    const nowIso = new Date().toISOString();

    // Build upsert data preserving existing fields
    const upsertData = {
      auth_id: authId,
      email: userResp.user.email,
      company_id: invite.company_id,
      updated_at: nowIso
    };

    // If it's a new user, set defaults
    if (!existingUser) {
      upsertData.registration_form_completed = false;
      upsertData.created_at = nowIso;
      upsertData.name = ''; // Set empty string for new users
    } else {
      // Preserve existing user data
      if (existingUser.name !== undefined && existingUser.name !== null) {
        upsertData.name = existingUser.name;
      }
      if (existingUser.registration_form_completed !== undefined) {
        upsertData.registration_form_completed = existingUser.registration_form_completed;
      }
    }

    const { error: userUpErr } = await admin
      .schema('maity')
      .from('users')
      .upsert(upsertData, { onConflict: 'auth_id', ignoreDuplicates: false });
    if (userUpErr) {
      console.error('[finalize] User upsert error:', userUpErr);
      return res.status(500).json({ error: 'USER_UPDATE_FAILED' });
    }

    // Obtener users.id (PK de negocio) para insertar en user_roles
    const { data: userRow, error: getUserErr } = await admin
      .schema('maity')
      .from('users')
      .select('id')
      .eq('auth_id', authId)
      .single();
    if (getUserErr || !userRow?.id) {
      console.error('[finalize] Get users.id error:', getUserErr);
      return res.status(500).json({ error: 'USER_LOOKUP_FAILED' });
    }

    // 6) Asignar rol (upsert por clave única user_id)
    const { error: roleErr } = await admin
      .schema('maity')
      .from('user_roles')
      .upsert(
        {
          user_id: userRow.id,
          role: roleToAssign,
          created_at: nowIso
        },
        { onConflict: 'user_id', ignoreDuplicates: false }
      );
    if (roleErr) {
      console.error('[finalize] Role assignment error:', roleErr);
      return res.status(500).json({ error: 'ROLE_ASSIGNMENT_FAILED' });
    }

    // 7) Incrementar contador de uso del invite
    const { error: invUpdErr } = await admin
      .schema('maity')
      .from('invite_links')
      .update({ used_count: (invite.used_count || 0) + 1, updated_at: nowIso })
      .eq('id', invite.id);
    if (invUpdErr) {
      console.error('[finalize] Invite update error:', invUpdErr);
      // No short-circuit: ya se asignó company y rol; solo log
    }

    // 8) Respuesta (frontend decide redirect)
    return res.status(200).json({
      success: true,
      message: 'Invite processed successfully',
      company_id: invite.company_id,
      role_assigned: roleToAssign,
      user_id: userRow.id
    });
  } catch (e) {
    console.error('[finalize] INTERNAL', e);
    return res.status(500).json({ error: 'INTERNAL' });
  }
}
