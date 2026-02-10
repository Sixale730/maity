import { Card } from '@/ui/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { WHEEL_AREAS } from '@maity/shared';
import type { WheelAreaGap } from '@maity/shared';

interface GapAnalysisProps {
  gaps: WheelAreaGap[];
}

export function GapAnalysis({ gaps }: GapAnalysisProps) {
  const { t } = useLanguage();

  return (
    <Card className="bg-[#0F0F0F] border-yellow-500/20 p-4">
      <h3 className="text-sm font-bold text-yellow-400 mb-4">
        {t('wheel_of_life.biggest_gaps')}
      </h3>
      <div className="space-y-3">
        {gaps.map(gap => {
          const meta = WHEEL_AREAS.find(w => w.id === gap.area_id);
          if (!meta) return null;
          const pct = (gap.gap / 9) * 100; // max gap is 9 (1 to 10)
          return (
            <div key={gap.area_id} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{meta.icon}</span>
                  <span className="text-sm text-white">{t(meta.labelKey)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-cyan-400">{gap.current}</span>
                  <span className="text-gray-600">→</span>
                  <span className="text-pink-400">{gap.desired}</span>
                  <span className="text-yellow-400 font-bold">+{gap.gap}</span>
                </div>
              </div>
              <div className="w-full h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
