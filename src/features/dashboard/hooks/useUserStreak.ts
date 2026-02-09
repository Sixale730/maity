import { useQuery } from '@tanstack/react-query';
import { supabase } from '@maity/shared';

export interface StreakData {
  streak_days: number;
  bonus_days: number;
  last_conversation_date: string | null;
  streak_started_at: string | null;
}

const DEFAULT_STREAK: StreakData = {
  streak_days: 0,
  bonus_days: 0,
  last_conversation_date: null,
  streak_started_at: null,
};

/**
 * Hook to fetch user streak data from the database.
 *
 * Streak calculation rules:
 * - Weekdays (Mon-Fri): MANDATORY - If no conversation, streak is LOST
 * - Weekends (Sat-Sun): BONUS - If conversation exists +1, if not does NOT break streak
 *
 * @param userId - The user's UUID
 * @returns Query result with streak data
 */
export function useUserStreak(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-streak', userId],
    queryFn: async (): Promise<StreakData> => {
      if (!userId) {
        return DEFAULT_STREAK;
      }

      const { data, error } = await supabase.rpc('calculate_user_streak', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error fetching user streak:', error);
        throw error;
      }

      // RPC returns an array, get first row
      const result = Array.isArray(data) ? data[0] : data;

      return result || DEFAULT_STREAK;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
