import { useQuery } from '@tanstack/react-query';
import { DiagnosticInterviewService } from '../diagnostic-interview.service';
import type { DiagnosticInterview, DiagnosticRadarScores } from '../coach.types';

/**
 * Hook to fetch user's diagnostic interview
 * @param userId - User's UUID from maity.users
 * @returns Query result with diagnostic interview data
 */
export function useDiagnosticInterview(userId: string | undefined) {
  return useQuery<DiagnosticInterview | null>({
    queryKey: ['diagnostic-interview', userId],
    queryFn: () => {
      if (!userId) return null;
      return DiagnosticInterviewService.getDiagnosticInterview(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to extract radar scores from diagnostic interview
 * Used for Dashboard Radar Chart comparison (user vs coach)
 * @param userId - User's UUID from maity.users
 * @returns Query result with scores scaled 0-100
 */
export function useDiagnosticRadarScores(userId: string | undefined) {
  return useQuery<DiagnosticRadarScores>({
    queryKey: ['diagnostic-radar-scores', userId],
    queryFn: async () => {
      if (!userId) {
        return {
          claridad: 0,
          adaptacion: 0,
          persuasion: 0,
          estructura: 0,
          proposito: 0,
          empatia: 0,
        };
      }

      const interview = await DiagnosticInterviewService.getDiagnosticInterview(userId);

      if (!interview) {
        return {
          claridad: 0,
          adaptacion: 0,
          persuasion: 0,
          estructura: 0,
          proposito: 0,
          empatia: 0,
        };
      }

      return DiagnosticInterviewService.extractRadarScores(interview);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to check if user has completed diagnostic interview
 * @param userId - User's UUID from maity.users
 * @returns Boolean indicating if interview exists
 */
export function useHasDiagnosticInterview(userId: string | undefined) {
  return useQuery<boolean>({
    queryKey: ['has-diagnostic-interview', userId],
    queryFn: () => {
      if (!userId) return false;
      return DiagnosticInterviewService.hasDiagnosticInterview(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}
