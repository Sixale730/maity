/**
 * Database Types for Supabase Schema
 *
 * Type definitions matching the maity schema in Supabase
 */

import { UserRole, InviteAudience, EvaluationStatus } from './common.js';

/**
 * User table (maity.users)
 */
export interface User {
  id: string;
  auth_id: string;
  company_id: string | null;
  name?: string | null;
  email?: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Company table (maity.companies)
 */
export interface Company {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Invitation table (maity.invitations)
 */
export interface Invitation {
  id: string;
  company_id: string;
  token: string;
  audience: InviteAudience;
  email: string | null;
  created_by: string;
  used: boolean;
  used_at: string | null;
  used_by: string | null;
  expires_at: string;
  created_at: string;
}

/**
 * Voice session table (maity.voice_sessions)
 */
export interface VoiceSession {
  id: string;
  user_id: string;
  conversation_id: string | null;
  agent_id: string | null;
  profile: string | null;
  scenario: string | null;
  scenario_code: string | null;
  objectives: string[] | null;
  difficulty: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  transcript: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Evaluation table (maity.evaluations)
 */
export interface Evaluation {
  id: string;
  request_id: string;
  user_id: string;
  session_id: string | null;
  status: EvaluationStatus;
  score: number | null;
  result: EvaluationResult | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

/**
 * Evaluation result structure (JSON field in evaluations table)
 */
export interface EvaluationResult {
  score?: number;
  feedback?: string;
  areas?: {
    clarity?: number;
    structure?: number;
    emotional_alignment?: number;
    influence?: number;
    [key: string]: number | undefined;
  };
  Evaluacion?: {
    Claridad?: EvaluationDimension;
    Estructura?: EvaluationDimension;
    Alineacion_Emocional?: EvaluationDimension;
    Influencia?: EvaluationDimension;
  };
  Resumen?: string;
  Recomendaciones?: string[];
  [key: string]: unknown;
}

/**
 * Evaluation dimension structure (from n8n)
 */
export interface EvaluationDimension {
  Apertura?: number;
  Desarrollo?: number;
  Cierre?: number;
  Puntuacion_Total?: number;
  Comentarios?: string;
}

/**
 * Tally events table (maity.tally_events)
 */
export interface TallyEvent {
  id: string;
  event_id: string;
  event_type: string;
  form_id: string;
  payload: Record<string, unknown>;
  processed: boolean;
  processed_at: string | null;
  created_at: string;
}

/**
 * OTK (One-Time Keys) table (maity.otk)
 */
export interface Otk {
  id: string;
  auth_id: string;
  token: string;
  expires_at: string;
  used: boolean;
  used_at: string | null;
  created_at: string;
}

/**
 * OTK data returned from RPC function
 * Note: The otk() RPC function uses RETURNS TABLE, so Supabase returns an array
 */
export interface OtkData {
  token: string;
  email: string;
  company_id: string | null;
  role: string;
  expires_at: string;
}

/**
 * Database insert types (omitting auto-generated fields)
 */
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type EvaluationInsert = Omit<Evaluation, 'id' | 'created_at' | 'updated_at' | 'completed_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
};

export type VoiceSessionInsert = Omit<VoiceSession, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TallyEventInsert = Omit<TallyEvent, 'id' | 'created_at' | 'processed_at'> & {
  id?: string;
  created_at?: string;
  processed_at?: string;
};

/**
 * Database update types (all fields optional except id)
 */
export type UserUpdate = Partial<Omit<User, 'id' | 'auth_id' | 'created_at'>> & {
  updated_at?: string;
};

export type EvaluationUpdate = Partial<Omit<Evaluation, 'id' | 'request_id' | 'created_at'>> & {
  updated_at?: string;
};

export type VoiceSessionUpdate = Partial<Omit<VoiceSession, 'id' | 'created_at'>> & {
  updated_at?: string;
};
