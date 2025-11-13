/**
 * Represents an interview session
 */
export interface InterviewSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string | null;
  duration_seconds?: number | null;
  raw_transcript?: string | null;
  score?: number | null;
  processed_feedback?: any;
  status: 'in_progress' | 'completed' | 'cancelled';
  evaluation_id?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Rubric scoring details for interview analysis
 */
export interface InterviewRubric {
  score: number;
  analysis: string;
  strengths: string[];
  areas_for_improvement: string[];
}

/**
 * All rubrics for interview evaluation
 */
export interface InterviewRubrics {
  claridad?: InterviewRubric;
  adaptacion?: InterviewRubric;
  persuasion?: InterviewRubric;
  estructura?: InterviewRubric;
  proposito?: InterviewRubric;
  empatia?: InterviewRubric;
}

/**
 * Represents an interview evaluation
 */
export interface InterviewEvaluation {
  request_id: string;
  session_id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  analysis_text?: string | null;
  interviewee_name?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  // Structured analysis fields
  rubrics?: InterviewRubrics | null;
  key_observations?: string[] | null;
  amazing_comment?: string | null;
  summary?: string | null;
  is_complete?: boolean | null;
  // Legacy structured fields (for backwards compatibility)
  recomendaciones_prioritarias?: any | null;
  patrones_observados?: any | null;
  conclusion_general?: string | null;
  siguiente_paso_sugerido?: string | null;
}

/**
 * Interview session with evaluation data (for history)
 */
export interface InterviewSessionWithEvaluation {
  session_id: string;
  user_id: string;
  user_name: string;
  interviewee_name?: string | null;
  started_at: string;
  ended_at?: string | null;
  duration_seconds?: number | null;
  status: string;
  evaluation_status?: string | null;
  analysis_preview?: string | null;
  created_at: string;
}

/**
 * Data for creating a new interview evaluation
 */
export interface CreateInterviewEvaluationData {
  sessionId: string;
  userId: string;
}

/**
 * Interview session with full evaluation details (for results page)
 */
export interface InterviewSessionDetails extends InterviewSession {
  evaluation?: InterviewEvaluation | null;
  user?: {
    id: string;
    name: string;
    email: string;
    company_name?: string | null;
  };
}

/**
 * Status of interview evaluation processing
 */
export type EvaluationStatus = 'pending' | 'processing' | 'complete' | 'error';

/**
 * Status of interview session
 */
export type SessionStatus = 'in_progress' | 'completed' | 'cancelled';
