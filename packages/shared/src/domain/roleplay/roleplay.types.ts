/**
 * Represents a voice session in the roleplay system
 */
export interface VoiceSession {
  id: string;
  user_id: string;
  profile_name: string;
  scenario_name?: string;
  scenario_code?: string;
  difficulty_level?: number;
  questionnaire_id?: string | null;
  started_at: string;
  ended_at?: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned';
  transcript?: any;
  processed_feedback?: any;
  score?: number | null;
  passed?: boolean | null;
  min_score_to_pass?: number | null;
  duration_seconds?: number | null;
}

/**
 * Represents user's progress in a practice profile
 */
export interface RoleplayProgress {
  id: string;
  user_id: string;
  profile_id: string;
  profile_name: string;
  total_sessions: number;
  completed_sessions: number;
  passed_sessions: number;
  average_score?: number;
  current_scenario?: string;
  last_session_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a practice profile (e.g., CEO, Manager, etc.)
 */
export interface PracticeProfile {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

/**
 * Represents a practice scenario within a profile
 */
export interface PracticeScenario {
  id: string;
  profile_id: string;
  name: string;
  description?: string;
  difficulty_level: number;
  scenario_code: string;
  min_score_to_pass: number;
  created_at: string;
}

/**
 * Result of a completed session with feedback
 */
export interface SessionResult {
  session_id: string;
  score: number;
  passed: boolean;
  feedback: string;
  areas_of_improvement?: string[];
  strengths?: string[];
  transcript?: TranscriptEntry[];
}

/**
 * Represents a single entry in the conversation transcript
 */
export interface TranscriptEntry {
  speaker: 'user' | 'agent';
  message: string;
  timestamp: string;
}

/**
 * Data required to create a new voice session
 */
export interface CreateSessionData {
  userId: string;
  profileName: string;
  questionnaireId?: string | null;
}

/**
 * Data for updating a voice session
 */
export interface UpdateSessionData {
  ended_at?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'abandoned';
  transcript?: any;
  processed_feedback?: any;
  score?: number;
  passed?: boolean;
}

/**
 * Questionnaire data collected before starting practice
 */
export interface QuestionnaireData {
  questionnaireId: string;
  practiceStartProfile: string;
  responses: Record<string, any>;
}
