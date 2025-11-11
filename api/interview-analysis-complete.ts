/**
 * Interview Analysis Complete Endpoint
 *
 * Called by n8n after processing interview transcript analysis.
 * Updates interview evaluation records with AI-generated text analysis.
 *
 * Security: Validates n8n secret header for authentication.
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { setCors } from '../lib/cors';
import { ApiError, withErrorHandler, validateMethod } from '../lib/types/api/errors';
import { getEnv } from '../lib/types/api/common';
import { z } from 'zod';

/**
 * Schema for structured interview analysis fields from n8n
 */
const RecomendacionSchema = z.object({
  Area: z.string().optional(),
  Situacion_Actual: z.string().optional(),
  Recomendacion_Especifica: z.string().optional(),
  Ejemplo_de_Mejora: z.string().optional(),
});

const PatronesObservadosSchema = z.object({
  Positivos: z.array(z.string()).optional(),
  A_Trabajar: z.array(z.string()).optional(),
});

/**
 * Request schema for interview analysis completion
 * Supports both legacy (analysis_text) and new structured format
 */
const interviewAnalysisCompleteRequestSchema = z.object({
  request_id: z.string().uuid(),
  status: z.enum(['complete', 'error']).optional(),

  // Legacy format (backwards compatible)
  analysis_text: z.string().optional(),
  interviewee_name: z.string().optional(),

  // New structured format (optional)
  Recomendaciones_Prioritarias: z.array(RecomendacionSchema).optional(),
  Patrones_Observados: PatronesObservadosSchema.optional(),
  Conclusion_General: z.string().optional(),
  Siguiente_Paso_Sugerido: z.string().optional(),

  // Error handling
  error: z.string().optional(),
});

type InterviewAnalysisCompleteRequest = z.infer<typeof interviewAnalysisCompleteRequestSchema>;

/**
 * Handler for interview analysis completion from n8n
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
    console.error('[interview-analysis-complete] ❌ UNAUTHORIZED - Invalid or missing n8n secret');
    throw ApiError.unauthorized('Invalid or missing n8n secret');
  }

  console.log('[interview-analysis-complete] ✅ n8n authentication successful');

  // Parse and validate request body
  const body = interviewAnalysisCompleteRequestSchema.parse(req.body) as InterviewAnalysisCompleteRequest;
  const {
    request_id,
    status,
    analysis_text,
    interviewee_name,
    Recomendaciones_Prioritarias,
    Patrones_Observados,
    Conclusion_General,
    Siguiente_Paso_Sugerido,
    error: errorMsg
  } = body;

  console.log('[interview-analysis-complete] 📝 Request details:', {
    request_id,
    status: status || 'complete',
    has_analysis: !!analysis_text,
    has_interviewee_name: !!interviewee_name,
    has_structured_data: !!(Recomendaciones_Prioritarias || Patrones_Observados),
    has_error: !!errorMsg,
  });

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Fetch evaluation from interview_evaluations table
    console.log('[interview-analysis-complete] 🔍 Fetching interview evaluation...');
    const { data: evaluation, error: fetchError } = await supabase
      .schema('maity')
      .from('interview_evaluations')
      .select('request_id, status, user_id, session_id')
      .eq('request_id', request_id)
      .maybeSingle();

    if (fetchError) {
      console.error('[interview-analysis-complete] ❌ Database fetch error:', fetchError);
      throw ApiError.database('Failed to fetch interview evaluation', fetchError);
    }

    if (!evaluation) {
      console.error('[interview-analysis-complete] ❌ Interview evaluation not found', {
        request_id,
        possible_causes: [
          'Evaluation was never created in database',
          'Frontend sent webhook before evaluation commit',
          'RPC function failed silently',
        ]
      });
      throw ApiError.notFound('Interview evaluation');
    }

    console.log('[interview-analysis-complete] ✅ Interview evaluation found:', {
      request_id: evaluation.request_id,
      currentStatus: evaluation.status,
      user_id: evaluation.user_id,
      session_id: evaluation.session_id,
    });

    // Idempotency check: only allow updates from pending or processing
    const allowedCurrentStatuses = ['pending', 'processing'];
    if (!allowedCurrentStatuses.includes(evaluation.status)) {
      console.warn(
        '[interview-analysis-complete] ⚠️ Attempted to update already finalized evaluation',
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

    // Update interview evaluation record
    const evaluationUpdate = {
      status: status || 'complete',
      analysis_text: analysis_text || null,
      interviewee_name: interviewee_name || null,
      // Structured analysis fields (new format)
      recomendaciones_prioritarias: Recomendaciones_Prioritarias || null,
      patrones_observados: Patrones_Observados || null,
      conclusion_general: Conclusion_General || null,
      siguiente_paso_sugerido: Siguiente_Paso_Sugerido || null,
      // Error handling
      error_message: errorMsg || null,
      updated_at: new Date().toISOString(),
    };

    console.log('[interview-analysis-complete] 💾 Updating interview_evaluations...');
    const { data: updatedEvaluation, error: updateError } = await supabase
      .schema('maity')
      .from('interview_evaluations')
      .update(evaluationUpdate)
      .eq('request_id', request_id)
      .select()
      .single();

    if (updateError) {
      console.error('[interview-analysis-complete] ❌ Failed to update interview_evaluations:', updateError);
      throw ApiError.database('Failed to update interview_evaluations', updateError);
    }

    console.log('[interview-analysis-complete] ✅ interview_evaluations updated successfully');

    // Update associated interview session
    console.log(
      '[interview-analysis-complete] 🔄 Updating associated interview_sessions:',
      evaluation.session_id
    );

    const { error: sessionUpdateError } = await supabase
      .schema('maity')
      .from('interview_sessions')
      .update({
        status: status === 'error' ? 'cancelled' : 'completed',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', evaluation.session_id);

    if (sessionUpdateError) {
      console.error(
        '[interview-analysis-complete] ⚠️ Failed to update interview_sessions:',
        sessionUpdateError
      );
      // Don't throw - evaluation is already updated
    } else {
      console.log('[interview-analysis-complete] ✅ interview_sessions updated successfully', {
        session_id: evaluation.session_id,
      });
    }

    console.log('[interview-analysis-complete] ✅ Process completed successfully');

    res.status(200).json({
      ok: true,
      evaluation: {
        request_id: updatedEvaluation.request_id,
        status: updatedEvaluation.status,
        has_analysis: !!updatedEvaluation.analysis_text,
        interviewee_name: updatedEvaluation.interviewee_name,
        updated_at: updatedEvaluation.updated_at,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const err = error as Error;
    console.error('[interview-analysis-complete] ❌ Internal error:', {
      error: err.message,
      stack: err.stack,
    });
    throw ApiError.internal('Failed to complete interview analysis', { message: err.message });
  }
}

export default withErrorHandler(handler);
