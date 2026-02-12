/**
 * Consolidated Evaluate Endpoint
 *
 * Routes evaluation requests to the appropriate handler based on `type`:
 * - roleplay: Evaluates roleplay sessions (voice_sessions → evaluations)
 * - coach: Evaluates coach sessions (voice_sessions → evaluations)
 * - diagnostic: Evaluates diagnostic interviews (voice_sessions → diagnostic_interviews)
 * - tech_week: Evaluates Tech Week sessions (tech_week_sessions → tech_week_evaluations)
 *
 * Features:
 * - Synchronous evaluation (3-10s response time)
 * - Rate limiting (5 eval/min, 50 eval/day per user)
 * - Retry logic with exponential backoff
 * - Comprehensive logging
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

const evaluateSchema = z.object({
  session_id: z.string().uuid('Invalid session ID format'),
  request_id: z.string().uuid('Invalid request ID format').optional(),
  type: z.enum(['roleplay', 'coach', 'diagnostic', 'tech_week']),
});

type EvaluateRequest = z.infer<typeof evaluateSchema>;

// ============================================================================
// RATE LIMITING
// ============================================================================

async function checkRateLimits(
  supabase: any,
  userId: string,
  table: string
): Promise<void> {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // 1. Rate limit per minute (5 evaluations/min)
  const { count: countPerMinute, error: minuteError } = await supabase
    .schema('maity')
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneMinuteAgo.toISOString());

  if (minuteError) {
    console.error('Error checking minute rate limit:', minuteError);
  }

  if (countPerMinute && countPerMinute >= 5) {
    throw ApiError.tooManyRequests(
      'Límite de 5 evaluaciones por minuto excedido. Espera un momento antes de intentar de nuevo.'
    );
  }

  // 2. Daily quota (50 evaluations/day)
  const { count: countPerDay, error: dayError } = await supabase
    .schema('maity')
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneDayAgo.toISOString());

  if (dayError) {
    console.error('Error checking daily rate limit:', dayError);
  }

  if (countPerDay && countPerDay >= 50) {
    throw ApiError.tooManyRequests(
      'Límite diario de 50 evaluaciones excedido. Intenta de nuevo mañana.'
    );
  }
}

// ============================================================================
// AUTHENTICATE USER
// ============================================================================

async function authenticateUser(
  req: VercelRequest,
  supabase: any
): Promise<{ userId: string; isAdmin: boolean }> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or invalid authorization header');
  }
  const accessToken = authHeader.substring(7);

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser(accessToken);

  if (authError || !authUser) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

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

  // Check admin role (needed for tech_week)
  const { data: userRoles } = await supabase.rpc('get_user_role', {
    p_user_id: maityUser.id,
  });
  const isAdmin = userRoles === 'admin';

  return { userId: maityUser.id, isAdmin };
}

// ============================================================================
// HANDLER: ROLEPLAY / COACH
// ============================================================================

async function handleRoleplayOrCoach(
  supabase: any,
  body: EvaluateRequest,
  userId: string
): Promise<any> {
  await checkRateLimits(supabase, userId, 'evaluations');

  const requestId = body.request_id || crypto.randomUUID();

  // Fetch voice session
  const { data: basicSession, error: basicError } = await supabase
    .schema('maity')
    .from('voice_sessions')
    .select('id, user_id, status, raw_transcript, profile_scenario_id')
    .eq('id', body.session_id)
    .maybeSingle();

  if (basicError || !basicSession) {
    throw ApiError.notFound('Session');
  }

  if (basicSession.user_id !== userId) {
    throw ApiError.forbidden('Session does not belong to user');
  }

  if (!basicSession.raw_transcript) {
    throw ApiError.badRequest('Session has no transcript to evaluate');
  }

  const transcript = parseTranscript(basicSession.raw_transcript);
  if (transcript.length === 0) {
    throw ApiError.badRequest('Session transcript could not be parsed');
  }

  const isCoachSession =
    body.type === 'coach' || !basicSession.profile_scenario_id;

  let evaluationResult: any;
  let overallScore: number;
  let passed: boolean;

  if (isCoachSession) {
    const coachResult = await evaluateDiagnosticInterview({
      transcript,
      sessionId: basicSession.id,
      userId,
    });

    evaluationResult = coachResult;
    passed = coachResult.is_complete;
    overallScore = passed ? 100 : 0;
  } else {
    // Fetch with JOINs for roleplay metadata
    const { data: roleplaySession, error: roleplayError } = await supabase
      .schema('maity')
      .from('voice_sessions')
      .select(
        `
        *,
        profile_scenario:voice_profile_scenarios!profile_scenario_id(
          profile:voice_agent_profiles!profile_id(name),
          scenario:voice_scenarios!scenario_id(name, objectives)
        )
      `
      )
      .eq('id', body.session_id)
      .maybeSingle();

    if (roleplayError || !roleplaySession) {
      throw ApiError.notFound('Session with scenario metadata');
    }

    const profile =
      roleplaySession.profile_scenario?.profile?.name || 'Coach Maity';
    const scenario =
      roleplaySession.profile_scenario?.scenario?.name || 'Coaching Session';
    const objective =
      roleplaySession.profile_scenario?.scenario?.objectives ||
      'Mejorar habilidades de comunicación general, desarrollar confianza y claridad en la expresión de ideas';

    const roleplayResult = await evaluateRoleplaySession({
      scenario,
      profile,
      objective,
      transcript,
      sessionId: basicSession.id,
      userId,
    });

    const scores = calculateScores(roleplayResult);
    overallScore = scores.overallScore;
    passed = scores.passed;

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

  // Upsert evaluation
  const { error: evalError } = await supabase
    .schema('maity')
    .from('evaluations')
    .upsert(
      {
        request_id: requestId,
        session_id: basicSession.id,
        user_id: userId,
        status: 'complete',
        result: evaluationResult,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'request_id', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (evalError) {
    console.error('Error upserting evaluation:', evalError);
    throw ApiError.database('Failed to save evaluation', evalError);
  }

  // Update session
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
    .eq('id', basicSession.id);

  if (updateError) {
    console.error('Error updating session:', updateError);
  }

  return {
    ok: true,
    evaluation: {
      request_id: requestId,
      score: overallScore,
      passed,
      result: evaluationResult,
    },
  };
}

// ============================================================================
// HANDLER: DIAGNOSTIC
// ============================================================================

async function handleDiagnostic(
  supabase: any,
  body: EvaluateRequest,
  userId: string
): Promise<any> {
  await checkRateLimits(supabase, userId, 'diagnostic_interviews');

  // Get voice session (Coach sessions have no profile_scenario_id)
  const { data: session, error: sessionError } = await supabase
    .schema('maity')
    .from('voice_sessions')
    .select('id, user_id, raw_transcript, profile_scenario_id')
    .eq('id', body.session_id)
    .is('profile_scenario_id', null)
    .maybeSingle();

  if (sessionError || !session) {
    throw ApiError.notFound('Coach session');
  }

  if (session.user_id !== userId) {
    throw ApiError.forbidden('Session does not belong to user');
  }

  if (!session.raw_transcript) {
    throw ApiError.badRequest('Session has no transcript to evaluate');
  }

  const transcript = parseTranscript(session.raw_transcript);
  if (transcript.length === 0) {
    throw ApiError.badRequest('Session transcript could not be parsed');
  }

  const evaluationResult = await evaluateDiagnosticInterview({
    transcript,
    sessionId: session.id,
    userId,
  });

  // Save diagnostic interview
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

  return {
    ok: true,
    interview: {
      id: interview.id,
      session_id: session.id,
      rubrics: evaluationResult.rubrics,
      amazing_comment: evaluationResult.amazing_comment,
      summary: evaluationResult.summary,
      is_complete: evaluationResult.is_complete,
    },
  };
}

// ============================================================================
// HANDLER: TECH WEEK
// ============================================================================

async function handleTechWeek(
  supabase: any,
  body: EvaluateRequest,
  userId: string,
  isAdmin: boolean
): Promise<any> {
  await checkRateLimits(supabase, userId, 'tech_week_evaluations');

  const requestId = body.request_id || crypto.randomUUID();

  // Find Tech Week session
  const { data: session, error: sessionError } = await supabase
    .schema('maity')
    .from('tech_week_sessions')
    .select('id, user_id, status, transcript, duration_seconds')
    .eq('id', body.session_id)
    .maybeSingle();

  if (sessionError || !session) {
    throw ApiError.notFound('Tech Week Session');
  }

  // Verify ownership (admins can evaluate any session)
  if (session.user_id !== userId && !isAdmin) {
    throw ApiError.forbidden('Session does not belong to user');
  }

  const sessionOwnerId = session.user_id;

  if (!session.transcript) {
    throw ApiError.badRequest('Session has no transcript to evaluate');
  }

  const transcript = parseTranscript(session.transcript);
  if (transcript.length === 0) {
    throw ApiError.badRequest('Session transcript could not be parsed');
  }

  // Evaluate with Tech Week context
  const evaluationResult = await evaluateRoleplaySession({
    scenario: 'Tech Week - Práctica de Presentaciones Técnicas',
    profile: 'Tech Week Coach',
    objective:
      'Evaluar habilidades de presentación técnica, pitch y comunicación en contexto tecnológico. Analizar claridad, estructura, persuasión y manejo de temas técnicos.',
    transcript,
    sessionId: session.id,
    userId: sessionOwnerId,
  });

  const scores = calculateScores(evaluationResult);
  const overallScore = scores.overallScore;
  const passed = scores.passed;

  const fullResult = {
    ...evaluationResult,
    dimension_scores: {
      clarity: scores.claridad,
      structure: scores.estructura,
      connection: scores.alineacion,
      influence: scores.influencia,
    },
  };

  // Upsert Tech Week evaluation
  const { error: evalError } = await supabase
    .schema('maity')
    .from('tech_week_evaluations')
    .upsert(
      {
        request_id: requestId,
        session_id: session.id,
        user_id: sessionOwnerId,
        status: 'complete',
        score: overallScore,
        passed,
        result: fullResult,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'request_id', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (evalError) {
    console.error('Error upserting Tech Week evaluation:', evalError);
    throw ApiError.database('Failed to save evaluation', evalError);
  }

  // Update session
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
    console.error('Error updating Tech Week session:', updateError);
  }

  return {
    ok: true,
    evaluation: {
      request_id: requestId,
      score: overallScore,
      passed,
      result: fullResult,
    },
  };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (setCors(req, res)) return;
  validateMethod(req.method, ['POST']);

  let body: EvaluateRequest;
  try {
    body = evaluateSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid request body', error.errors);
    }
    throw error;
  }

  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'maity' },
  });

  const { userId, isAdmin } = await authenticateUser(req, supabase);

  console.log({
    event: 'evaluate_request',
    type: body.type,
    sessionId: body.session_id,
    userId,
    isAdmin,
    timestamp: new Date().toISOString(),
  });

  let result: any;

  switch (body.type) {
    case 'roleplay':
    case 'coach':
      result = await handleRoleplayOrCoach(supabase, body, userId);
      break;
    case 'diagnostic':
      result = await handleDiagnostic(supabase, body, userId);
      break;
    case 'tech_week':
      result = await handleTechWeek(supabase, body, userId, isAdmin);
      break;
  }

  res.status(200).json(result);
}

export default withErrorHandler(handler);
