/**
 * Hook for fetching form responses (autoevaluaciones) analytics
 * Fetches self-assessment data by company for analytics dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@maity/shared';

export interface FormResponseAnalytics {
  user_id: string;
  user_name: string;
  user_email: string;
  company_id: string | null;
  company_name: string | null;
  submitted_at: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
  q11: string;
  q12: string;
  q13: string;
  q14: string;
  q15: string;
  q16: string;
  q17: string;
  q18: string;
  q19: string;
  claridad_avg: number;
  adaptacion_avg: number;
  persuasion_avg: number;
  estructura_avg: number;
  proposito_avg: number;
  empatia_avg: number;
  overall_avg: number;
}

interface UseFormResponsesAnalyticsOptions {
  companyId?: string;
  enabled?: boolean;
}

export function useFormResponsesAnalytics(
  options: UseFormResponsesAnalyticsOptions = {}
) {
  const { companyId, enabled = true } = options;

  return useQuery<FormResponseAnalytics[]>({
    queryKey: ['analytics', 'form-responses', companyId],
    queryFn: () => AnalyticsService.getFormResponsesByCompany(companyId),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
