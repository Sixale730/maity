import { useState, useCallback, useEffect } from 'react';
import { GameService } from '../games.service';
import type { WheelOfLifeAreaAssessment, WheelOfLifeData, WheelOfLifeResults, WheelStep } from '../wheel-of-life.types';
import type { CompleteGameResult } from '../games.types';
import { WHEEL_AREAS } from '../wheel-areas-data';

interface SavedProgress {
  step: WheelStep;
  currentAreaIndex: number;
  areas: WheelOfLifeAreaAssessment[];
  sessionId: string | null;
}

interface UseWheelOfLifeOptions {
  userId: string;
}

export function useWheelOfLife({ userId }: UseWheelOfLifeOptions) {
  const [step, setStep] = useState<WheelStep>('intro');
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
  const [areas, setAreas] = useState<WheelOfLifeAreaAssessment[]>(
    WHEEL_AREAS.map(a => ({ area_id: a.id, current_score: 5, desired_score: 7, reason: '' }))
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [results, setResults] = useState<WheelOfLifeResults | null>(null);
  const [completionResult, setCompletionResult] = useState<CompleteGameResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);

  // Restore progress on mount
  useEffect(() => {
    if (!userId) return;
    const saved = GameService.loadProgress<SavedProgress>(userId, 'wheel_of_life');
    if (saved && saved.areas?.length === WHEEL_AREAS.length && saved.step !== 'results') {
      setStep(saved.step);
      setCurrentAreaIndex(saved.currentAreaIndex);
      setAreas(saved.areas);
      setSessionId(saved.sessionId);
      setHasRestoredProgress(true);
    }
  }, [userId]);

  // Auto-save progress when areas or step change
  useEffect(() => {
    if (!userId || step === 'intro' || step === 'results') return;
    GameService.saveProgress(userId, 'wheel_of_life', {
      step,
      currentAreaIndex,
      areas,
      sessionId,
    } satisfies SavedProgress);
  }, [userId, step, currentAreaIndex, areas, sessionId]);

  const startGame = useCallback(async () => {
    const session = await GameService.createSession(userId, 'wheel_of_life');
    if (session) {
      setSessionId(session.id);
      setStep('assessment');
      setCurrentAreaIndex(0);
    }
  }, [userId]);

  const setAreaScore = useCallback(
    (field: 'current_score' | 'desired_score', value: number) => {
      setAreas(prev => {
        const next = [...prev];
        next[currentAreaIndex] = { ...next[currentAreaIndex], [field]: value };
        return next;
      });
    },
    [currentAreaIndex]
  );

  const setAreaReason = useCallback(
    (reason: string) => {
      setAreas(prev => {
        const next = [...prev];
        next[currentAreaIndex] = { ...next[currentAreaIndex], reason };
        return next;
      });
    },
    [currentAreaIndex]
  );

  const nextArea = useCallback(() => {
    if (currentAreaIndex < WHEEL_AREAS.length - 1) {
      setCurrentAreaIndex(i => i + 1);
    } else {
      setStep('review');
    }
  }, [currentAreaIndex]);

  const previousArea = useCallback(() => {
    if (currentAreaIndex > 0) {
      setCurrentAreaIndex(i => i - 1);
    }
  }, [currentAreaIndex]);

  const goToReview = useCallback(() => {
    setStep('review');
  }, []);

  const goToArea = useCallback((index: number) => {
    setCurrentAreaIndex(index);
    setStep('assessment');
  }, []);

  const submitGame = useCallback(async () => {
    if (!sessionId || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const gameData: WheelOfLifeData = { areas };
      const wheelResults = GameService.calculateWheelResults(gameData);

      // Save game data first
      await GameService.updateSessionData(sessionId, gameData as unknown as Record<string, unknown>);

      // Check if first attempt
      const previousSessions = await GameService.getUserSessions('wheel_of_life');
      const isFirst = !previousSessions.some(s => s.status === 'completed');

      const xp = GameService.calculateWheelXP(wheelResults, isFirst);

      const result = await GameService.completeSession(
        sessionId,
        wheelResults as unknown as Record<string, unknown>,
        wheelResults.balance_score,
        xp,
        'Completaste la Rueda de la Vida'
      );

      setResults(wheelResults);
      setCompletionResult(result);
      setStep('results');

      // Clear saved progress
      GameService.clearProgress(userId, 'wheel_of_life');
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, isSubmitting, areas, userId]);

  const resetGame = useCallback(() => {
    setStep('intro');
    setCurrentAreaIndex(0);
    setAreas(WHEEL_AREAS.map(a => ({ area_id: a.id, current_score: 5, desired_score: 7, reason: '' })));
    setSessionId(null);
    setResults(null);
    setCompletionResult(null);
    GameService.clearProgress(userId, 'wheel_of_life');
  }, [userId]);

  return {
    // State
    step,
    currentAreaIndex,
    areas,
    currentArea: areas[currentAreaIndex],
    currentAreaMeta: WHEEL_AREAS[currentAreaIndex],
    totalAreas: WHEEL_AREAS.length,
    sessionId,
    results,
    completionResult,
    isSubmitting,
    hasRestoredProgress,

    // Actions
    startGame,
    setAreaScore,
    setAreaReason,
    nextArea,
    previousArea,
    goToReview,
    goToArea,
    submitGame,
    resetGame,
  };
}
