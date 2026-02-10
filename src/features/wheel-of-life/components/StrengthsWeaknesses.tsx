import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/ui/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { WHEEL_AREAS } from '@maity/shared';
import type { WheelOfLifeAreaId } from '@maity/shared';

interface StrengthsWeaknessesProps {
  strengths: WheelOfLifeAreaId[];
  weaknesses: WheelOfLifeAreaId[];
}

export function StrengthsWeaknesses({ strengths, weaknesses }: StrengthsWeaknessesProps) {
  const { t } = useLanguage();

  const renderAreaList = (areaIds: WheelOfLifeAreaId[], type: 'strength' | 'weakness') => (
    <div className="space-y-2">
      {areaIds.map(areaId => {
        const meta = WHEEL_AREAS.find(w => w.id === areaId);
        if (!meta) return null;
        return (
          <div
            key={areaId}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ backgroundColor: `${meta.color}10` }}
          >
            <span className="text-xl">{meta.icon}</span>
            <span className="text-sm font-medium text-white">{t(meta.labelKey)}</span>
            {type === 'strength' ? (
              <TrendingUp size={14} className="ml-auto text-green-400" />
            ) : (
              <TrendingDown size={14} className="ml-auto text-red-400" />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="bg-[#0F0F0F] border-green-500/20 p-4">
        <h3 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
          <TrendingUp size={16} />
          {t('wheel_of_life.strengths')}
        </h3>
        {renderAreaList(strengths, 'strength')}
      </Card>

      <Card className="bg-[#0F0F0F] border-red-500/20 p-4">
        <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
          <TrendingDown size={16} />
          {t('wheel_of_life.weaknesses')}
        </h3>
        {renderAreaList(weaknesses, 'weakness')}
      </Card>
    </div>
  );
}
