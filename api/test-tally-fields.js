// Endpoint para testing y debugging de campos de Tally
export default async function handler(req, res) {
  // Set CORS headers
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:8080'];
  const origin = req.headers.origin;

  if (corsOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', corsOrigins[0]);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[test-tally-fields] Headers:', req.headers);
    console.log('[test-tally-fields] Query params:', req.query);
    console.log('[test-tally-fields] Body:', req.body);

    const body = req.body || {};
    const data = body.data || body;

    // Simular la misma extracción que el webhook real
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
        email
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
          "data['hidden[otk]']": data['hidden[otk]']
        }
      }
    };

    console.log('[test-tally-fields] Result:', result);

    return res.status(200).json(result);
  } catch (error) {
    console.error('[test-tally-fields] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}