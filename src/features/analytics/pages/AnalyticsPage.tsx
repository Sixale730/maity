import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAnalyticsData, useSessionsList } from '../hooks/useAnalyticsData';
import { useSessionsByCompanyUser } from '../hooks/useSessionsByCompanyUser';
import { StatsCard } from '../components/StatsCard';
import { SessionsTable } from '../components/SessionsTable';
import { ScoreDistributionChart } from '../components/ScoreDistributionChart';
import { CompanyStatsTable } from '../components/CompanyStatsTable';
import { ProfileScenarioStats } from '../components/ProfileScenarioStats';
import { CompanyUsersTable } from '../components/CompanyUsersTable';
import { FormResponsesTable } from '../components/FormResponsesTable';
import { AnalyticsFilters } from '../components/AnalyticsFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/ui/tabs';
import { AnalyticsService, type AnalyticsFilters as FiltersType } from '@maity/shared';
import { toast } from '@/shared/hooks/use-toast';
import {
  Users,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Clock,
  BarChart3,
  Building2,
  LayoutDashboard,
  List,
  FileText,
} from 'lucide-react';
import { Skeleton } from '@/ui/components/ui/skeleton';

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Restore state from URL params
  const initialTab = searchParams.get('tab') || 'overview';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialType = searchParams.get('type') || 'all';
  const initialCompanyId = searchParams.get('companyId') || undefined;
  const initialProfileId = searchParams.get('profileId') || undefined;
  const initialScenarioId = searchParams.get('scenarioId') || undefined;
  const initialStartDate = searchParams.get('startDate') || undefined;
  const initialEndDate = searchParams.get('endDate') || undefined;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [filters, setFilters] = useState<FiltersType>({
    type: initialType as 'all' | 'interview' | 'roleplay',
    companyId: initialCompanyId,
    profileId: initialProfileId,
    scenarioId: initialScenarioId,
    startDate: initialStartDate,
    endDate: initialEndDate,
  });
  const [currentPage, setCurrentPage] = useState(initialPage);
  const pageSize = 50;

  // Update URL params whenever state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('tab', activeTab);
    params.set('page', currentPage.toString());
    params.set('type', filters.type || 'all');

    if (filters.companyId) params.set('companyId', filters.companyId);
    if (filters.profileId) params.set('profileId', filters.profileId);
    if (filters.scenarioId) params.set('scenarioId', filters.scenarioId);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);

    setSearchParams(params, { replace: true });
  }, [activeTab, currentPage, filters, setSearchParams]);

  // Reset page when filters change
  const handleFiltersChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const { data, isLoading, error } = useAnalyticsData(filters);
  const {
    data: detailedData,
    isLoading: isLoadingDetailed,
    error: errorDetailed,
  } = useSessionsByCompanyUser({
    companyId: filters.companyId,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });
  const {
    data: allSessionsData,
    isLoading: isLoadingAllSessions,
    error: errorAllSessions,
  } = useSessionsList(filters, currentPage, pageSize);

  const handleSessionClick = async (sessionId: string) => {
    try {
      const sessionDetails = await AnalyticsService.getSessionDetailsAdmin(sessionId);

      // Navigate based on session type
      if (sessionDetails.type === 'tech_week') {
        navigate(`/tech-week/sessions/${sessionId}`);
      } else if (sessionDetails.type === 'interview') {
        navigate(`/primera-entrevista/resultados/${sessionId}`);
      } else {
        navigate(`/sessions/${sessionId}`);
      }
    } catch (error) {
      console.error('Error getting session details:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `No se pudo cargar los detalles de la sesión: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      });
    }
  };

  const handleRecentSessionClick = (session: any) => {
    // SessionListItem already has type field, so we can navigate directly
    if (session.type === 'interview') {
      navigate(`/primera-entrevista/resultados/${session.id}`);
    } else {
      // For roleplay sessions, check if it's tech week by checking profile name
      // This is a simplified approach - ideally we'd have a flag in SessionListItem
      navigate(`/sessions/${session.id}`);
    }
  };

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
        <AnalyticsFilters filters={filters} onFiltersChange={handleFiltersChange} />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setCurrentPage(1);
        }}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="all-sessions" className="gap-2">
            <List className="h-4 w-4" />
            Todas las Sesiones
          </TabsTrigger>
          <TabsTrigger value="detailed" className="gap-2">
            <Building2 className="h-4 w-4" />
            Detalle por Empresa
          </TabsTrigger>
          <TabsTrigger value="autoevaluaciones" className="gap-2">
            <FileText className="h-4 w-4" />
            Autoevaluaciones
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">

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
              <SessionsTable
                sessions={data.recentSessions}
                onSessionClick={handleRecentSessionClick}
              />
            </div>
          </>
        )
      )}
        </TabsContent>

        {/* All Sessions Tab */}
        <TabsContent value="all-sessions" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Todas las Sesiones</h2>
            {errorAllSessions ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                <h2 className="font-semibold mb-2">Error al cargar sesiones</h2>
                <p className="text-sm">{errorAllSessions.message}</p>
              </div>
            ) : (
              <SessionsTable
                sessions={allSessionsData?.sessions || []}
                onSessionClick={handleRecentSessionClick}
                totalSessions={allSessionsData?.total}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                isLoading={isLoadingAllSessions}
              />
            )}
          </div>
        </TabsContent>

        {/* Detailed Tab */}
        <TabsContent value="detailed" className="space-y-6">
          {errorDetailed ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              <h2 className="font-semibold mb-2">Error al cargar vista detallada</h2>
              <p className="text-sm">{errorDetailed.message}</p>
            </div>
          ) : isLoadingDetailed ? (
            <div className="space-y-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          ) : (
            detailedData && (
              <CompanyUsersTable
                companies={detailedData.companies}
                onSessionClick={handleSessionClick}
              />
            )
          )}
        </TabsContent>

        {/* Autoevaluaciones Tab */}
        <TabsContent value="autoevaluaciones" className="space-y-6">
          <FormResponsesTable companyId={filters.companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
