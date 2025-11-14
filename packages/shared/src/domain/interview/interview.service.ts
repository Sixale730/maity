import { supabase } from '../../api/client/supabase';
import { AuthService } from '../auth/auth.service';
import {
  InterviewSession,
  InterviewEvaluation,
  InterviewSessionWithEvaluation,
  InterviewSessionDetails,
  InterviewRadarScores,
} from './interview.types';

/**
 * Service for managing interview sessions and evaluations
 * Encapsulates business logic for interview analysis system
 */
export class InterviewService {
  /**
   * Create a new interview evaluation
   * Uses the create_interview_evaluation RPC function
   * @param sessionId - Interview session UUID
   * @param userId - User's UUID from maity.users table
   * @returns Promise with request_id for tracking n8n workflow
   */
  static async createEvaluation(sessionId: string, userId: string): Promise<string> {
    console.log('🔧 Calling RPC create_interview_evaluation:', { sessionId, userId });
    const { data, error } = await supabase.rpc('create_interview_evaluation', {
      p_session_id: sessionId,
      p_user_id: userId,
    });

    if (error) {
      console.error('❌ RPC Error creating interview evaluation:', error);
      throw error;
    }

    console.log('✅ RPC returned requestId:', data);
    return data as string;
  }

  /**
   * Get interview sessions history
   * Uses the get_interview_sessions_history RPC function
   * @param userId - Optional user ID to filter by (admins can see all)
   * @returns Promise with array of interview sessions with evaluation data
   */
  static async getSessionHistory(
    userId?: string | null
  ): Promise<InterviewSessionWithEvaluation[]> {
    const { data, error } = await supabase.rpc('get_interview_sessions_history', {
      p_user_id: userId || null,
    });

    if (error) {
      console.error('Error getting interview sessions history:', error);
      throw error;
    }

    return (data as InterviewSessionWithEvaluation[]) || [];
  }

  /**
   * Get a specific interview session by ID
   * @param sessionId - Interview session UUID
   * @returns Promise with interview session data
   */
  static async getSessionById(sessionId: string): Promise<InterviewSession | null> {
    const { data, error } = await supabase
      .schema('maity')
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (error) {
      console.error('Error getting interview session:', error);
      throw error;
    }

    return data as InterviewSession | null;
  }

  /**
   * Get a specific interview session with its evaluation and user details
   * Used for the results page
   * @param sessionId - Interview session UUID
   * @returns Promise with complete session details including evaluation
   */
  static async getSessionWithEvaluation(
    sessionId: string
  ): Promise<InterviewSessionDetails | null> {
    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .schema('maity')
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionError) {
      console.error('Error getting interview session:', sessionError);
      throw sessionError;
    }

    if (!session) {
      return null;
    }

    // Fetch evaluation if exists
    let evaluation: InterviewEvaluation | null = null;
    if (session.evaluation_id) {
      const { data: evalData, error: evalError } = await supabase
        .schema('maity')
        .from('interview_evaluations')
        .select('*')
        .eq('request_id', session.evaluation_id)
        .maybeSingle();

      if (evalError) {
        console.error('Error getting interview evaluation:', evalError);
        // Don't throw - session exists, evaluation might not
      } else {
        evaluation = evalData as InterviewEvaluation | null;
      }
    }

    // Fetch user details with company
    const { data: userData, error: userError } = await supabase
      .schema('maity')
      .from('users')
      .select('id, name, email, companies(name)')
      .eq('id', session.user_id)
      .maybeSingle();

    if (userError) {
      console.error('Error getting user data:', userError);
      // Don't throw - we can still show session without user details
    }

