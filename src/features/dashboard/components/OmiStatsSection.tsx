import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/ui/components/ui/chart";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mic, Clock, Star, MessageSquare } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts";
import { getOmiStats, OmiStats } from "@/features/omi/services/omi.service";

const chartConfig = {
  sessions: {
    label: "Sesiones",
    color: "hsl(var(--primary))",
  },
};

interface OmiStatsSectionProps {
  userId?: string;
}

export function OmiStatsSection({ userId }: OmiStatsSectionProps) {
  const { t } = useLanguage();
  const [omiStats, setOmiStats] = useState<OmiStats | null>(null);
  const [omiLoading, setOmiLoading] = useState(true);

  useEffect(() => {
    async function fetchOmiStats() {
      if (!userId) {
        setOmiLoading(false);
        return;
      }
      try {
        const stats = await getOmiStats(userId);
        setOmiStats(stats);
      } catch (error) {
        console.error('Error fetching Omi stats:', error);
      } finally {
        setOmiLoading(false);
      }
    }
    fetchOmiStats();
  }, [userId]);

  // Prepare Omi radar data for chart
  const omiRadarData = useMemo(() => {
    if (!omiStats || omiStats.totalConversations === 0) return [];
    return [
      { metric: t('omi.clarity'), value: omiStats.avgClarity, fullMark: 10 },
      { metric: t('omi.engagement'), value: omiStats.avgEngagement, fullMark: 10 },
      { metric: t('omi.structure'), value: omiStats.avgStructure, fullMark: 10 },
      { metric: t('dashboard.user.omi_overall'), value: omiStats.avgOverallScore, fullMark: 10 },
    ];
  }, [omiStats, t]);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">
              {t('dashboard.user.omi_section')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.user.omi_description')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {omiLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">{t('dashboard.loading')}</p>
          </div>
        ) : !omiStats || omiStats.totalConversations === 0 ? (
          <div className="flex flex-col items-center justify-center h-[250px] text-center">
            <div className="text-6xl mb-4">🎙️</div>
            <p className="text-lg font-medium text-muted-foreground mb-2">
              {t('dashboard.user.omi_no_data')}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('dashboard.user.omi_no_data_desc')}
            </p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0F0F0F] border border-white/10 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500 text-white">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-400">
                    {omiStats.totalConversations}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.user.omi_total_conversations')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0F0F0F] border border-white/10 hover:border-amber-500/30 transition-colors">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500 text-white">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">
                    {omiStats.avgOverallScore > 0 ? `${omiStats.avgOverallScore}/10` : 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.user.omi_avg_score')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0F0F0F] border border-white/10 hover:border-violet-500/30 transition-colors">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-500 text-white">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-violet-400">
                    {omiStats.totalDurationMinutes} min
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.user.omi_total_time')}
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Radar Chart - Average Scores */}
              {omiRadarData.length > 0 && omiRadarData.some(d => d.value > 0) && (
                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    {t('dashboard.user.omi_avg_scores')}
                  </h3>
                  <ChartContainer config={chartConfig} className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={omiRadarData}>
                        <PolarGrid stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                        <PolarAngleAxis
                          dataKey="metric"
                          tick={{ fontSize: 11, fontWeight: 500 }}
                        />
                        <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} />
                        <Radar
                          name="Promedio"
                          dataKey="value"
                          stroke="#06b6d4"
                          fill="#06b6d4"
                          fillOpacity={0.5}
                          strokeWidth={2}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}

              {/* Line Chart - Score Evolution */}
              {omiStats.scoreHistory.length > 0 && (
                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    {t('dashboard.user.omi_evolution')}
                  </h3>
                  <ChartContainer config={chartConfig} className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={omiStats.scoreHistory} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 10]}
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                        />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                  <p className="font-semibold text-sm">{payload[0].payload.date}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Score: <span className="font-bold text-cyan-600">{payload[0].value}/10</span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#06b6d4"
                          strokeWidth={3}
                          dot={{ fill: '#06b6d4', strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 7, fill: '#0891b2' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
