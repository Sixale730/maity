/**
 * OnboardingProgress Component
 * Visual progress indicator showing the two main onboarding phases
 */

import { cn } from '@maity/shared';
import { User, ClipboardList, Check } from 'lucide-react';
import type { OnboardingStep } from '../../hooks/useOnboardingFlow';

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
  avatarCompleted: boolean;
  className?: string;
}

const PHASES = [
  {
    step: 0 as OnboardingStep,
    label: 'Tu Avatar',
    icon: User,
  },
  {
    step: 1 as OnboardingStep, // Instructions and questionnaire are combined as "Cuestionario" phase
    label: 'Cuestionario',
    icon: ClipboardList,
  },
];

export function OnboardingProgress({
  currentStep,
  avatarCompleted,
  className,
}: OnboardingProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-center gap-4">
        {PHASES.map((phase, index) => {
          // Phase is complete if:
          // - Avatar phase (0): avatarCompleted is true
          // - Questionnaire phase (1/2): currentStep > 1 (which means form completed, but that's handled outside)
          const isComplete = phase.step === 0 ? avatarCompleted : false;
          const isCurrent =
            phase.step === 0
              ? currentStep === 0
              : currentStep === 1 || currentStep === 2;
          const Icon = phase.icon;

          return (
            <div key={phase.step} className="flex items-center">
              {/* Step indicator */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                    isComplete
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isCurrent ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {phase.label}
                </span>
              </div>

              {/* Connector line (not after last item) */}
              {index < PHASES.length - 1 && (
                <div
                  className={cn(
                    'w-16 h-0.5 mx-4 transition-colors',
                    avatarCompleted ? 'bg-green-500' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
