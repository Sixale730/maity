/**
 * Learning Path React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LearningPathService } from '../learning-path.service';
import type { CompleteNodeRequest } from '../learning-path.types';

const LEARNING_PATH_KEY = ['learning-path'];
const LEARNING_PATH_SUMMARY_KEY = ['learning-path-summary'];
const TEAM_PROGRESS_KEY = ['team-learning-progress'];

/**
 * Hook to fetch user's learning path with all nodes
 */
export function useLearningPath(userId: string | undefined) {
  return useQuery({
    queryKey: [...LEARNING_PATH_KEY, userId],
    queryFn: () => LearningPathService.getUserLearningPath(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch learning path summary (lightweight)
 */
export function useLearningPathSummary(userId: string | undefined) {
  return useQuery({
    queryKey: [...LEARNING_PATH_SUMMARY_KEY, userId],
    queryFn: () => LearningPathService.getLearningPathSummary(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to check if user has a learning path
 */
export function useHasLearningPath(userId: string | undefined) {
  const { data: summary, ...rest } = useLearningPathSummary(userId);
  return {
    hasPath: summary?.hasPath ?? false,
    ...rest,
  };
}

/**
 * Hook to initialize a learning path for a user
 */
export function useInitializeLearningPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => LearningPathService.initializePath(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: [...LEARNING_PATH_KEY, userId] });
      queryClient.invalidateQueries({ queryKey: [...LEARNING_PATH_SUMMARY_KEY, userId] });
    },
  });
}

/**
 * Hook to complete a node
 */
export function useCompleteNode(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CompleteNodeRequest) =>
      LearningPathService.completeNode(userId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...LEARNING_PATH_KEY, userId] });
      queryClient.invalidateQueries({ queryKey: [...LEARNING_PATH_SUMMARY_KEY, userId] });
    },
  });
}

/**
 * Hook to start a node (mark as in_progress)
 */
export function useStartNode(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nodeId: string) => LearningPathService.startNode(userId, nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...LEARNING_PATH_KEY, userId] });
    },
  });
}

/**
 * Hook for managers to view team progress
 */
export function useTeamLearningProgress(managerId: string | undefined) {
  return useQuery({
    queryKey: [...TEAM_PROGRESS_KEY, managerId],
    queryFn: () => LearningPathService.getTeamProgress(managerId!),
    enabled: !!managerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
