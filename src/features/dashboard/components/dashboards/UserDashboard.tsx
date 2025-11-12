import { SidebarTrigger } from "@/ui/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/ui/components/ui/chart";
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
import { useFormResponses, supabase } from "@maity/shared";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/contexts/UserContext";
import { Lightbulb, Users, Layout, Target, Heart, TrendingUp } from "lucide-react";
import { getLevelInfo } from "@/features/levels";

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
  empatia: {
    label: "Empatía",
    color: "#ef4444", // Rojo vibrante
  },
};

interface UserDashboardProps {
  userName?: string;
}

export function UserDashboard({ userName }: UserDashboardProps) {
  const { t } = useLanguage();
  const { userProfile } = useUser();
  const { monthlyData, dailyData, statusData, dashboardStats, loading } =
    useDashboardDataByRole('user');
  const { radarData, competencyBars, loading: formLoading, error: formError } = useFormResponses();

  // Calculate diagnostic score from registration form data (q5-q16, scale 1-5)
  const diagnosticScore = useMemo(() => {
    if (!radarData || radarData.length === 0) return null;

    // radarData has 6 competencies, each is average of 2 questions scaled to 0-100
    // Convert back to 1-5 scale and calculate overall average
    const totalScore = radarData.reduce((acc, comp) => {
      return acc + (comp.usuario / 20); // Convert 0-100 back to 0-5 scale
    }, 0);

    const avgScore = totalScore / radarData.length; // 6 competencies
    return Math.round(avgScore * 10) / 10; // Round to 1 decimal
  }, [radarData]);

  // Use radar data directly (no translation needed for generic area names)
  const translatedRadarData = radarData;

  // Rubric definitions with icons and descriptions
  const rubricDefinitions = [
    {
      name: 'Claridad',
      color: '#485df4',
      icon: Lightbulb,
      description: 'Expresa ideas de forma simple, concreta y sin rodeos. Refleja pensamiento estructurado.'
    },
    {
      name: 'Adaptación',
      color: '#1bea9a',
      icon: Users,
      description: 'Ajusta su lenguaje verbal y no verbal según la persona o contexto principal.'
    },
    {
      name: 'Estructura',
      color: '#ff8c42',
      icon: Layout,
      description: 'Ordena sus mensajes con inicio, desarrollo y cierre; guía la conversación.'
    },
    {
      name: 'Propósito',
      color: '#ffd93d',
      icon: Target,
      description: 'Comunica con intención clara y sentido del para qué.'
    },
    {
      name: 'Empatía',
      color: '#ef4444',
      icon: Heart,
      description: 'Escucha con atención, hace preguntas, confirma comprensión y responde con empatía.'
    },
    {
      name: 'Persuasivo',
      color: '#9b4dca',
      icon: TrendingUp,
      description: 'Usa ejemplos, historias o datos para reforzar ideas e influir positivamente.'
    },
  ];

  // Calculate average scores for horizontal bar chart
  const horizontalBarData = useMemo(() => {
    if (!competencyBars) return [];

    const calculateAverage = (questions: any[]) => {
      if (!questions || questions.length === 0) return 0;
      const sum = questions.reduce((acc, q) => acc + (q.value || 0), 0);
      return Math.round((sum / questions.length) * 10) / 10; // Round to 1 decimal
    };

    return [
      {
        competencia: 'Claridad',
        promedio: calculateAverage(competencyBars.claridad),
        color: '#485df4'
      },
      {
        competencia: 'Adaptación',
        promedio: calculateAverage(competencyBars.adaptacion),
        color: '#1bea9a'
      },
      {
        competencia: 'Estructura',
        promedio: calculateAverage(competencyBars.estructura),
        color: '#ff8c42'
      },
      {
        competencia: 'Propósito',
        promedio: calculateAverage(competencyBars.proposito),
        color: '#ffd93d'
      },
      {
        competencia: 'Empatía',
        promedio: calculateAverage(competencyBars.empatia),
        color: '#ef4444'
      },
      {
        competencia: 'Persuasivo',
        promedio: calculateAverage(competencyBars.persuasion),
        color: '#9b4dca'
      },
    ];
  }, [competencyBars]);

  console.log('Radar data:', radarData);
  console.log('Translated radar data:', translatedRadarData);
  console.log('Competency bars:', competencyBars);
  console.log('Horizontal bar data:', horizontalBarData);
  console.log('Diagnostic score:', diagnosticScore);

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
            <CardTitle className="text-sm font-medium text-green-900">Autoevaluación</CardTitle>
            <span className="text-2xl">🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {diagnosticScore !== null ? `${diagnosticScore}/5` : 'N/A'}
            </div>
            <p className="text-xs text-green-700">
              Promedio de autoevaluación
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Mi Nivel</CardTitle>
            <span className="text-3xl">{getLevelInfo(userProfile?.level || 1).icon}</span>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getLevelInfo(userProfile?.level || 1).color}`}>
              {getLevelInfo(userProfile?.level || 1).name}
            </div>
            <p className="text-xs text-blue-700">
              Nivel {userProfile?.level || 1} de 5
            </p>
          </CardContent>
        </Card>

        {/* Cards 3-4 temporalmente comentadas */}
        {/* <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
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
        </Card> */}
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

      {/* Horizontal Bar Chart - Promedio por Rúbrica */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Rúbricas de Comunicación</CardTitle>
          <CardDescription className="text-center">
            Promedio de autoevaluación por competencia (escala 1-5)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          {/* Chart Section */}
          <div className="mb-8 flex justify-center">
            <ChartContainer config={chartConfig} className="h-[400px] w-full max-w-3xl">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={horizontalBarData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis
                    type="number"
                    domain={[0, 5]}
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Promedio (1-5)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="competencia"
                    tick={{ fontSize: 14, fontWeight: 500 }}
                    width={110}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold text-sm">{payload[0].payload.competencia}</p>
                            <p className="text-sm text-muted-foreground">
                              Promedio: <span className="font-bold">{payload[0].value}/5</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="promedio"
                    radius={[0, 8, 8, 0]}
                    label={{ position: 'right', fontSize: 12, fontWeight: 600 }}
                  >
                    {horizontalBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Descriptions Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {rubricDefinitions.map((rubric) => {
              const Icon = rubric.icon;
              return (
                <div
                  key={rubric.name}
                  className="relative p-6 rounded-2xl bg-card hover:shadow-2xl transition-all duration-300 group border-2"
                  style={{
                    borderColor: rubric.color,
                    boxShadow: `0 8px 24px ${rubric.color}25`
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon Circle */}
                    <div
                      className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 border-4"
                      style={{
                        backgroundColor: `${rubric.color}15`,
                        borderColor: rubric.color,
                        boxShadow: `0 0 30px ${rubric.color}40, inset 0 0 20px ${rubric.color}10`
                      }}
                    >
                      <Icon className="w-10 h-10" style={{ color: rubric.color, strokeWidth: 2.5 }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-2" style={{ color: rubric.color }}>
                        {rubric.name}
                      </h3>
                      <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                        {rubric.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

    </main>
  );
}