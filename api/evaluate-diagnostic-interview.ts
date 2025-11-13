/**
 * Evaluate Diagnostic Interview Endpoint
 *
 * Evaluates a Coach diagnostic interview using OpenAI.
 * Assesses 6 rubrics (same as self-assessment): Claridad, Adaptación, Persuasión, Estructura, Propósito, Empatía.
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
  evaluateDiagnosticInterview,
  parseTranscript,
} from '../lib/services/openai.service.js';

// ============================================================================
// SCHEMAS
// ============================================================================

const evaluateDiagnosticInterviewSchema = z.object({
  session_id: z.string().uuid('Invalid session ID format'),
});

type EvaluateDiagnosticInterviewRequest = z.infer<typeof evaluateDiagnosticInterviewSchema>;

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
    .from('diagnostic_interviews')
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
    .from('diagnostic_interviews')
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
  let body: EvaluateDiagnosticInterviewRequest;
  try {
    body = evaluateDiagnosticInterviewSchema.parse(req.body);
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
    .select('id')
    .eq('auth_id', authUser.id)
    .single();

  if (userError || !maityUser) {
    console.error('User lookup error:', userError);
    throw ApiError.notFound('User');
  }

  const userId = maityUser.id;

  // Check rate limits
  await checkRateLimits(supabase, userId);

  console.log({
    event: 'diagnostic_interview_lookup_started',
    sessionId: body.session_id,
    userId,
    timestamp: new Date().toISOString(),
  });

  // Get voice session (Coach sessions have no profile_scenario_id)
  const { data: session, error: sessionError } = await supabase
    .schema('maity')
    .from('voice_sessions')
    .select('id, user_id, raw_transcript, profile_scenario_id')
    .eq('id', body.session_id)
    .is('profile_scenario_id', null) // MUST be a Coach session (no scenario)
    .maybeSingle();

  if (sessionError || !session) {
    console.error({
      event: 'session_lookup_failed',
      sessionId: body.session_id,
      userId,
      error: sessionError,
      timestamp: new Date().toISOString(),
    });
    throw ApiError.notFound('Coach session');
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
    event: 'diagnostic_interview_evaluation_request',
    sessionId: session.id,
    userId,
    transcriptMessages: transcript.length,
    timestamp: new Date().toISOString(),
  });

  // Call OpenAI diagnostic evaluation service
  const evaluationResult = await evaluateDiagnosticInterview({
    transcript,
    sessionId: session.id,
    userId,
  });

  console.log({
    event: 'diagnostic_interview_evaluation_completed',
    sessionId: session.id,
    userId,
    is_complete: evaluationResult.is_complete,
    rubric_scores: {
      claridad: evaluationResult.rubrics.claridad.score,
      adaptacion: evaluationResult.rubrics.adaptacion.score,
      persuasion: evaluationResult.rubrics.persuasion.score,
      estructura: evaluationResult.rubrics.estructura.score,
      proposito: evaluationResult.rubrics.proposito.score,
      empatia: evaluationResult.rubrics.empatia.score,
    },
    timestamp: new Date().toISOString(),
  });

  // Save diagnostic interview to database
  const { data: interview, error: saveError } = await supabase
    .schema('maity')
    .from('diagnostic_interviews')
    .insert({
      user_id: userId,
      session_id: session.id,
      transcript: session.raw_transcript,
      rubrics: evaluationResult.rubrics,
      amazing_comment: evaluationResult.amazing_comment,
      summary: evaluationResult.summary,
      is_complete: evaluationResult.is_complete,
    })
    .select()
    .single();

  if (saveError) {
    console.error('Error saving diagnostic interview:', saveError);
    throw ApiError.database('Failed to save diagnostic interview', saveError);
  }

  console.log({
    event: 'diagnostic_interview_saved',
    interviewId: interview.id,
    sessionId: session.id,
    userId,
    timestamp: new Date().toISOString(),
  });

  // Return success response
  res.status(200).json({
    ok: true,
    interview: {
      id: interview.id,
      session_id: session.id,
      rubrics: evaluationResult.rubrics,
      amazing_comment: evaluationResult.amazing_comment,
      summary: evaluationResult.summary,
      is_complete: evaluationResult.is_complete,
    },
  });
}

// Export handler wrapped with error handler
export default withErrorHandler(handler);
