/**
 * Finalize Invite Endpoint
 *
 * Processes invite tokens after OAuth callback.
 * Links user to company and assigns role based on invite audience.
 * Clears the invite cookie after successful processing.
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { parse as parseCookie } from 'cookie';
import { setCors } from '../lib/cors.js';
import { ApiError, withErrorHandler, validateMethod } from '../lib/types/api/errors.js';
import { getEnv } from '../lib/types/api/common.js';
import { Invitation, User, UserInsert } from '../lib/types/api/database.js';

/**
 * Clear invite cookie from response
 */
function clearInviteCookie(res: VercelResponse): void {
  const cookieDomain = process.env.COOKIE_DOMAIN || '.maity.com.mx';
  res.setHeader(
    'Set-Cookie',
    `invite_token=; Max-Age=0; Path=/; Domain=${cookieDomain}; HttpOnly; Secure; SameSite=Lax`
  );
}

/**
 * Handler for finalizing invitations
 */
async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Handle CORS
  if (setCors(req, res)) return;

  // Validate method
  validateMethod(req.method, ['POST']);

  // Get environment variables
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  // Get authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    clearInviteCookie(res);
    throw ApiError.unauthorized('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  // Get invite token from cookie
  const cookieHeader = req.headers.cookie || '';
  const cookies = parseCookie(cookieHeader);
  const inviteToken = cookies.invite_token;

  if (!inviteToken) {
    throw ApiError.invalidRequest('No invite token found in cookies');
  }

  // Create admin client
  const admin = createClient(supabaseUrl, serviceRoleKey);

  // Create user client
  const userClient = createClient(supabaseUrl, serviceRoleKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  try {
    // Get user from token
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      console.error('Error getting user:', userError);
      clearInviteCookie(res);
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const authId = user.id;
    const email = user.email;

    // Look up invitation by token
    const { data: invites, error: inviteError } = await admin
      .schema('maity')
      .from('invitations')
      .select('*')
      .eq('token', inviteToken)
      .eq('used', false);

    if (inviteError) {
      console.error('Error looking up invitation:', inviteError);
      throw ApiError.database('Failed to look up invitation', inviteError);
    }

    if (!invites || invites.length === 0) {
      clearInviteCookie(res);
      throw ApiError.notFound('Invitation');
    }

    const invite = invites[0] as Invitation;

    // Check if invitation has expired
    const expiresAt = new Date(invite.expires_at);
    if (expiresAt < new Date()) {
      clearInviteCookie(res);
      throw ApiError.expired('Invitation');
    }

    // Check if invitation email matches (if email specified)
    if (invite.email && invite.email !== email) {
      clearInviteCookie(res);
      throw ApiError.invalidRequest('Invitation email does not match authenticated user');
    }

    // Get existing user data (if any) to preserve it
    const { data: existingUsers } = await admin
      .schema('maity')
      .from('users')
      .select('*')
      .eq('auth_id', authId);

    const existingUser = existingUsers?.[0] as User | undefined;

    // Determine role based on invite audience
    const role = invite.audience === 'manager' ? 'manager' : 'user';

    // Upsert user with company and role
    const upsertData: UserInsert = {
      auth_id: authId,
      company_id: invite.company_id,
      role,
      email: email || null,
    };

    // Preserve existing name if present
    if (existingUser?.name) {
      upsertData.name = existingUser.name;
    }

    const { error: upsertError } = await admin
      .schema('maity')
      .from('users')
      .upsert(upsertData, {
        onConflict: 'auth_id',
      });

    if (upsertError) {
      console.error('Error upserting user:', upsertError);
      throw ApiError.database('Failed to update user', upsertError);
    }

    // Mark invitation as used
    const { error: updateError } = await admin
      .schema('maity')
      .from('invitations')
      .update({
        used: true,
        used_at: new Date().toISOString(),
        used_by: authId,
      })
      .eq('id', invite.id);

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      // Don't throw - user is already linked, this is just cleanup
    }

    // Clear the invite cookie
    clearInviteCookie(res);

    console.log('Invitation finalized:', {
      authId,
      companyId: invite.company_id,
      role,
    });

    // Return success
    res.status(200).json({
      success: true,
      data: {
        company_id: invite.company_id,
        role,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error finalizing invite:', error);
    clearInviteCookie(res);
    throw ApiError.internal('Failed to finalize invitation');
  }
}

export default withErrorHandler(handler);
