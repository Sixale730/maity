import { RotateCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';
import { Card } from '@/ui/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import type { WheelOfLifeResults as WheelResults, CompleteGameResult } from '@maity/shared';
import { WheelRadarChart } from './WheelRadarChart';
import { StrengthsWeaknesses } from './StrengthsWeaknesses';
import { GapAnalysis } from './GapAnalysis';
import { Recommendations } from './Recommendations';
import { XPEarnedAnimation } from './XPEarnedAnimation';

interface WheelResultsProps {
  results: WheelResults;
  completionResult: CompleteGameResult | null;
  onReset: () => void;
}

export function WheelResultsView({ results, completionResult, onReset }: WheelResultsProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 space-y-6 pb-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-5xl mb-2">🎡</div>
        <h2 className="text-2xl font-bold text-white">
          {t('wheel_of_life.results_title')}
        </h2>
      </div>

      {/* XP Animation */}
      {completionResult?.success && (
        <XPEarnedAnimation
          xpEarned={completionResult.xp_earned ?? 0}
          isFirstAttempt={completionResult.is_first_attempt ?? false}
          totalXP={completionResult.total_xp ?? 0}
        />
      )}

      {/* Balance Score */}
      <Card className="bg-[#0F0F0F] border-[#2a2a3e] p-6 text-center">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          {t('wheel_of_life.balance_score')}
        </div>
        <div className="text-5xl font-black text-white mb-1">
          {results.balance_score}
        </div>
        <div className="text-xs text-gray-500">/ 100</div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div>
            <span className="text-cyan-400 font-bold">{results.average_current}</span>
            <span className="text-gray-500 ml-1">{t('wheel_of_life.avg_current')}</span>
          </div>
          <div>
            <span className="text-pink-400 font-bold">{results.average_desired}</span>
            <span className="text-gray-500 ml-1">{t('wheel_of_life.avg_desired')}</span>
          </div>
        </div>
      </Card>

      {/* Radar Chart */}
      <Card className="bg-[#0F0F0F] border-[#2a2a3e] p-4">
        <h3 className="text-sm font-bold text-white mb-2 text-center">
          {t('wheel_of_life.your_wheel')}
        </h3>
        <WheelRadarChart data={results.radar_data} size="lg" />
      </Card>

      {/* Strengths & Weaknesses */}
      <StrengthsWeaknesses
        strengths={results.strengths}
        weaknesses={results.weaknesses}
      />

      {/* Gap Analysis */}
      <GapAnalysis gaps={results.biggest_gaps} />

      {/* Recommendations */}
      <Recommendations recommendations={results.recommendations} />

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => navigate('/skills-arena')}
          variant="outline"
          className="flex-1 border-[#2a2a3e] text-gray-400 hover:text-white"
        >
          <ArrowLeft size={16} className="mr-1" />
          {t('wheel_of_life.back_to_arena')}
        </Button>
        <Button
          onClick={onReset}
          className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
        >
          <RotateCcw size={16} className="mr-1" />
          {t('wheel_of_life.play_again')}
        </Button>
      </div>
    </div>
  );
}
