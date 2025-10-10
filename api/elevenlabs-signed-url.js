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

  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY_TEST || process.env.VITE_ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID || process.env.VITE_ELEVENLABS_AGENT_ID_TEST || process.env.VITE_ELEVENLABS_AGENT_ID;

  if (!apiKey) {
    console.error('ElevenLabs API key not found');
    return res.status(500).json({ error: 'API key not configured' });
  }

  if (!agentId) {
    console.error('ElevenLabs Agent ID not found');
    return res.status(500).json({ error: 'Agent ID not configured' });
  }

  try {
    console.log('Requesting signed URL for agent:', agentId);

    // Get signed URL from ElevenLabs
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
      console.error('ElevenLabs API error:', errorText);
      return res.status(response.status).json({
        error: 'Failed to get signed URL',
        details: errorText
      });
    }

    const data = await response.json();
    console.log('Signed URL obtained successfully');

    return res.status(200).json({ signed_url: data.signed_url });
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}