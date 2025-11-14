/**
 * Evaluate Session Endpoint
 *
 * Evaluates a roleplay session using OpenAI directly.
 * Replaces the n8n webhook-based evaluation system.
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
  evaluateDiagnosticInterview,
  parseTranscript,
  calculateScores,
} from '../lib/services/openai.service.js';

// ============================================================================
// SCHEMAS
// ============================================================================

const evaluateSessionSchema = z.object({
  session_id: z.string().uuid('Invalid session ID format'),
  request_id: z.string().uuid('Invalid request ID format').optional(),
});

type EvaluateSessionRequest = z.infer<typeof evaluateSessionSchema>;

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
    .from('evaluations')
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
    .from('evaluations')
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
  let body: EvaluateSessionRequest;
  try {
    body = evaluateSessionSchema.parse(req.body);
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
    event: 'session_lookup_started',
    sessionId: body.session_id,
    userId,
    usingServiceRole: true,
    timestamp: new Date().toISOString(),
  });

  // First, try to find the session without joins to verify it exists
  const { data: basicSession, error: basicError } = await supabase
    .schema('maity')
    .from('voice_sessions')
    .select('id, user_id, status, raw_transcript, profile_scenario_id')
    .eq('id', body.session_id)
    .maybeSingle();

  console.log({
    event: 'basic_session_lookup',
    found: !!basicSession,
    basicError,
    basicSessionId: basicSession?.id,
    basicSessionUserId: basicSession?.user_id,
    hasTranscript: !!basicSession?.raw_transcript,
    profileScenarioId: basicSession?.profile_scenario_id,
    isCoachSession: !basicSession?.profile_scenario_id,
  });

  // Check if basicSession was found
  if (basicError || !basicSession) {
    console.error({
      event: 'session_lookup_failed',
      sessionId: body.session_id,
      userId,
      error: basicError,
      errorCode: basicError?.code,
      errorMessage: basicError?.message,
      timestamp: new Date().toISOString(),
    });
    throw ApiError.notFound('Session');
  }

  // For Coach sessions (no profile_scenario_id), use basicSession directly
  // For Roleplay sessions, fetch with JOINs to get scenario metadata
  let session: any;

  if (!basicSession.profile_scenario_id) {
    // Coach session - no JOINs needed, use basicSession
    console.log({
      event: 'coach_session_detected',
      sessionId: basicSession.id,
      message: 'Using simplified query for Coach session',
      timestamp: new Date().toISOString(),
    });

    session = {
      ...basicSession,
      profile_scenario: null, // No scenario for Coach sessions
    };
  } else {
    // Roleplay session - fetch with JOINs to get metadata
    console.log({
      event: 'roleplay_session_detected',
      sessionId: basicSession.id,
      profileScenarioId: basicSession.profile_scenario_id,
      message: 'Using JOIN query for Roleplay session',
      timestamp: new Date().toISOString(),
    });

    const { data: roleplaySession, error: roleplayError } = await supabase
      .schema('maity')
      .from('voice_sessions')
      .select(
        `
        *,
        profile_scenario:voice_profile_scenarios!left(
          profile:voice_agent_profiles(name),
          scenario:voice_scenarios(name, objectives)
        )
      `
      )
      .eq('id', body.session_id)
      .maybeSingle();

    if (roleplayError || !roleplaySession) {
      console.error({
        event: 'roleplay_session_lookup_failed',
        sessionId: body.session_id,
        userId,
        error: roleplayError,
        errorCode: roleplayError?.code,
        errorMessage: roleplayError?.message,
        timestamp: new Date().toISOString(),
      });
      throw ApiError.notFound('Session with scenario metadata');
    }

    session = roleplaySession;
  }

  console.log({
    event: 'session_lookup_success',
    sessionId: session.id,
    hasProfileScenario: !!session.profile_scenario,
    hasTranscript: !!session.raw_transcript,
    status: session.status,
    isCoachSession: !session.profile_scenario_id,
    timestamp: new Date().toISOString(),
  });

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

  // Determine if this is a Coach session (no profile_scenario_id)
  const isCoachSession = !session.profile_scenario_id;

  console.log({
    event: 'evaluation_request_received',
    sessionId: session.id,
    userId,
    requestId,
    transcriptMessages: transcript.length,
    isCoachSession,
    timestamp: new Date().toISOString(),
  });

  // Call appropriate evaluation service based on session type
  let evaluationResult: any;
  let overallScore: number;
  let passed: boolean;

  if (isCoachSession) {
    // Coach evaluation - different format and criteria
    console.log({
      event: 'evaluating_coach_session',
      sessionId: session.id,
      timestamp: new Date().toISOString(),
    });

    const coachResult = await evaluateDiagnosticInterview({
      transcript,
      sessionId: session.id,
      userId,
    });

    evaluationResult = coachResult;

    // For Coach sessions, "passed" means the interview is complete
    passed = coachResult.is_complete;
    // Score is not applicable for Coach sessions, but we set a value for DB
    overallScore = passed ? 100 : 0;

    console.log({
      event: 'coach_evaluation_result',
      sessionId: session.id,
      is_complete: coachResult.is_complete,
      has_amazing_comment: !!coachResult.amazing_comment,
      timestamp: new Date().toISOString(),
    });
  } else {
    // Roleplay evaluation - existing logic
    const profile = session.profile_scenario?.profile?.name || 'Coach Maity';
    const scenario = session.profile_scenario?.scenario?.name || 'Coaching Session';
    const objective = session.profile_scenario?.scenario?.objectives ||
      'Mejorar habilidades de comunicación general, desarrollar confianza y claridad en la expresión de ideas';

    console.log({
      event: 'evaluating_roleplay_session',
      sessionId: session.id,
      profile,
      scenario,
      timestamp: new Date().toISOString(),
    });

    const roleplayResult = await evaluateRoleplaySession({
      scenario,
      profile,
      objective,
      transcript,
      sessionId: session.id,
      userId,
    });

    // Calculate scores from evaluation result
    const scores = calculateScores(roleplayResult);
    overallScore = scores.overallScore;
    passed = scores.passed;

    // Add dimension_scores to result for frontend compatibility
    evaluationResult = {
      ...roleplayResult,
      dimension_scores: {
        clarity: scores.claridad,
        structure: scores.estructura,
        connection: scores.alineacion,
        influence: scores.influencia,
      },
    };
  }

  // Update evaluation in database (frontend already created it)
  const { data: _evaluation, error: evalError } = await supabase
    .schema('maity')
    .from('evaluations')
    .update({
      status: 'complete',
      result: evaluationResult,
      updated_at: new Date().toISOString(),
    })
    .eq('request_id', requestId)
    .select()
    .single();

  if (evalError) {
    console.error('Error updating evaluation:', evalError);
    throw ApiError.database('Failed to save evaluation', evalError);
  }

  // Update session with scores and feedback
  const { error: updateError } = await supabase
    .schema('maity')
    .from('voice_sessions')
    .update({
      score: overallScore,
      passed,
      processed_feedback: evaluationResult,
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', session.id);

  if (updateError) {
    // Log error but don't throw - evaluation is already saved
    console.error('Error updating session:', updateError);
  }

  console.log({
    event: 'evaluation_saved',
    sessionId: session.id,
    userId,
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
      result: evaluationResult,
    },
  });
}

// Export handler wrapped with error handler
export default withErrorHandler(handler);
