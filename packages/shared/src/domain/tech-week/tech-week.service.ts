import { supabase } from '../../api/client/supabase';

/**
 * Type for Tech Week session update data
 */
export interface TechWeekSessionUpdate {
  ended_at?: string;
  status?: string;
  transcript?: string;
  duration_seconds?: number;
  score?: number;
  passed?: boolean;
  processed_feedback?: unknown;
  session_metadata?: unknown;
}

/**
 * Service for managing Tech Week sessions and evaluations
 * Encapsulates business logic for Tech Week voice practice sessions
 *
 * NOTE: Tech Week uses isolated tables (tech_week_sessions, tech_week_evaluations)
 * separate from the roleplay system (voice_sessions, evaluations)
 */
export class TechWeekService {
  /**
   * Create a new Tech Week session for a user
   * Uses the create_tech_week_session RPC function
   * @param userId - User's UUID from maity.users table
   * @returns Promise with session ID (UUID)
   */
  static async createSession(userId: string): Promise<string | null> {
    const { data, error } = await supabase.rpc('create_tech_week_session', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error creating Tech Week session:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get all Tech Week sessions for a user
   * @param userId - User's UUID from maity.users table
   * @param limit - Optional limit for results
   * @returns Promise with array of Tech Week sessions
   */
  static async getSessions(userId: string, limit?: number): Promise<unknown[] | null> {
    let query = supabase
      .schema('maity')
      .from('tech_week_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching Tech Week sessions:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get all Tech Week sessions (admin only)
   * Returns sessions with user information
   * @param limit - Optional limit for results
   * @returns Promise with array of Tech Week sessions with user info
   */
  static async getAllSessions(limit?: number): Promise<unknown[] | null> {
    let query = supabase
      .schema('maity')
      .from('tech_week_sessions')
      .select(`
        *,
        user:users!tech_week_sessions_user_id_fkey (
          id,
          name,
          email
        )
      `)
      .order('started_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching all Tech Week sessions:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get a specific Tech Week session by ID with user information
   * Uses RPC function that respects RLS policies
   * @param sessionId - Session UUID
   * @returns Promise with session data including user info
   */
  static async getSessionById(sessionId: string): Promise<unknown> {
    const { data, error } = await supabase.rpc('get_tech_week_session_by_id', {
      p_session_id: sessionId
    });

    if (error) {
      console.error('Error fetching Tech Week session:', error);
      throw error;
    }

    // RPC returns array, get first element
    return data && data.length > 0 ? data[0] : null;
  }

  /**
   * Update a Tech Week session
   * @param sessionId - Session UUID
   * @param updates - Fields to update
   * @returns Promise with updated session
   */
  static async updateSession(
    sessionId: string,
    updates: TechWeekSessionUpdate
  ): Promise<unknown> {
    const { data, error } = await supabase
      .schema('maity')
      .from('tech_week_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating Tech Week session:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create a Tech Week evaluation request
   * Uses the create_tech_week_evaluation RPC function
   * @param sessionId - Session UUID
   * @param userId - User's UUID from maity.users table
   * @returns Promise with request_id (UUID) for n8n tracking
   */
  static async createEvaluation(
    sessionId: string,
    userId: string
  ): Promise<string | null> {
    const { data, error } = await supabase.rpc('create_tech_week_evaluation', {
      p_session_id: sessionId,
      p_user_id: userId
    });

    if (error) {
      console.error('Error creating Tech Week evaluation:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get evaluation for a Tech Week session
   * @param sessionId - Session UUID
   * @returns Promise with evaluation data (null if not found)
   */
  static async getEvaluationBySessionId(sessionId: string): Promise<unknown> {
    const { data, error } = await supabase
      .schema('maity')
      .from('tech_week_evaluations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching Tech Week evaluation:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get evaluation by request_id (for realtime updates)
   * @param requestId - Request UUID
   * @returns Promise with evaluation data (null if not found)
   */
  static async getEvaluationByRequestId(requestId: string): Promise<unknown> {
    const { data, error } = await supabase
      .schema('maity')
      .from('tech_week_evaluations')
      .select('*')
      .eq('request_id', requestId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching Tech Week evaluation by request_id:', error);
      throw error;
    }

    return data;
  }
}
