import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getOmiConversations, OmiConversation } from '@/features/omi/services/omi.service';
import { useFormResponses, useXPSummary, useTodayEvaluation, useLeaderboard } from '@maity/shared';
import { useUserStreak } from './useUserStreak';

export interface MountainNode {
  index: number;
  x: number;
  y: number;
  status: 'completed' | 'current' | 'locked';
}

export interface RankingEntry {
  position: number;
  name: string;
  xp: number;
  isCurrentUser?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  xp: number;
  icon: string;
  color: string;
  unlocked: boolean;
}

export interface Mission {
  name: string;
  enemy: string;
  enemyDesc: string;
  enemyIcon: string;
  items: { name: string; icon: string }[];
  progress: number;
}

export interface RecentActivity {
  id: string;
  title: string;
  date: string;
  duration: string;
  score: number;
  status: 'excellent' | 'good' | 'warning';
  insight?: string; // Key feedback or summary
  topSkill?: string; // Best performing skill
  emoji?: string; // Category emoji
}

export interface Competency {
  name: string;
  value: number;
  color: string;
}

export interface GamifiedDashboardDataV2 {
  // User info
  userName: string;
  userRole: string;
  level: number;
  rank: string;
  totalXP: number;
  xp: number; // alias for totalXP
  nextLevelXP: number;
  streakDays: number;
  streak: number; // alias for streakDays
  bonusDays: number; // Weekend bonus days included in streak

  // Score
  score: { yesterday: number; today: number };

  // Mountain nodes
  nodes: MountainNode[];
  completedNodes: number;

  // Competencies (6 total for radar)
  competencies: Competency[];

  // Mission (with both property names for compatibility)
  mission: Mission & { map: string };

  // Badges
  badges: Badge[];

  // Analytics
  analytics: {
    muletillasScore: number; // 0-100, higher is better
    flowScore: number; // 0-100
    muletillas: number; // alias
    flow: number; // alias
  };

  // Ranking
  ranking: RankingEntry[];

  // Recent activity
  recentActivity: RecentActivity[];

  // Loading state
  loading: boolean;
}

const NODE_POSITIONS: [number, number][] = [
  [20, 88], [40, 85], [60, 82], [80, 79],
  [70, 72], [50, 69], [30, 66],
  [40, 58], [60, 55],
  [50, 47], [35, 42], [65, 37],
  [50, 30], [45, 22], [55, 15],
];

const BADGE_DEFINITIONS: Omit<Badge, 'unlocked'>[] = [
  { id: '1', name: 'Negociador Valiente', xp: 50, icon: '\uD83D\uDEE1\uFE0F', color: '#3b82f6' },
  { id: '2', name: 'Precisión Verbal', xp: 90, icon: '\uD83C\uDFAF', color: '#ef4444' },
  { id: '3', name: 'Empático', xp: 50, icon: '\u2764\uFE0F', color: '#10b981' },
  { id: '4', name: 'Astucia Disruptiva', xp: 170, icon: '\uD83E\uDDE0', color: '#9333ea' },
  { id: '5', name: 'Orador Maestro', xp: 500, icon: '\uD83C\uDFA4', color: '#f59e0b' },
  { id: '6', name: 'Líder Nato', xp: 1000, icon: '\uD83D\uDC51', color: '#ec4899' },
];

const MOCK_MISSION: Mission = {
  name: 'Montaña de Fuego',
  enemy: 'EL REGATEADOR',
  enemyDesc: 'Escéptico, Ocupado, Orientado a datos',
  enemyIcon: '\uD83D\uDC79',
  items: [
    { name: 'Pico de Piedra', icon: '\u26CF\uFE0F' },
    { name: 'Casco de Lava', icon: '\u26D1\uFE0F' },
  ],
  progress: 35,
};

const COMPETENCY_COLORS: Record<string, string> = {
  'Claridad': '#485df4',
  'Adaptación': '#1bea9a',
  'Persuasión': '#9b4dca',
  'Estructura': '#ff8c42',
  'Propósito': '#ffd93d',
  'Empatía': '#ef4444',
};

