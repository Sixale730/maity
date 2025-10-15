import { useState, useEffect } from 'react';
import { supabase } from '@maity/shared';

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

export const useDashboardData = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);
  const [dailyData, setDailyData] = useState<DailyTraffic[]>([]);
  const [statusData, setStatusData] = useState<SessionStatus[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSessions: 0,
    activeSessions: 0,
    completionRate: 0,
    avgMood: 0
  });
  const [loading, setLoading] = useState(true);

  // Sample data based on Maity coaching sessions structure
  // In production, this would be fetched from the maity schema
  const sampleMonthlyData: MonthlyStats[] = [
    { month: "Jun", sessions: 12, completed: 8, mood: 7.2 },
    { month: "Jul", sessions: 18, completed: 14, mood: 7.8 },
    { month: "Ago", sessions: 29, completed: 22, mood: 8.1 },
  ];

  const sampleDailyData: DailyTraffic[] = [
    { day: "Mar", sessions: 18 },
    { day: "Mié", sessions: 5 },
    { day: "Jue", sessions: 6 },
  ];

  const sampleStatusData: SessionStatus[] = [
    { name: "programadas", value: 19, color: "hsl(var(--primary))" },
    { name: "completadas", value: 2, color: "hsl(var(--accent))" },
    { name: "canceladas", value: 3, color: "hsl(var(--destructive))" },
    { name: "incompletas", value: 4, color: "hsl(var(--muted-foreground))" },
    { name: "en progreso", value: 1, color: "hsl(var(--chart-2))" },
  ];

  const sampleDashboardStats: DashboardStats = {
    totalSessions: 29,
    activeSessions: 20,
    completionRate: 7, // (2/29) * 100
    avgMood: 7.7
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMonthlyData(sampleMonthlyData);
      setDailyData(sampleDailyData);
      setStatusData(sampleStatusData);
      setDashboardStats(sampleDashboardStats);
      
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    monthlyData,
    dailyData,
    statusData,
    dashboardStats,
    loading,
    refetch: () => {
      // In production, this would refetch from the database
      setLoading(true);
      setTimeout(() => {
        setMonthlyData(sampleMonthlyData);
        setDailyData(sampleDailyData);
        setStatusData(sampleStatusData);
        setDashboardStats(sampleDashboardStats);
        setLoading(false);
      }, 500);
    }
  };
};