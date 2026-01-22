import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Label } from '@/ui/components/ui/label';
import { Slider } from '@/ui/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/ui/components/ui/radio-group';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  VECTORIZATION_PRESETS,
  type VectorizationPreset,
  type VectorizationSettings,
} from '@maity/shared';

interface ConversionSettingsProps {
  settings: VectorizationSettings;
  onSettingsChange: (settings: VectorizationSettings) => void;
}

const PRESETS: { key: VectorizationPreset; labelKey: string }[] = [
  { key: 'photo', labelKey: 'svg_converter.preset_photo' },
  { key: 'logo', labelKey: 'svg_converter.preset_logo' },
  { key: 'illustration', labelKey: 'svg_converter.preset_illustration' },
  { key: 'line-art', labelKey: 'svg_converter.preset_line_art' },
];

export function ConversionSettings({
  settings,
  onSettingsChange,
}: ConversionSettingsProps) {
  const { t } = useLanguage();

  const handlePresetChange = (preset: VectorizationPreset) => {
    const presetConfig = VECTORIZATION_PRESETS[preset];
    onSettingsChange({
      preset,
      colorCount: presetConfig.colorCount,
      smoothing: presetConfig.smoothing as 'low' | 'medium' | 'high',
    });
  };

  const handleColorCountChange = (value: number[]) => {
    onSettingsChange({
      ...settings,
      colorCount: value[0],
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t('svg_converter.settings_title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Presets */}
        <div className="space-y-3">
          <Label>{t('svg_converter.preset_label')}</Label>
          <RadioGroup
            value={settings.preset}
            onValueChange={(value) => handlePresetChange(value as VectorizationPreset)}
            className="grid grid-cols-2 gap-2"
          >
            {PRESETS.map(({ key, labelKey }) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={`preset-${key}`} />
                <Label htmlFor={`preset-${key}`} className="cursor-pointer">
                  {t(labelKey)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Color Count */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>{t('svg_converter.color_count_label')}</Label>
            <span className="text-sm text-muted-foreground">{settings.colorCount}</span>
          </div>
          <Slider
            value={[settings.colorCount]}
            onValueChange={handleColorCountChange}
            min={2}
            max={256}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            {t('svg_converter.color_count_hint')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
