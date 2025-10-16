/**
 * Tally Link Endpoint
 *
 * Generates secure Tally form URLs with OTK (One-Time Key) for user registration.
 * Requires authentication and creates a time-limited token for form access.
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { setCors } from '../lib/cors.js';
import { ApiError, withErrorHandler, validateMethod } from '../../lib/types/api/errors.js';
import { getEnv } from '../../lib/types/api/common.js';
import { OtkData } from '../../lib/types/api/database.js';

/**
 * Handler for Tally link generation
 */
async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Handle CORS
  if (setCors(req, res)) return;

  // Validate method
  validateMethod(req.method, ['POST']);

  // Get environment variables
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  const tallyFormUrl = getEnv('TALLY_FORM_URL');

  // Get authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  // Create Supabase client with user's token
  const userClient = createClient(supabaseUrl, serviceRoleKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  // Get user from token
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    console.error('Error getting user:', userError);
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const authId = user.id;

  // Create admin client for OTK generation
  const admin = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Generate OTK via RPC function (requires service role)
    const { data: otkData, error: otkError } = await admin.rpc('otk', {
      p_auth_id: authId,
      p_ttl_minutes: 120, // 2 hours
    });

    if (otkError) {
      console.error('Error generating OTK:', otkError);
      throw ApiError.database('Failed to generate one-time key', otkError);
    }

    const otk = otkData as OtkData;

    if (!otk || !otk.token) {
      throw ApiError.internal('OTK generation returned invalid data');
    }

    // Build Tally form URL with hidden fields
    const url = new URL(tallyFormUrl);
    url.searchParams.set('auth_id', authId);
    url.searchParams.set('otk', otk.token);

    console.log('Generated Tally link:', {
      authId,
      hasToken: !!otk.token,
      expiresAt: otk.expires_at,
    });

    // Return the URL
    res.status(200).json({
      success: true,
      data: {
        url: url.toString(),
        expires_at: otk.expires_at,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error in tally-link:', error);
    throw ApiError.internal('Failed to generate Tally link');
  }
}

export default withErrorHandler(handler);
