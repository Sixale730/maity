import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { Card } from '@/ui/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { WHEEL_AREAS } from '@maity/shared';
import type { WheelOfLifeAreaAssessment } from '@maity/shared';
import { WheelRadarChart } from './WheelRadarChart';

interface WheelReviewProps {
  areas: WheelOfLifeAreaAssessment[];
  onSubmit: () => void;
  onGoToArea: (index: number) => void;
  isSubmitting: boolean;
}

export function WheelReview({ areas, onSubmit, onGoToArea, isSubmitting }: WheelReviewProps) {
  const { t } = useLanguage();

  const radarData = areas.map(a => {
    const meta = WHEEL_AREAS.find(w => w.id === a.area_id)!;
    return {
      area_id: a.area_id,
      label_key: meta.labelKey,
      current: a.current_score,
      desired: a.desired_score,
    };
  });

  return (
    <div className="max-w-2xl mx-auto px-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {t('wheel_of_life.review_title')}
        </h2>
        <p className="text-sm text-gray-400">
          {t('wheel_of_life.review_description')}
        </p>
      </div>

      {/* Mini Radar */}
      <Card className="bg-[#0F0F0F] border-[#2a2a3e] p-4">
        <WheelRadarChart data={radarData} size="sm" />
      </Card>

      {/* Areas Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {areas.map((area, index) => {
          const meta = WHEEL_AREAS.find(w => w.id === area.area_id)!;
          const gap = area.desired_score - area.current_score;

          return (
            <Card
              key={area.area_id}
              className="bg-[#0F0F0F] border-[#2a2a3e] p-3 cursor-pointer hover:border-pink-500/30 transition-colors"
              onClick={() => onGoToArea(index)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {t(meta.labelKey)}
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="text-cyan-400">{t('wheel_of_life.current')}: {area.current_score}</span>
                    <span className="text-pink-400">{t('wheel_of_life.desired')}: {area.desired_score}</span>
                    {gap > 0 && (
                      <span className="text-yellow-400">
                        {t('wheel_of_life.gap')}: {gap}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <Button
          onClick={() => onGoToArea(areas.length - 1)}
          variant="outline"
          className="border-[#2a2a3e] text-gray-400 hover:text-white"
        >
          <ArrowLeft size={16} className="mr-1" />
          {t('wheel_of_life.edit')}
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
          size="lg"
        >
          {isSubmitting ? (
            <span className="animate-pulse">{t('wheel_of_life.submitting')}</span>
          ) : (
            <>
              <Send size={16} className="mr-2" />
              {t('wheel_of_life.submit')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