    return {
      ...(session as InterviewSession),
      evaluation,
      user: userData ? {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        company_name: (userData as any).companies?.name || null,
      } : undefined,
    };
  }

  /**
   * Get interview evaluation by request ID
   * @param requestId - Evaluation request UUID
   * @returns Promise with interview evaluation data
   */
  static async getEvaluationByRequestId(
    requestId: string
  ): Promise<InterviewEvaluation | null> {
    const { data, error } = await supabase
      .schema('maity')
      .from('interview_evaluations')
      .select('*')
      .eq('request_id', requestId)
      .maybeSingle();

    if (error) {
      console.error('Error getting interview evaluation:', error);
      throw error;
    }

    return data as InterviewEvaluation | null;
  }

  /**
   * Update interview session
   * @param sessionId - Interview session UUID
   * @param updates - Partial session data to update
   * @returns Promise with updated session data
   */
  static async updateSession(
    sessionId: string,
    updates: Partial<InterviewSession>
  ): Promise<InterviewSession | null> {
    const { data, error } = await supabase
      .schema('maity')
      .from('interview_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating interview session:', error);
      throw error;
    }

    return data as InterviewSession | null;
  }

  /**
   * Trigger manual evaluation of an interview session (admin feature)
   * Creates a new evaluation record and calls OpenAI API synchronously
   * @param sessionId - Interview session UUID
   * @returns Promise with evaluation result
   */
  static async triggerManualEvaluation(sessionId: string): Promise<{
    success: boolean;
    evaluation?: any;
    error?: string;
  }> {
    try {
      // Get current user's auth session
      const authSession = await AuthService.getSession();
      if (!authSession?.access_token) {
        throw new Error('No authentication token found');
      }

      // Get current user's ID
      const authUser = await AuthService.getUser();
      if (!authUser) {
        throw new Error('User not authenticated');
      }

      // Get maity user ID
      const { data: maityUser, error: userError } = await supabase
        .schema('maity')
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .single();

      if (userError || !maityUser) {
        throw new Error('Failed to get user profile');
      }

      // Create new evaluation record
      console.log('🔍 Creating evaluation:', { sessionId, userId: maityUser.id });
      const requestId = await InterviewService.createEvaluation(sessionId, maityUser.id);
      console.log('✅ Evaluation created with requestId:', requestId);

      // Get API URL from environment
      const apiUrl = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      // Call evaluation endpoint
      console.log('🌐 Calling evaluation endpoint:', { apiUrl, sessionId, requestId });
      const response = await fetch(`${apiUrl}/api/evaluate-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession.access_token}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          request_id: requestId,
        }),
      });
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Evaluation failed:', { status: response.status, errorData });
        let errorMessage = 'Error al evaluar la entrevista';

        if (response.status === 400) {
          errorMessage = errorData.error || 'La entrevista no es válida para evaluación.';
        } else if (response.status === 401) {
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (response.status === 404) {
          errorMessage = 'La sesión de entrevista no fue encontrada.';
        } else if (response.status === 429) {
          errorMessage = 'Límite de evaluaciones alcanzado. Intenta más tarde.';
        } else if (response.status === 500) {
          errorMessage = 'Error del servidor al procesar la evaluación.';
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      const result = await response.json();

      return {
        success: true,
        evaluation: result.evaluation,
      };
    } catch (error) {
      console.error('Error triggering manual evaluation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al evaluar la entrevista',
      };
    }
  }

  /**
   * Extract rubric scores for Radar Chart comparison
   * Converts 1-5 scale to 0-100 for visualization
   * @param evaluation - Interview evaluation data
   * @returns Object with scores for each rubric (0-100 scale)
   */
  static extractRadarScores(evaluation: InterviewEvaluation | null): InterviewRadarScores {
    if (!evaluation?.rubrics) {
      return {
        claridad: 0,
        adaptacion: 0,
        persuasion: 0,
        estructura: 0,
        proposito: 0,
        empatia: 0,
      };
    }

    const rubrics = evaluation.rubrics;

    return {
      claridad: (rubrics.claridad?.score ?? 0) * 20, // 1-5 → 0-100
      adaptacion: (rubrics.adaptacion?.score ?? 0) * 20,
      persuasion: (rubrics.persuasion?.score ?? 0) * 20,
      estructura: (rubrics.estructura?.score ?? 0) * 20,
      proposito: (rubrics.proposito?.score ?? 0) * 20,
      empatia: (rubrics.empatia?.score ?? 0) * 20,
    };
  }
}
