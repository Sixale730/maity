import { supabase } from '../../api/client/supabase';
import {
  InterviewSession,
  InterviewEvaluation,
  InterviewSessionWithEvaluation,
  InterviewSessionDetails,
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
    const { data, error } = await supabase.rpc('create_interview_evaluation', {
      p_session_id: sessionId,
      p_user_id: userId,
    });

    if (error) {
      console.error('Error creating interview evaluation:', error);
      throw error;
    }

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
}
