import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Zap, Star } from 'lucide-react';
import { Card } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SkillTest, UserTestProgress } from '../types/skills-arena.types';
import { CATEGORY_METADATA, DIFFICULTY_METADATA } from '../types/skills-arena.types';

interface FeaturedTestCardProps {
  test: SkillTest;
  progress?: UserTestProgress;
}

export function FeaturedTestCard({ test, progress }: FeaturedTestCardProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const categoryMeta = CATEGORY_METADATA[test.category];
  const difficultyMeta = DIFFICULTY_METADATA[test.difficulty];
  const isInProgress = progress?.status === 'in_progress';
  const isCompleted = progress?.status === 'completed';

  const handleClick = () => {
    // Navigate to test page (future implementation)
    navigate(`/skills-arena/${test.slug}`);
  };

  return (
    <Card className="relative overflow-hidden border-2 border-pink-500/30 hover:border-pink-500/50 transition-all duration-300 bg-[#0F0F0F] group">
      {/* Background Gradient */}
      <div
        className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${test.color}20 0%, transparent 50%, ${categoryMeta.color}10 100%)`,
        }}
      />

      {/* Glow Effect */}
      <div
        className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background: `linear-gradient(135deg, ${test.color}10, transparent)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 lg:p-8">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          {/* Featured Badge */}
          <div className="flex items-center gap-2 text-pink-500 font-bold tracking-widest uppercase text-xs">
            <Star size={14} className="fill-current" />
            {t('skills_arena.featured')}
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
            <Clock size={14} className="text-gray-400" />
            <span className="text-xs text-white font-medium">
              {test.estimatedMinutes} min
            </span>
          </div>
        </div>

        {/* Category Tag */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
          style={{
            backgroundColor: `${categoryMeta.color}20`,
            color: categoryMeta.color,
          }}
        >
          <span>{categoryMeta.icon}</span>
          <span className="uppercase tracking-wider">
            {t(categoryMeta.labelKey)}
          </span>
        </div>

        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center text-4xl lg:text-5xl shadow-lg"
            style={{
              backgroundColor: `${test.color}20`,
              boxShadow: `0 0 30px ${test.color}20`,
            }}
          >
            {test.icon}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 group-hover:text-pink-100 transition-colors">
              {t(test.titleKey)}
            </h2>
            <p className="text-gray-400 text-sm lg:text-base leading-relaxed">
              {t(test.descriptionKey)}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Difficulty */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{
              backgroundColor: `${difficultyMeta.color}15`,
              color: difficultyMeta.color,
            }}
          >
            <span>{difficultyMeta.icon}</span>
            <span>{t(difficultyMeta.labelKey)}</span>
          </div>

          {/* XP Reward */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-500/15 rounded-lg text-xs font-bold text-pink-400">
            <Zap size={14} />
            <span>+{test.baseXP} XP</span>
          </div>

          {/* Questions Count */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-xs font-medium text-gray-400">
            <span>{test.questionsCount} {t('skills_arena.questions')}</span>
          </div>
        </div>

        {/* Progress Bar (if in progress) */}
        {isInProgress && progress && (
          <div className="mb-6">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-400">{t('skills_arena.progress')}</span>
              <span className="text-yellow-400 font-bold">{progress.progress}%</span>
            </div>
            <div className="w-full h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress.progress}%`,
                  backgroundColor: '#ffd93d',
                  boxShadow: '0 0 10px #ffd93d60',
                }}
              />
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Button
          onClick={handleClick}
          disabled={isCompleted}
          className="w-full sm:w-auto bg-gradient-to-r from-[#ff0050] to-[#485df4] hover:opacity-90 text-white font-bold px-8 py-4 text-base shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCompleted ? (
            <>
              <span className="mr-2">✓</span>
              {t('skills_arena.completed')}
            </>
          ) : isInProgress ? (
            <>
              {t('skills_arena.continue')}
              <ArrowRight size={18} className="ml-2" />
            </>
          ) : (
            <>
              {t('skills_arena.start')}
              <ArrowRight size={18} className="ml-2" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
