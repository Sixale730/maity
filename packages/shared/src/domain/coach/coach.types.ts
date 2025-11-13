/**
 * Represents a coach conversation session
 */
export interface Conversation {
  id: string;
  user_id: string;
  topic?: string | null;
  started_at: string;
  ended_at?: string | null;
  messages?: Message[];
  summary?: string | null;
  created_at: string;
}

/**
 * Represents a single message in a coach conversation
 */
export interface Message {
  speaker: 'user' | 'coach';
  content: string;
  timestamp: string;
}

/**
 * Result of conversation history query
 */
export interface ConversationHistory {
  conversations: Conversation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Data for creating a new conversation
 */
export interface CreateConversationData {
  userId: string;
  topic?: string;
}

/**
 * Evaluation of a single rubric (competency)
 * Used in diagnostic interviews
 */
export interface RubricEvaluation {
  score: number; // 1-5 (Likert scale)
  analysis: string; // Qualitative analysis (2-3 sentences)
  strengths: string[]; // Positive aspects
  areas_for_improvement: string[]; // Areas to develop
}

/**
 * Complete diagnostic interview evaluation
 * Evaluates 6 rubrics (same as self-assessment):
 * Claridad, Adaptación, Persuasión, Estructura, Propósito, Empatía
 */
export interface DiagnosticInterviewEvaluation {
  rubrics: {
    claridad: RubricEvaluation;
    adaptacion: RubricEvaluation;
    persuasion: RubricEvaluation;
    estructura: RubricEvaluation;
    proposito: RubricEvaluation;
    empatia: RubricEvaluation;
  };
  key_observations?: string[]; // 3-4 key observations from the interview
  amazing_comment: string; // Surprising/impressive observation about the user
  summary: string; // Overall summary (2-3 sentences)
  is_complete: boolean; // Whether interview met completion criteria
}

/**
 * Diagnostic interview record from database
 */
export interface DiagnosticInterview {
  id: string;
  user_id: string;
  session_id: string | null;
  transcript: string;
  rubrics: DiagnosticInterviewEvaluation['rubrics'];
  key_observations?: string[] | null;
  amazing_comment: string | null;
  summary: string | null;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Radar chart scores extracted from diagnostic interview
 * Scaled 0-100 for visualization
 */
export interface DiagnosticRadarScores {
  claridad: number;
  adaptacion: number;
  persuasion: number;
  estructura: number;
  proposito: number;
  empatia: number;
}
