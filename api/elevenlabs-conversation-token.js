export default async function handler(req, res) {
  // Set CORS headers
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:8080'];
  const origin = req.headers.origin;

  if (corsOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', corsOrigins[0]);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY_TEST || process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY_TEST;
  const agentId = process.env.ELEVENLABS_AGENT_ID || process.env.VITE_ELEVENLABS_AGENT_ID || process.env.VITE_ELEVENLABS_AGENT_ID_TEST || process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID_TEST;

  console.log('[elevenlabs-conversation-token] Environment check:', {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    hasAgentId: !!agentId,
    agentIdValue: agentId,
  });

  if (!apiKey) {
    console.error('[elevenlabs-conversation-token] ElevenLabs API key not found');
    return res.status(500).json({
      error: 'API key not configured',
      details: 'ELEVENLABS_API_KEY environment variable is missing'
    });
  }

  if (!agentId) {
    console.error('[elevenlabs-conversation-token] ElevenLabs Agent ID not found');
    return res.status(500).json({
      error: 'Agent ID not configured',
      details: 'ELEVENLABS_AGENT_ID environment variable is missing'
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
        body: errorText
      });
      return res.status(response.status).json({
        error: 'Failed to get conversation token',
        status: response.status,
        statusText: response.statusText,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('[elevenlabs-conversation-token] Conversation token obtained successfully:', {
      hasToken: !!data.token,
      tokenLength: data.token?.length || 0
    });

    return res.status(200).json({
      token: data.token,
      agentId: agentId
    });
  } catch (error) {
    console.error('[elevenlabs-conversation-token] Error getting conversation token:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      type: error.name
    });
  }
}
