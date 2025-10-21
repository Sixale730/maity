/**
 * Evaluation Complete Endpoint
 *
 * Called by n8n after processing voice transcript evaluations.
 * Updates evaluation records and associated voice sessions with AI-generated feedback.
 *
 * Security: Validates n8n secret header for authentication.
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { setCors } from '../lib/cors.js';
import { ApiError, withErrorHandler, validateMethod } from '../../lib/types/api/errors.js';
import { getEnv } from '../../lib/types/api/common.js';
import { evaluationCompleteRequestSchema, EvaluationCompleteRequest } from '../../lib/types/api/schemas.js';
import { EvaluationDimension } from '../../lib/types/api/database.js';

/**
 * Calculate average score from evaluation dimension
 * Handles both old structure (Apertura/Desarrollo/Cierre) and new structure (dynamic fields)
 */
function calculateDimensionAverage(dimension: any): number {
  const scores: number[] = [];

  // Iterate over all properties in the dimension
  for (const [key, value] of Object.entries(dimension)) {
    // Skip non-score fields
    if (key === 'Puntuacion_Total' || key === 'Comentarios') continue;

    // Convert string to number if needed
    if (typeof value === 'string') {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        scores.push(numValue);
      }
    } else if (typeof value === 'number') {
      scores.push(value);
    }
  }

  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

/**
 * Calculate overall score from all dimensions
 */
function calculateOverallScore(evaluacion: any): number {
  const dimensions: number[] = [];

  if (evaluacion.Claridad) {
    dimensions.push(calculateDimensionAverage(evaluacion.Claridad));
  }
  if (evaluacion.Estructura) {
    dimensions.push(calculateDimensionAverage(evaluacion.Estructura));
  }
  if (evaluacion.Alineacion_Emocional) {
    dimensions.push(calculateDimensionAverage(evaluacion.Alineacion_Emocional));
  }
  if (evaluacion.Influencia) {
    dimensions.push(calculateDimensionAverage(evaluacion.Influencia));
  }

  if (dimensions.length === 0) return 0;
  return Math.round(dimensions.reduce((sum, score) => sum + score, 0) / dimensions.length);
}

/**
 * Handler for evaluation completion from n8n
 */
