// pages/api/tally-link.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL   = process.env.SUPABASE_URL!;
const ANON_KEY       = process.env.SUPABASE_ANON_KEY!;             // para leer el user del JWT
const SERVICE_ROLE   = process.env.SUPABASE_SERVICE_ROLE_KEY!;     // admin para RPC/tablas
const TALLY_FORM_URL = process.env.TALLY_FORM_URL!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function setCors(req, res) {
  const allowed = (process.env.CORS_ORIGINS || 'https://maity.com.mx,https://www.maity.com.mx').split(',');
  const origin = req.headers.origin;
  if (allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  try {
    // 1) JWT del usuario
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'UNAUTHORIZED' });
    const userJwt = auth.slice(7);

    // 2) Obtener user.id (authId) a partir del JWT
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${userJwt}` } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return res.status(401).json({ error: 'INVALID_TOKEN' });
    const authId = user.id;

    // 3) Validaciones de negocio en maity (admin)
    const { data: u, error: uErr } = await admin
      .schema('maity')
      .from('users')
      .select('id, company_id, registration_form_completed')
      .eq('auth_id', authId)
      .single();
    if (uErr || !u)                      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    if (u.registration_form_completed)   return res.status(400).json({ error: 'ALREADY_COMPLETED' });
    if (!u.company_id)                   return res.status(400).json({ error: 'NO_COMPANY' });

    const { data: co } = await admin
      .schema('maity')
      .from('companies')
      .select('name')
      .eq('id', u.company_id)
      .single();

    // 4) 🔑 Emite OTK SOLO desde backend (service_role)
    const { data: otkData, error: otkErr } = await admin
      .rpc('otk', { p_auth_id: authId, p_ttl_minutes: 120 });
    if (otkErr || !otkData?.[0]?.token) {
      console.error('[tally-link] RPC public.otk error:', otkErr, otkData);
      return res.status(500).json({ error: 'OTK_GENERATION_FAILED' });
    }
    const { token, expires_at } = otkData[0];

    // 5) Construir URL Tally con hidden fields
    const url = new URL(TALLY_FORM_URL);
    url.searchParams.set('hidden[auth_id]', authId);
    url.searchParams.set('hidden[otk]', token);
    url.searchParams.set('hidden[company_id]', u.company_id);
    url.searchParams.set('hidden[company_name]', co?.name || '');
    url.searchParams.set('hidden[email]', user.email || '');
    url.searchParams.set('alignLeft', '1');
    url.searchParams.set('hideTitle', '1');
    url.searchParams.set('transparentBackground', '1');

    return res.status(200).json({ url: url.toString(), expires_at });
  } catch (e) {
    console.error('[tally-link] INTERNAL', e);
    return res.status(500).json({ error: 'INTERNAL' });
  }
}