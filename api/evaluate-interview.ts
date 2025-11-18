/**
 * Evaluate Interview Endpoint (Edge Runtime with Async Processing)
 *
 * Evaluates an interview session using OpenAI.
 * Provides comprehensive analysis of communication skills and areas for improvement.
 *
 * Features:
 * - Edge Runtime with waitUntil() for background processing
 * - Returns immediately, processes OpenAI in background
 * - Rate limiting (5 eval/min, 50 eval/day per user)
 * - Retry logic with exponential backoff
 * - Comprehensive logging
 * - Cost tracking
 */

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { waitUntil } from '@vercel/functions';
import {
  evaluateInterviewSession,
  parseTranscript,
  TranscriptMessage,
} from '../lib/services/openai.service.js';

// Edge Runtime configuration - 30 seconds timeout
export const config = {
  runtime: 'edge',
};

// ============================================================================
// SCHEMAS
// ============================================================================

const evaluateInterviewSchema = z.object({
  session_id: z.string().uuid('Invalid session ID format'),
  request_id: z.string().uuid('Invalid request ID format'),
});

type EvaluateInterviewRequest = z.infer<typeof evaluateInterviewSchema>;

// ============================================================================
// CORS HELPER FOR EDGE
// ============================================================================

function getCorsHeaders(req: Request): HeadersInit {
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:8080')
    .split(',')
    .map(s => s.trim());

  const origin = req.headers.get('origin') || '';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
// RATE LIMITING
// ============================================================================

async function checkRateLimits(supabase: any, userId: string, isAdmin: boolean): Promise<string | null> {
  // Admins bypass rate limits completely
  if (isAdmin) {
    console.log({
      event: 'rate_limit_check',
      userId,
      isAdmin: true,
      message: 'Admin user - rate limits bypassed',
    });
    return null;
  }

  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // 1. Rate limit por minuto (5 evaluaciones/min)
  const { count: countPerMinute, error: minuteError } = await supabase
    .schema('maity')
    .from('interview_evaluations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneMinuteAgo.toISOString());

  if (minuteError) {
    console.error('Error checking minute rate limit:', minuteError);
  }

  if (countPerMinute && countPerMinute >= 5) {
    return 'Límite de 5 evaluaciones por minuto excedido. Espera un momento antes de intentar de nuevo.';
  }

  // 2. Quota diaria (50 evaluaciones/día)
  const { count: countPerDay, error: dayError } = await supabase
    .schema('maity')
    .from('interview_evaluations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneDayAgo.toISOString());

  if (dayError) {
    console.error('Error checking daily rate limit:', dayError);
  }

  if (countPerDay && countPerDay >= 50) {
    return 'Límite diario de 50 evaluaciones excedido. Intenta de nuevo mañana.';
  }

  return null;
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
  if (req.method !== 'POST') {
    return errorResponse('METHOD_NOT_ALLOWED', 'Only POST method is allowed', 405, req);
  }

  // Parse and validate request body
  let body: EvaluateInterviewRequest;
  try {
    const rawBody = await req.json();
    body = evaluateInterviewSchema.parse(rawBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('INVALID_REQUEST', 'Invalid request body', 400, req);
    }
    return errorResponse('INVALID_REQUEST', 'Could not parse request body', 400, req);
  }

  // Verify authentication
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return errorResponse('UNAUTHORIZED', 'Missing or invalid authorization header', 401, req);
  }
  const accessToken = authHeader.substring(7);

  // Initialize Supabase client with service role (bypasses RLS)
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

  // Verify token and get auth user
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser(accessToken);

  if (authError || !authUser) {
    return errorResponse('UNAUTHORIZED', 'Invalid or expired token', 401, req);
  }

  // Get maity user_id from auth_id
  const { data: maityUser, error: userError } = await supabase
    .schema('maity')
    .from('users')
    .select('id, name')
    .eq('auth_id', authUser.id)
    .single();

  if (userError || !maityUser) {
    console.error('User lookup error:', userError);
    return errorResponse('NOT_FOUND', 'User not found', 404, req);
  }

  const userId = maityUser.id;
  const userName = maityUser.name;

  // Check if user is admin
  const { data: roles } = await supabase
    .schema('maity')
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  const isAdmin = roles?.some((r: any) => r.role === 'admin') || false;

  // Check rate limits (admins bypass)
  const rateLimitError = await checkRateLimits(supabase, userId, isAdmin);
  if (rateLimitError) {
    return errorResponse('TOO_MANY_REQUESTS', rateLimitError, 429, req);
  }

  console.log({
    event: 'interview_evaluation_started',
    sessionId: body.session_id,
    requestId: body.request_id,
    userId,
    isAdmin,
    timestamp: new Date().toISOString(),
  });

  // Get interview session
  const { data: session, error: sessionError } = await supabase
    .schema('maity')
    .from('interview_sessions')
    .select('id, user_id, raw_transcript')
    .eq('id', body.session_id)
    .maybeSingle();

  if (sessionError || !session) {
    console.error({
      event: 'session_lookup_failed',
      sessionId: body.session_id,
      userId,
      error: sessionError,
      timestamp: new Date().toISOString(),
    });
    return errorResponse('NOT_FOUND', 'Interview session not found', 404, req);
  }

  // Verify session ownership (admins can evaluate any session)
  if (!isAdmin && session.user_id !== userId) {
    return errorResponse('FORBIDDEN', 'Session does not belong to user', 403, req);
  }

  // Get session owner's name for analysis (important when admin evaluates another user's session)
  let sessionOwnerName = userName;
  if (isAdmin && session.user_id !== userId) {
    const { data: sessionOwner } = await supabase
      .schema('maity')
      .from('users')
      .select('name')
      .eq('id', session.user_id)
      .single();

    if (sessionOwner) {
      sessionOwnerName = sessionOwner.name;
    }
  }

  // Verify session has transcript
  if (!session.raw_transcript) {
    return errorResponse('BAD_REQUEST', 'Session has no transcript to evaluate', 400, req);
  }

  // Parse transcript to structured format
  const transcript = parseTranscript(session.raw_transcript);

  if (transcript.length === 0) {
    return errorResponse('BAD_REQUEST', 'Session transcript could not be parsed', 400, req);
  }

  console.log({
    event: 'interview_evaluation_request',
    sessionId: session.id,
    requestId: body.request_id,
    userId,
    transcriptMessages: transcript.length,
    timestamp: new Date().toISOString(),
  });

  // Update evaluation status to processing
  await supabase
    .schema('maity')
    .from('interview_evaluations')
    .update({
      status: 'processing',
      updated_at: new Date().toISOString()
    })
    .eq('request_id', body.request_id);

  // Process evaluation in background using waitUntil
  // This allows the function to return immediately while continuing to process
  waitUntil(processEvaluationAsync({
    supabaseUrl,
    serviceRoleKey,
    sessionId: session.id,
    requestId: body.request_id,
    userId,
    sessionOwnerName,
    transcript,
  }));

  // Return immediately - frontend will poll for completion
  return jsonResponse({
    ok: true,
    status: 'processing',
    request_id: body.request_id,
    session_id: session.id,
    message: 'Evaluation started. Poll for completion.',
  }, 202, req);
}

// ============================================================================
// ASYNC EVALUATION PROCESSING
// ============================================================================

interface ProcessEvaluationParams {
  supabaseUrl: string;
  serviceRoleKey: string;
  sessionId: string;
  requestId: string;
  userId: string;
  sessionOwnerName: string;
  transcript: TranscriptMessage[];
}

async function processEvaluationAsync(params: ProcessEvaluationParams): Promise<void> {
  const {
    supabaseUrl,
    serviceRoleKey,
    sessionId,
    requestId,
    userId,
    sessionOwnerName,
    transcript,
  } = params;

  // Create a new Supabase client for background processing
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'maity'
    }
  });

  try {
    // Call OpenAI interview evaluation service
    const analysis = await evaluateInterviewSession({
      transcript,
      sessionId,
      userId,
      userName: sessionOwnerName,
    });

    // Parse the analysis JSON to extract structured fields
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysis);
    } catch (parseError) {
      console.error('Error parsing analysis JSON:', parseError);
      throw new Error('Failed to parse evaluation response');
    }

    console.log({
      event: 'interview_evaluation_completed',
      sessionId,
      requestId,
      userId,
      analysisLength: analysis.length,
      is_complete: parsedAnalysis.is_complete,
      has_amazing_comment: !!parsedAnalysis.amazing_comment,
      has_summary: !!parsedAnalysis.summary,
      has_rubrics: !!parsedAnalysis.rubrics,
      timestamp: new Date().toISOString(),
    });

    // Update interview evaluation with analysis and structured fields
    const { error: updateError } = await supabase
      .schema('maity')
      .from('interview_evaluations')
      .update({
        status: 'complete',
        analysis_text: analysis,
        rubrics: parsedAnalysis.rubrics,
        key_observations: parsedAnalysis.key_observations || null,
        amazing_comment: parsedAnalysis.amazing_comment,
        summary: parsedAnalysis.summary,
        is_complete: parsedAnalysis.is_complete,
        interviewee_name: sessionOwnerName,
        updated_at: new Date().toISOString(),
      })
      .eq('request_id', requestId);

    if (updateError) {
      console.error('Error updating interview evaluation:', updateError);
      throw new Error('Failed to save interview evaluation');
    }

    console.log({
      event: 'interview_evaluation_saved',
      requestId,
      sessionId,
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // If anything fails, mark evaluation as error
    console.error({
      event: 'interview_evaluation_failed',
      sessionId,
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    await supabase
      .schema('maity')
      .from('interview_evaluations')
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error occurred',
        updated_at: new Date().toISOString(),
      })
      .eq('request_id', requestId);
  }
}
