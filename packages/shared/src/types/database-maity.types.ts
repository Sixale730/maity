/**
 * Maity Schema Type Extensions
 * Extends the Database type with maity schema definitions
 */

import type { Database } from '../services/supabase/types';

export interface MaitySchema {
  Tables: {
    users: {
      Row: {
        id: string;
        company_id: string | null;
        auth_id: string | null;
        name: string;
        phone: string | null;
        created_at: string | null;
        nickname: string | null;
        skill: string | null;
        email: string | null;
        status: string;
        registration_form_completed: boolean | null;
        updated_at: string;
        onboarding_completed_at: string | null;
        onboarding_token: string | null;
        onboarding_token_expires_at: string | null;
        platform_tour_completed: boolean | null;
        level: number;
      };
      Insert: {
        id?: string;
        company_id?: string | null;
        auth_id?: string | null;
        name?: string;
        phone?: string | null;
        created_at?: string | null;
        nickname?: string | null;
        skill?: string | null;
        email?: string | null;
        status?: string;
        registration_form_completed?: boolean | null;
        updated_at?: string;
        onboarding_completed_at?: string | null;
        onboarding_token?: string | null;
        onboarding_token_expires_at?: string | null;
        platform_tour_completed?: boolean | null;
        level?: number;
      };
      Update: {
        id?: string;
        company_id?: string | null;
        auth_id?: string | null;
        name?: string;
        phone?: string | null;
        created_at?: string | null;
        nickname?: string | null;
        skill?: string | null;
        email?: string | null;
        status?: string;
        registration_form_completed?: boolean | null;
        updated_at?: string;
        onboarding_completed_at?: string | null;
        onboarding_token?: string | null;
        onboarding_token_expires_at?: string | null;
        platform_tour_completed?: boolean | null;
        level?: number;
      };
      Relationships: [];
    };
    companies: {
      Row: {
        id: string;
        name: string;
        plan: string | null;
        timezone: string | null;
        is_active: boolean | null;
        created_at: string | null;
        slug: string | null;
      };
      Insert: {
        id?: string;
        name: string;
        plan?: string | null;
        timezone?: string | null;
        is_active?: boolean | null;
        created_at?: string | null;
        slug?: string | null;
      };
      Update: {
        id?: string;
        name?: string;
        plan?: string | null;
        timezone?: string | null;
        is_active?: boolean | null;
        created_at?: string | null;
        slug?: string | null;
      };
      Relationships: [];
    };
    voice_sessions: {
      Row: {
        id: string;
        user_id: string;
        company_id: string | null;
        profile_scenario_id: string;
        questionnaire_id: string | null;
        status: string | null;
        started_at: string | null;
        ended_at: string | null;
        duration_seconds: number | null;
        recording_url: string | null;
        raw_transcript: string | null;
        ai_agent_config: any | null;
        processed_feedback: any | null;
        score: number | null;
        passed: boolean | null;
        session_metadata: any | null;
        created_at: string | null;
        updated_at: string | null;
        min_score_to_pass: number | null;
      };
      Insert: {
        id?: string;
        user_id: string;
        company_id?: string | null;
        profile_scenario_id: string;
        questionnaire_id?: string | null;
        status?: string | null;
        started_at?: string | null;
        ended_at?: string | null;
        duration_seconds?: number | null;
        recording_url?: string | null;
        raw_transcript?: string | null;
        ai_agent_config?: any | null;
        processed_feedback?: any | null;
        score?: number | null;
        passed?: boolean | null;
        session_metadata?: any | null;
        created_at?: string | null;
        updated_at?: string | null;
        min_score_to_pass?: number | null;
      };
      Update: {
        id?: string;
        user_id?: string;
        company_id?: string | null;
        profile_scenario_id?: string;
        questionnaire_id?: string | null;
        status?: string | null;
        started_at?: string | null;
        ended_at?: string | null;
        duration_seconds?: number | null;
        recording_url?: string | null;
        raw_transcript?: string | null;
        ai_agent_config?: any | null;
        processed_feedback?: any | null;
        score?: number | null;
        passed?: boolean | null;
        session_metadata?: any | null;
        created_at?: string | null;
        updated_at?: string | null;
        min_score_to_pass?: number | null;
      };
      Relationships: [];
    };
    evaluations: {
      Row: {
        user_id: string;
        request_id: string;
        status: string;
        result: any | null;
        error_message: string | null;
        created_at: string;
        updated_at: string;
        session_id: string | null;
      };
      Insert: {
        user_id: string;
        request_id: string;
        status?: string;
        result?: any | null;
        error_message?: string | null;
        created_at?: string;
        updated_at?: string;
        session_id?: string | null;
      };
      Update: {
        user_id?: string;
        request_id?: string;
        status?: string;
        result?: any | null;
        error_message?: string | null;
        created_at?: string;
        updated_at?: string;
        session_id?: string | null;
      };
      Relationships: [];
    };
    voice_scenarios: {
      Row: {
        id: string;
        name: string;
        code: string;
        order_index: number;
        base_context: string;
        objectives: string;
        estimated_duration: number | null;
        category: string | null;
        is_active: boolean | null;
        created_at: string | null;
        updated_at: string | null;
      };
      Insert: {
        id?: string;
        name: string;
        code: string;
        order_index: number;
        base_context: string;
        objectives: string;
        estimated_duration?: number | null;
        category?: string | null;
        is_active?: boolean | null;
        created_at?: string | null;
        updated_at?: string | null;
      };
      Update: {
        id?: string;
        name?: string;
        code?: string;
        order_index?: number;
        base_context?: string;
        objectives?: string;
        estimated_duration?: number | null;
        category?: string | null;
        is_active?: boolean | null;
        created_at?: string | null;
        updated_at?: string | null;
      };
      Relationships: [];
    };
    voice_agent_profiles: {
      Row: {
        id: string;
        name: string;
        description: string | null;
        key_focus: string | null;
        communication_style: string | null;
        personality_traits: any | null;
        is_active: boolean | null;
        created_at: string | null;
        updated_at: string | null;
      };
      Insert: {
        id?: string;
        name: string;
        description?: string | null;
        key_focus?: string | null;
        communication_style?: string | null;
        personality_traits?: any | null;
        is_active?: boolean | null;
        created_at?: string | null;
        updated_at?: string | null;
      };
      Update: {
        id?: string;
        name?: string;
        description?: string | null;
        key_focus?: string | null;
        communication_style?: string | null;
        personality_traits?: any | null;
        is_active?: boolean | null;
        created_at?: string | null;
        updated_at?: string | null;
      };
      Relationships: [];
    };
    voice_difficulty_levels: {
      Row: {
        id: string;
        level: number;
        name: string;
        code: string;
        mood_preset: string | null;
        objection_frequency: number | null;
        time_pressure: boolean | null;
        interruption_tendency: number | null;
        created_at: string | null;
      };
      Insert: {
        id?: string;
        level: number;
        name: string;
        code: string;
        mood_preset?: string | null;
        objection_frequency?: number | null;
        time_pressure?: boolean | null;
        interruption_tendency?: number | null;
        created_at?: string | null;
      };
      Update: {
        id?: string;
        level?: number;
        name?: string;
        code?: string;
        mood_preset?: string | null;
        objection_frequency?: number | null;
        time_pressure?: boolean | null;
        interruption_tendency?: number | null;
        created_at?: string | null;
      };
      Relationships: [];
    };
    voice_profile_scenarios: {
      Row: {
        id: string;
        profile_id: string;
        scenario_id: string;
        difficulty_id: string;
        company_id: string | null;
        specific_context: string | null;
        key_objections: any | null;
        success_criteria: any | null;
        talking_points: any | null;
        min_score_to_pass: number | null;
        is_locked: boolean | null;
        unlock_after_scenario: string | null;
        created_at: string | null;
        updated_at: string | null;
        user_instructions: string | null;
      };
      Insert: {
        id?: string;
        profile_id: string;
        scenario_id: string;
        difficulty_id: string;
        company_id?: string | null;
        specific_context?: string | null;
        key_objections?: any | null;
        success_criteria?: any | null;
        talking_points?: any | null;
        min_score_to_pass?: number | null;
        is_locked?: boolean | null;
        unlock_after_scenario?: string | null;
        created_at?: string | null;
        updated_at?: string | null;
        user_instructions?: string | null;
      };
      Update: {
        id?: string;
        profile_id?: string;
        scenario_id?: string;
        difficulty_id?: string;
        company_id?: string | null;
        specific_context?: string | null;
        key_objections?: any | null;
        success_criteria?: any | null;
        talking_points?: any | null;
        min_score_to_pass?: number | null;
        is_locked?: boolean | null;
        unlock_after_scenario?: string | null;
        created_at?: string | null;
        updated_at?: string | null;
        user_instructions?: string | null;
      };
      Relationships: [];
    };
    voice_user_progress: {
      Row: {
        id: string;
        user_id: string;
        company_id: string | null;
        profile_id: string;
        current_scenario_order: number | null;
        current_difficulty_level: number | null;
        scenarios_completed: number | null;
        scenarios_failed: number | null;
        total_sessions: number | null;
        total_practice_time: number | null;
        average_score: number | null;
        best_score: number | null;
        streak_days: number | null;
        last_session_date: string | null;
        achievements_unlocked: number | null;
        total_points: number | null;
        created_at: string | null;
        updated_at: string | null;
      };
      Insert: {
        id?: string;
        user_id: string;
        company_id?: string | null;
        profile_id: string;
        current_scenario_order?: number | null;
        current_difficulty_level?: number | null;
        scenarios_completed?: number | null;
        scenarios_failed?: number | null;
        total_sessions?: number | null;
        total_practice_time?: number | null;
        average_score?: number | null;
        best_score?: number | null;
        streak_days?: number | null;
        last_session_date?: string | null;
        achievements_unlocked?: number | null;
        total_points?: number | null;
        created_at?: string | null;
        updated_at?: string | null;
      };
      Update: {
        id?: string;
        user_id?: string;
        company_id?: string | null;
        profile_id?: string;
        current_scenario_order?: number | null;
        current_difficulty_level?: number | null;
        scenarios_completed?: number | null;
        scenarios_failed?: number | null;
        total_sessions?: number | null;
        total_practice_time?: number | null;
        average_score?: number | null;
        best_score?: number | null;
        streak_days?: number | null;
        last_session_date?: string | null;
        achievements_unlocked?: number | null;
        total_points?: number | null;
        created_at?: string | null;
        updated_at?: string | null;
      };
      Relationships: [];
    };
    coach_conversations: {
      Row: {
        id: string;
        user_id: string;
        topic: string | null;
        started_at: string | null;
        ended_at: string | null;
        messages: any | null;
        summary: string | null;
        created_at: string | null;
      };
      Insert: {
        id?: string;
        user_id: string;
        topic?: string | null;
        started_at?: string | null;
        ended_at?: string | null;
        messages?: any | null;
        summary?: string | null;
        created_at?: string | null;
      };
      Update: {
        id?: string;
        user_id?: string;
        topic?: string | null;
        started_at?: string | null;
        ended_at?: string | null;
        messages?: any | null;
        summary?: string | null;
        created_at?: string | null;
      };
      Relationships: [];
    };
  };
  Views: {};
  Functions: {
    get_admin_dashboard_stats: {
      Args: Record<string, never>;
      Returns: {
        totalSessions: number;
        activeSessions: number;
        completionRate: number;
        avgMood: number;
      };
    };
    get_admin_monthly_data: {
      Args: Record<string, never>;
      Returns: Array<{
        month: string;
        sessions: number;
        mood: number;
        completed: number;
      }>;
    };
    get_admin_session_status: {
      Args: Record<string, never>;
      Returns: Array<{
        name: string;
        value: number;
        color: string;
      }>;
    };
    get_my_form_responses: {
      Args: Record<string, never>;
      Returns: {
        q1: string;
        q2: string;
        q3: string;
        q4: string;
        q5: string;
        q6: string;
        q7: string;
        q8: string;
        q9: string;
        q10: string;
        user_id: string;
      };
    };
  };
  Enums: {};
  CompositeTypes: {};
}

// Extended Database type that includes maity schema
export type DatabaseWithMaity = Database & {
  maity: MaitySchema;
};
