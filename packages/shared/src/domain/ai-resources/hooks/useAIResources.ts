import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AIResourcesService, CreateResourceInput } from '../ai-resources.service';

const AI_RESOURCES_KEY = ['ai-resources'];

/**
 * Hook to fetch all AI resources
 */
export function useAIResources() {
  return useQuery({
    queryKey: AI_RESOURCES_KEY,
    queryFn: () => AIResourcesService.getAllResources(),
  });
}

/**
 * Hook to create a new AI resource
 */
export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resource: CreateResourceInput) => AIResourcesService.createResource(resource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_RESOURCES_KEY });
    },
  });
}

/**
 * Hook to toggle resource active status
 */
export function useToggleResourceActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AIResourcesService.toggleResourceActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_RESOURCES_KEY });
    },
  });
}
