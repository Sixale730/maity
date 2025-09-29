import React from "react";
import { UserRole, UserProfile } from "@/contexts/UserContext";
import { PlatformAdminDashboard } from "./dashboards/PlatformAdminDashboard";
import { UserDashboard } from "./dashboards/UserDashboard";
import TeamDashboard from "./dashboards/TeamDashboard";
import { useDashboardDataByRole } from "@/hooks/useDashboardDataByRole";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Routes, Route, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { OrganizationsManager } from "./OrganizationsManager";
import { CoachPage } from "./coach/CoachPage";
import { RoleplayPage } from "./roleplay/RoleplayPage";
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
  Cell
} from "recharts";

const chartConfig = {
  sessions: {
    label: "Sesiones",
    color: "hsl(var(--primary))",
  },
  completed: {
    label: "Completadas",
    color: "hsl(var(--accent))",
  },
  mood: {
    label: "Humor Promedio",
    color: "hsl(var(--chart-3))",
  },
};

// Org Admin Dashboard Component
function OrgAdminDashboard({ userName, companyId }: { userName?: string; companyId?: string }) {
  const { t } = useLanguage();
  const { monthlyData, dailyData, statusData, dashboardStats, loading } = 
    useDashboardDataByRole('manager', companyId);

  console.log('OrgAdminDashboard rendering with language context');

  if (loading) {
    return (
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
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
            <h1 className="text-3xl font-bold text-foreground">{t('dashboard.org.title')}</h1>
            <p className="text-muted-foreground">
              {t('dashboard.org.description')}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Org Admin
        </Badge>
      </div>

      {/* Org Admin Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900">{t('dashboard.stats.team_sessions')}</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{dashboardStats.totalSessions}</div>
            <p className="text-xs text-indigo-700">
              {t('dashboard.stats.organization_total')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">{t('dashboard.stats.active')}</CardTitle>
            <span className="text-2xl">🔄</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{dashboardStats.activeSessions}</div>
            <p className="text-xs text-green-700">
              {t('dashboard.stats.in_progress')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">{t('dashboard.stats.performance')}</CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{dashboardStats.completionRate}%</div>
            <p className="text-xs text-amber-700">
              {t('dashboard.stats.completion_rate')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-900">{t('dashboard.stats.team_wellbeing')}</CardTitle>
            <span className="text-2xl">💪</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">{dashboardStats.avgMood}</div>
            <p className="text-xs text-pink-700">
              {t('dashboard.stats.average_mood')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Monthly Team Performance */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.charts.monthly_performance')}</CardTitle>
            <CardDescription>
              {t('dashboard.charts.monthly_description')}
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
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" name={t('dashboard.charts.team_sessions')} />
                  <Bar dataKey="completed" fill="hsl(var(--accent))" name={t('dashboard.charts.completed')} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Team Session Status */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.charts.team_status')}</CardTitle>
            <CardDescription>
              {t('dashboard.charts.status_description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
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

        {/* Weekly Team Activity */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>{t('dashboard.charts.weekly_activity')}</CardTitle>
            <CardDescription>
              {t('dashboard.charts.weekly_description')}
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
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                    name={t('dashboard.charts.team_sessions')}
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

interface DashboardContentProps {
  userRole: UserRole;
  userProfile: UserProfile | null;
}

export function DashboardContent({ userRole, userProfile }: DashboardContentProps) {
  const { t, language } = useLanguage();

  console.log('DashboardContent rendering, current language:', language);

  // Default dashboard component based on role
  const getDefaultDashboard = () => {
    if (userRole === 'admin') {
      return <PlatformAdminDashboard />;
    } else if (userRole === 'manager') {
      return (
        <OrgAdminDashboard
          userName={userProfile?.name}
          companyId={userProfile?.company_id}
        />
      );
    } else {
      return <UserDashboard userName={userProfile?.name} />;
    }
  };

  return (
    <Routes>
      {/* Default dashboard route */}
      <Route
        index
        element={getDefaultDashboard()}
      />

      {/* Coach route - available for all roles */}
      <Route
        path="coach"
        element={<CoachPage />}
      />

      {/* Roleplay route - available for all roles */}
      <Route
        path="roleplay"
        element={<RoleplayPage />}
      />

      {/* Team dashboard - only for managers */}
      {userRole === 'manager' && (
        <Route
          path="team"
          element={
            <main className="flex-1">
              <TeamDashboard />
            </main>
          }
        />
      )}

      {/* Organizations - only for admins */}
      {userRole === 'admin' && (
        <Route
          path="organizations"
          element={<OrganizationsManager />}
        />
      )}

      {/* Other admin routes */}
      {userRole === 'admin' && (
        <>
          <Route path="analytics" element={<div className="p-6">Analytics Dashboard</div>} />
          <Route path="users" element={<div className="p-6">Users Management</div>} />
          <Route path="reports" element={<div className="p-6">Reports Dashboard</div>} />
          <Route path="trends" element={<div className="p-6">Trends Dashboard</div>} />
          <Route path="settings" element={<div className="p-6">Settings</div>} />
        </>
      )}

      {/* Manager routes */}
      {userRole === 'manager' && (
        <>
          <Route path="planes" element={<div className="p-6">Plans Management</div>} />
          <Route path="documentos" element={<div className="p-6">Documents</div>} />
          <Route path="settings" element={<div className="p-6">Settings</div>} />
        </>
      )}

      {/* User routes */}
      {userRole === 'user' && (
        <>
          <Route path="plan" element={<div className="p-6">My Plan</div>} />
          <Route path="logros" element={<div className="p-6">Achievements</div>} />
        </>
      )}

      {/* Fallback to default dashboard */}
      <Route
        path="*"
        element={getDefaultDashboard()}
      />
    </Routes>
  );
}