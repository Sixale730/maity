// /api/tally-link
// Generates Tally form URL with OTK and hidden fields
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TALLY_FORM_URL = process.env.TALLY_FORM_URL || 'https://tally.so/r/wQGAyA';

export default async function handler(req, res) {
  // Set CORS headers
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:8080,https://www.maity.com.mx').split(',');
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    const token = authHeader.substring(7);

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'INVALID_TOKEN' });
    }

    const authId = user.id;

    // Get user and company data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, company_id, registration_form_completed')
      .eq('auth_id', authId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }

    if (userData.registration_form_completed) {
      return res.status(400).json({ error: 'ALREADY_COMPLETED' });
    }

    if (!userData.company_id) {
      return res.status(400).json({ error: 'NO_COMPANY' });
    }

    // Get company info
    const { data: companyData } = await supabase
      .from('companies')
      .select('name')
      .eq('id', userData.company_id)
      .single();

    // Generate OTK using the RPC function
    const { data: otkData, error: otkError } = await supabase.rpc('otk', {
      p_auth_id: authId,
      p_ttl_minutes: 120
    });

    if (otkError || !otkData || !otkData[0]) {
      console.error('OTK generation failed:', otkError);
      return res.status(500).json({ error: 'OTK_GENERATION_FAILED' });
    }

    const otk = otkData[0].token;
    const expiresAt = otkData[0].expires_at;

    // Build Tally URL with hidden fields
    const url = new URL(TALLY_FORM_URL);

    // Hidden fields for webhook validation
    url.searchParams.set('auth_id', authId);
    url.searchParams.set('otk', otk);
    url.searchParams.set('company_id', userData.company_id);
    url.searchParams.set('company_name', companyData?.name || '');
    url.searchParams.set('email', user.email || '');

    // UI customization
    url.searchParams.set('alignLeft', '1');
    url.searchParams.set('hideTitle', '1');
    url.searchParams.set('transparentBackground', '1');

    return res.status(200).json({
      url: url.toString(),
      expires_at: expiresAt
    });

  } catch (error) {
    console.error('[tally-link] Error:', error);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
}
