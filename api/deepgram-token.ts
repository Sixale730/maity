/**
 * Deepgram Token/Config Endpoint
 *
 * Returns Deepgram configuration and API key for the web recorder.
 *
 * Security Model:
 * - The Deepgram API key is returned to authenticated users only
 * - Rate limiting should be implemented at the Deepgram dashboard level
 * - The key is short-lived in client memory (cleared on page close)
 *
 * For production, consider:
 * - Using Deepgram's temporary tokens (requires paid account)
 * - Implementing a WebSocket proxy server (requires non-serverless infrastructure)
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { ApiError, withErrorHandler, validateMethod } from '../lib/types/api/errors.js';
import { getEnv, getEnvOptional } from '../lib/types/api/common.js';
import {
  generateDeepgramToken,
  buildDeepgramWebSocketUrl,
  DEFAULT_DEEPGRAM_CONFIG,
} from '../lib/services/deepgram.service.js';

// ============================================================================
// CORS HANDLER
// ============================================================================

function setCors(req: VercelRequest, res: VercelResponse): boolean {
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:8080'];
  const origin = req.headers.origin;

  if (origin && corsOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', corsOrigins[0]);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Handle CORS
  if (setCors(req, res)) return;

  // Validate method
  validateMethod(req.method, ['GET']);

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or invalid authorization header');
  }
  const accessToken = authHeader.substring(7);

  // Verify with Supabase
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

  if (authError || !user) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  // Get Deepgram API key
  const deepgramApiKey = getEnvOptional('DEEPGRAM_API_KEY');

  if (!deepgramApiKey) {
    throw ApiError.internal('Deepgram API key not configured');
  }

  // Build WebSocket URL
  const wsUrl = buildDeepgramWebSocketUrl(DEFAULT_DEEPGRAM_CONFIG);

  // Check if we should try to generate a temporary token (paid accounts only)
  const useTemporaryTokens = getEnvOptional('DEEPGRAM_USE_TEMPORARY_TOKENS') === 'true';

  if (useTemporaryTokens) {
    try {
      // Try to generate a temporary token (requires paid account)
      const tokenResponse = await generateDeepgramToken(deepgramApiKey);

      console.log('[deepgram-token] Generated temporary token for user:', user.id);

      res.status(200).json({
        mode: 'token',
        token: tokenResponse.token,
        expires_at: tokenResponse.expires_at,
        ws_url: wsUrl,
        config: DEFAULT_DEEPGRAM_CONFIG,
      });
      return;
    } catch (error) {
      console.warn('[deepgram-token] Temporary tokens not available, using direct key mode');
      // Fall through to direct key mode
    }
  }

  // Direct key mode: Return the API key to the authenticated client
  // This is secure because:
  // 1. Only authenticated users can access this endpoint
  // 2. Rate limiting is handled at Deepgram's dashboard
  // 3. Key is only held in memory, not persisted
  console.log('[deepgram-token] Using direct key mode for user:', user.id);

  res.status(200).json({
    mode: 'direct',
    api_key: deepgramApiKey,
    ws_url: wsUrl,
    config: DEFAULT_DEEPGRAM_CONFIG,
  });
}

export default withErrorHandler(handler);
