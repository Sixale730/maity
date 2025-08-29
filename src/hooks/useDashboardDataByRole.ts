import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from './useUserRole';

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
    if (role === 'platform_admin') {
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
    } else if (role === 'org_admin') {
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
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const roleData = generateDataByRole(userRole);
      setData(roleData);
      
      setLoading(false);
    };

    if (userRole) {
      loadData();
    }
  }, [userRole, companyId]);

  const refetch = () => {
    if (!userRole) return;
    
    setLoading(true);
    setTimeout(() => {
      const roleData = generateDataByRole(userRole);
      setData(roleData);
      setLoading(false);
    }, 500);
  };

  return {
    ...data,
    loading,
    refetch
  };
};