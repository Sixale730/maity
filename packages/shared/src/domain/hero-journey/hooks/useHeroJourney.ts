/**
 * Hero Journey React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HeroJourneyService } from '../hero-journey.service';
import type {
  HeroJourneyConfig,
  SaveHeroJourneyConfigRequest,
} from '../hero-journey.types';

const QUERY_KEYS = {
  configs: ['hero-journey', 'configs'] as const,
  config: (id: string) => ['hero-journey', 'config', id] as const,
  defaultConfig: ['hero-journey', 'default'] as const,
};

/**
 * Hook to fetch all hero journey configs
 */
export function useHeroJourneyConfigs(companyId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.configs, companyId],
    queryFn: () => HeroJourneyService.getConfigs(companyId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single config by ID
 */
export function useHeroJourneyConfig(id: string | null) {
  return useQuery({
    queryKey: id ? QUERY_KEYS.config(id) : ['hero-journey', 'config', 'none'],
    queryFn: () => (id ? HeroJourneyService.getConfigById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch the default config
 */
export function useDefaultHeroJourneyConfig() {
  return useQuery({
    queryKey: QUERY_KEYS.defaultConfig,
    queryFn: () => HeroJourneyService.getDefaultConfig(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to save (create/update) a hero journey config
 */
export function useSaveHeroJourneyConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SaveHeroJourneyConfigRequest) =>
      HeroJourneyService.saveConfig(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.configs });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.defaultConfig });
    },
  });
}

/**
 * Hook to delete a hero journey config
 */
export function useDeleteHeroJourneyConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => HeroJourneyService.deleteConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.configs });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.defaultConfig });
    },
  });
}

/**
 * Hook to clone a hero journey config
 */
export function useCloneHeroJourneyConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceId, newName }: { sourceId: string; newName: string }) =>
      HeroJourneyService.cloneConfig(sourceId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.configs });
    },
  });
}

/**
 * Hook for local config state management (editor)
 */
export function useHeroJourneyEditor(initialConfig: HeroJourneyConfig | null) {
  const queryClient = useQueryClient();
  const saveMutation = useSaveHeroJourneyConfig();

  return {
    initialConfig,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    invalidateConfigs: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.configs });
    },
  };
}
