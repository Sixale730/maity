import { useMemo } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  scores: {
    clarity: number;
    structure: number;
    empathy: number;
    vocabulary: number;
    objective: number;
    overall: number;
  };
  trend: 'up' | 'down' | 'stable';
  trendDelta: number;
  sessionsThisMonth: number;
  lastActive: string;
  streak: number;
}

export interface TeamKPI {
  label: string;
  value: number;
  suffix: string;
  delta: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

export interface DimensionDistribution {
  dimension: string;
  color: string;
  green: number; // % with score >= 7
  yellow: number; // % with score 4-6.9
  red: number; // % with score < 4
}

export interface TeamRadarPoint {
  dimension: string;
  team: number;
  benchmark: number;
}

export interface ScoreEvolutionPoint {
  month: string;
  score: number;
  sessions: number;
}

export interface ActionPlanItem {
  id: string;
  type: 'team' | 'individual';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  targetUser?: string;
  dimension: string;
  accent: string;
}

export interface TeamDimensionTrendPoint {
  month: string;
  clarity: number;
  structure: number;
  empathy: number;
  vocabulary: number;
  objective: number;
}

export interface TeamMuletillasTrendPoint {
  month: string;
  avg: number;
  best: number;
  worst: number;
}

export interface TeamEmotionTrendPoint {
  month: string;
  anticipation: number;
  confidence: number;
  joy: number;
}

export interface TeamRadarComparisonPoint {
  dimension: string;
  firstMonth: number;
  currentMonth: number;
}

export interface RecentTeamSession {
  id: string;
  member: string;
  date: string;
  type: string;
  global: number;
  clarity: number;
  structure: number;
  empathy: number;
  muletillas: number;
}

export interface EngagementHeatmapCell {
  member: string;
  initials: string;
  days: number[]; // sessions per day for last 30 days
}

export interface TopFillerWord {
  word: string;
  count: number;
  color: string;
}

export interface TeamDashboardData {
  // Executive summary
  teamScore: number;
  teamScoreDelta: number;
  totalMembers: number;
  activeMembers: number;
  improving: number;
  worsening: number;
  stable: number;
  totalSessions: number;

  // KPIs
  kpis: TeamKPI[];

  // Team members (for heatmap)
  members: TeamMember[];

  // Distribution per dimension
  distribution: DimensionDistribution[];

  // Team radar
  radarData: TeamRadarPoint[];

  // Score evolution
  scoreEvolution: ScoreEvolutionPoint[];

  // Rankings
  topImprovers: { name: string; delta: number; avatar?: string }[];
  needsAttention: { name: string; issue: string; score: number; avatar?: string }[];

  // Action plans
  actionPlans: ActionPlanItem[];

  // Dimension trend (team average per month)
  dimensionTrend: TeamDimensionTrendPoint[];

  // Muletillas trend (team average per month)
  muletillasTrend: TeamMuletillasTrendPoint[];

  // Emotion trend (team aggregate per month)
  emotionTrend: TeamEmotionTrendPoint[];

  // Radar comparison (first month vs current)
  radarComparison: TeamRadarComparisonPoint[];

  // Recent sessions across all members
  recentSessions: RecentTeamSession[];

  // Engagement heatmap (GitHub-style: member × days)
  engagementHeatmap: EngagementHeatmapCell[];

  // Top filler words (team aggregate)
  topFillerWords: TopFillerWord[];

