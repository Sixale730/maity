import { useQuery } from '@tanstack/react-query';
import { DailyEvaluationService } from '../daily-evaluation.service';

export function useTodayEvaluation() {
  return useQuery({
    queryKey: ['daily-evaluation', 'today'],
    queryFn: () => DailyEvaluationService.getTodayEvaluation(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useDailyEvaluations(days = 30) {
  return useQuery({
    queryKey: ['daily-evaluations', days],
    queryFn: () => DailyEvaluationService.getEvaluations(days),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLeaderboard(limit = 10) {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: () => DailyEvaluationService.getLeaderboard(limit),
    staleTime: 5 * 60 * 1000,
  });
}
