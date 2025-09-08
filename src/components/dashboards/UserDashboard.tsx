import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

// Datos para el gráfico radar 360
const radarData = [
  {
    competencia: "Claridad (C)",
    usuario: 85,
    coach: 75,
    fullMark: 100,
  },
  {
    competencia: "Estructura (E)",
    usuario: 70,
    coach: 80,
    fullMark: 100,
  },
  {
    competencia: "Alineación Emocional (A)",
    usuario: 90,
    coach: 85,
    fullMark: 100,
  },
  {
    competencia: "Acción e Influencia (I)",
    usuario: 65,
    coach: 70,
    fullMark: 100,
  },
];

interface UserDashboardProps {
  userName?: string;
}

export function UserDashboard({ userName }: UserDashboardProps) {
  const { monthlyData, dailyData, statusData, dashboardStats, loading } = 
    useDashboardDataByRole('user');

  if (loading) {
    return (
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mi Dashboard</h1>
            <p className="text-muted-foreground">Cargando tu progreso...</p>
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
              ¡Hola {userName ? userName.split(' ')[0] : 'Usuario'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Aquí tienes tu progreso personal de coaching
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Mi Progreso
        </Badge>
      </div>

      {/* Personal Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Mis Sesiones</CardTitle>
            <span className="text-2xl">🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{dashboardStats.totalSessions}</div>
            <p className="text-xs text-green-700">
              Sesiones completadas
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Próximas</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{dashboardStats.activeSessions}</div>
            <p className="text-xs text-blue-700">
              Sesiones programadas
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Mi Constancia</CardTitle>
            <span className="text-2xl">🏆</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{dashboardStats.completionRate}%</div>
            <p className="text-xs text-purple-700">
              Tasa de asistencia
            </p>
            <Progress value={dashboardStats.completionRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">Mi Bienestar</CardTitle>
            <span className="text-2xl">😊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{dashboardStats.avgMood}</div>
            <p className="text-xs text-yellow-700">
              Humor promedio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Principal - Evaluación 360° */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Evaluación de Competencias 360°</CardTitle>
          <CardDescription className="text-center">
            Comparación entre tu autoevaluación y la evaluación de tu coach
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ChartContainer config={chartConfig} className="h-[500px] w-full max-w-2xl">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                <PolarGrid 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="3 3"
                />
                <PolarAngleAxis 
                  dataKey="competencia" 
                  tick={{ fontSize: 14, fontWeight: 500 }}
                  className="fill-foreground"
                />
                <PolarRadiusAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 12 }}
                  tickCount={6}
                  angle={90}
                  className="fill-muted-foreground"
                />
                <Radar
                  name="Mi Evaluación"
                  dataKey="usuario"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                />
                <Radar
                  name="Evaluación Coach"
                  dataKey="coach"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.2}
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 6 }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => `${value}`}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Personal Progress Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Personal Monthly Progress */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Mi Progreso Mensual</CardTitle>
            <CardDescription>
              Tu evolución en los últimos meses
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
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" name="Mis Sesiones" radius={4} />
                  <Bar dataKey="completed" fill="hsl(var(--accent))" name="Completadas" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Personal Session Status */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Sesiones</CardTitle>
            <CardDescription>
              Estado de tus sesiones
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
            <CardTitle>Mi Actividad Semanal</CardTitle>
            <CardDescription>
              Tus sesiones en la última semana
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
                    name="Mis Sesiones"
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