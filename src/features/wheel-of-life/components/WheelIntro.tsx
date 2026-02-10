import { ArrowRight, Zap, Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { Card } from '@/ui/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface WheelIntroProps {
  onStart: () => void;
  hasRestoredProgress: boolean;
  onContinue: () => void;
}

export function WheelIntro({ onStart, hasRestoredProgress, onContinue }: WheelIntroProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Icon */}
      <div className="text-7xl mb-6">🎡</div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
        {t('wheel_of_life.title')}
      </h1>

      <p className="text-gray-400 text-center max-w-lg mb-8">
        {t('wheel_of_life.intro_description')}
      </p>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg w-full mb-8">
        <Card className="bg-[#0F0F0F] border-[#2a2a3e] p-4 text-center">
          <div className="text-2xl mb-1">12</div>
          <div className="text-xs text-gray-500">{t('wheel_of_life.areas_count')}</div>
        </Card>
        <Card className="bg-[#0F0F0F] border-[#2a2a3e] p-4 text-center">
          <Clock size={20} className="mx-auto mb-1 text-gray-400" />
          <div className="text-xs text-gray-500">~10 min</div>
        </Card>
        <Card className="bg-[#0F0F0F] border-[#2a2a3e] p-4 text-center">
          <Zap size={20} className="mx-auto mb-1 text-pink-400" />
          <div className="text-xs text-gray-500">+150 XP</div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {hasRestoredProgress ? (
          <>
            <Button
              onClick={onContinue}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white"
              size="lg"
            >
              <RotateCcw size={18} className="mr-2" />
              {t('wheel_of_life.continue_progress')}
            </Button>
            <Button
              onClick={onStart}
              variant="outline"
              className="w-full border-[#2a2a3e] text-gray-400 hover:text-white"
            >
              {t('wheel_of_life.start_new')}
            </Button>
          </>
        ) : (
          <Button
            onClick={onStart}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white"
            size="lg"
          >
            {t('wheel_of_life.start')}
            <ArrowRight size={18} className="ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
