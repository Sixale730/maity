/**
 * Evaluate Tech Week Session Endpoint
 *
 * Evaluates a Tech Week session using OpenAI directly.
 * Similar to evaluate-session but uses isolated Tech Week tables.
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
  evaluateRoleplaySession,
  parseTranscript,
  calculateScores,
} from '../lib/services/openai.service.js';

// ============================================================================
// SCHEMAS
// ============================================================================

const evaluateTechWeekSchema = z.object({
  session_id: z.string().uuid('Invalid session ID format'),
  request_id: z.string().uuid('Invalid request ID format').optional(),
});

type EvaluateTechWeekRequest = z.infer<typeof evaluateTechWeekSchema>;

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
    .from('tech_week_evaluations')
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
    .from('tech_week_evaluations')
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
  let body: EvaluateTechWeekRequest;
  try {
    body = evaluateTechWeekSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid request body', error.errors);
    }
    throw error;
  }

  const requestId = body.request_id || crypto.randomUUID();

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
    .select('id, name')
    .eq('auth_id', authUser.id)
    .single();

  if (userError || !maityUser) {
    console.error('User lookup error:', userError);
    throw ApiError.notFound('User');
  }

  const userId = maityUser.id;

  // Check if user is admin
  const { data: userRoles } = await supabase.rpc('get_user_role', { p_user_id: userId });
  const isAdmin = userRoles === 'admin';

  // Check rate limits against tech_week_evaluations table
  await checkRateLimits(supabase, userId);

  console.log({
    event: 'tech_week_session_lookup_started',
    sessionId: body.session_id,
    userId,
    usingServiceRole: true,
    timestamp: new Date().toISOString(),
  });

  // Find the Tech Week session
  const { data: session, error: sessionError } = await supabase
    .schema('maity')
    .from('tech_week_sessions')
    .select('id, user_id, status, transcript, duration_seconds')
    .eq('id', body.session_id)
    .maybeSingle();

  if (sessionError || !session) {
    console.error({
      event: 'tech_week_session_lookup_failed',
      sessionId: body.session_id,
      userId,
      error: sessionError,
      errorCode: sessionError?.code,
      errorMessage: sessionError?.message,
      timestamp: new Date().toISOString(),
    });
    throw ApiError.notFound('Tech Week Session');
  }

  console.log({
    event: 'tech_week_session_lookup_success',
    sessionId: session.id,
    hasTranscript: !!session.transcript,
    status: session.status,
    timestamp: new Date().toISOString(),
  });

  // Verify session ownership (admins can evaluate any session)
  if (session.user_id !== userId && !isAdmin) {
    throw ApiError.forbidden('Session does not belong to user');
  }

  // Use session owner's userId for the evaluation record
  const sessionOwnerId = session.user_id;

  // Verify session has transcript
  if (!session.transcript) {
    throw ApiError.badRequest('Session has no transcript to evaluate');
  }

  // Parse transcript to structured format
  const transcript = parseTranscript(session.transcript);

  if (transcript.length === 0) {
    throw ApiError.badRequest('Session transcript could not be parsed');
  }

  console.log({
    event: 'tech_week_evaluation_request_received',
    sessionId: session.id,
    userId: sessionOwnerId,
    requestId,
    transcriptMessages: transcript.length,
    triggeredByAdmin: isAdmin && session.user_id !== userId,
    timestamp: new Date().toISOString(),
  });

  // Call OpenAI evaluation service with Tech Week context
  const evaluationResult = await evaluateRoleplaySession({
    scenario: 'Tech Week - Práctica de Presentaciones Técnicas',
    profile: 'Tech Week Coach',
    objective: 'Evaluar habilidades de presentación técnica, pitch y comunicación en contexto tecnológico. Analizar claridad, estructura, persuasión y manejo de temas técnicos.',
    transcript,
    sessionId: session.id,
    userId: sessionOwnerId,
  });

  // Calculate scores from evaluation result
  const scores = calculateScores(evaluationResult);
  const overallScore = scores.overallScore;
  const passed = scores.passed;

  // Add dimension_scores to result for frontend compatibility
  const fullResult = {
    ...evaluationResult,
    dimension_scores: {
      clarity: scores.claridad,
      structure: scores.estructura,
      connection: scores.alineacion,
      influence: scores.influencia,
    },
  };

  // Upsert evaluation in tech_week_evaluations table
  const { data: _evaluation, error: evalError } = await supabase
    .schema('maity')
    .from('tech_week_evaluations')
    .upsert({
      request_id: requestId,
      session_id: session.id,
      user_id: sessionOwnerId,
      status: 'complete',
      score: overallScore,
      passed,
      result: fullResult,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'request_id',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (evalError) {
    console.error('Error upserting Tech Week evaluation:', evalError);
    throw ApiError.database('Failed to save evaluation', evalError);
  }

  // Update session with scores and feedback
  const { error: updateError } = await supabase
    .schema('maity')
    .from('tech_week_sessions')
    .update({
      score: overallScore,
      passed,
      processed_feedback: fullResult,
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', session.id);

  if (updateError) {
    // Log error but don't throw - evaluation is already saved
    console.error('Error updating Tech Week session:', updateError);
  }

  console.log({
    event: 'tech_week_evaluation_saved',
    sessionId: session.id,
    userId: sessionOwnerId,
    requestId,
    score: overallScore,
    passed,
    timestamp: new Date().toISOString(),
  });

  // Return success response
  res.status(200).json({
    ok: true,
    evaluation: {
      request_id: requestId,
      score: overallScore,
      passed,
      result: fullResult,
    },
  });
}

// Export handler wrapped with error handler
export default withErrorHandler(handler);
