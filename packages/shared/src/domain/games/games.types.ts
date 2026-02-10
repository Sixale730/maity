// =============================================================================
// Game Sessions & XP Types
// =============================================================================

export type GameType = 'wheel_of_life' | 'personal_brand' | 'active_listening';

export type GameSessionStatus = 'in_progress' | 'completed' | 'abandoned';

export type XPSourceType = 'game' | 'conversation' | 'streak' | 'badge' | 'bonus';

export interface GameSession {
  id: string;
  user_id: string;
  game_type: GameType;
  status: GameSessionStatus;
  game_data: Record<string, unknown>;
  results: Record<string, unknown> | null;
  score: number | null;
  xp_earned: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  source_type: XPSourceType;
  source_id: string | null;
  amount: number;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface XPBreakdown {
  source_type: XPSourceType;
  total: number;
  count: number;
}

export interface XPSummary {
  total_xp: number;
  breakdown: XPBreakdown[];
  recent: Pick<XPTransaction, 'id' | 'source_type' | 'amount' | 'description' | 'created_at'>[];
}

export interface CompleteGameResult {
  success: boolean;
  error?: string;
  xp_earned?: number;
  is_first_attempt?: boolean;
  total_xp?: number;
}
