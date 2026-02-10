import { Slider } from '@/ui/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';

interface AreaSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
}

export function AreaSlider({ label, value, onChange, color }: AreaSliderProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color }}
        >
          {value}
        </span>
      </div>

      <Slider
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />

      <div className="flex justify-between text-[10px] text-gray-600">
        <span>1 - {t('wheel_of_life.score_low')}</span>
        <span>10 - {t('wheel_of_life.score_high')}</span>
      </div>
    </div>
  );
}
