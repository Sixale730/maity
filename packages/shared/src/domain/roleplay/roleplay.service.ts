import { supabase } from '../../api/client/supabase';

/**
 * Type for voice session update data
 */
export interface SessionUpdate {
  ended_at?: string;
  status?: string;
  transcript?: unknown;
  processed_feedback?: unknown;
  score?: number;
  passed?: boolean;
}

/**
 * Service for managing roleplay sessions and user progress
 * Encapsulates business logic for voice sessions, progress tracking, and scenarios
 */
export class RoleplayService {
  /**
   * Create a new voice session for a user
   * Uses the create_voice_session RPC function
   * @param userId - User's UUID from maity.users table
   * @param profileName - Name of the practice profile (e.g., 'CEO', 'MANAGER')
   * @param questionnaireId - Optional questionnaire ID
   * @returns Promise with session ID
   */
  static async createSession(
    userId: string,
    profileName: string,
    questionnaireId?: string | null
  ): Promise<string | null> {
    const { data, error } = await supabase.rpc('create_voice_session', {
      p_user_id: userId,
      p_profile_name: profileName,
      p_questionnaire_id: questionnaireId || ''
    });

    if (error) {
      console.error('Error creating voice session:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get or create user progress for a specific profile
   * Uses the get_or_create_user_progress RPC function
   * @param userId - User's UUID from maity.users table
   * @param profileName - Name of the practice profile
   * @returns Promise with user progress data
   */
  static async getOrCreateProgress(userId: string, profileName: string): Promise<unknown> {
    const { data, error } = await supabase.rpc('get_or_create_user_progress', {
      p_user_id: userId,
      p_profile_name: profileName
    });

    if (error) {
      console.error('Error getting/creating user progress:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create initial voice progress for a user and profile
   * Uses the create_initial_voice_progress RPC function
   * @param authId - User's auth UUID
   * @param profileName - Name of the practice profile
   * @returns Promise with creation result
   */
  static async createInitialProgress(authId: string, profileName: string): Promise<unknown> {
    const { data, error } = await supabase.rpc('create_initial_voice_progress', {
      p_auth_id: authId,
      p_profile_name: profileName
    });

    if (error) {
      console.error('Error creating initial progress:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get all voice sessions for a user
   * @param userId - User's UUID from maity.users table
   * @param limit - Optional limit for results
   * @returns Promise with array of voice sessions
   */
  static async getSessions(userId: string, limit?: number): Promise<unknown[] | null> {
    let query = supabase
      .schema('maity')
      .from('voice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching voice sessions:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get a specific voice session by ID
   * @param sessionId - Session UUID
   * @returns Promise with session data
   */
  static async getSessionById(sessionId: string): Promise<unknown> {
    const { data, error } = await supabase
      .schema('maity')
      .from('voice_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching voice session:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update a voice session
   * @param sessionId - Session UUID
   * @param updates - Fields to update
   * @returns Promise with updated session
   */
  static async updateSession(
    sessionId: string,
    updates: SessionUpdate
  ): Promise<unknown> {
    const { data, error } = await supabase
      .schema('maity')
      .from('voice_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating voice session:', error);
      throw error;
    }

    return data;
  }

  /**
   * End a voice session
   * @param sessionId - Session UUID
   * @returns Promise with updated session
   */
  static async endSession(sessionId: string): Promise<unknown> {
    return this.updateSession(sessionId, {
      ended_at: new Date().toISOString(),
      status: 'completed'
    });
  }

  /**
   * Get all available practice profiles
   * @returns Promise with array of profiles
   */
  static async getProfiles(): Promise<unknown[] | null> {
    const { data, error } = await supabase
      .schema('maity')
      .from('voice_agent_profiles')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching practice profiles:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get all scenarios for a specific profile
   * @param profileId - Profile UUID
   * @returns Promise with array of scenarios
   */
  static async getScenariosByProfile(profileId: string): Promise<unknown[] | null> {
    const { data, error } = await supabase
      .schema('maity')
      .from('voice_scenarios')
      .select('*')
      .eq('profile_id', profileId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching scenarios:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get user's progress for all profiles
   * @param userId - User's UUID from maity.users table
   * @returns Promise with array of progress records
   */
  static async getUserProgress(userId: string): Promise<unknown[] | null> {
    const { data, error } = await supabase
      .schema('maity')
      .from('voice_user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get all available scenarios (for admin testing)
   * @returns Promise with array of all scenarios
   */
  static async getAllScenarios(): Promise<unknown[] | null> {
    const { data, error } = await supabase
      .schema('maity')
      .from('voice_scenarios')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching all scenarios:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get specific profile + scenario configuration for admin testing
   * @param profileName - Profile name (CEO, CTO, CFO)
   * @param scenarioCode - Scenario code
   * @returns Promise with scenario configuration data
   */
  static async getProfileScenarioConfig(
    profileName: string,
    scenarioCode: string
  ): Promise<unknown> {
    const { data, error } = await supabase.rpc('get_admin_scenario_config', {
      p_profile_name: profileName,
      p_scenario_code: scenarioCode
    });

    if (error) {
      console.error('Error getting profile scenario config:', error);
      throw error;
    }

    return data;
  }
}
