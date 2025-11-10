import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@maity/shared';

interface UseSessionsByCompanyUserParams {
  companyId?: string;
  startDate?: string;
  endDate?: string;
}

export function useSessionsByCompanyUser(params?: UseSessionsByCompanyUserParams) {
  return useQuery({
    queryKey: ['analytics', 'sessions-by-company-user', params],
    queryFn: () =>
      AnalyticsService.getSessionsByCompanyUser(
        params?.companyId,
        params?.startDate,
        params?.endDate
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
