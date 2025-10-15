import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, AuthService } from '@maity/shared';

interface PlatformTourState {
  isRunning: boolean;
  hasCompleted: boolean;
  loading: boolean;
  currentStepIndex: number;
}

interface PlatformTourContextType extends PlatformTourState {
  startTour: () => void;
  finishTour: () => Promise<void>;
  skipTour: () => Promise<void>;
  restartTour: () => void;
  checkTourStatus: () => Promise<void>;
  setCurrentStepIndex: (index: number) => void;
}

const PlatformTourContext = createContext<PlatformTourContextType | undefined>(undefined);

export const PlatformTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | undefined>();
  const [state, setState] = useState<PlatformTourState>({
    isRunning: false,
    hasCompleted: false,
    loading: true,
    currentStepIndex: 0,
  });

  // Obtener userId
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUserId();
  }, []);

  // Verificar si el usuario ya completó el tour
  const checkTourStatus = useCallback(async () => {
    if (!userId) {
      setState({ isRunning: false, hasCompleted: false, loading: false });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));

      // Intentar obtener del localStorage como fallback
      const localStorageKey = `maity_tour_completed_${userId}`;
      const localCompleted = localStorage.getItem(localStorageKey) === 'true';

      // Consultar base de datos usando RPC para acceder a maity.users
      const data = await AuthService.getMyStatus();
      const dbCompleted = data?.[0]?.platform_tour_completed ?? false;
      const hasCompleted = dbCompleted || localCompleted;

      setState({
        isRunning: false,
        hasCompleted,
        loading: false,
      });
    } catch (err) {
      console.error('Error in checkTourStatus:', err);
      setState({ isRunning: false, hasCompleted: false, loading: false });
    }
  }, [userId]);

  // Marcar tour como completado
  const markTourAsCompleted = useCallback(async () => {
    if (!userId) return;

    try {
      const localStorageKey = `maity_tour_completed_${userId}`;
      localStorage.setItem(localStorageKey, 'true');

      await AuthService.markTourCompleted();

      setState(prev => ({
        ...prev,
        hasCompleted: true,
        isRunning: false,
      }));
    } catch (err) {
      console.error('Error in markTourAsCompleted:', err);
    }
  }, [userId]);

  const startTour = useCallback(() => {
    console.log('[PlatformTourContext] startTour called');
    setState(prev => ({
      ...prev,
      isRunning: true,
      currentStepIndex: 0,
    }));
  }, []);

  const finishTour = useCallback(async () => {
    await markTourAsCompleted();
  }, [markTourAsCompleted]);

  const skipTour = useCallback(async () => {
    await markTourAsCompleted();
  }, [markTourAsCompleted]);

  const restartTour = useCallback(() => {
    console.log('[PlatformTourContext] restartTour called');
    setState(prev => {
      console.log('[PlatformTourContext] Setting isRunning to true, prev:', prev);
      return {
        ...prev,
        isRunning: true,
        currentStepIndex: 0,
      };
    });
  }, []);

  const setCurrentStepIndex = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      currentStepIndex: index,
    }));
  }, []);

  // Verificar estado al montar y cuando cambie userId
  useEffect(() => {
    checkTourStatus();
  }, [checkTourStatus]);

  // Auto-iniciar tour si es primera vez
  useEffect(() => {
    if (!state.loading && !state.hasCompleted && userId) {
      const timer = setTimeout(() => {
        startTour();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state.loading, state.hasCompleted, userId, startTour]);

  return (
    <PlatformTourContext.Provider
      value={{
        ...state,
        startTour,
        finishTour,
        skipTour,
        restartTour,
        checkTourStatus,
        setCurrentStepIndex,
      }}
    >
      {children}
    </PlatformTourContext.Provider>
  );
};

export const usePlatformTour = () => {
  const context = useContext(PlatformTourContext);
  if (context === undefined) {
    throw new Error('usePlatformTour must be used within a PlatformTourProvider');
  }
  return context;
};
