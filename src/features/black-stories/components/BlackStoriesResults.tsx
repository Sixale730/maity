import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { Zap, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Mystery } from '../data/mysteries-catalog';

interface BlackStoriesResultsProps {
  mystery: Mystery;
  questionsUsed: number;
  hintsUsed: number;
  xpEarned: number;
  isFirstAttempt: boolean;
  totalXP: number;
  onPlayAgain: () => void;
  onBackToArena: () => void;
}

export function BlackStoriesResults({
  mystery,
  questionsUsed,
  hintsUsed,
  xpEarned,
  isFirstAttempt,
  totalXP,
  onPlayAgain,
  onBackToArena,
}: BlackStoriesResultsProps) {
  const { t } = useLanguage();
  const [showXP, setShowXP] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowXP(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 space-y-6">
      {/* Solution Card */}
      <Card className="bg-gradient-to-br from-[#2a0845] to-[#1a0430] border-2 border-[#d12dff] shadow-[0_0_40px_rgba(209,45,255,0.3)]">
        <CardContent className="p-8 text-center">
          <div className="text-2xl font-extrabold text-[#d12dff] mb-4">
            🎭 {t('black_stories.solution_title')}
          </div>
          <div className="text-5xl mb-4">😱</div>
          <p className="text-lg text-white leading-relaxed font-medium">
            {mystery.solution}
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="flex justify-center gap-4 flex-wrap">
        <Card className="bg-[#1c1a2e] border-[#2a2a3e] flex-1 min-w-[140px]">
          <CardContent className="p-4 text-center">
            <div className="text-gray-400 text-sm">{t('black_stories.questions_used')}</div>
            <div className="text-2xl font-extrabold text-white">{questionsUsed}/10</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1c1a2e] border-[#2a2a3e] flex-1 min-w-[140px]">
          <CardContent className="p-4 text-center">
            <div className="text-gray-400 text-sm">{t('black_stories.hints_used')}</div>
            <div className="text-2xl font-extrabold text-white">{hintsUsed}/3</div>
          </CardContent>
        </Card>
      </div>

      {/* XP Animation */}
      <div
        className={`text-center space-y-3 transition-all duration-700 ${
          showXP ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30">
          <Zap size={24} className="text-pink-400" />
          <span className="text-3xl font-black text-white">+{xpEarned}</span>
          <span className="text-sm font-bold text-pink-300">XP</span>
        </div>

        {isFirstAttempt && (
          <div className="flex items-center justify-center gap-1 text-yellow-400 text-sm">
            <Star size={14} />
            <span>{t('black_stories.first_attempt_bonus')}</span>
          </div>
        )}

        <div className="text-xs text-gray-500">
          {t('black_stories.total_xp')}: <span className="text-white font-bold">{totalXP}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center flex-wrap">
        <Button
          onClick={onPlayAgain}
          className="px-8 py-5 text-base font-bold rounded-full bg-gradient-to-r from-[#d12dff] to-[#5ad0ff] hover:opacity-90 shadow-[0_6px_20px_rgba(209,45,255,0.4)]"
        >
          {t('black_stories.btn_play_again')}
        </Button>
        <Button
          onClick={onBackToArena}
          variant="secondary"
          className="px-8 py-5 text-base font-bold rounded-full bg-gradient-to-r from-[#6c2b8a] to-[#3a1f5c] text-white hover:opacity-90"
        >
          {t('black_stories.btn_back_arena')}
        </Button>
      </div>
    </div>
  );
}
