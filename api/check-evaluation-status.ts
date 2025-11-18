/**
 * Check Interview Evaluation Status Endpoint
 *
 * Simple endpoint to poll for interview evaluation completion.
 * Used with async evaluation flow.
 */

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Edge Runtime for fast response
export const config = {
  runtime: 'edge',
};

// ============================================================================
// SCHEMAS
// ============================================================================

const checkStatusSchema = z.object({
  request_id: z.string().uuid('Invalid request ID format'),
});

// ============================================================================
// CORS HELPER
// ============================================================================

function getCorsHeaders(req: Request): HeadersInit {
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:8080')
    .split(',')
    .map(s => s.trim());

  const origin = req.headers.get('origin') || '';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };

  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

function jsonResponse(data: any, status: number, req: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(req),
    },
  });
}

function errorResponse(code: string, message: string, status: number, req: Request): Response {
  return jsonResponse({ error: code, message }, status, req);
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req),
    });
  }

  // Validate HTTP method
  if (req.method !== 'GET') {
    return errorResponse('METHOD_NOT_ALLOWED', 'Only GET method is allowed', 405, req);
  }

  // Parse request_id from query string
  const url = new URL(req.url);
  const requestId = url.searchParams.get('request_id');

  // Validate
  try {
    checkStatusSchema.parse({ request_id: requestId });
  } catch (error) {
    return errorResponse('INVALID_REQUEST', 'Invalid or missing request_id', 400, req);
  }

  // Verify authentication
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse('UNAUTHORIZED', 'Missing or invalid authorization header', 401, req);
  }
  const accessToken = authHeader.substring(7);

  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return errorResponse('CONFIG_ERROR', 'Missing Supabase configuration', 500, req);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'maity'
    }
  });

  // Verify token
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser(accessToken);

  if (authError || !authUser) {
    return errorResponse('UNAUTHORIZED', 'Invalid or expired token', 401, req);
  }

  // Get maity user_id
  const { data: maityUser, error: userError } = await supabase
    .schema('maity')
    .from('users')
    .select('id')
    .eq('auth_id', authUser.id)
    .single();

  if (userError || !maityUser) {
    return errorResponse('NOT_FOUND', 'User not found', 404, req);
  }

  // Check if user is admin
  const { data: roles } = await supabase
    .schema('maity')
    .from('user_roles')
    .select('role')
    .eq('user_id', maityUser.id);

  const isAdmin = roles?.some((r: any) => r.role === 'admin') || false;

  // Get evaluation status
  const { data: evaluation, error: evalError } = await supabase
    .schema('maity')
    .from('interview_evaluations')
    .select('request_id, session_id, status, error_message, rubrics, summary, amazing_comment, key_observations, is_complete, interviewee_name, user_id')
    .eq('request_id', requestId)
    .single();

  if (evalError || !evaluation) {
    return errorResponse('NOT_FOUND', 'Evaluation not found', 404, req);
  }

  // Verify ownership (admins can check any)
  if (!isAdmin && evaluation.user_id !== maityUser.id) {
    return errorResponse('FORBIDDEN', 'Evaluation does not belong to user', 403, req);
  }

  // Return status and data if complete
  return jsonResponse({
    ok: true,
    status: evaluation.status,
    request_id: evaluation.request_id,
    session_id: evaluation.session_id,
    error_message: evaluation.error_message,
    // Only include full data if complete
    ...(evaluation.status === 'complete' && {
      rubrics: evaluation.rubrics,
      summary: evaluation.summary,
      amazing_comment: evaluation.amazing_comment,
      key_observations: evaluation.key_observations,
      is_complete: evaluation.is_complete,
      interviewee_name: evaluation.interviewee_name,
    }),
  }, 200, req);
}
