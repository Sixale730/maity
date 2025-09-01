import React from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { PlatformAdminDashboard } from "./dashboards/PlatformAdminDashboard";
import { UserDashboard } from "./dashboards/UserDashboard";
import TeamDashboard from "./dashboards/TeamDashboard";
import { useDashboardDataByRole } from "@/hooks/useDashboardDataByRole";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
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
  const { monthlyData, dailyData, statusData, dashboardStats, loading } = 
    useDashboardDataByRole('org_admin', companyId);

  if (loading) {
    return (
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Organizacional</h1>
            <p className="text-muted-foreground">Cargando datos del equipo...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Dashboard de Mi Organización</h1>
            <p className="text-muted-foreground">
              Vista de tu equipo y progreso organizacional
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
            <CardTitle className="text-sm font-medium text-indigo-900">Sesiones del Equipo</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{dashboardStats.totalSessions}</div>
            <p className="text-xs text-indigo-700">
              Total de la organización
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Activas</CardTitle>
            <span className="text-2xl">🔄</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{dashboardStats.activeSessions}</div>
            <p className="text-xs text-green-700">
              En progreso o programadas
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Rendimiento</CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{dashboardStats.completionRate}%</div>
            <p className="text-xs text-amber-700">
              Tasa de completado del equipo
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-900">Bienestar del Equipo</CardTitle>
            <span className="text-2xl">💪</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">{dashboardStats.avgMood}</div>
            <p className="text-xs text-pink-700">
              Humor promedio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Monthly Team Performance */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Rendimiento Mensual del Equipo</CardTitle>
            <CardDescription>
              Progreso de tu organización por mes
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
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" name="Sesiones del Equipo" />
                  <Bar dataKey="completed" fill="hsl(var(--accent))" name="Completadas" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Team Session Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Equipo</CardTitle>
            <CardDescription>
              Distribución de sesiones
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
                    innerRadius={60}
                    outerRadius={100}
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
            <CardTitle>Actividad Semanal del Equipo</CardTitle>
            <CardDescription>
              Sesiones diarias de tu organización
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
                    name="Sesiones del Equipo"
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

export function DashboardContent() {
  const { userRole, userProfile, loading, error } = useUserRole();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Cargando datos del usuario...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[150px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-3 w-[200px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  // Check if we're on the team route for org_admin
  if (location.pathname === '/dashboard/team' && userRole === 'org_admin') {
    return (
      <main className="flex-1">
        <TeamDashboard />
      </main>
    );
  }

  // Render dashboard based on user role
  if (userRole === 'platform_admin') {
    return <PlatformAdminDashboard />;
  } else if (userRole === 'org_admin') {
    return (
      <OrgAdminDashboard 
        userName={userProfile?.name} 
        companyId={userProfile?.company_id} 
      />
    );
  } else {
    return <UserDashboard userName={userProfile?.name} />;  
  }
}