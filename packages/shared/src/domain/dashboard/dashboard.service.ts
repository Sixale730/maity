import { supabase } from '../../api/client/supabase';

/**
 * Service for dashboard statistics and metrics
 * Encapsulates RPC calls for admin and user dashboards
 */
export class DashboardService {
  /**
   * Get admin dashboard statistics
   * Uses the get_admin_dashboard_stats RPC function
   * @returns Promise with admin stats
   */
  static async getAdminStats() {
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats');

    if (error) {
      console.error('Error fetching admin dashboard stats:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get admin monthly data for charts
   * Uses the get_admin_monthly_data RPC function
   * @returns Promise with monthly data
   */
  static async getAdminMonthlyData() {
    const { data, error } = await supabase.rpc('get_admin_monthly_data');

    if (error) {
      console.error('Error fetching admin monthly data:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get admin session status breakdown
   * Uses the get_admin_session_status RPC function
   * @returns Promise with session status data
   */
  static async getAdminSessionStatus() {
    const { data, error } = await supabase.rpc('get_admin_session_status');

    if (error) {
      console.error('Error fetching admin session status:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get user-specific dashboard statistics
   * @param userId - User's UUID from maity.users table
   * @returns Promise with user stats
   */
  static async getUserStats(userId: string) {
    // Get user's sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('maity.voice_sessions')
      .select('*')
      .eq('user_id', userId);

    if (sessionsError) {
      console.error('Error fetching user sessions:', error);
      throw sessionsError;
    }

    // Calculate stats
    const totalSessions = sessions?.length || 0;
    const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;
    const passedSessions = sessions?.filter(s => s.passed === true).length || 0;
    const averageScore = sessions?.length
      ? sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length
      : 0;

    return {
      totalSessions,
      completedSessions,
      passedSessions,
      averageScore: Math.round(averageScore),
      sessions: sessions || []
    };
  }

  /**
   * Get recent activity for a user
   * @param userId - User's UUID
   * @param limit - Number of recent activities to fetch
   * @returns Promise with recent activities
   */
  static async getRecentActivity(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('maity.voice_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }

    return data;
  }
}
