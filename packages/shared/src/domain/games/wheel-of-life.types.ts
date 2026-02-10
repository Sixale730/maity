// =============================================================================
// Wheel of Life Types
// =============================================================================

export type WheelOfLifeAreaId =
  | 'trabajo'
  | 'dinero'
  | 'salud'
  | 'amor'
  | 'crecimiento_personal'
  | 'diversion'
  | 'entorno_fisico'
  | 'espiritualidad'
  | 'amigos'
  | 'familia'
  | 'alimentacion'
  | 'ejercicio_fisico';

export interface WheelOfLifeAreaAssessment {
  area_id: WheelOfLifeAreaId;
  current_score: number; // 1-10
  desired_score: number; // 1-10
  reason: string;
}

/** Shape stored in game_sessions.game_data */
export interface WheelOfLifeData {
  areas: WheelOfLifeAreaAssessment[];
}

export interface WheelAreaGap {
  area_id: WheelOfLifeAreaId;
  gap: number;
  current: number;
  desired: number;
}

/** Shape stored in game_sessions.results */
export interface WheelOfLifeResults {
  strengths: WheelOfLifeAreaId[];
  weaknesses: WheelOfLifeAreaId[];
  biggest_gaps: WheelAreaGap[];
  balance_score: number; // 0-100
  average_current: number;
  average_desired: number;
  recommendations: WheelRecommendation[];
  radar_data: WheelRadarPoint[];
}

export interface WheelRecommendation {
  area_id: WheelOfLifeAreaId;
  text_key: string; // i18n key
}

export interface WheelRadarPoint {
  area_id: WheelOfLifeAreaId;
  label_key: string;
  current: number;
  desired: number;
}

export type WheelStep = 'intro' | 'assessment' | 'review' | 'results';

export interface WheelAreaMeta {
  id: WheelOfLifeAreaId;
  labelKey: string;
  icon: string;
  color: string;
  descriptionKey: string;
}
