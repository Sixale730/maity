import { supabase } from '../../api/client/supabase';
import type { DiagnosticInterviewEvaluation, RubricEvaluation } from './coach.types';

/**
 * Service for managing diagnostic interview evaluations
 * Evaluates 6 rubrics (same as self-assessment): Claridad, Adaptación, Persuasión, Estructura, Propósito, Empatía
 */
export class DiagnosticInterviewService {
  /**
   * Create a new diagnostic interview record
   * @param userId - User's UUID from maity.users table
   * @param sessionId - Voice session UUID
   * @param data - Evaluation data from OpenAI
   * @returns Promise with created interview
   */
  static async create(
    userId: string,
    sessionId: string,
    data: {
      transcript: string;
      rubrics: DiagnosticInterviewEvaluation['rubrics'];
      amazing_comment?: string;
      summary?: string;
      is_complete: boolean;
    }
  ): Promise<any> {
    const { data: interview, error } = await supabase
      .schema('maity')
      .from('diagnostic_interviews')
      .insert({
        user_id: userId,
        session_id: sessionId,
        transcript: data.transcript,
        rubrics: data.rubrics,
        amazing_comment: data.amazing_comment,
        summary: data.summary,
        is_complete: data.is_complete,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating diagnostic interview:', error);
      throw error;
    }

    return interview;
  }

  /**
   * Get diagnostic interview for a user
   * There should only be one completed interview per user (future: unique constraint)
   * @param userId - User's UUID
   * @returns Promise with interview data or null
   */
  static async getDiagnosticInterview(userId: string): Promise<any | null> {
    const { data, error } = await supabase
      .schema('maity')
      .from('diagnostic_interviews')
      .select('*')
      .eq('user_id', userId)
      .eq('is_complete', true) // Only get completed interviews
      .order('created_at', { ascending: false }) // Get most recent if multiple exist
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching diagnostic interview:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get diagnostic interview by ID
   * @param interviewId - Interview UUID
   * @returns Promise with interview data
   */
  static async getById(interviewId: string): Promise<any> {
    const { data, error } = await supabase
      .schema('maity')
      .from('diagnostic_interviews')
      .select('*')
      .eq('id', interviewId)
      .single();

    if (error) {
      console.error('Error fetching diagnostic interview by ID:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update diagnostic interview
   * @param interviewId - Interview UUID
   * @param updates - Fields to update
   * @returns Promise with updated interview
   */
  static async update(
    interviewId: string,
    updates: {
      rubrics?: DiagnosticInterviewEvaluation['rubrics'];
      amazing_comment?: string;
      summary?: string;
      is_complete?: boolean;
    }
  ): Promise<any> {
    const { data, error } = await supabase
      .schema('maity')
      .from('diagnostic_interviews')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', interviewId)
      .select()
      .single();

    if (error) {
      console.error('Error updating diagnostic interview:', error);
      throw error;
    }

    return data;
  }

  /**
   * Check if user has a completed diagnostic interview
   * Useful for future restriction (one interview per user)
   * @param userId - User's UUID
   * @returns Promise with boolean
   */
  static async hasDiagnosticInterview(userId: string): Promise<boolean> {
    const { count, error } = await supabase
      .schema('maity')
      .from('diagnostic_interviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_complete', true);

    if (error) {
      console.error('Error checking diagnostic interview existence:', error);
      throw error;
    }

    return (count ?? 0) > 0;
  }

  /**
   * Get all diagnostic interviews (admin only)
   * @param limit - Optional limit
   * @returns Promise with array of interviews
   */
  static async getAll(limit?: number): Promise<any[]> {
    let query = supabase
      .schema('maity')
      .from('diagnostic_interviews')
      .select('*, user:users(name, email)')
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching all diagnostic interviews:', error);
      throw error;
    }

    return data ?? [];
  }

  /**
   * Extract rubric scores for Radar Chart comparison
   * Converts 1-5 scale to 0-100 for visualization
   * @param interview - Diagnostic interview data
   * @returns Object with scores for each rubric (0-100 scale)
   */
  static extractRadarScores(interview: any): {
    claridad: number;
    adaptacion: number;
    persuasion: number;
    estructura: number;
    proposito: number;
    empatia: number;
  } {
    if (!interview?.rubrics) {
      return {
        claridad: 0,
        adaptacion: 0,
        persuasion: 0,
        estructura: 0,
        proposito: 0,
        empatia: 0,
      };
    }

    const rubrics = interview.rubrics;

    return {
      claridad: (rubrics.claridad?.score ?? 0) * 20, // 1-5 → 0-100
      adaptacion: (rubrics.adaptacion?.score ?? 0) * 20,
      persuasion: (rubrics.persuasion?.score ?? 0) * 20,
      estructura: (rubrics.estructura?.score ?? 0) * 20,
      proposito: (rubrics.proposito?.score ?? 0) * 20,
      empatia: (rubrics.empatia?.score ?? 0) * 20,
    };
  }
}
