import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@maity/shared';
import type { AnalyticsFilters, AnalyticsDashboardData, SessionListItem } from '@maity/shared';

export function useAnalyticsData(filters?: AnalyticsFilters) {
  return useQuery<AnalyticsDashboardData>({
    queryKey: ['analytics', 'dashboard', filters],
    queryFn: () => AnalyticsService.getDashboardData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSessionsList(
  filters?: AnalyticsFilters,
  page: number = 1,
  pageSize: number = 50
) {
  return useQuery<{ sessions: SessionListItem[]; total: number }>({
    queryKey: ['analytics', 'sessions', filters, page, pageSize],
    queryFn: () => AnalyticsService.getSessionsList(filters, page, pageSize),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCompaniesForFilter() {
  return useQuery({
    queryKey: ['analytics', 'companies'],
    queryFn: () => AnalyticsService.getCompaniesForFilter(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useProfilesForFilter() {
  return useQuery({
    queryKey: ['analytics', 'profiles'],
    queryFn: () => AnalyticsService.getProfilesForFilter(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useScenariosForFilter() {
  return useQuery({
    queryKey: ['analytics', 'scenarios'],
    queryFn: () => AnalyticsService.getScenariosForFilter(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