  // Loading
  loading: boolean;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_MEMBERS: TeamMember[] = [
  {
    id: '1', name: 'María Beltrán', role: 'Ventas', streak: 12,
    scores: { clarity: 8.2, structure: 7.5, empathy: 9.1, vocabulary: 7.8, objective: 8.0, overall: 8.1 },
    trend: 'up', trendDelta: 0.8, sessionsThisMonth: 14, lastActive: 'Hoy',
  },
  {
    id: '2', name: 'Carlos Mendoza', role: 'Soporte', streak: 5,
    scores: { clarity: 6.5, structure: 7.2, empathy: 5.8, vocabulary: 6.0, objective: 6.8, overall: 6.5 },
    trend: 'down', trendDelta: -0.4, sessionsThisMonth: 8, lastActive: 'Ayer',
  },
  {
    id: '3', name: 'Lupita Hernández', role: 'Ventas', streak: 22,
    scores: { clarity: 9.0, structure: 8.8, empathy: 8.5, vocabulary: 9.2, objective: 8.7, overall: 8.8 },
    trend: 'up', trendDelta: 1.2, sessionsThisMonth: 18, lastActive: 'Hoy',
  },
  {
    id: '4', name: 'Diego Ramírez', role: 'Marketing', streak: 0,
    scores: { clarity: 4.2, structure: 5.0, empathy: 6.1, vocabulary: 4.5, objective: 3.8, overall: 4.7 },
    trend: 'down', trendDelta: -1.1, sessionsThisMonth: 3, lastActive: 'Hace 5 días',
  },
  {
    id: '5', name: 'Ana Torres', role: 'Ventas', streak: 8,
    scores: { clarity: 7.8, structure: 8.0, empathy: 7.5, vocabulary: 7.2, objective: 7.9, overall: 7.7 },
    trend: 'up', trendDelta: 0.5, sessionsThisMonth: 11, lastActive: 'Hoy',
  },
  {
    id: '6', name: 'Roberto Juárez', role: 'Soporte', streak: 3,
    scores: { clarity: 5.5, structure: 4.8, empathy: 7.0, vocabulary: 5.2, objective: 5.0, overall: 5.5 },
    trend: 'stable', trendDelta: 0.1, sessionsThisMonth: 6, lastActive: 'Hace 2 días',
  },
  {
    id: '7', name: 'Sofía Castillo', role: 'Ventas', streak: 15,
    scores: { clarity: 8.5, structure: 8.2, empathy: 8.8, vocabulary: 8.0, objective: 8.4, overall: 8.4 },
    trend: 'up', trendDelta: 0.6, sessionsThisMonth: 16, lastActive: 'Hoy',
  },
  {
    id: '8', name: 'Fernando Ortiz', role: 'Marketing', streak: 1,
    scores: { clarity: 6.0, structure: 6.5, empathy: 5.5, vocabulary: 6.8, objective: 6.2, overall: 6.2 },
    trend: 'down', trendDelta: -0.3, sessionsThisMonth: 5, lastActive: 'Hace 3 días',
  },
];

const MOCK_DISTRIBUTION: DimensionDistribution[] = [
  { dimension: 'Claridad', color: '#485df4', green: 50, yellow: 25, red: 25 },
  { dimension: 'Estructura', color: '#ff8c42', green: 37, yellow: 38, red: 25 },
  { dimension: 'Empatía', color: '#ef4444', green: 62, yellow: 25, red: 13 },
  { dimension: 'Vocabulario', color: '#9b4dca', green: 37, yellow: 38, red: 25 },
  { dimension: 'Objetivo', color: '#ffd93d', green: 50, yellow: 25, red: 25 },
];

const MOCK_RADAR: TeamRadarPoint[] = [
  { dimension: 'Claridad', team: 69, benchmark: 72 },
  { dimension: 'Estructura', team: 70, benchmark: 68 },
  { dimension: 'Empatía', team: 73, benchmark: 70 },
  { dimension: 'Vocabulario', team: 68, benchmark: 71 },
  { dimension: 'Objetivo', team: 68, benchmark: 69 },
];

const MOCK_EVOLUTION: ScoreEvolutionPoint[] = [
  { month: 'Sep', score: 5.8, sessions: 42 },
  { month: 'Oct', score: 6.2, sessions: 58 },
  { month: 'Nov', score: 6.5, sessions: 65 },
  { month: 'Dic', score: 6.8, sessions: 71 },
  { month: 'Ene', score: 7.1, sessions: 78 },
  { month: 'Feb', score: 7.0, sessions: 81 },
];

const MOCK_ACTION_PLANS: ActionPlanItem[] = [
  {
    id: '1', type: 'team', priority: 'high',
    title: 'Taller de Estructura del Mensaje',
    description: 'El 25% del equipo tiene score bajo en estructura. Programar taller grupal.',
    dimension: 'Estructura', accent: '#ff8c42',
  },
  {
    id: '2', type: 'individual', priority: 'high',
    title: 'Coaching individual - Diego R.',
    description: 'Score general de 4.7. Requiere seguimiento semanal urgente.',
    targetUser: 'Diego Ramírez', dimension: 'General', accent: '#ef4444',
  },
  {
    id: '3', type: 'team', priority: 'medium',
    title: 'Ejercicios de Vocabulario Técnico',
    description: 'Reforzar vocabulario profesional con sesiones de roleplay temáticas.',
    dimension: 'Vocabulario', accent: '#9b4dca',
  },
  {
    id: '4', type: 'individual', priority: 'medium',
    title: 'Reconocimiento - Lupita H.',
    description: 'Mejora del +1.2 este mes. Considerar como mentora del equipo.',
    targetUser: 'Lupita Hernández', dimension: 'Liderazgo', accent: '#1bea9a',
  },
  {
    id: '5', type: 'team', priority: 'low',
    title: 'Meta de sesiones mensuales',
    description: 'Incrementar de 10 a 12 sesiones mensuales promedio por persona.',
    dimension: 'Engagement', accent: '#485df4',
  },
];

const MOCK_DIMENSION_TREND: TeamDimensionTrendPoint[] = [
  { month: 'Sep', clarity: 5.2, structure: 4.8, empathy: 6.0, vocabulary: 5.5, objective: 4.9 },
  { month: 'Oct', clarity: 5.6, structure: 5.1, empathy: 6.3, vocabulary: 5.7, objective: 5.2 },
  { month: 'Nov', clarity: 6.0, structure: 5.5, empathy: 6.5, vocabulary: 5.9, objective: 5.6 },
  { month: 'Dic', clarity: 6.4, structure: 5.8, empathy: 6.8, vocabulary: 6.2, objective: 5.9 },
  { month: 'Ene', clarity: 6.8, structure: 6.2, empathy: 7.1, vocabulary: 6.5, objective: 6.3 },
  { month: 'Feb', clarity: 7.0, structure: 6.5, empathy: 7.3, vocabulary: 6.8, objective: 6.5 },
];

const MOCK_MULETILLAS_TREND: TeamMuletillasTrendPoint[] = [
  { month: 'Sep', avg: 4.2, best: 2.1, worst: 6.8 },
  { month: 'Oct', avg: 3.8, best: 1.9, worst: 6.2 },
  { month: 'Nov', avg: 3.5, best: 1.7, worst: 5.8 },
  { month: 'Dic', avg: 3.2, best: 1.5, worst: 5.5 },
  { month: 'Ene', avg: 2.9, best: 1.3, worst: 5.1 },
  { month: 'Feb', avg: 2.7, best: 1.2, worst: 4.8 },
];

const MOCK_EMOTION_TREND: TeamEmotionTrendPoint[] = [
  { month: 'Sep', anticipation: 0.72, confidence: 0.55, joy: 0.30 },
  { month: 'Oct', anticipation: 0.75, confidence: 0.58, joy: 0.33 },
  { month: 'Nov', anticipation: 0.78, confidence: 0.62, joy: 0.38 },
  { month: 'Dic', anticipation: 0.76, confidence: 0.65, joy: 0.42 },
  { month: 'Ene', anticipation: 0.80, confidence: 0.68, joy: 0.48 },
  { month: 'Feb', anticipation: 0.82, confidence: 0.70, joy: 0.52 },
];

const MOCK_RADAR_COMPARISON: TeamRadarComparisonPoint[] = [
  { dimension: 'Claridad', firstMonth: 52, currentMonth: 70 },
  { dimension: 'Estructura', firstMonth: 48, currentMonth: 65 },
  { dimension: 'Empatía', firstMonth: 60, currentMonth: 73 },
  { dimension: 'Vocabulario', firstMonth: 55, currentMonth: 68 },
  { dimension: 'Objetivo', firstMonth: 49, currentMonth: 65 },
];

const MOCK_RECENT_SESSIONS: RecentTeamSession[] = [
  { id: 's1', member: 'Lupita Hernández', date: '9 Feb', type: 'Coaching', global: 8.8, clarity: 9.0, structure: 8.8, empathy: 8.5, muletillas: 1.2 },
  { id: 's2', member: 'María Beltrán', date: '9 Feb', type: 'Reunión', global: 8.1, clarity: 8.2, structure: 7.5, empathy: 9.1, muletillas: 1.8 },
  { id: 's3', member: 'Sofía Castillo', date: '8 Feb', type: 'Roleplay', global: 8.4, clarity: 8.5, structure: 8.2, empathy: 8.8, muletillas: 1.5 },
  { id: 's4', member: 'Ana Torres', date: '8 Feb', type: 'Coaching', global: 7.7, clarity: 7.8, structure: 8.0, empathy: 7.5, muletillas: 2.1 },
  { id: 's5', member: 'Carlos Mendoza', date: '7 Feb', type: 'Reunión', global: 6.5, clarity: 6.5, structure: 7.2, empathy: 5.8, muletillas: 3.2 },
  { id: 's6', member: 'Fernando Ortiz', date: '7 Feb', type: 'Roleplay', global: 6.2, clarity: 6.0, structure: 6.5, empathy: 5.5, muletillas: 3.5 },
  { id: 's7', member: 'Roberto Juárez', date: '6 Feb', type: 'Coaching', global: 5.5, clarity: 5.5, structure: 4.8, empathy: 7.0, muletillas: 3.8 },
  { id: 's8', member: 'Diego Ramírez', date: '4 Feb', type: 'Reunión', global: 4.7, clarity: 4.2, structure: 5.0, empathy: 6.1, muletillas: 4.5 },
];

// Generate engagement heatmap: 8 members × 30 days
function generateEngagementHeatmap(members: TeamMember[]): EngagementHeatmapCell[] {
  // Seed-based pseudo-random for consistent renders
  const patterns: Record<string, number[]> = {
    '1': [1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,1,0,1,1,0,1,0,1,1], // María - very active
    '2': [0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0], // Carlos - sporadic
    '3': [1,1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1,1], // Lupita - most active
    '4': [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1], // Diego - very low
    '5': [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], // Ana - consistent
    '6': [0,0,1,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], // Roberto - low
    '7': [1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0], // Sofía - active
    '8': [0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0], // Fernando - low
  };
  return members.map(m => ({
    member: m.name,
    initials: m.name.split(' ').map(n => n[0]).join(''),
    days: patterns[m.id] || Array(30).fill(0),
  }));
}

const MOCK_TOP_FILLER_WORDS: TopFillerWord[] = [
  { word: 'este...', count: 142, color: '#f97316' },
  { word: 'o sea', count: 128, color: '#f97316' },
  { word: 'entonces', count: 105, color: '#fb923c' },
  { word: 'verdad', count: 89, color: '#fb923c' },
  { word: 'como que', count: 72, color: '#fdba74' },
  { word: 'digamos', count: 58, color: '#fdba74' },
  { word: 'básicamente', count: 45, color: '#fed7aa' },
];

// ============================================================================
// HOOK
// ============================================================================

export function useTeamDashboardData(): TeamDashboardData {
  const members = MOCK_MEMBERS;

  const teamScore = useMemo(() => {
    const sum = members.reduce((acc, m) => acc + m.scores.overall, 0);
    return Math.round((sum / members.length) * 10) / 10;
  }, [members]);

  const kpis = useMemo((): TeamKPI[] => {
    const avgClarity = members.reduce((a, m) => a + m.scores.clarity, 0) / members.length;
    const avgStructure = members.reduce((a, m) => a + m.scores.structure, 0) / members.length;
    const avgEmpathy = members.reduce((a, m) => a + m.scores.empathy, 0) / members.length;
    const totalSessionsMonth = members.reduce((a, m) => a + m.sessionsThisMonth, 0);

    return [
      { label: 'Claridad Promedio', value: Math.round(avgClarity * 10) / 10, suffix: '/10', delta: 0.4, trend: 'up', icon: 'clarity', color: '#485df4' },
      { label: 'Estructura Promedio', value: Math.round(avgStructure * 10) / 10, suffix: '/10', delta: 0.2, trend: 'up', icon: 'structure', color: '#ff8c42' },
      { label: 'Empatía Promedio', value: Math.round(avgEmpathy * 10) / 10, suffix: '/10', delta: -0.1, trend: 'down', icon: 'empathy', color: '#ef4444' },
      { label: 'Sesiones Este Mes', value: totalSessionsMonth, suffix: '', delta: 12, trend: 'up', icon: 'sessions', color: '#1bea9a' },
    ];
  }, [members]);

  const improving = members.filter(m => m.trend === 'up').length;
  const worsening = members.filter(m => m.trend === 'down').length;
  const stable = members.filter(m => m.trend === 'stable').length;
  const totalSessions = members.reduce((a, m) => a + m.sessionsThisMonth, 0);

  const topImprovers = useMemo(() =>
    members
      .filter(m => m.trend === 'up')
      .sort((a, b) => b.trendDelta - a.trendDelta)
      .slice(0, 3)
      .map(m => ({ name: m.name, delta: m.trendDelta })),
    [members]
  );

  const needsAttention = useMemo(() =>
    members
      .filter(m => m.scores.overall < 6 || m.trend === 'down')
      .sort((a, b) => a.scores.overall - b.scores.overall)
      .slice(0, 3)
      .map(m => ({
        name: m.name,
        issue: m.scores.overall < 5 ? 'Score crítico' : m.trend === 'down' ? 'Tendencia negativa' : 'Score bajo',
        score: m.scores.overall,
      })),
    [members]
  );

  return {
    teamScore,
    teamScoreDelta: 0.3,
    totalMembers: members.length,
    activeMembers: members.filter(m => m.sessionsThisMonth > 0).length,
    improving,
    worsening,
    stable,
    totalSessions,
    kpis,
    members,
    distribution: MOCK_DISTRIBUTION,
    radarData: MOCK_RADAR,
    scoreEvolution: MOCK_EVOLUTION,
    topImprovers,
    needsAttention,
    actionPlans: MOCK_ACTION_PLANS,
    dimensionTrend: MOCK_DIMENSION_TREND,
    muletillasTrend: MOCK_MULETILLAS_TREND,
    emotionTrend: MOCK_EMOTION_TREND,
    radarComparison: MOCK_RADAR_COMPARISON,
    recentSessions: MOCK_RECENT_SESSIONS,
    engagementHeatmap: generateEngagementHeatmap(members),
    topFillerWords: MOCK_TOP_FILLER_WORDS,
    loading: false,
  };
}