const LEVEL_THRESHOLDS = [0, 500, 1500, 3500, 7000, 15000];
const RANK_NAMES = ['Novato', 'Aprendiz', 'Competente', 'Experto', 'Maestro', 'Leyenda'];

function calculateLevel(xp: number): { level: number; rank: string; nextLevelXP: number } {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return {
        level: i + 1,
        rank: RANK_NAMES[i] || 'Leyenda',
        nextLevelXP: LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i],
      };
    }
  }
  return { level: 1, rank: 'Novato', nextLevelXP: 500 };
}

function calculateCompletedNodes(conversations: OmiConversation[]): number {
  const now = new Date();
  const thisMonth = conversations.filter(c => {
    const d = new Date(c.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const uniqueDays = new Set(
    thisMonth.map(c => new Date(c.created_at).toDateString())
  );

  return Math.min(Math.floor(uniqueDays.size / 2), 15);
}

function buildNodes(completedCount: number): MountainNode[] {
  return NODE_POSITIONS.map(([x, y], index) => {
    let status: MountainNode['status'] = 'locked';
    if (index < completedCount) status = 'completed';
    else if (index === completedCount) status = 'current';
    return { index, x, y, status };
  });
}

function formatRecentActivity(conversations: OmiConversation[]): RecentActivity[] {
  return conversations.slice(0, 5).map((conv, i) => {
    const score = conv.communication_feedback?.overall_score || 0;
    const feedback = conv.communication_feedback;
    const date = new Date(conv.created_at);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    let dateStr = date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    if (isToday) dateStr = 'Hoy';
    if (isYesterday) dateStr = 'Ayer';

    const timeStr = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    // Extract insight from feedback or overview
    let insight = '';
    if (feedback?.feedback) {
      insight = feedback.feedback.slice(0, 80) + (feedback.feedback.length > 80 ? '...' : '');
    } else if (conv.overview) {
      insight = conv.overview.slice(0, 80) + (conv.overview.length > 80 ? '...' : '');
    } else if (feedback?.strengths && feedback.strengths.length > 0) {
      insight = `✓ ${feedback.strengths[0]}`;
    }

    // Find top skill
    let topSkill = '';
    if (feedback) {
      const skills = [
        { name: 'Claridad', value: feedback.clarity || 0 },
        { name: 'Empatía', value: feedback.engagement || 0 },
        { name: 'Estructura', value: feedback.structure || 0 },
      ];
      const best = skills.reduce((max, s) => s.value > max.value ? s : max, skills[0]);
      if (best.value > 0) {
        topSkill = best.name;
      }
    }

    return {
      id: conv.id,
      title: conv.title || `Conversación ${i + 1}`,
      date: `${dateStr}, ${timeStr}`,
      duration: conv.duration ? `${Math.round(conv.duration / 60)}:${(conv.duration % 60).toString().padStart(2, '0')}` : '--:--',
      score: Math.round(score * 10),
      status: score >= 8 ? 'excellent' : score >= 6.5 ? 'good' : 'warning',
      insight,
      topSkill,
      emoji: conv.emoji || '\uD83D\uDCAC',
    };
  });
}

export function useGamifiedDashboardDataV2(): GamifiedDashboardDataV2 {
  const { userProfile } = useUser();
  const { radarData, loading: formLoading } = useFormResponses();
  const { data: streakData, isLoading: streakLoading } = useUserStreak(userProfile?.id);
  const { data: xpData, isLoading: xpLoading } = useXPSummary();
  const { data: todayEval, isLoading: evalLoading } = useTodayEvaluation();
  const { data: leaderboardData, isLoading: leaderboardLoading } = useLeaderboard(10);
  const [conversations, setConversations] = useState<OmiConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!userProfile?.id) {
        setLoading(false);
        return;
      }
      try {
        const data = await getOmiConversations(userProfile.id);
        setConversations(data);
      } catch (err) {
        console.error('Error loading omi conversations for gamified dashboard v2:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userProfile?.id]);

  const completedNodes = useMemo(
    () => calculateCompletedNodes(conversations),
    [conversations]
  );

  const nodes = useMemo(() => buildNodes(completedNodes), [completedNodes]);

  // Build 6 competencies for radar chart
  const competencies = useMemo((): Competency[] => {
    const defaultCompetencies = Object.entries(COMPETENCY_COLORS).map(([name, color]) => ({
      name,
      value: 0,
      color,
    }));

    if (!radarData || radarData.length === 0) {
      return defaultCompetencies;
    }

    return defaultCompetencies.map(comp => {
      const found = radarData.find(r => r.competencia === comp.name);
      return {
        ...comp,
        value: found?.usuario || 0,
      };
    });
  }, [radarData]);

  // Streak data from RPC (weekdays mandatory, weekends bonus)
  const streakDays = streakData?.streak_days ?? 0;
  const bonusDays = streakData?.bonus_days ?? 0;

  // Score from daily evaluation (real data) with conversation fallback
  const score = useMemo(() => {
    if (todayEval?.today?.avg_overall_score != null) {
      return {
        today: todayEval.today.avg_overall_score,
        yesterday: todayEval.yesterday?.avg_overall_score ?? 0,
      };
    }
    const scored = conversations.filter(c => c.communication_feedback?.overall_score);
    if (scored.length >= 2) {
      return {
        today: scored[0].communication_feedback!.overall_score!,
        yesterday: scored[1].communication_feedback!.overall_score!,
      };
    }
    if (scored.length === 1) {
      return { today: scored[0].communication_feedback!.overall_score!, yesterday: 0 };
    }
    return { yesterday: 0, today: 0 };
  }, [conversations, todayEval]);

  // Real XP from database
  const totalXP = xpData?.total_xp ?? 0;

  const { level, rank, nextLevelXP } = useMemo(() => calculateLevel(totalXP), [totalXP]);

  // Real ranking from leaderboard RPC
  const ranking = useMemo((): RankingEntry[] => {
    if (leaderboardData && leaderboardData.length > 0) {
      return leaderboardData.map(entry => ({
        position: entry.position,
        name: entry.user_name,
        xp: entry.total_xp,
        isCurrentUser: entry.is_current_user,
      }));
    }
    return [];
  }, [leaderboardData]);

  // Update badges based on real XP
  const badges = useMemo((): Badge[] => {
    return BADGE_DEFINITIONS.map(badge => ({
      ...badge,
      unlocked: totalXP >= badge.xp,
    }));
  }, [totalXP]);

  // Recent activity
  const recentActivity = useMemo(() => formatRecentActivity(conversations), [conversations]);

  // Analytics from daily evaluation (real data)
  const analytics = useMemo(() => {
    const muletillasRate = todayEval?.today?.muletillas_rate ?? 0;
    const ratioHabla = todayEval?.today?.avg_ratio_habla ?? 0;
    const muletillasScore = Math.round(Math.max(0, 100 - muletillasRate));
    const flowScore = Math.round(Math.min(100, ratioHabla * 20));
    return {
      muletillasScore,
      flowScore,
      muletillas: muletillasScore, // alias
      flow: flowScore, // alias
    };
  }, [todayEval]);

  // Mission progress based on completed nodes
  const mission = useMemo((): Mission => ({
    ...MOCK_MISSION,
    progress: Math.round((completedNodes / 15) * 100),
  }), [completedNodes]);

  return {
    userName: userProfile?.name || 'Usuario',
    userRole: 'Comunicador',
    level,
    rank,
    totalXP,
    xp: totalXP, // alias
    nextLevelXP,
    streakDays,
    streak: streakDays, // alias
    bonusDays,
    score,
    nodes,
    completedNodes,
    competencies,
    mission: {
      ...mission,
      map: mission.name, // alias for the new dashboard
    },
    badges,
    analytics,
    ranking,
    recentActivity,
    loading: loading || formLoading || streakLoading || xpLoading || evalLoading || leaderboardLoading,
  };
}
