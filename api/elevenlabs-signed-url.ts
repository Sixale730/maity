/**
 * ElevenLabs Signed URL Endpoint
 *
 * Generates signed URLs for ElevenLabs voice conversations.
 * Proxies the ElevenLabs API to keep API keys server-side.
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors } from '../lib/cors.js';
import { ApiError, withErrorHandler, validateMethod } from './types/errors.js';
import { getEnv } from './types/common.js';
import { elevenlabsSignedUrlRequestSchema } from './types/schemas.js';

/**
 * Handler for ElevenLabs signed URL generation
 */
async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Handle CORS
  if (setCors(req, res)) return;

  // Validate method
  validateMethod(req.method, ['POST']);

  // Get environment variables
  const apiKey = getEnv('ELEVENLABS_API_KEY_TEST');
  let agentId = getEnv('ELEVENLABS_AGENT_ID_TEST');

  // Parse and validate request body
  const body = elevenlabsSignedUrlRequestSchema.parse(req.body);

  // Allow override of agent_id from request
  if (body.agent_id) {
    agentId = body.agent_id;
  }

  try {
    // Call ElevenLabs API
    const response = await fetch(
      'https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?' +
        new URLSearchParams({ agent_id: agentId }),
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw ApiError.internal('Failed to get signed URL from ElevenLabs', {
        status: response.status,
        error: errorText,
      });
    }

    const data = await response.json();

    // Return the signed URL
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error fetching signed URL:', error);
    throw ApiError.internal('Failed to fetch signed URL');
  }
}

export default withErrorHandler(handler);
