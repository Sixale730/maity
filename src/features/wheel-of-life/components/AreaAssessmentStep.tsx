import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { Textarea } from '@/ui/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import type { WheelOfLifeAreaAssessment, WheelAreaMeta } from '@maity/shared';
import { AreaSlider } from './AreaSlider';
import { AreaProgressIndicator } from './AreaProgressIndicator';

interface AreaAssessmentStepProps {
  areaMeta: WheelAreaMeta;
  area: WheelOfLifeAreaAssessment;
  currentIndex: number;
  totalAreas: number;
  allAreas: WheelOfLifeAreaAssessment[];
  onSetScore: (field: 'current_score' | 'desired_score', value: number) => void;
  onSetReason: (reason: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function AreaAssessmentStep({
  areaMeta,
  area,
  currentIndex,
  totalAreas,
  allAreas,
  onSetScore,
  onSetReason,
  onNext,
  onPrevious,
  isFirst,
  isLast,
}: AreaAssessmentStepProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-lg mx-auto px-4 space-y-6">
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{currentIndex + 1} / {totalAreas}</span>
          <span>{Math.round(((currentIndex + 1) / totalAreas) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((currentIndex + 1) / totalAreas) * 100}%`,
              backgroundColor: areaMeta.color,
            }}
          />
        </div>
        <AreaProgressIndicator currentIndex={currentIndex} areas={allAreas} />
      </div>

      {/* Area Header */}
      <div className="text-center space-y-2">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mx-auto"
          style={{ backgroundColor: `${areaMeta.color}20` }}
        >
          {areaMeta.icon}
        </div>
        <h2 className="text-xl font-bold text-white">{t(areaMeta.labelKey)}</h2>
        <p className="text-sm text-gray-400">{t(areaMeta.descriptionKey)}</p>
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        <AreaSlider
          label={t('wheel_of_life.current_score')}
          value={area.current_score}
          onChange={(v) => onSetScore('current_score', v)}
          color={areaMeta.color}
        />
        <AreaSlider
          label={t('wheel_of_life.desired_score')}
          value={area.desired_score}
          onChange={(v) => onSetScore('desired_score', v)}
          color="#f15bb5"
        />
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">
          {t('wheel_of_life.reason_label')}
          <span className="text-gray-600 ml-1">({t('wheel_of_life.optional')})</span>
        </label>
        <Textarea
          value={area.reason}
          onChange={(e) => onSetReason(e.target.value)}
          placeholder={t('wheel_of_life.reason_placeholder')}
          className="bg-[#0F0F0F] border-[#2a2a3e] text-gray-200 placeholder:text-gray-600 resize-none"
          rows={2}
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex-1 border-[#2a2a3e] text-gray-400 hover:text-white"
          disabled={isFirst}
        >
          <ArrowLeft size={16} className="mr-1" />
          {t('wheel_of_life.previous')}
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 text-white"
          style={{ backgroundColor: areaMeta.color }}
        >
          {isLast ? t('wheel_of_life.review') : t('wheel_of_life.next')}
          <ArrowRight size={16} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}
