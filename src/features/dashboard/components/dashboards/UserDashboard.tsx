import { SidebarTrigger } from "@/ui/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/ui/components/ui/chart";
import { Badge } from "@/ui/components/ui/badge";
import { Progress } from "@/ui/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/shared/components/LanguageSelector";
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
import { useDashboardDataByRole } from "@/features/dashboard/hooks/useDashboardDataByRole";
import { useFormResponses } from "@maity/shared";

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
  claridad: {
    label: "Claridad",
    color: "#485df4", // Azul oficial
  },
  estructura: {
    label: "Estructura",
    color: "#1bea9a", // Verde oficial
  },
  inspiracion: {
    label: "Inspiración y Confianza",
    color: "#ff0050", // Rojo/Rosa oficial
  },
  influencia: {
    label: "Influencia",
    color: "#e7e7e9", // Gris claro oficial
  },
};

interface UserDashboardProps {
  userName?: string;
}

export function UserDashboard({ userName }: UserDashboardProps) {
  const { t } = useLanguage();
  const { monthlyData, dailyData, statusData, dashboardStats, loading } =
    useDashboardDataByRole('user');
  const { radarData, competencyBars, loading: formLoading, error: formError } = useFormResponses();

  // Use radar data directly (no translation needed for generic area names)
  const translatedRadarData = radarData;

  console.log('Radar data:', radarData);
  console.log('Translated radar data:', translatedRadarData);
  console.log('Competency bars:', competencyBars);

  if (loading || formLoading) {
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
          <CardTitle className="text-center text-2xl font-bold">Radar de Habilidades - Autoevaluación 360°</CardTitle>
          <CardDescription className="text-center">
            Evaluación de competencias clave de liderazgo
            {formError && !formError.includes('mostrando datos de ejemplo') && (
              <div className="text-sm text-orange-600 mt-2">
                ⚠️ {formError}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <ChartContainer config={chartConfig} className="h-[400px] w-full max-w-2xl">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={translatedRadarData}>
                <PolarGrid
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="3 3"
                />
                <PolarAngleAxis
                  dataKey="competencia"
                  tick={{
                    fontSize: 12,
                    fontWeight: 500
                  }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{
                    fontSize: 10
                  }}
                />
                <Radar
                  name="Mi Evaluación"
                  dataKey="usuario"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Individual Competency Bar Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Claridad Bar Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Claridad</CardTitle>
            <CardDescription className="text-sm">Evaluación por pregunta (1-5)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={competencyBars.claridad} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis
                    dataKey="pregunta"
                    tick={{ fontSize: 10 }}
                    interval={0}
                  />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#485df4" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Estructura Bar Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Estructura</CardTitle>
            <CardDescription className="text-sm">Evaluación por pregunta (1-5)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={competencyBars.estructura} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis
                    dataKey="pregunta"
                    tick={{ fontSize: 10 }}
                    interval={0}
                  />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#1bea9a" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Inspiración y Confianza Bar Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Inspiración y Confianza</CardTitle>
            <CardDescription className="text-sm">Evaluación por pregunta (1-5)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={competencyBars.inspiracion} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis
                    dataKey="pregunta"
                    tick={{ fontSize: 10 }}
                    interval={0}
                  />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#ff0050" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Influencia Bar Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Influencia</CardTitle>
            <CardDescription className="text-sm">Evaluación por pregunta (1-5)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={competencyBars.influencia} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis
                    dataKey="pregunta"
                    tick={{ fontSize: 10 }}
                    interval={0}
                  />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#e7e7e9" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

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