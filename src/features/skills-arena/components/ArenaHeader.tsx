import { Zap, Flame, Target, Trophy } from 'lucide-react';
import type { ArenaStats } from '../types/skills-arena.types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ArenaHeaderProps {
  stats: ArenaStats;
  userName?: string;
}

// Progress Bar Component
const ProgressBar = ({
  value,
  max = 100,
  color = '#ff0050',
  height = 'h-1.5',
  glow = false,
}: {
  value: number;
  max?: number;
  color?: string;
  height?: string;
  glow?: boolean;
}) => (
  <div className={`w-full bg-[#1a1a2e] rounded-full overflow-hidden ${height}`}>
    <div
      className="h-full rounded-full transition-all duration-1000 ease-out"
      style={{
        width: `${(value / max) * 100}%`,
        backgroundColor: color,
        boxShadow: glow ? `0 0 10px ${color}60` : 'none',
      }}
    />
  </div>
);

export function ArenaHeader({ stats, userName }: ArenaHeaderProps) {
  const { t } = useLanguage();
  const firstName = userName?.split(' ')[0] || 'Usuario';

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
      {/* Left: Avatar + Greeting */}
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-[#ff0050] to-[#485df4] p-1 shadow-lg shadow-pink-500/20">
            <div className="w-full h-full rounded-full bg-[#0a0a12] flex items-center justify-center text-3xl lg:text-4xl">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
          {/* Level badge */}
          <div className="absolute -bottom-1 -right-1 bg-[#485df4] text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-[#0a0a12]">
            Lv.{stats.level}
          </div>
        </div>

        {/* Greeting */}
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white mb-1">
            {t('skills_arena.title')}
          </h1>
          <p className="text-gray-400 text-sm">
            {t('skills_arena.subtitle', { name: firstName })}
          </p>
          {/* XP Progress Bar */}
          <div className="mt-2 w-40 lg:w-48">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>{stats.totalXP} XP</span>
              <span>Lv.{stats.level + 1}</span>
            </div>
            <ProgressBar
              value={stats.levelProgress}
              color="#ff0050"
              height="h-1.5"
              glow
            />
          </div>
        </div>
      </div>

      {/* Right: Quick Stats */}
      <div className="flex flex-wrap gap-3">
        {/* Tests Completed */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2.5 rounded-2xl border border-blue-500/20">
          <div className="p-1.5 bg-blue-500/20 rounded-lg">
            <Trophy size={18} className="text-blue-500" />
          </div>
          <div>
            <div className="text-lg lg:text-xl font-bold text-white">
              {stats.testsCompleted}/{stats.testsTotal}
            </div>
            <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">
              {t('skills_arena.tests_label')}
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 px-4 py-2.5 rounded-2xl border border-orange-500/20">
          <div className="p-1.5 bg-orange-500/20 rounded-lg">
            <Flame size={18} className="text-orange-500" />
          </div>
          <div>
            <div className="text-lg lg:text-xl font-bold text-white">
              {stats.currentStreak}
            </div>
            <div className="text-[10px] text-orange-400 uppercase font-bold tracking-wider">
              {t('skills_arena.streak_label')}
            </div>
          </div>
        </div>

        {/* XP */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-4 py-2.5 rounded-2xl border border-pink-500/20">
          <div className="p-1.5 bg-pink-500/20 rounded-lg">
            <Zap size={18} className="text-pink-500" />
          </div>
          <div>
            <div className="text-lg lg:text-xl font-bold text-white">
              {stats.totalXP}
            </div>
            <div className="text-[10px] text-pink-400 uppercase font-bold tracking-wider">
              XP Total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
