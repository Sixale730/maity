/**
 * useOnboardingFlow Hook
 * Manages the multi-step onboarding flow state (Avatar -> Questionnaire)
 */

import { useState, useEffect, useCallback } from 'react';
import type { UpdateAvatarInput } from '@maity/shared';

export type OnboardingStep = 0 | 1 | 2; // 0=avatar, 1=instructions, 2=questionnaire

interface OnboardingState {
  currentStep: OnboardingStep;
  avatarCompleted: boolean;
}

interface UseOnboardingFlowProps {
  userId: string;
}

interface UseOnboardingFlowReturn {
  currentStep: OnboardingStep;
  avatarCompleted: boolean;
  goToStep: (step: OnboardingStep) => void;
  completeAvatarStep: () => void;
  startQuestionnaire: () => void;
  clearProgress: () => void;
}

const STORAGE_KEY = (userId: string) => `onboarding_state_${userId}`;

const DEFAULT_STATE: OnboardingState = {
  currentStep: 0,
  avatarCompleted: false,
};

export function useOnboardingFlow({ userId }: UseOnboardingFlowProps): UseOnboardingFlowReturn {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);

  // Load saved state on mount
  useEffect(() => {
    if (!userId) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY(userId));
      if (saved) {
        const parsed = JSON.parse(saved) as OnboardingState;
        console.log('[useOnboardingFlow] Loaded saved state:', parsed);
        setState(parsed);
      }
    } catch (error) {
      console.error('[useOnboardingFlow] Error loading saved state:', error);
    }
  }, [userId]);

  // Save state changes
  const saveState = useCallback(
    (newState: OnboardingState) => {
      if (!userId) return;

      try {
        localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(newState));
        console.log('[useOnboardingFlow] Saved state:', newState);
      } catch (error) {
        console.error('[useOnboardingFlow] Error saving state:', error);
      }
    },
    [userId]
  );

  // Navigate to a specific step
  const goToStep = useCallback(
    (step: OnboardingStep) => {
      const newState = { ...state, currentStep: step };
      setState(newState);
      saveState(newState);
    },
    [state, saveState]
  );

  // Mark avatar step as completed and advance to instructions
  const completeAvatarStep = useCallback(() => {
    const newState: OnboardingState = {
      currentStep: 1,
      avatarCompleted: true,
    };
    setState(newState);
    saveState(newState);
    console.log('[useOnboardingFlow] Avatar step completed');
  }, [saveState]);

  // Start the questionnaire (move from instructions to form)
  const startQuestionnaire = useCallback(() => {
    const newState: OnboardingState = {
      ...state,
      currentStep: 2,
    };
    setState(newState);
    saveState(newState);
    console.log('[useOnboardingFlow] Starting questionnaire');
  }, [state, saveState]);

  // Clear all progress (call on successful completion)
  const clearProgress = useCallback(() => {
    if (!userId) return;

    try {
      localStorage.removeItem(STORAGE_KEY(userId));
      console.log('[useOnboardingFlow] Cleared progress');
    } catch (error) {
      console.error('[useOnboardingFlow] Error clearing progress:', error);
    }
  }, [userId]);

  return {
    currentStep: state.currentStep,
    avatarCompleted: state.avatarCompleted,
    goToStep,
    completeAvatarStep,
    startQuestionnaire,
    clearProgress,
  };
}
