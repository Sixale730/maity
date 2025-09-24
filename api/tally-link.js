// /api/tally-link.js  (si usas Next "pages": /pages/api/tally-link.js)
import { createClient } from '@supabase/supabase-js';
import { setCors } from '../lib/cors.js'; // ← si estás en /pages/api cambia a '../../lib/cors.js'

// ENVs con fallbacks a VITE_ (como los tienes en tu panel)
const SUPABASE_URL   = process.env.SUPABASE_URL   || process.env.VITE_SUPABASE_URL;
const ANON_KEY       = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY; // para leer user del JWT
const SERVICE_ROLE   = process.env.SUPABASE_SERVICE_ROLE_KEY;                                  // admin para RPC/tablas
const TALLY_FORM_URL = process.env.TALLY_FORM_URL;                                             // https://tally.so/r/XXXXXX

// Cliente admin (bypasa RLS) para negocio y RPC backend-only
const admin = createClient(SUPABASE_URL || '', SERVICE_ROLE || '');

export default async function handler(req, res) {
  if (setCors(req, res)) return;                           // responde preflight OPTIONS
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  // Validación de ENVs (si falta alguna, devolvemos cuál)
  const missing = [
    !SUPABASE_URL && 'SUPABASE_URL|VITE_SUPABASE_URL',
    !ANON_KEY && 'SUPABASE_ANON_KEY|VITE_SUPABASE_ANON_KEY',
    !SERVICE_ROLE && 'SUPABASE_SERVICE_ROLE_KEY',
    !TALLY_FORM_URL && 'TALLY_FORM_URL',
  ].filter(Boolean);
  if (missing.length) {
    console.error('[tally-link] MISSING_ENV', missing);
    return res.status(500).json({ error: 'MISSING_ENV', missing });
  }

  try {
    // 1) JWT del usuario (enviado por el front)
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'UNAUTHORIZED' });
    const userJwt = auth.slice(7);

    // 2) Resolver el usuario a partir del JWT (cliente ANON con Authorization)
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${userJwt}` } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      console.error('[tally-link] GET_USER_FAILED', userErr);
      return res.status(401).json({ error: 'INVALID_TOKEN' });
    }
    const authId = user.id;

    // 3) Validaciones de negocio (esquema maity, service_role)
    const { data: u, error: uErr } = await admin
      .schema('maity')
      .from('users')
      .select('id, company_id, registration_form_completed')
      .eq('auth_id', authId)
      .single();

    if (uErr || !u)                    return res.status(404).json({ error: 'USER_NOT_FOUND' });
    if (u.registration_form_completed) return res.status(400).json({ error: 'ALREADY_COMPLETED' });
    if (!u.company_id)                 return res.status(400).json({ error: 'NO_COMPANY' });

    const { data: co, error: cErr } = await admin
      .schema('maity')
      .from('companies')
      .select('name')
      .eq('id', u.company_id)
      .single();
    if (cErr) console.warn('[tally-link] ADMIN_QUERY_COMPANY_WARN', cErr);

    // 4) Emitir OTK SOLO desde backend (RPC backend-only: public.otk(text,int))
    const { data: otkData, error: otkErr } = await admin.rpc('otk', {
      p_auth_id: authId,
      p_ttl_minutes: 120, // ajusta TTL si quieres
    });

    if (otkErr || !otkData?.[0]?.token) {
      console.error('[tally-link] RPC_OTK_FAILED', {
        code: otkErr?.code,
        message: otkErr?.message,
        details: otkErr?.details,
        hint: otkErr?.hint,
        data: otkData
      });
      return res.status(500).json({ error: 'OTK_GENERATION_FAILED' });
    }

    const { token, expires_at } = otkData[0];

    // 5) Construir URL de Tally con hidden fields
    let urlStr;
    try {
      const url = new URL(TALLY_FORM_URL);
      url.searchParams.set('hidden[auth_id]', authId);
      url.searchParams.set('hidden[otk]', token);
      url.searchParams.set('hidden[company_id]', u.company_id);
      url.searchParams.set('hidden[company_name]', co?.name || '');
      url.searchParams.set('hidden[email]', user.email || '');

      // UI opcional de Tally
      url.searchParams.set('alignLeft', '1');
      url.searchParams.set('hideTitle', '1');
      url.searchParams.set('transparentBackground', '1');

      urlStr = url.toString();
    } catch (e) {
      console.error('[tally-link] URL_BUILD_FAILED', e, { TALLY_FORM_URL });
      return res.status(500).json({ error: 'URL_BUILD_FAILED' });
    }

    // Respuesta final
    return res.status(200).json({ url: urlStr, expires_at });
  } catch (e) {
    console.error('[tally-link] INTERNAL', e);
    return res.status(500).json({ error: 'INTERNAL' });
  }
}