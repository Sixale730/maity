import React from "react";
import { SidebarTrigger } from "@/ui/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/ui/components/ui/chart";
import { Badge } from "@/ui/components/ui/badge";
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
import { useDashboardDataByRole } from "@/features/dashboard/hooks/useDashboardDataByRole";
import { DashboardService } from "@maity/shared";

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

export function PlatformAdminDashboard() {
  const { monthlyData, dailyData, statusData, dashboardStats, loading } =
    useDashboardDataByRole('admin');

  const [additionalStats, setAdditionalStats] = React.useState({
    totalUsers: 0,
    totalCompanies: 0,
    completedSessions: 0
  });

  React.useEffect(() => {
    const fetchAdditionalStats = async () => {
      try {
        const stats = await DashboardService.getAdminStats();
        if (stats) {
          setAdditionalStats({
            totalUsers: stats.totalUsers || 0,
            totalCompanies: stats.totalCompanies || 0,
            completedSessions: stats.completedSessions || 0
          });
        }
      } catch (error) {
        console.error('Error fetching additional stats:', error);
      }
    };

    if (!loading) {
      fetchAdditionalStats();
    }
  }, [loading]);

  if (loading) {
    return (
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Global</h1>
            <p className="text-muted-foreground">Cargando datos...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Dashboard Global</h1>
            <p className="text-muted-foreground">
              Vista completa de todas las organizaciones y usuarios
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Platform Admin
        </Badge>
      </div>

      {/* Enhanced Stats Cards for Platform Admin */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Sesiones Globales</CardTitle>
            <span className="text-2xl">🌍</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{dashboardStats.totalSessions}</div>
            <p className="text-xs text-blue-700">
              Todas las organizaciones
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Total Usuarios</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{additionalStats.totalUsers}</div>
            <p className="text-xs text-green-700">
              Usuarios registrados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Empresas Activas</CardTitle>
            <span className="text-2xl">🏢</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{additionalStats.totalCompanies}</div>
            <p className="text-xs text-purple-700">
              Organizaciones
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Satisfacción Global</CardTitle>
            <span className="text-2xl">😊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{dashboardStats.avgMood}</div>
            <p className="text-xs text-orange-700">
              Humor promedio (1-5)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Monthly Sessions Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Tendencias Globales por Mes</CardTitle>
            <CardDescription>
              Rendimiento agregado de todas las organizaciones
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
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" name="Sesiones" />
                  <Bar dataKey="completed" fill="hsl(var(--accent))" name="Completadas" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Session Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Estado Global</CardTitle>
            <CardDescription>
              Distribución en todas las plataformas
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

        {/* Daily Activity Line Chart */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Actividad Semanal Global</CardTitle>
            <CardDescription>
              Sesiones diarias agregadas de todas las organizaciones
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
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                    name="Sesiones"
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