import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '@maity/shared';

interface PlatformTourState {
  isRunning: boolean;
  hasCompleted: boolean;
  loading: boolean;
}

export const usePlatformTour = (userId?: string) => {
  const [state, setState] = useState<PlatformTourState>({
    isRunning: false,
    hasCompleted: false,
    loading: true,
  });

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

      // Sincronizar localStorage con DB si hay discrepancia
      if (localCompleted && !dbCompleted) {
        await markTourAsCompleted();
      }

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
      // Guardar en localStorage inmediatamente
      const localStorageKey = `maity_tour_completed_${userId}`;
      localStorage.setItem(localStorageKey, 'true');

      // Actualizar base de datos usando RPC
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

  // Iniciar tour (verificar primero si ya se completó)
  const startTour = useCallback(async () => {
    console.log('[usePlatformTour] startTour called');
    setState(prev => {
      console.log('[usePlatformTour] Setting isRunning to true, prev state:', prev);
      return {
        ...prev,
        isRunning: true,
      };
    });
  }, []);

  // Finalizar tour exitosamente
  const finishTour = useCallback(async () => {
    await markTourAsCompleted();
  }, [markTourAsCompleted]);

  // Saltar tour (también marca como completado)
  const skipTour = useCallback(async () => {
    await markTourAsCompleted();
  }, [markTourAsCompleted]);

  // Reiniciar tour (para demos)
  const restartTour = useCallback(() => {
    console.log('[usePlatformTour] restartTour called');
    setState(prev => {
      console.log('[usePlatformTour] Restarting tour, prev state:', prev);
      return {
        ...prev,
        isRunning: true,
      };
    });
  }, []);

  // Verificar estado al montar y cuando cambie userId
  useEffect(() => {
    checkTourStatus();
  }, [checkTourStatus]);

  // Auto-iniciar tour si es primera vez
  useEffect(() => {
    if (!state.loading && !state.hasCompleted && userId) {
      // Delay pequeño para que la UI esté lista
      const timer = setTimeout(() => {
        startTour();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state.loading, state.hasCompleted, userId, startTour]);

  return {
    isRunning: state.isRunning,
    hasCompleted: state.hasCompleted,
    loading: state.loading,
    startTour,
    finishTour,
    skipTour,
    restartTour,
    checkTourStatus,
  };
};
