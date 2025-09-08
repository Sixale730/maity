import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { useDashboardDataByRole } from "@/hooks/useDashboardDataByRole";

const chartConfig = {
  sessions: {
    label: "Mis Sesiones",
    color: "hsl(var(--primary))",
  },
  completed: {
    label: "Completadas",
    color: "hsl(var(--accent))",
  },
  mood: {
    label: "Mi Humor",
    color: "hsl(var(--chart-3))",
  },
  user: {
    label: "Mi Evaluación",
    color: "hsl(var(--primary))",
  },
  coach: {
    label: "Evaluación Coach",
    color: "hsl(var(--chart-2))",
  },
};

interface UserDashboardProps {
  userName?: string;
}

export function UserDashboard({ userName }: UserDashboardProps) {
  const { t } = useLanguage();
  const { monthlyData, dailyData, statusData, dashboardStats, loading } = 
    useDashboardDataByRole('user');

  // Datos para el gráfico radar 360
  const radarData = [
    {
      competencia: t('dashboard.user.clarity'),
      usuario: 85,
      coach: 75,
      fullMark: 100,
    },
    {
      competencia: t('dashboard.user.structure'),
      usuario: 70,
      coach: 80,
      fullMark: 100,
    },
    {
      competencia: t('dashboard.user.emotional_alignment'),
      usuario: 90,
      coach: 85,
      fullMark: 100,
    },
    {
      competencia: t('dashboard.user.action_influence'),
      usuario: 65,
      coach: 70,
      fullMark: 100,
    },
  ];

  if (loading) {
    return (
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('dashboard.user.title')}</h1>
            <p className="text-muted-foreground">{t('dashboard.loading')}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {userName ? `${t('dashboard.user.greeting')} ${userName.split(' ')[0]}!` : `${t('dashboard.user.greeting')} ${t('dashboard.user.user')}!`} 👋
            </h1>
            <p className="text-muted-foreground">
              {t('dashboard.user.description')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {t('dashboard.user.progress_badge')}
          </Badge>
          <LanguageSelector />
        </div>
      </div>

      {/* Personal Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">{t('dashboard.user.my_sessions')}</CardTitle>
            <span className="text-2xl">🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{dashboardStats.totalSessions}</div>
            <p className="text-xs text-green-700">
              {t('dashboard.user.sessions_completed')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">{t('dashboard.user.upcoming')}</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{dashboardStats.activeSessions}</div>
            <p className="text-xs text-blue-700">
              {t('dashboard.user.sessions_scheduled')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">{t('dashboard.user.consistency')}</CardTitle>
            <span className="text-2xl">🏆</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{dashboardStats.completionRate}%</div>
            <p className="text-xs text-purple-700">
              {t('dashboard.user.attendance_rate')}
            </p>
            <Progress value={dashboardStats.completionRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">{t('dashboard.user.wellbeing')}</CardTitle>
            <span className="text-2xl">😊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{dashboardStats.avgMood}</div>
            <p className="text-xs text-yellow-700">
              {t('dashboard.user.average_mood')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Principal - Evaluación 360° */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">{t('dashboard.user.radar_title')}</CardTitle>
          <CardDescription className="text-center">
            {t('dashboard.user.radar_description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <ChartContainer config={chartConfig} className="h-[650px] w-full max-w-4xl">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                data={radarData} 
                margin={{ top: 60, right: 150, bottom: 60, left: 150 }}
                cx="50%" 
                cy="50%"
              >
                <PolarGrid 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="2 2"
                  strokeWidth={1.5}
                  gridType="polygon"
                />
                <PolarAngleAxis 
                  dataKey="competencia" 
                  tick={{ 
                    fontSize: 15, 
                    fontWeight: 600,
                    textAnchor: 'middle',
                    dominantBaseline: 'middle'
                  }}
                  className="fill-foreground"
                  tickFormatter={(value) => value}
                  radius={130}
                />
                <PolarRadiusAxis 
                  domain={[0, 100]} 
                  tick={{ 
                    fontSize: 11,
                    fontWeight: 500
                  }}
                  tickCount={5}
                  angle={45}
                  className="fill-muted-foreground"
                  axisLine={false}
                />
                <Radar
                  name={t('dashboard.user.my_evaluation')}
                  dataKey="usuario"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.25}
                  strokeWidth={4}
                  dot={{ 
                    fill: "hsl(var(--primary))", 
                    strokeWidth: 3, 
                    stroke: "white",
                    r: 8 
                  }}
                />
                <Radar
                  name={t('dashboard.user.coach_evaluation')}
                  dataKey="coach"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.15}
                  strokeWidth={4}
                  dot={{ 
                    fill: "hsl(var(--chart-2))", 
                    strokeWidth: 3, 
                    stroke: "white",
                    r: 8 
                  }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => `${value}`}
                  wrapperStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Personal Progress Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.user.monthly_progress')}</CardTitle>
            <CardDescription>
              {t('dashboard.user.monthly_description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" name={t('dashboard.user.my_sessions')} radius={4} />
                  <Bar dataKey="completed" fill="hsl(var(--accent))" name={t('dashboard.charts.completed')} radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Personal Session Status */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.user.sessions_status')}</CardTitle>
            <CardDescription>
              {t('dashboard.user.status_description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Personal Weekly Activity */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>{t('dashboard.user.weekly_activity')}</CardTitle>
            <CardDescription>
              {t('dashboard.user.weekly_description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 8 }}
                    name={t('dashboard.user.my_sessions')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}