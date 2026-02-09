/**
 * Recorder Logs Service
 *
 * Service for persisting and retrieving debug logs from web recorder sessions.
 * Users can save their own logs, admins can view all logs.
 */

import { supabase } from '../../api/client/supabase';
import type {
  RecorderLog,
  RecorderLogInput,
  RecorderSession,
} from './recorder-logs.types';

/**
 * Save debug logs for a recording session (batch insert)
 *
 * @param conversationId - The conversation ID to associate logs with
 * @param logs - Array of log entries to save
 * @returns Number of logs saved
 */
export async function saveRecorderLogs(
  conversationId: string,
  logs: RecorderLogInput[]
): Promise<number> {
  if (logs.length === 0) return 0;

  // Transform logs to match the RPC expected format
  const logsJson = logs.map((log) => ({
    timestamp_ms: log.timestamp_ms,
    log_type: log.log_type,
    message: log.message,
    details: log.details || null,
  }));

  const { data, error } = await supabase.rpc('save_recorder_logs', {
    p_conversation_id: conversationId,
    p_logs: logsJson,
  });

  if (error) {
    console.error('[RecorderLogs] Error saving logs:', error);
    throw new Error(`Failed to save recorder logs: ${error.message}`);
  }

  return data as number;
}

/**
 * List recording sessions with log counts (admin only)
 *
 * @param limit - Maximum number of sessions to return (default 50)
 * @param userId - Optional filter by user ID
 * @returns Array of session summaries
 */
export async function listRecorderSessions(
  limit = 50,
  userId?: string
): Promise<RecorderSession[]> {
  const { data, error } = await supabase.rpc('list_recorder_sessions', {
    p_limit: limit,
    p_user_id: userId || null,
  });

  if (error) {
    console.error('[RecorderLogs] Error listing sessions:', error);
    throw new Error(`Failed to list recorder sessions: ${error.message}`);
  }

  return (data as RecorderSession[]) || [];
}

/**
 * Get all logs for a specific conversation (admin only)
 *
 * @param conversationId - The conversation ID to get logs for
 * @returns Array of log entries
 */
export async function getRecorderLogs(
  conversationId: string
): Promise<RecorderLog[]> {
  const { data, error } = await supabase.rpc('get_recorder_logs', {
    p_conversation_id: conversationId,
  });

  if (error) {
    console.error('[RecorderLogs] Error getting logs:', error);
    throw new Error(`Failed to get recorder logs: ${error.message}`);
  }

  return (data as RecorderLog[]) || [];
}
