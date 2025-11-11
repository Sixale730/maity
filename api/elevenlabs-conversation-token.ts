/**
 * ElevenLabs Conversation Token Endpoint
 *
 * Gets a conversation token from ElevenLabs for starting a voice conversation.
 * Proxies the ElevenLabs API to keep API keys server-side.
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { ApiError, withErrorHandler, validateMethod } from '../lib/types/api/errors.js';
import { getEnvOptional } from '../lib/types/api/common.js';

/**
 * Custom CORS handler for GET requests
 */
function setCorsForGet(req: VercelRequest, res: VercelResponse): boolean {
  const corsOrigins =
    process.env.CORS_ORIGINS?.split(',') || ['http://localhost:8080'];
  const origin = req.headers.origin;

  if (origin && corsOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', corsOrigins[0]);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Handler for ElevenLabs conversation token
 */
async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Handle CORS
  if (setCorsForGet(req, res)) return;

  // Validate method
  validateMethod(req.method, ['GET']);

  // Get API key from multiple possible env vars
  const apiKey =
    getEnvOptional('ELEVENLABS_API_KEY') ||
    getEnvOptional('VITE_ELEVENLABS_API_KEY') ||
    getEnvOptional('VITE_ELEVENLABS_API_KEY_TEST') ||
    getEnvOptional('EXPO_PUBLIC_ELEVENLABS_API_KEY_TEST');

  const agentId =
    getEnvOptional('ELEVENLABS_AGENT_ID') ||
    getEnvOptional('VITE_ELEVENLABS_AGENT_ID') ||
    getEnvOptional('VITE_ELEVENLABS_AGENT_ID_TEST') ||
    getEnvOptional('EXPO_PUBLIC_ELEVENLABS_AGENT_ID_TEST');

  console.log('[elevenlabs-conversation-token] Environment check:', {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    hasAgentId: !!agentId,
    agentIdValue: agentId,
  });

  if (!apiKey) {
    console.error('[elevenlabs-conversation-token] ElevenLabs API key not found');
    throw ApiError.internal('API key not configured', {
      details: 'ELEVENLABS_API_KEY environment variable is missing',
    });
  }

  if (!agentId) {
    console.error('[elevenlabs-conversation-token] ElevenLabs Agent ID not found');
    throw ApiError.internal('Agent ID not configured', {
      details: 'ELEVENLABS_AGENT_ID environment variable is missing',
    });
  }

  try {
    console.log('[elevenlabs-conversation-token] Requesting conversation token for agent:', agentId);

    // Get conversation token from ElevenLabs
    const url = `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`;
    console.log('[elevenlabs-conversation-token] Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    console.log('[elevenlabs-conversation-token] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[elevenlabs-conversation-token] ElevenLabs API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw ApiError.internal('Failed to get conversation token', {
        status: response.status,
        statusText: response.statusText,
        details: errorText,
      });
    }

    const data = (await response.json()) as { token: string };
    console.log('[elevenlabs-conversation-token] Conversation token obtained successfully:', {
      hasToken: !!data.token,
      tokenLength: data.token?.length || 0,
    });

    res.status(200).json({
      token: data.token,
      agentId: agentId,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const err = error as Error;
    console.error('[elevenlabs-conversation-token] Error getting conversation token:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    throw ApiError.internal('Failed to get conversation token', {
      message: err.message,
      type: err.name,
    });
  }
}

export default withErrorHandler(handler);
