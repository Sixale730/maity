/**
 * Accept Invite Endpoint
 *
 * Sets HttpOnly cookie with invite token before OAuth flow.
 * This is the first step in the invitation acceptance process.
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors } from '../lib/cors';
import { ApiError, withErrorHandler, validateMethod } from './types/errors';
import { CookieOptions } from './types/common';
import { acceptInviteRequestSchema } from './types/schemas';

/**
 * Helper to create cookie string with options
 */
function cookieString(name: string, value: string, opts: CookieOptions = {}): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (opts.maxAge) {
    parts.push(`Max-Age=${opts.maxAge}`);
  }
  if (opts.domain) {
    parts.push(`Domain=${opts.domain}`);
  }
  if (opts.path) {
    parts.push(`Path=${opts.path}`);
  }
  if (opts.httpOnly) {
    parts.push('HttpOnly');
  }
  if (opts.secure) {
    parts.push('Secure');
  }
  if (opts.sameSite) {
    parts.push(`SameSite=${opts.sameSite}`);
  }

  return parts.join('; ');
}

/**
 * Handler for accepting invitations
 */
async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Handle CORS
  if (setCors(req, res)) return;

  // Validate method
  validateMethod(req.method, ['POST']);

  // Parse and validate request body
  const body = acceptInviteRequestSchema.parse(req.body);
  const { token } = body;

  if (!token || token.trim() === '') {
    throw ApiError.invalidRequest('Token is required');
  }

  // Get cookie domain from environment
  const cookieDomain = process.env.COOKIE_DOMAIN || '.maity.com.mx';

  // Set the invite token cookie
  // Cookie expires in 1 hour (3600 seconds)
  const cookie = cookieString('invite_token', token, {
    maxAge: 3600,
    domain: cookieDomain,
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
  });

  res.setHeader('Set-Cookie', cookie);

  // Return success response
  res.status(200).json({
    success: true,
    message: 'Invite token set successfully',
  });
}

export default withErrorHandler(handler);
