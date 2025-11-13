/**
 * Evaluate Interview Endpoint
 *
 * Evaluates an interview session using OpenAI.
 * Provides comprehensive analysis of communication skills and areas for improvement.
 *
 * Features:
 * - Synchronous evaluation (3-10s response time)
 * - Rate limiting (5 eval/min, 50 eval/day per user)
 * - Retry logic with exponential backoff
 * - Comprehensive logging
 * - Cost tracking
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { setCors } from '../lib/cors.js';
import {
  ApiError,
  withErrorHandler,
  validateMethod,
} from '../lib/types/api/errors.js';
import { getEnv } from '../lib/types/api/common.js';
import {
  evaluateInterviewSession,
  parseTranscript,
} from '../lib/services/openai.service.js';

// ============================================================================
// SCHEMAS
// ============================================================================

const evaluateInterviewSchema = z.object({
  session_id: z.string().uuid('Invalid session ID format'),
  request_id: z.string().uuid('Invalid request ID format'),
});

type EvaluateInterviewRequest = z.infer<typeof evaluateInterviewSchema>;

// ============================================================================
// RATE LIMITING
// ============================================================================

async function checkRateLimits(supabase: any, userId: string): Promise<void> {
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
    // Don't throw - allow evaluation to proceed if rate limit check fails
  }

  if (countPerMinute && countPerMinute >= 5) {
    throw ApiError.tooManyRequests(
      'Límite de 5 evaluaciones por minuto excedido. Espera un momento antes de intentar de nuevo.'
    );
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
    // Don't throw - allow evaluation to proceed if rate limit check fails
  }

  if (countPerDay && countPerDay >= 50) {
    throw ApiError.tooManyRequests(
      'Límite diario de 50 evaluaciones excedido. Intenta de nuevo mañana.'
    );
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Handle CORS
  if (setCors(req, res)) return;

  // Validate HTTP method
  validateMethod(req.method, ['POST']);

  // Parse and validate request body
  let body: EvaluateInterviewRequest;
  try {
    body = evaluateInterviewSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid request body', error.errors);
    }
    throw error;
  }

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or invalid authorization header');
  }
  const accessToken = authHeader.substring(7);

  // Initialize Supabase client with service role (bypasses RLS)
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
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
    throw ApiError.unauthorized('Invalid or expired token');
  }

  // Get maity user_id from auth_id
  const { data: maityUser, error: userError } = await supabase
    .schema('maity')
    .from('users')
    .select('id, first_name, last_name')
    .eq('auth_id', authUser.id)
    .single();

  if (userError || !maityUser) {
    console.error('User lookup error:', userError);
    throw ApiError.notFound('User');
  }

  const userId = maityUser.id;
  const userName = `${maityUser.first_name} ${maityUser.last_name}`.trim();

  // Check rate limits
  await checkRateLimits(supabase, userId);

  console.log({
    event: 'interview_evaluation_started',
    sessionId: body.session_id,
    requestId: body.request_id,
    userId,
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
    throw ApiError.notFound('Interview session');
  }

  // Verify session ownership
  if (session.user_id !== userId) {
    throw ApiError.forbidden('Session does not belong to user');
  }

  // Verify session has transcript
  if (!session.raw_transcript) {
    throw ApiError.badRequest('Session has no transcript to evaluate');
  }

  // Parse transcript to structured format
  const transcript = parseTranscript(session.raw_transcript);

  if (transcript.length === 0) {
    throw ApiError.badRequest('Session transcript could not be parsed');
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

  // Call OpenAI interview evaluation service
  const analysis = await evaluateInterviewSession({
    transcript,
    sessionId: session.id,
    userId,
    userName,
  });

  // Parse the analysis JSON to extract structured fields
  let parsedAnalysis;
  try {
    parsedAnalysis = JSON.parse(analysis);
  } catch (parseError) {
    console.error('Error parsing analysis JSON:', parseError);
    throw ApiError.internal('Failed to parse evaluation response');
  }

  console.log({
    event: 'interview_evaluation_completed',
    sessionId: session.id,
    requestId: body.request_id,
    userId,
    analysisLength: analysis.length,
    is_complete: parsedAnalysis.is_complete,
    has_amazing_comment: !!parsedAnalysis.amazing_comment,
    has_summary: !!parsedAnalysis.summary,
    has_rubrics: !!parsedAnalysis.rubrics,
    timestamp: new Date().toISOString(),
  });

  // Update interview evaluation with analysis and structured fields
  const { data: evaluation, error: updateError } = await supabase
    .schema('maity')
    .from('interview_evaluations')
    .update({
      status: 'complete',
      analysis_text: analysis, // Keep full JSON for backward compatibility
      rubrics: parsedAnalysis.rubrics, // Store structured rubrics
      amazing_comment: parsedAnalysis.amazing_comment, // Deep personality insight
      summary: parsedAnalysis.summary, // Overall summary
      is_complete: parsedAnalysis.is_complete, // Whether interview was sufficient
      interviewee_name: userName,
      updated_at: new Date().toISOString(),
    })
    .eq('request_id', body.request_id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating interview evaluation:', updateError);
    throw ApiError.database('Failed to save interview evaluation', updateError);
  }

  console.log({
    event: 'interview_evaluation_saved',
    requestId: evaluation.request_id,
    sessionId: session.id,
    userId,
    timestamp: new Date().toISOString(),
  });

  // Return success response with structured fields
  res.status(200).json({
    ok: true,
    evaluation: {
      request_id: evaluation.request_id,
      session_id: session.id,
      status: evaluation.status,
      analysis_text: analysis,
      rubrics: parsedAnalysis.rubrics,
      amazing_comment: parsedAnalysis.amazing_comment,
      summary: parsedAnalysis.summary,
      is_complete: parsedAnalysis.is_complete,
      interviewee_name: userName,
    },
  });
}

// Export handler wrapped with error handler
export default withErrorHandler(handler);
