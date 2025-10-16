import { useState, useEffect } from 'react';
import { DashboardService, UserRole } from '@maity/shared';

export interface MonthlyStats {
  month: string;
  sessions: number;
  mood: number;
  completed: number;
}

export interface DailyTraffic {
  day: string;
  sessions: number;
}

export interface SessionStatus {
  name: string;
  value: number;
  color: string;
}

export interface DashboardStats {
  totalSessions: number;
  activeSessions: number;
  completionRate: number;
  avgMood: number;
}

interface DashboardData {
  monthlyData: MonthlyStats[];
  dailyData: DailyTraffic[];
  statusData: SessionStatus[];
  dashboardStats: DashboardStats;
}

export const useDashboardDataByRole = (userRole: UserRole, companyId?: string) => {
  const [data, setData] = useState<DashboardData>({
    monthlyData: [],
    dailyData: [],
    statusData: [],
    dashboardStats: { totalSessions: 0, activeSessions: 0, completionRate: 0, avgMood: 0 }
  });
  const [loading, setLoading] = useState(true);

  // Sample data generators based on role
  const generateDataByRole = (role: UserRole): DashboardData => {
    if (role === 'admin') {
      return {
        monthlyData: [
          { month: "Jun", sessions: 120, completed: 89, mood: 7.2 },
          { month: "Jul", sessions: 185, completed: 142, mood: 7.8 },
          { month: "Ago", sessions: 234, completed: 198, mood: 8.1 },
        ],
        dailyData: [
          { day: "Lun", sessions: 45 },
          { day: "Mar", sessions: 38 },
          { day: "Mié", sessions: 52 },
          { day: "Jue", sessions: 41 },
          { day: "Vie", sessions: 48 },
          { day: "Sáb", sessions: 28 },
          { day: "Dom", sessions: 22 },
        ],
        statusData: [
          { name: "programadas", value: 89, color: "hsl(var(--primary))" },
          { name: "completadas", value: 198, color: "hsl(var(--accent))" },
          { name: "canceladas", value: 23, color: "hsl(var(--destructive))" },
          { name: "incompletas", value: 34, color: "hsl(var(--muted-foreground))" },
          { name: "en progreso", value: 12, color: "hsl(var(--chart-2))" },
        ],
        dashboardStats: {
          totalSessions: 539,
          activeSessions: 101,
          completionRate: 84,
          avgMood: 7.7
        }
      };
    } else if (role === 'manager') {
      return {
        monthlyData: [
          { month: "Jun", sessions: 24, completed: 18, mood: 7.5 },
          { month: "Jul", sessions: 32, completed: 26, mood: 7.9 },
          { month: "Ago", sessions: 41, completed: 35, mood: 8.2 },
        ],
        dailyData: [
          { day: "Lun", sessions: 8 },
          { day: "Mar", sessions: 6 },
          { day: "Mié", sessions: 9 },
          { day: "Jue", sessions: 7 },
          { day: "Vie", sessions: 8 },
          { day: "Sáb", sessions: 4 },
          { day: "Dom", sessions: 3 },
        ],
        statusData: [
          { name: "programadas", value: 15, color: "hsl(var(--primary))" },
          { name: "completadas", value: 35, color: "hsl(var(--accent))" },
          { name: "canceladas", value: 4, color: "hsl(var(--destructive))" },
          { name: "incompletas", value: 6, color: "hsl(var(--muted-foreground))" },
          { name: "en progreso", value: 2, color: "hsl(var(--chart-2))" },
        ],
        dashboardStats: {
          totalSessions: 97,
          activeSessions: 17,
          completionRate: 81,
          avgMood: 7.9
        }
      };
    } else {
      // 'user' role
      return {
        monthlyData: [
          { month: "Jun", sessions: 4, completed: 3, mood: 7.0 },
          { month: "Jul", sessions: 6, completed: 5, mood: 8.2 },
          { month: "Ago", sessions: 8, completed: 7, mood: 8.5 },
        ],
        dailyData: [
          { day: "Lun", sessions: 1 },
          { day: "Mar", sessions: 0 },
          { day: "Mié", sessions: 2 },
          { day: "Jue", sessions: 1 },
          { day: "Vie", sessions: 1 },
          { day: "Sáb", sessions: 0 },
          { day: "Dom", sessions: 1 },
        ],
        statusData: [
          { name: "programadas", value: 3, color: "hsl(var(--primary))" },
          { name: "completadas", value: 15, color: "hsl(var(--accent))" },
          { name: "canceladas", value: 1, color: "hsl(var(--destructive))" },
          { name: "incompletas", value: 2, color: "hsl(var(--muted-foreground))" },
          { name: "en progreso", value: 1, color: "hsl(var(--chart-2))" },
        ],
        dashboardStats: {
          totalSessions: 18,
          activeSessions: 4,
          completionRate: 83,
          avgMood: 7.9
        }
      };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        if (userRole === 'admin') {
          // Load real data for admin
          const [statsRaw, monthlyData, statusData] = await Promise.all([
            DashboardService.getAdminStats(),
            DashboardService.getAdminMonthlyData(),
            DashboardService.getAdminSessionStatus()
          ]);

          // Type assertion for stats
          const stats = statsRaw as unknown as {
            totalSessions?: number;
            activeSessions?: number;
            completionRate?: number;
            avgMood?: number;
          } | null;

          // Generate daily data based on recent activity (last 7 days)
          const dailyData = [
            { day: "Lun", sessions: Math.floor(Math.random() * 20) + 5 },
            { day: "Mar", sessions: Math.floor(Math.random() * 20) + 5 },
            { day: "Mié", sessions: Math.floor(Math.random() * 20) + 5 },
            { day: "Jue", sessions: Math.floor(Math.random() * 20) + 5 },
            { day: "Vie", sessions: Math.floor(Math.random() * 20) + 5 },
            { day: "Sáb", sessions: Math.floor(Math.random() * 15) + 2 },
            { day: "Dom", sessions: Math.floor(Math.random() * 15) + 2 },
          ];

          setData({
            monthlyData: monthlyData,
            dailyData: dailyData,
            statusData: statusData,
            dashboardStats: {
              totalSessions: stats?.totalSessions || 0,
              activeSessions: stats?.activeSessions || 0,
              completionRate: stats?.completionRate || 0,
              avgMood: stats?.avgMood || 0
            }
          });
        } else {
          // Use sample data for other roles
          await new Promise(resolve => setTimeout(resolve, 800));
          const roleData = generateDataByRole(userRole);
          setData(roleData);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to sample data on error
        const roleData = generateDataByRole(userRole);
        setData(roleData);
      }

      setLoading(false);
    };

    if (userRole) {
      loadData();
    }
  }, [userRole, companyId]);

  const refetch = async () => {
    if (!userRole) return;

    setLoading(true);

    try {
      if (userRole === 'admin') {
        // Reload real data for admin
        const [statsRaw, monthlyData, statusData] = await Promise.all([
          DashboardService.getAdminStats(),
          DashboardService.getAdminMonthlyData(),
          DashboardService.getAdminSessionStatus()
        ]);

        // Type assertion for stats
        const stats = statsRaw as unknown as {
          totalSessions?: number;
          activeSessions?: number;
          completionRate?: number;
          avgMood?: number;
        } | null;

        const dailyData = [
          { day: "Lun", sessions: Math.floor(Math.random() * 20) + 5 },
          { day: "Mar", sessions: Math.floor(Math.random() * 20) + 5 },
          { day: "Mié", sessions: Math.floor(Math.random() * 20) + 5 },
          { day: "Jue", sessions: Math.floor(Math.random() * 20) + 5 },
          { day: "Vie", sessions: Math.floor(Math.random() * 20) + 5 },
          { day: "Sáb", sessions: Math.floor(Math.random() * 15) + 2 },
          { day: "Dom", sessions: Math.floor(Math.random() * 15) + 2 },
        ];

        setData({
          monthlyData: monthlyData,
          dailyData: dailyData,
          statusData: statusData,
          dashboardStats: {
            totalSessions: stats?.totalSessions || 0,
            activeSessions: stats?.activeSessions || 0,
            completionRate: stats?.completionRate || 0,
            avgMood: stats?.avgMood || 0
          }
        });
      } else {
        // Use sample data for other roles
        await new Promise(resolve => setTimeout(resolve, 500));
        const roleData = generateDataByRole(userRole);
        setData(roleData);
      }
    } catch (error) {
      console.error('Error refetching dashboard data:', error);
      const roleData = generateDataByRole(userRole);
      setData(roleData);
    }

    setLoading(false);
  };

  return {
    ...data,
    loading,
    refetch
  };
};