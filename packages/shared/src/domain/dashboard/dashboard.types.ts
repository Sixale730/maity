/**
 * Dashboard statistics for admin view
 */
export interface DashboardStats {
  totalUsers: number;
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  activeUsersToday: number;
}

/**
 * Monthly data for charts
 */
export interface MonthlyData {
  month: string;
  sessions: number;
  users: number;
  avgScore: number;
}

/**
 * Session status breakdown
 */
export interface SessionStatus {
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned';
  count: number;
}

/**
 * User-specific dashboard statistics
 */
export interface UserStats {
  totalSessions: number;
  completedSessions: number;
  passedSessions: number;
  averageScore: number;
  sessions: any[];
}

/**
 * Recent activity item
 */
export interface RecentActivity {
  id: string;
  type: 'session' | 'evaluation' | 'achievement';
  description: string;
  timestamp: string;
  score?: number;
}
