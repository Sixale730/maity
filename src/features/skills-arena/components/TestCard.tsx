import { useNavigate } from 'react-router-dom';
import { Clock, Zap, Lock, Check } from 'lucide-react';
import { Card } from '@/ui/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SkillTest, UserTestProgress } from '../types/skills-arena.types';
import { CATEGORY_METADATA, DIFFICULTY_METADATA } from '../types/skills-arena.types';

interface TestCardProps {
  test: SkillTest;
  progress?: UserTestProgress;
}

export function TestCard({ test, progress }: TestCardProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const categoryMeta = CATEGORY_METADATA[test.category];
  const difficultyMeta = DIFFICULTY_METADATA[test.difficulty];

  const status = progress?.status || 'locked';
  const isLocked = status === 'locked';
  const isInProgress = status === 'in_progress';
  const isCompleted = status === 'completed';
  const isAvailable = status === 'available';

  const handleClick = () => {
    if (!isLocked) {
      navigate(`/skills-arena/${test.slug}`);
    }
  };

  // Border and background styles based on status
  const getStatusStyles = () => {
    if (isLocked) {
      return {
        border: 'border-[#2a2a3e]',
        opacity: 'opacity-60',
        cursor: 'cursor-not-allowed',
        hover: '',
      };
    }
    if (isCompleted) {
      return {
        border: 'border-green-500/30 hover:border-green-500/50',
        opacity: '',
        cursor: 'cursor-pointer',
        hover: 'hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(27,234,154,0.15)]',
      };
    }
    if (isInProgress) {
      return {
        border: 'border-yellow-500/30 hover:border-yellow-500/50',
        opacity: '',
        cursor: 'cursor-pointer',
        hover: 'hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,217,61,0.15)]',
      };
    }
    // Available
    return {
      border: 'border-pink-500/20 hover:border-pink-500/40',
      opacity: '',
      cursor: 'cursor-pointer',
      hover: 'hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,0,80,0.15)]',
    };
  };

  const styles = getStatusStyles();

  return (
    <Card
      onClick={handleClick}
      className={`
        relative overflow-hidden bg-[#0F0F0F] p-5
        transition-all duration-300 group
        ${styles.border} ${styles.opacity} ${styles.cursor} ${styles.hover}
      `}
    >
      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#1a1a2e] flex items-center justify-center">
              <Lock size={20} className="text-gray-500" />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {t('skills_arena.locked')}
            </span>
          </div>
        </div>
      )}

      {/* Completed Badge */}
      {isCompleted && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
            <Check size={16} className="text-green-400" />
          </div>
        </div>
      )}

      {/* Available Pulse */}
      {isAvailable && (
        <div className="absolute top-3 right-3 z-10">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-pink-500 animate-ping opacity-75" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-110"
          style={{
            backgroundColor: isLocked ? '#1a1a2e' : `${test.color}20`,
          }}
        >
          {isLocked ? '🔒' : test.icon}
        </div>

        {/* Category */}
        <div
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold mb-2"
          style={{
            backgroundColor: isLocked ? '#1a1a2e' : `${categoryMeta.color}15`,
            color: isLocked ? '#6b7280' : categoryMeta.color,
          }}
        >
          <span>{categoryMeta.icon}</span>
          <span className="uppercase tracking-wider">
            {t(categoryMeta.labelKey)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-pink-100 transition-colors">
          {t(test.titleKey)}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {t(test.descriptionKey)}
        </p>

        {/* Progress Bar (if in progress) */}
        {isInProgress && progress && (
          <div className="mb-4">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-500">{t('skills_arena.progress')}</span>
              <span className="text-yellow-400 font-bold">{progress.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress.progress}%`,
                  backgroundColor: '#ffd93d',
                }}
              />
            </div>
          </div>
        )}

        {/* Score (if completed) */}
        {isCompleted && progress?.bestScore !== undefined && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs text-gray-500">{t('skills_arena.best_score')}:</span>
            <span className="text-sm font-bold text-green-400">{progress.bestScore}%</span>
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex items-center gap-3 text-xs">
          {/* Duration */}
          <div className="flex items-center gap-1.5 text-gray-500">
            <Clock size={12} />
            <span>{test.estimatedMinutes} min</span>
          </div>

          {/* Difficulty */}
          <div
            className="flex items-center gap-1.5 font-medium"
            style={{
              color: isLocked ? '#6b7280' : difficultyMeta.color,
            }}
          >
            <span>{difficultyMeta.icon}</span>
            <span>{t(difficultyMeta.labelKey)}</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1.5 text-pink-400 font-medium ml-auto">
            <Zap size={12} />
            <span>+{test.baseXP}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
