/**
 * OnboardingFlow Component
 * Main orchestrator for the multi-step onboarding flow
 * Flow: Avatar -> Instructions -> Questionnaire
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useOnboardingFlow } from '../../hooks/useOnboardingFlow';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingAvatarStep } from './OnboardingAvatarStep';
import { RegistrationInstructions } from '../registration/RegistrationInstructions';
import { NativeRegistrationForm } from '../registration/NativeRegistrationForm';

interface OnboardingFlowProps {
  userId: string;
  onComplete: () => void;
}

export function OnboardingFlow({ userId, onComplete }: OnboardingFlowProps) {
  const {
    currentStep,
    avatarCompleted,
    completeAvatarStep,
    startQuestionnaire,
    clearProgress,
  } = useOnboardingFlow({ userId });

  // Handle avatar step completion
  const handleAvatarComplete = () => {
    completeAvatarStep();
  };

  // Handle instructions start (move to questionnaire)
  const handleInstructionsStart = () => {
    startQuestionnaire();
  };

  // Handle questionnaire completion
  const handleQuestionnaireComplete = () => {
    clearProgress();
    onComplete();
  };

  return (
    <div className="w-full space-y-6">
      {/* Progress Indicator */}
      <OnboardingProgress
        currentStep={currentStep}
        avatarCompleted={avatarCompleted}
        className="mb-8"
      />

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            key="avatar-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <OnboardingAvatarStep
              userId={userId}
              onComplete={handleAvatarComplete}
            />
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div
            key="instructions-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <RegistrationInstructions onStart={handleInstructionsStart} />
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="questionnaire-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <NativeRegistrationForm
              userId={userId}
              onComplete={handleQuestionnaireComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
