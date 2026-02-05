import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getOmiConversations, OmiConversation } from '@/features/omi/services/omi.service';
import { useFormResponses } from '@maity/shared';

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

const MOCK_RANKING: RankingEntry[] = [
  { position: 1, name: 'Mary B.', xp: 58000 },
  { position: 2, name: 'Lupita', xp: 23000 },
  { position: 3, name: 'Carlos M.', xp: 15000 },
  { position: 28, name: 'Tú', xp: 170, isCurrentUser: true },
];

const MOCK_BADGES: Badge[] = [
  { id: '1', name: 'Negociador Valiente', xp: 50, icon: '🛡️', color: '#3b82f6', unlocked: true },
  { id: '2', name: 'Precisión Verbal', xp: 90, icon: '🎯', color: '#ef4444', unlocked: true },
  { id: '3', name: 'Empático', xp: 50, icon: '❤️', color: '#10b981', unlocked: true },
  { id: '4', name: 'Astucia Disruptiva', xp: 170, icon: '🧠', color: '#9333ea', unlocked: true },
  { id: '5', name: 'Orador Maestro', xp: 500, icon: '🎤', color: '#f59e0b', unlocked: false },
  { id: '6', name: 'Líder Nato', xp: 1000, icon: '👑', color: '#ec4899', unlocked: false },
];

const MOCK_MISSION: Mission = {
  name: 'Montaña de Fuego',
  enemy: 'EL REGATEADOR',
  enemyDesc: 'Escéptico, Ocupado, Orientado a datos',
  enemyIcon: '👹',
  items: [
    { name: 'Pico de Piedra', icon: '⛏️' },
    { name: 'Casco de Lava', icon: '⛑️' },
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
      emoji: conv.emoji || '💬',
    };
  });
}

export function useGamifiedDashboardDataV2(): GamifiedDashboardDataV2 {
  const { userProfile } = useUser();
  const { radarData, loading: formLoading } = useFormResponses();
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

  // Calculate streak from conversations
  const streakDays = useMemo(() => {
    if (conversations.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daySet = new Set(
      conversations.map(c => {
        const d = new Date(c.created_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );
    let streak = 0;
    const checkDay = new Date(today);
    while (daySet.has(checkDay.getTime())) {
      streak++;
      checkDay.setDate(checkDay.getDate() - 1);
    }
    return streak;
  }, [conversations]);

  // Score from last 2 conversations
  const score = useMemo(() => {
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
    return { yesterday: 5.6, today: 7.2 };
  }, [conversations]);

  // Calculate XP (mock calculation based on conversations and scores)
  const totalXP = useMemo(() => {
    const baseXP = conversations.length * 10;
    const scoreXP = conversations.reduce((acc, c) => {
      const s = c.communication_feedback?.overall_score || 0;
      return acc + Math.round(s * 5);
    }, 0);
    return baseXP + scoreXP + 50; // +50 base for signing up
  }, [conversations]);

  const { level, rank, nextLevelXP } = useMemo(() => calculateLevel(totalXP), [totalXP]);

  // Update ranking with user name
  const ranking = useMemo(() => {
    const r = [...MOCK_RANKING];
    if (userProfile?.name) {
      const currentIdx = r.findIndex(e => e.isCurrentUser);
      if (currentIdx >= 0) {
        r[currentIdx] = { ...r[currentIdx], name: userProfile.name.split(' ')[0], xp: totalXP };
      }
    }
    return r;
  }, [userProfile?.name, totalXP]);

  // Update badges based on XP
  const badges = useMemo(() => {
    return MOCK_BADGES.map(badge => ({
      ...badge,
      unlocked: totalXP >= badge.xp,
    }));
  }, [totalXP]);

  // Recent activity
  const recentActivity = useMemo(() => formatRecentActivity(conversations), [conversations]);

  // Analytics (mock with some real data hints)
  const analytics = useMemo(() => {
    // In a real implementation, these would come from transcript analysis
    return {
      muletillasScore: 94, // Higher is better (less filler words)
      flowScore: 27,
    };
  }, []);

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
    score,
    nodes,
    completedNodes,
    competencies,
    mission: {
      ...mission,
      map: mission.name, // alias for the new dashboard
    },
    badges,
    analytics: {
      ...analytics,
      muletillas: analytics.muletillasScore, // alias
      flow: analytics.flowScore, // alias
    },
    ranking,
    recentActivity,
    loading: loading || formLoading,
  };
}
