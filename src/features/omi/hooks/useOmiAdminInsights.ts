import { useQuery } from '@tanstack/react-query';
import { getOmiAdminInsights } from '../services/omi.service';
import {
  OmiAdminInsights,
  ScalabilityProjection,
  calculateScalabilityProjection,
} from '../types/omi-insights.types';

const OMI_ADMIN_INSIGHTS_KEY = ['omi', 'admin', 'insights'];

interface UseOmiAdminInsightsResult {
  insights: OmiAdminInsights | undefined;
  projection: ScalabilityProjection | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for fetching platform-wide Omi insights (admin only)
 * @param targetUsers - Target number of users for scalability projection (default: 600)
 */
export function useOmiAdminInsights(targetUsers: number = 600): UseOmiAdminInsightsResult {
  const {
    data: insights,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<OmiAdminInsights, Error>({
    queryKey: OMI_ADMIN_INSIGHTS_KEY,
    queryFn: getOmiAdminInsights,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  // Calculate projection if insights are available
  const projection = insights
    ? calculateScalabilityProjection(insights, targetUsers)
    : undefined;

  return {
    insights,
    projection,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
