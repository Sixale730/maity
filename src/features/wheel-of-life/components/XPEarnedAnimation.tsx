import { useEffect, useState } from 'react';
import { Zap, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface XPEarnedAnimationProps {
  xpEarned: number;
  isFirstAttempt: boolean;
  totalXP: number;
}

export function XPEarnedAnimation({ xpEarned, isFirstAttempt, totalXP }: XPEarnedAnimationProps) {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        text-center space-y-3 transition-all duration-700
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {/* XP Badge */}
      <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30">
        <Zap size={24} className="text-pink-400" />
        <span className="text-3xl font-black text-white">+{xpEarned}</span>
        <span className="text-sm font-bold text-pink-300">XP</span>
      </div>

      {/* First attempt bonus */}
      {isFirstAttempt && (
        <div className="flex items-center justify-center gap-1 text-yellow-400 text-sm">
          <Star size={14} />
          <span>{t('wheel_of_life.first_attempt_bonus')}</span>
        </div>
      )}

      {/* Total */}
      <div className="text-xs text-gray-500">
        {t('wheel_of_life.total_xp')}: <span className="text-white font-bold">{totalXP}</span>
      </div>
    </div>
  );
}
