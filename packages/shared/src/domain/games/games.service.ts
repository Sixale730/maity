import { supabase } from '../../api/client/supabase';
import type { GameType, GameSession, CompleteGameResult, XPSummary } from './games.types';
import type { WheelOfLifeData, WheelOfLifeResults, WheelAreaGap, WheelRadarPoint, WheelRecommendation } from './wheel-of-life.types';
import { WHEEL_AREAS } from './wheel-areas-data';

const PROGRESS_KEY = (userId: string, gameType: string) =>
  `maity_game_progress_${userId}_${gameType}`;

export class GameService {
  // ---------------------------------------------------------------------------
  // Session CRUD
  // ---------------------------------------------------------------------------

  static async createSession(userId: string, gameType: GameType): Promise<GameSession | null> {
    const { data, error } = await supabase
      .schema('maity')
      .from('game_sessions')
      .insert({ user_id: userId, game_type: gameType })
      .select()
      .single();

    if (error) {
      console.error('[GameService] createSession error:', error);
      return null;
    }
    return data as GameSession;
  }

  static async updateSessionData(sessionId: string, gameData: Record<string, unknown>): Promise<boolean> {
    const { error } = await supabase
      .schema('maity')
      .from('game_sessions')
      .update({ game_data: gameData, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      console.error('[GameService] updateSessionData error:', error);
      return false;
    }
    return true;
  }

  static async completeSession(
    sessionId: string,
    results: Record<string, unknown>,
    score: number,
    xpAmount: number,
    description?: string
  ): Promise<CompleteGameResult> {
    const { data, error } = await supabase.rpc('complete_game_session', {
      p_session_id: sessionId,
      p_results: results,
      p_score: score,
      p_xp_amount: xpAmount,
      p_description: description ?? null,
    });

    if (error) {
      console.error('[GameService] completeSession error:', error);
      return { success: false, error: error.message };
    }
    return data as CompleteGameResult;
  }

  static async abandonSession(sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .schema('maity')
      .from('game_sessions')
      .update({ status: 'abandoned', updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      console.error('[GameService] abandonSession error:', error);
      return false;
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Session Queries
  // ---------------------------------------------------------------------------

  static async getUserSessions(gameType?: GameType, limit = 20): Promise<GameSession[]> {
    const { data, error } = await supabase.rpc('get_my_game_sessions', {
      p_game_type: gameType ?? null,
      p_limit: limit,
    });

    if (error) {
      console.error('[GameService] getUserSessions error:', error);
      return [];
    }
    return (data ?? []) as GameSession[];
  }

  static async getLatestCompleted(gameType: GameType): Promise<GameSession | null> {
    const sessions = await this.getUserSessions(gameType, 1);
    const completed = sessions.find(s => s.status === 'completed');
    return completed ?? null;
  }

  // ---------------------------------------------------------------------------
  // XP Queries
  // ---------------------------------------------------------------------------

  static async getXPSummary(): Promise<XPSummary> {
    const { data, error } = await supabase.rpc('get_my_xp_summary');
    if (error) {
      console.error('[GameService] getXPSummary error:', error);
      return { total_xp: 0, breakdown: [], recent: [] };
    }
    return data as XPSummary;
  }

  // ---------------------------------------------------------------------------
  // Wheel of Life - Pure Calculation
  // ---------------------------------------------------------------------------

  static calculateWheelResults(data: WheelOfLifeData): WheelOfLifeResults {
    const areas = data.areas;

    // Calculate gaps
    const gaps: WheelAreaGap[] = areas.map(a => ({
      area_id: a.area_id,
      gap: a.desired_score - a.current_score,
      current: a.current_score,
      desired: a.desired_score,
    }));

    // Sort by current score
    const sortedByCurrent = [...areas].sort((a, b) => b.current_score - a.current_score);
    const strengths = sortedByCurrent.slice(0, 3).map(a => a.area_id);
    const weaknesses = sortedByCurrent.slice(-3).reverse().map(a => a.area_id);

    // Biggest gaps (sorted by gap desc)
    const sortedByGap = [...gaps].sort((a, b) => b.gap - a.gap);
    const biggest_gaps = sortedByGap.slice(0, 3);

    // Average scores
    const average_current = areas.reduce((sum, a) => sum + a.current_score, 0) / areas.length;
    const average_desired = areas.reduce((sum, a) => sum + a.desired_score, 0) / areas.length;

    // Balance score: how evenly distributed are the current scores (0-100)
    // Low std deviation = high balance
    const mean = average_current;
    const variance = areas.reduce((sum, a) => sum + Math.pow(a.current_score - mean, 2), 0) / areas.length;
    const stdDev = Math.sqrt(variance);
    // Max possible std dev for 1-10 scale is ~4.5
    const balance_score = Math.round(Math.max(0, Math.min(100, (1 - stdDev / 4.5) * 100)));

    // Recommendations for the 3 weakest areas
    const recommendations: WheelRecommendation[] = weaknesses.map(area_id => ({
      area_id,
      text_key: `wheel_of_life.recommendation.${area_id}`,
    }));

    // Radar chart data
    const radar_data: WheelRadarPoint[] = areas.map(a => {
      const meta = WHEEL_AREAS.find(w => w.id === a.area_id);
      return {
        area_id: a.area_id,
        label_key: meta?.labelKey ?? a.area_id,
        current: a.current_score,
        desired: a.desired_score,
      };
    });

    return {
      strengths,
      weaknesses,
      biggest_gaps,
      balance_score,
      average_current: Math.round(average_current * 10) / 10,
      average_desired: Math.round(average_desired * 10) / 10,
      recommendations,
      radar_data,
    };
  }

  static calculateWheelXP(results: WheelOfLifeResults, isFirst: boolean): number {
    const baseXP = 150;
    const bonusXP = results.balance_score >= 90 ? 25 : 0;
    const firstBonus = isFirst ? 30 : 0;
    return baseXP + bonusXP + firstBonus;
  }

  // ---------------------------------------------------------------------------
  // Local Progress (localStorage)
  // ---------------------------------------------------------------------------

  static saveProgress(userId: string, gameType: string, data: unknown): void {
    try {
      localStorage.setItem(PROGRESS_KEY(userId, gameType), JSON.stringify(data));
    } catch { /* ignore quota errors */ }
  }

  static loadProgress<T>(userId: string, gameType: string): T | null {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY(userId, gameType));
      return raw ? JSON.parse(raw) as T : null;
    } catch {
      return null;
    }
  }

  static clearProgress(userId: string, gameType: string): void {
    localStorage.removeItem(PROGRESS_KEY(userId, gameType));
  }
}
