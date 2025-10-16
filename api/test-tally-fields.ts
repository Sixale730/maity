/**
 * Test Tally Fields Endpoint
 *
 * Testing and debugging endpoint for Tally form field extraction.
 * Helps verify that hidden fields are being correctly received from Tally webhooks.
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { ApiError, withErrorHandler, validateMethod } from './types/errors';

/**
 * Custom CORS handler for testing endpoint
 */
function setCorsForTest(req: VercelRequest, res: VercelResponse): boolean {
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:8080'];
  const origin = req.headers.origin;

  if (origin && corsOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', corsOrigins[0]);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Handler for testing Tally field extraction
 */
async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Handle CORS
  if (setCorsForTest(req, res)) return;

  // Validate method
  validateMethod(req.method, ['POST']);

  try {
    console.log('[test-tally-fields] Headers:', req.headers);
    console.log('[test-tally-fields] Query params:', req.query);
    console.log('[test-tally-fields] Body:', req.body);

    const body = (req.body || {}) as Record<string, any>;
    const data = body.data || body;

    // Simulate the same extraction as the real webhook
    const hidden = data?.hidden || data?.hiddenFields || {};

    const authId =
      hidden.auth_id ||
      hidden.user_id ||
      data.auth_id ||
      data.user_id ||
      data['hidden[auth_id]'] ||
      data['hidden[user_id]'] ||
      null;

    const otk =
      hidden.otk ||
      hidden.token ||
      data.otk ||
      data.token ||
      data['hidden[otk]'] ||
      data['hidden[token]'] ||
      null;

    const email =
      hidden.email ||
      data.email ||
      data['hidden[email]'] ||
      null;

    const result = {
      success: !!(authId && otk),
      extracted: {
        authId,
        otk,
        email,
      },
      debugging: {
        bodyKeys: Object.keys(body),
        dataKeys: Object.keys(data || {}),
        hiddenKeys: Object.keys(hidden || {}),
        rawHidden: hidden,
        rawData: data,
        searchPaths: {
          'hidden.auth_id': hidden.auth_id,
          'data.auth_id': data.auth_id,
          "data['hidden[auth_id]']": data['hidden[auth_id]'],
          'hidden.otk': hidden.otk,
          'data.otk': data.otk,
          "data['hidden[otk]']": data['hidden[otk]'],
        },
      },
    };

    console.log('[test-tally-fields] Result:', result);

    res.status(200).json(result);
  } catch (error) {
    const err = error as Error;
    console.error('[test-tally-fields] Error:', err);
    throw ApiError.internal('Test failed', { message: err.message });
  }
}

export default withErrorHandler(handler);
