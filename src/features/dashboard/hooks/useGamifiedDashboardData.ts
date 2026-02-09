import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getOmiConversations, OmiConversation } from '@/features/omi/services/omi.service';
import { useFormResponses } from '@maity/shared';
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

export interface Reward {
  name: string;
  xp: number;
  icon: string;
  color: string;
}

export interface GamifiedDashboardData {
  // User info
  userName: string;
  totalXP: number;
  streakDays: number;
  bonusDays: number; // Weekend bonus days included in streak
  // Score
  score: { yesterday: number; today: number };
  // Mountain nodes
  nodes: MountainNode[];
  completedNodes: number;
  // Competencies (real data from form responses)
  competencies: { name: string; value: number; color: string }[];
  // Mock data
  ranking: RankingEntry[];
  rewards: Reward[];
  muletillasPercent: number;
  // Loading state
  loading: boolean;
}

const NODE_POSITIONS: [number, number][] = [
  [20, 88], [40, 85], [60, 82], [80, 79],   // Row 1 (base)
  [70, 72], [50, 69], [30, 66],              // Row 2
  [40, 58], [60, 55],                        // Row 3
  [50, 47], [35, 42], [65, 37],              // Row 4
  [50, 30], [45, 22], [55, 15],              // Row 5 (summit)
];

const MOCK_RANKING: RankingEntry[] = [
  { position: 1, name: 'Mary B.', xp: 58000 },
  { position: 2, name: 'Lupita', xp: 23000 },
  { position: 3, name: 'Carlos M.', xp: 15000 },
  { position: 28, name: 'Poncho', xp: 170, isCurrentUser: true },
];

const MOCK_REWARDS: Reward[] = [
  { name: 'Negociador Valiente', xp: 170, icon: '\u2602\uFE0F', color: '#3b82f6' },
  { name: 'Presi\u00F3n Verbal', xp: 90, icon: '\uD83D\uDCAA', color: '#ef4444' },
  { name: 'Emp\u00E1tico', xp: 50, icon: '\u2764\uFE0F', color: '#10b981' },
  { name: 'Astucia Disruptiva', xp: 170, icon: '\uD83E\uDDE0', color: '#9333ea' },
];

const COMPETENCY_COLORS: Record<string, string> = {
  'Claridad': '#485df4',
  'Estructura': '#ff8c42',
  'Propósito': '#ffd93d',
  'Empatía': '#ef4444',
};

const ALLOWED_COMPETENCIES = ['Claridad', 'Estructura', 'Propósito', 'Empatía'];

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

export function useGamifiedDashboardData(): GamifiedDashboardData {
  const { userProfile } = useUser();
  const { radarData, loading: formLoading } = useFormResponses();
  const { data: streakData, isLoading: streakLoading } = useUserStreak(userProfile?.id);
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
        console.error('Error loading omi conversations for gamified dashboard:', err);
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

  const competencies = useMemo(() => {
    if (!radarData || radarData.length === 0) {
      return Object.entries(COMPETENCY_COLORS).map(([name, color]) => ({
        name,
        value: 0,
        color,
      }));
    }
    return radarData
      .filter(r => ALLOWED_COMPETENCIES.includes(r.competencia))
      .map(r => ({
        name: r.competencia,
        value: r.usuario,
        color: COMPETENCY_COLORS[r.competencia] || '#666',
      }));
  }, [radarData]);

  // Streak data from RPC (weekdays mandatory, weekends bonus)
  const streakDays = streakData?.streak_days ?? 0;
  const bonusDays = streakData?.bonus_days ?? 0;

  // Mock score from last 2 conversations
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

  const ranking = useMemo(() => {
    const r = [...MOCK_RANKING];
    if (userProfile?.name) {
      const currentIdx = r.findIndex(e => e.isCurrentUser);
      if (currentIdx >= 0) {
        r[currentIdx] = { ...r[currentIdx], name: userProfile.name.split(' ')[0] };
      }
    }
    return r;
  }, [userProfile?.name]);

  return {
    userName: userProfile?.name || 'Usuario',
    totalXP: 170,
    streakDays,
    bonusDays,
    score,
    nodes,
    completedNodes,
    competencies,
    ranking,
    rewards: MOCK_REWARDS,
    muletillasPercent: 42,
    loading: loading || formLoading || streakLoading,
  };
}
