import { useMemo } from 'react';
import { useAIResources } from '@maity/shared';
import type { ArenaResource, ArenaResourcesData } from '../types/skills-arena.types';

/**
 * Hook that fetches AI Resources and maps them to Arena format
 * for display in the Skills Arena section
 */
export function useArenaResources(): ArenaResourcesData {
  const { data: aiResources, isLoading, error } = useAIResources();

  const resources = useMemo<ArenaResource[]>(() => {
    if (!aiResources || aiResources.length === 0) {
      return [];
    }

    return aiResources
      .filter((r) => r.is_active) // Only show active resources
      .map((resource) => ({
        id: resource.id,
        title: resource.title,
        description: resource.description,
        url: resource.url,
        icon: resource.icon || 'brain',
        color: resource.color || 'purple',
        type: 'external' as const,
        // Check if resource was created in the last 7 days
        isNew: isResourceNew(resource.created_at),
      }));
  }, [aiResources]);

  return {
    resources,
    loading: isLoading,
    error: error as Error | null,
  };
}

/**
 * Check if a resource was created in the last 7 days
 */
function isResourceNew(createdAt: string): boolean {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(createdAt) > sevenDaysAgo;
}
