import { Lightbulb } from 'lucide-react';
import { Card } from '@/ui/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { WHEEL_AREAS } from '@maity/shared';
import type { WheelRecommendation } from '@maity/shared';

interface RecommendationsProps {
  recommendations: WheelRecommendation[];
}

export function Recommendations({ recommendations }: RecommendationsProps) {
  const { t } = useLanguage();

  return (
    <Card className="bg-[#0F0F0F] border-[#2a2a3e] p-4">
      <h3 className="text-sm font-bold text-purple-400 mb-4 flex items-center gap-2">
        <Lightbulb size={16} />
        {t('wheel_of_life.recommendations')}
      </h3>
      <div className="space-y-3">
        {recommendations.map(rec => {
          const meta = WHEEL_AREAS.find(w => w.id === rec.area_id);
          if (!meta) return null;
          return (
            <div
              key={rec.area_id}
              className="flex gap-3 p-3 rounded-lg border border-[#2a2a3e]"
            >
              <span className="text-xl">{meta.icon}</span>
              <div>
                <div className="text-sm font-medium text-white mb-1">
                  {t(meta.labelKey)}
                </div>
                <p className="text-xs text-gray-400">
                  {t(rec.text_key)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
