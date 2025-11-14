import { useQuery } from '@tanstack/react-query';
import { InterviewService } from '../interview.service';
import type { InterviewRadarScores } from '../interview.types';

/**
 * Generate random radar scores for admin testing/preview purposes
 * @returns Random scores between 0-100 for all competencies
 */
function generateRandomInterviewScores(): InterviewRadarScores {
  const randomScore = () => Math.floor(Math.random() * 80) + 20; // 20-100 range
  return {
    claridad: randomScore(),
    adaptacion: randomScore(),
    persuasion: randomScore(),
    estructura: randomScore(),
    proposito: randomScore(),
    empatia: randomScore(),
  };
}

/**
 * Hook to extract radar scores from user's most recent interview evaluation
 * Used for Dashboard Radar Chart comparison (self-assessment vs coach vs interview)
 * @param userId - User's UUID from maity.users
 * @param options - Optional configuration
 * @param options.useRandomDataForTesting - If true, returns random data when no interview exists (for admin testing)
 * @returns Query result with scores scaled 0-100
 */
export function useInterviewRadarScores(
  userId: string | undefined,
  options?: { useRandomDataForTesting?: boolean }
) {
  const { useRandomDataForTesting = false } = options || {};

  return useQuery<InterviewRadarScores>({
    queryKey: ['interview-radar-scores', userId, useRandomDataForTesting],
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

      // Get user's interview sessions history
      const sessions = await InterviewService.getSessionHistory(userId);

      // Find most recent completed session with evaluation
      const completedSession = sessions.find(
        (session) =>
          session.status === 'completed' &&
          session.evaluation_status === 'complete'
      );

      if (!completedSession?.session_id) {
        // If testing mode is enabled and no data exists, return random scores
        if (useRandomDataForTesting) {
          return generateRandomInterviewScores();
        }

        return {
          claridad: 0,
          adaptacion: 0,
          persuasion: 0,
          estructura: 0,
          proposito: 0,
          empatia: 0,
        };
      }

      // Fetch full session with evaluation data
      const sessionDetails = await InterviewService.getSessionWithEvaluation(
        completedSession.session_id
      );

      if (!sessionDetails?.evaluation) {
        // If testing mode is enabled and no evaluation exists, return random scores
        if (useRandomDataForTesting) {
          return generateRandomInterviewScores();
        }

        return {
          claridad: 0,
          adaptacion: 0,
          persuasion: 0,
          estructura: 0,
          proposito: 0,
          empatia: 0,
        };
      }

      return InterviewService.extractRadarScores(sessionDetails.evaluation);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
