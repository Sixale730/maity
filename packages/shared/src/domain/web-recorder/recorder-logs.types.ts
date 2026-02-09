/**
 * Recorder Logs Types
 *
 * Types for persisted debug logs from web recorder sessions.
 */

export type RecorderLogType =
  | 'WS_OPEN'
  | 'WS_CLOSE'
  | 'WS_ERROR'
  | 'DEEPGRAM'
  | 'SEGMENT'
  | 'INTERIM'
  | 'AUDIO'
  | 'STATE'
  | 'ERROR'
  | 'SAVE';

export interface RecorderLogDetails {
  is_final?: boolean;
  speech_final?: boolean;
  speaker?: number;
  confidence?: number;
  wordCount?: number;
  text?: string;
  code?: number;
  reason?: string;
}

/**
 * Log entry as it comes from the frontend before saving
 */
export interface RecorderLogInput {
  timestamp_ms: number;
  log_type: RecorderLogType;
  message: string;
  details?: RecorderLogDetails;
}

/**
 * Log entry as stored in the database
 */
export interface RecorderLog {
  id: string;
  timestamp_ms: number;
  log_type: RecorderLogType;
  message: string;
  details: RecorderLogDetails | null;
  created_at: string;
}

/**
 * Recording session summary for admin list view
 */
export interface RecorderSession {
  conversation_id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  title: string | null;
  created_at: string;
  duration_seconds: number | null;
  log_count: number;
}