async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Handle CORS
  if (setCors(req, res)) return;

  // Validate method
  validateMethod(req.method, ['POST']);

  // Get environment variables
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  const n8nSecret = getEnv('N8N_BACKEND_SECRET');

  // Validate n8n secret
  const providedSecret = req.headers['x-n8n-secret'];
  if (!providedSecret || providedSecret !== n8nSecret) {
    console.error('[evaluation-complete] ❌ UNAUTHORIZED - Invalid or missing n8n secret');
    throw ApiError.unauthorized('Invalid or missing n8n secret');
  }

  console.log('[evaluation-complete] ✅ n8n authentication successful');

  // Parse and validate request body
  const body = evaluationCompleteRequestSchema.parse(req.body) as EvaluationCompleteRequest;
  const { request_id, status, result, error: errorMsg } = body;

  console.log('[evaluation-complete] 📝 Request details:', {
    request_id,
    status: status || 'complete',
    has_result: !!result,
    has_error: !!errorMsg,
  });

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Fetch evaluation from database
    console.log('[evaluation-complete] 🔍 Fetching evaluation...');
    const { data: evaluation, error: fetchError } = await supabase
      .schema('maity')
      .from('evaluations')
      .select('request_id, status, user_id, session_id')
      .eq('request_id', request_id)
      .maybeSingle();

    if (fetchError) {
      console.error('[evaluation-complete] ❌ Database fetch error:', fetchError);
      throw ApiError.database('Failed to fetch evaluation', fetchError);
    }

    if (!evaluation) {
      console.error('[evaluation-complete] ❌ Evaluation not found:', request_id);
      throw ApiError.notFound('Evaluation');
    }

    console.log('[evaluation-complete] ✅ Evaluation found:', {
      request_id: evaluation.request_id,
      currentStatus: evaluation.status,
      user_id: evaluation.user_id,
      session_id: evaluation.session_id || 'none',
    });

    // Idempotency check: only allow updates from pending or processing
    const allowedCurrentStatuses = ['pending', 'processing'];
    if (!allowedCurrentStatuses.includes(evaluation.status)) {
      console.warn(
        '[evaluation-complete] ⚠️ Attempted to update already finalized evaluation',
        {
          request_id,
          currentStatus: evaluation.status,
        }
      );
      res.status(409).json({
        error: 'ALREADY_FINALIZED',
        current_status: evaluation.status,
      });
      return;
    }

    // Calculate score from new evaluation structure
    let finalScore = result?.score || 0;
    let passed = false;

    if (result?.Evaluacion) {
      const overallScore = calculateOverallScore(result.Evaluacion);
      if (overallScore > 0) {
        finalScore = overallScore;
      }
      console.log('[evaluation-complete] 📊 Calculated scores:', {
        overall: overallScore,
        dimensions: {
          claridad: result.Evaluacion.Claridad
            ? calculateDimensionAverage(result.Evaluacion.Claridad)
            : null,
          estructura: result.Evaluacion.Estructura
            ? calculateDimensionAverage(result.Evaluacion.Estructura)
            : null,
          alineacion: result.Evaluacion.Alineacion_Emocional
            ? calculateDimensionAverage(result.Evaluacion.Alineacion_Emocional)
            : null,
          influencia: result.Evaluacion.Influencia
            ? calculateDimensionAverage(result.Evaluacion.Influencia)
            : null,
        },
      });
    }

    // Determine if evaluation passed (score >= 70)
    passed = finalScore >= 70;

    console.log('[evaluation-complete] ✅ Final evaluation result:', {
      score: finalScore,
      passed,
      threshold: 70,
    });

    // Update evaluation record
    const evaluationUpdate = {
      status: status || 'complete',
      score: finalScore,
      result: result || null,
      error_message: errorMsg || null,
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    };

    console.log('[evaluation-complete] 💾 Updating evaluation...');
    const { data: updatedEvaluation, error: updateError } = await supabase
      .schema('maity')
      .from('evaluations')
      .update(evaluationUpdate)
      .eq('request_id', request_id)
      .select()
      .single();

    if (updateError) {
      console.error('[evaluation-complete] ❌ Failed to update evaluation:', updateError);
      throw ApiError.database('Failed to update evaluation', updateError);
    }

    console.log('[evaluation-complete] ✅ Evaluation updated successfully');

    // Update associated voice_session if it exists
    if (evaluation.session_id) {
      console.log(
        '[evaluation-complete] 🔄 Updating associated voice_session:',
        evaluation.session_id
      );

      const { error: sessionUpdateError } = await supabase
        .schema('maity')
        .from('voice_sessions')
        .update({
          score: finalScore,
          passed: passed,
          processed_feedback: result || null,
          status: 'completed',
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', evaluation.session_id);

      if (sessionUpdateError) {
        console.error(
          '[evaluation-complete] ⚠️ Failed to update voice_session:',
          sessionUpdateError
        );
        // Don't throw - evaluation is already updated
      } else {
        console.log('[evaluation-complete] ✅ Voice session updated successfully', {
          session_id: evaluation.session_id,
          score: finalScore,
          passed,
        });
      }
    }

    console.log('[evaluation-complete] ✅ Process completed successfully');

    res.status(200).json({
      ok: true,
      evaluation: {
        request_id: updatedEvaluation.request_id,
        status: updatedEvaluation.status,
        score: updatedEvaluation.score,
        passed,
        updated_at: updatedEvaluation.updated_at,
        completed_at: updatedEvaluation.completed_at,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const err = error as Error;
    console.error('[evaluation-complete] ❌ Internal error:', {
      error: err.message,
      stack: err.stack,
    });
    throw ApiError.internal('Failed to complete evaluation', { message: err.message });
  }
}

export default withErrorHandler(handler);
