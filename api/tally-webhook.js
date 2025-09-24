// pages/api/tally-link.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const ANON_KEY = process.env.SUPABASE_ANON_KEY!;                 // para llamar RPC con JWT de usuario
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;     // para leer maity.users/companies
const TALLY_FORM_URL = process.env.TALLY_FORM_URL!;

// Cliente admin (RLS bypass) para leer tus tablas
const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

// CORS helper
function setCors(req, res) {
  const allowed = (process.env.CORS_ORIGINS || 'http://localhost:8080,https://maity.com.mx,https://www.maity.com.mx').split(',');
  const origin = req.headers.origin;
  if (allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  try {
    // 1) JWT del usuario (lo manda tu front en Authorization: Bearer <token>)
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'UNAUTHORIZED' });
    const userJwt = auth.slice(7);

    // 2) Con ese JWT crea un cliente "de usuario" para que public.otk vea auth.uid()
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${userJwt}` } },
    });

    // (opcional) validar usuario por si quieres checar claims
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return res.status(401).json({ error: 'INVALID_TOKEN' });
    const authId = user.id;

    // 3) Lee tu usuario/empresa en esquema maity con admin
    const { data: u, error: uErr } = await admin
      .schema('maity')
      .from('users')
      .select('id, company_id, registration_form_completed')
      .eq('auth_id', authId)
      .single();
    if (uErr || !u) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    if (u.registration_form_completed) return res.status(400).json({ error: 'ALREADY_COMPLETED' });

    const { data: co } = await admin
      .schema('maity')
      .from('companies')
      .select('name')
      .eq('id', u.company_id)
      .single();

    // 4) 🔑 Genera OTK con tu wrapper público (usa auth.uid() del JWT)
    const { data: otkData, error: otkErr } = await userClient.rpc('otk', { p_ttl_minutes: 120 });
    if (otkErr || !otkData?.[0]?.token) {
      console.error('[tally-link] RPC public.otk error:', otkErr, otkData);
      return res.status(500).json({ error: 'OTK_GENERATION_FAILED' });
    }
    const { token, expires_at } = otkData[0];

    // 5) Construye la URL de Tally con hidden fields
    const url = new URL(TALLY_FORM_URL);
    url.searchParams.set('hidden[auth_id]', authId);
    url.searchParams.set('hidden[otk]', token);
    url.searchParams.set('hidden[company_id]', u.company_id || '');
    url.searchParams.set('hidden[company_name]', co?.name || '');
    url.searchParams.set('hidden[email]', user.email || '');
    // UI opcional
    url.searchParams.set('alignLeft', '1');
    url.searchParams.set('hideTitle', '1');
    url.searchParams.set('transparentBackground', '1');

    return res.status(200).json({ url: url.toString(), expires_at });
  } catch (e) {
    console.error('[tally-link] INTERNAL', e);
    return res.status(500).json({ error: 'INTERNAL' });
  }
}
