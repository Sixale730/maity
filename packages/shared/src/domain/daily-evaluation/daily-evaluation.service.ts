import { supabase } from '../../api/client/supabase';
import type { DailyEvaluation, TodayEvaluation, LeaderboardEntry } from './daily-evaluation.types';

export class DailyEvaluationService {
  static async getTodayEvaluation(): Promise<TodayEvaluation> {
    const { data, error } = await supabase.rpc('get_my_today_evaluation');
    if (error) {
      console.error('[DailyEvaluationService] getTodayEvaluation error:', error);
      return { today: null, yesterday: null };
    }
    return data as TodayEvaluation;
  }

  static async getEvaluations(days = 30): Promise<DailyEvaluation[]> {
    const { data, error } = await supabase.rpc('get_my_daily_evaluations', { p_days: days });
    if (error) {
      console.error('[DailyEvaluationService] getEvaluations error:', error);
      return [];
    }
    return (data ?? []) as DailyEvaluation[];
  }

  static async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase.rpc('get_xp_leaderboard', { p_limit: limit });
    if (error) {
      console.error('[DailyEvaluationService] getLeaderboard error:', error);
      return [];
    }
    return (data ?? []) as LeaderboardEntry[];
  }
}
