import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../api/client/supabase';

/**
 * User company association status
 */
export interface UserCompanyStatus {
  /** User ID (from maity.users table) */
  id: string;
  /** Company ID (null if not assigned) */
  company_id: string | null;
  /** User status (ACTIVE, PENDING, etc.) */
  status: string;
  /** User email */
  email: string | null;
}

/**
 * Hook to check if user has been assigned to a company
 *
 * This hook is useful for:
 * - Checking if autojoin was successful
 * - Determining if user needs to accept an invite
 * - Showing different UI based on company assignment status
 *
 * @returns Query result with user company status
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { data: status, isLoading } = useAutojoinCheck();
 *
 *   if (isLoading) return <Loading />;
 *
 *   if (status?.hasCompany) {
 *     return <div>You belong to a company!</div>;
 *   }
 *
 *   return <div>No company assigned. Join via invite link.</div>;
 * }
 * ```
 */
export function useAutojoinCheck() {
  return useQuery({
    queryKey: ['user', 'company-status'],
    queryFn: async () => {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get user info including company assignment
      const { data, error } = await supabase
        .schema('maity')
        .from('users')
        .select('id, company_id, status, email')
        .eq('auth_id', user.id)
        .single();

      if (error) {
        console.error('[useAutojoinCheck] Error fetching user company status:', error);
        throw error;
      }

      const userStatus: UserCompanyStatus = data;

      return {
        /** Raw user status data */
        raw: userStatus,
        /** Whether user has been assigned to a company */
        hasCompany: !!userStatus.company_id,
        /** Whether user is active (has access to platform) */
        isActive: userStatus.status === 'ACTIVE',
        /** Whether user is pending (waiting for approval or invite) */
        isPending: userStatus.status === 'PENDING',
        /** Whether user needs company assignment */
        needsCompany: !userStatus.company_id,
        /** User's company ID (null if not assigned) */
        companyId: userStatus.company_id,
        /** User's status */
        status: userStatus.status,
        /** User's email */
        email: userStatus.email,
      };
    },
    // Refetch when window gains focus (user might have joined via another tab)
    refetchOnWindowFocus: true,
    // Keep data fresh
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Simplified hook that just returns whether user has a company
 *
 * @returns Boolean indicating if user has company, or undefined while loading
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const hasCompany = useHasCompany();
 *
 *   if (hasCompany === undefined) return <Loading />;
 *   if (hasCompany) return <Dashboard />;
 *   return <JoinCompanyPrompt />;
 * }
 * ```
 */
export function useHasCompany(): boolean | undefined {
  const { data, isLoading } = useAutojoinCheck();

  if (isLoading) return undefined;
  return data?.hasCompany;
}
