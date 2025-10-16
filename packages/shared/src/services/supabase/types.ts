export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          registration_url: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          registration_url: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          registration_url?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      users: {
        Row: {
          auth_id: string | null
          company_id: string | null
          created_at: string | null
          email: string | null
          id: string | null
          name: string | null
          nickname: string | null
          phone: string | null
          registration_form_completed: boolean | null
          skill: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          auth_id?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          nickname?: string | null
          phone?: string | null
          registration_form_completed?: boolean | null
          skill?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_id?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          nickname?: string | null
          phone?: string | null
          registration_form_completed?: boolean | null
          skill?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      voice_pre_practice_questionnaire: {
        Row: {
          answered_at: string | null
          created_at: string | null
          id: string | null
          most_difficult_profile: string | null
          practice_start_profile: string | null
          session_id: string | null
          session_started: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          answered_at?: string | null
          created_at?: string | null
          id?: string | null
          most_difficult_profile?: string | null
          practice_start_profile?: string | null
          session_id?: string | null
          session_started?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          answered_at?: string | null
          created_at?: string | null
          id?: string | null
          most_difficult_profile?: string | null
          practice_start_profile?: string | null
          session_id?: string | null
          session_started?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_invite_and_assign: {
        Args: { p_auth_id: string; p_token: string }
        Returns: {
          assigned: boolean
          audience: string
          redirect: string
        }[]
      }
      armor: {
        Args: { "": string }
        Returns: string
      }
      assign_company_simple: {
        Args: { company_slug: string; user_auth_id: string }
        Returns: Json
      }
      assign_user_to_company: {
        Args: { company_slug: string; user_auth_id: string }
        Returns: undefined
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      complete_onboarding: {
        Args: { submission_data?: Json }
        Returns: undefined
      }
      complete_user_registration: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_voice_session: {
        Args: {
          p_duration_seconds: number
          p_score: number
          p_session_id: string
        }
        Returns: boolean
      }
      create_company: {
        Args: { company_name: string }
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          plan: string
          slug: string
          timezone: string
        }[]
      }
      create_evaluation: {
        Args: { p_request_id: string; p_session_id?: string; p_user_id: string }
        Returns: unknown
      }
      create_initial_voice_progress: {
        Args: { p_auth_id: string; p_profile_name: string }
        Returns: string
      }
      create_voice_session: {
        Args: {
          p_profile_name: string
          p_questionnaire_id: string
          p_user_id: string
        }
        Returns: string
      }
      dearmor: {
        Args: { "": string }
        Returns: string
      }
      delete_company: {
        Args: { company_id: string }
        Returns: undefined
      }
      ensure_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      gen_random_bytes: {
        Args: { "": number }
        Returns: string
      }
      gen_random_uuid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      gen_salt: {
        Args: { "": string }
        Returns: string
      }
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_admin_monthly_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          completed: number
          month: string
          mood: number
          sessions: number
        }[]
      }
      get_admin_session_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          color: string
          name: string
          value: number
        }[]
      }
      get_companies: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          plan: string
          slug: string
          timezone: string
        }[]
      }
      get_companies_with_invite_tokens: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          manager_invite_token: string
          name: string
          plan: string
          slug: string
          timezone: string
          user_invite_token: string
        }[]
      }
      get_company_by_id: {
        Args: { company_id: string }
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          plan: string
          slug: string
          timezone: string
        }[]
      }
      get_company_by_slug: {
        Args: { company_slug: string }
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          plan: string
          slug: string
          timezone: string
        }[]
      }
      get_company_invite_links: {
        Args: { company_id: string }
        Returns: {
          audience: string
          expires_at: string
          is_active: boolean
          max_uses: number
          token: string
          used_count: number
        }[]
      }
      get_my_form_responses: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          q1: string
          q10: string
          q11: string
          q12: string
          q2: string
          q3: string
          q4: string
          q5: string
          q6: string
          q7: string
          q8: string
          q9: string
          submitted_at: string
          user_id: string
        }[]
      }
      get_or_create_user_progress: {
        Args: { p_profile_name: string; p_user_id: string }
        Returns: {
          current_scenario_code: string
          current_scenario_id: string
          current_scenario_name: string
          current_scenario_order: number
          difficulty_interruption_tendency: number
          difficulty_level: number
          difficulty_mood: string
          difficulty_name: string
          difficulty_objection_frequency: number
          difficulty_time_pressure: boolean
          is_locked: boolean
          min_score_to_pass: number
          profile_communication_style: string
          profile_description: string
          profile_key_focus: string
          profile_personality_traits: Json
          progress_id: string
          scenarios_completed: number
          user_instructions: string
        }[]
      }
      get_user_company_id: {
        Args: { user_auth_id?: string }
        Returns: string
      }
      get_user_company_info: {
        Args: { user_auth_id?: string }
        Returns: {
          company_id: string
          company_name: string
          company_slug: string
          registration_form_completed: boolean
          user_id: string
        }[]
      }
      get_user_recent_sessions: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          created_at: string
          duration_seconds: number
          ended_at: string
          id: string
          profile_name: string
          scenario_code: string
          score: number
          status: string
          user_id: string
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_sessions_history: {
        Args: { p_auth_id: string }
        Returns: {
          difficulty_level: number
          duration_seconds: number
          ended_at: string
          id: string
          min_score_to_pass: number
          objectives: string
          passed: boolean
          processed_feedback: Json
          profile_name: string
          raw_transcript: string
          scenario_code: string
          scenario_name: string
          score: number
          session_id: string
          started_at: string
          status: string
          user_id: string
        }[]
      }
      get_user_voice_progress: {
        Args: { p_auth_id: string }
        Returns: {
          average_score: number
          best_score: number
          current_difficulty_level: number
          current_scenario_order: number
          id: string
          last_session_date: string
          profile_id: string
          scenarios_completed: number
          scenarios_failed: number
          streak_days: number
          total_practice_time: number
          total_sessions: number
          user_id: string
        }[]
      }
      get_voice_agent_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          communication_style: string
          description: string
          id: string
          is_active: boolean
          key_focus: string
          name: string
          personality_traits: Json
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      handle_company_invitation: {
        Args: {
          company_slug: string
          force_assign?: boolean
          invitation_source?: string
          user_auth_id: string
        }
        Returns: Json
      }
      handle_user_company_invitation: {
        Args:
          | {
              company_slug: string
              force_assign?: boolean
              invitation_source?: string
              user_auth_id: string
              user_email: string
            }
          | {
              force_assign?: boolean
              invitation_source?: string
              target_company_id: string
              user_auth_id: string
              user_email: string
            }
        Returns: Json
      }
      has_role: {
        Args: {
          required_role: Database["public"]["Enums"]["app_role"]
          user_auth_id: string
        }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { data: Json; uri: string } | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { data: Json; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      mark_tour_completed: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      my_phase: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      my_roles: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      my_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_id: string
          registration_form_completed: boolean
        }[]
      }
      otk: {
        Args: { p_auth_id: string; p_ttl_minutes?: number }
        Returns: {
          company_id: string
          email: string
          expires_at: string
          role: string
          token: string
        }[]
      }
      pgp_armor_headers: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
      pgp_key_id: {
        Args: { "": string }
        Returns: string
      }
      provision_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      provision_user_with_company: {
        Args: { company_slug: string; invitation_source?: string }
        Returns: Json
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      update_user_auth_status: {
        Args: { user_auth_id: string; user_email: string }
        Returns: undefined
      }
      update_voice_session_transcript: {
        Args: {
          p_duration_seconds: number
          p_raw_transcript: string
          p_session_id: string
        }
        Returns: undefined
      }
      update_voice_user_progress_on_pass: {
        Args: { p_profile_scenario_id: string; p_user_id: string }
        Returns: undefined
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "user"
      assign_state: "pending" | "sent" | "answered" | "graded" | "missed"
      attendance_outcome: "SHOW" | "NO_SHOW" | "LATE" | "CANCELLED"
      grade_scale: "na" | "fail" | "pass" | "good" | "excellent"
      task_scope: "global" | "company" | "user"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "user"],
      assign_state: ["pending", "sent", "answered", "graded", "missed"],
      attendance_outcome: ["SHOW", "NO_SHOW", "LATE", "CANCELLED"],
      grade_scale: ["na", "fail", "pass", "good", "excellent"],
      task_scope: ["global", "company", "user"],
    },
  },
} as const
