export interface DailyEvaluation {
  id: string;
  user_id: string;
  evaluation_date: string;
  conversations_count: number;
  total_duration_seconds: number;
  total_words_user: number;
  total_words_others: number;
  avg_overall_score: number | null;
  avg_clarity: number | null;
  avg_structure: number | null;
  avg_empatia: number | null;
  avg_vocabulario: number | null;
  avg_objetivo: number | null;
  muletillas_total: number;
  muletillas_by_word: Record<string, number>;
  muletillas_rate: number;
  avg_ratio_habla: number | null;
  total_preguntas_usuario: number;
  total_preguntas_otros: number;
  temas_tratados: string[];
  acciones_count: number;
  temas_sin_cerrar_count: number;
  top_strengths: string[];
  top_areas_to_improve: string[];
  daily_summary: string | null;
  daily_insights: DailyInsights | null;
  conversation_ids: string[];
  status: 'pending' | 'processing' | 'complete' | 'error';
  created_at: string;
  updated_at: string;
}

export interface DailyInsights {
  patron_principal: string;
  recomendacion: string;
  tendencia: 'improving' | 'stable' | 'declining';
  highlight: string;
  riesgo: string;
}

export interface TodayEvaluation {
  today: DailyEvaluation | null;
  yesterday: DailyEvaluation | null;
}

export interface LeaderboardEntry {
  position: number;
  user_id: string;
  user_name: string;
  total_xp: number;
  is_current_user: boolean;
}
