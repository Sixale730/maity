import { useState } from 'react';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { StatsCard } from '../components/StatsCard';
import { SessionsTable } from '../components/SessionsTable';
import { ScoreDistributionChart } from '../components/ScoreDistributionChart';
import { CompanyStatsTable } from '../components/CompanyStatsTable';
import { ProfileScenarioStats } from '../components/ProfileScenarioStats';
import { AnalyticsFilters } from '../components/AnalyticsFilters';
import type { AnalyticsFilters as FiltersType } from '@maity/shared';
import {
  Users,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Clock,
  BarChart3,
} from 'lucide-react';
import { Skeleton } from '@/ui/components/ui/skeleton';

export default function AnalyticsPage() {
  const [filters, setFilters] = useState<FiltersType>({
    type: 'all',
  });

  const { data, isLoading, error } = useAnalyticsData(filters);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Error al cargar analytics</h2>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Estadísticas y métricas de entrevistas y roleplay
          </p>
        </div>
        <BarChart3 className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border">
        <AnalyticsFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Overview Stats */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        data && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Entrevistas"
                value={data.overview.totalInterviews}
                icon={Users}
                description="Entrevistas completadas"
              />
              <StatsCard
                title="Total Roleplay"
                value={data.overview.totalRoleplaySessions}
                icon={MessageSquare}
                description="Sesiones de práctica"
              />
              <StatsCard
                title="Score Promedio"
                value={data.overview.averageScore.toFixed(1)}
                icon={TrendingUp}
                description="De todas las sesiones"
              />
              <StatsCard
                title="Tasa de Aprobación"
                value={`${data.overview.passRate.toFixed(1)}%`}
                icon={CheckCircle2}
                description="Sesiones aprobadas"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <StatsCard
                title="Duración Total"
                value={formatDuration(data.overview.totalDuration)}
                icon={Clock}
                description="Tiempo total de práctica"
              />
              <StatsCard
                title="Duración Promedio"
                value={formatDuration(data.overview.averageDuration)}
                icon={Clock}
                description="Por sesión"
              />
            </div>

            {/* Score Distribution */}
            <ScoreDistributionChart data={data.scoreDistribution} />

            {/* Company Stats */}
            <CompanyStatsTable data={data.sessionsByCompany} />

            {/* Profile and Scenario Stats */}
            <ProfileScenarioStats
              profiles={data.sessionsByProfile}
              scenarios={data.sessionsByScenario}
            />

            {/* Recent Sessions */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Sesiones Recientes</h2>
              <SessionsTable sessions={data.recentSessions} />
            </div>
          </>
        )
      )}
    </div>
  );
}
