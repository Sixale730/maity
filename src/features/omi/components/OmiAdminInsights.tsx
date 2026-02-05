import React from 'react';
import {
  Database,
  Users,
  MessageSquare,
  TrendingUp,
  HardDrive,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Progress } from '@/ui/components/ui/progress';
import { Badge } from '@/ui/components/ui/badge';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/ui/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOmiAdminInsights } from '../hooks/useOmiAdminInsights';
import { SUPABASE_TIERS } from '../types/omi-insights.types';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  className?: string;
}

function MetricCard({ title, value, subtitle, icon, className }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function OmiAdminInsights() {
  const { t } = useLanguage();
  const { insights, projection, isLoading, isError, error } = useOmiAdminInsights(600);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('omi_insights.error_title')}</AlertTitle>
        <AlertDescription>
          {error?.message || t('omi_insights.error_loading')}
        </AlertDescription>
      </Alert>
    );
  }

  if (!insights) {
    return null;
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  const feedbackPercentage = Math.round(insights.feedbackCoveragePercent);
  const activeUsersPercentage = insights.totalUsers > 0
    ? Math.round((insights.totalUsersWithConversations / insights.totalUsers) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Database className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{t('omi_insights.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('omi_insights.description')}
          </p>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('omi_insights.total_conversations')}
          value={insights.totalConversations.toLocaleString()}
          subtitle={`${insights.totalTranscriptSegments.toLocaleString()} ${t('omi_insights.segments')}`}
          icon={<MessageSquare className="h-4 w-4 text-blue-500" />}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        <MetricCard
          title={t('omi_insights.active_users')}
          value={insights.totalUsersWithConversations.toLocaleString()}
          subtitle={`${activeUsersPercentage}% ${t('omi_insights.of_total')} (${insights.totalUsers})`}
          icon={<Users className="h-4 w-4 text-green-500" />}
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        <MetricCard
          title={t('omi_insights.avg_per_user')}
          value={insights.avgConversationsPerUser.toFixed(1)}
          subtitle={`${t('omi_insights.median')}: ${insights.medianConversationsPerUser.toFixed(1)}`}
          icon={<BarChart3 className="h-4 w-4 text-purple-500" />}
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        />
        <MetricCard
          title={t('omi_insights.with_feedback')}
          value={`${feedbackPercentage}%`}
          subtitle={`${insights.conversationsWithFeedback} ${t('omi_insights.analyzed')}`}
          icon={<CheckCircle2 className="h-4 w-4 text-cyan-500" />}
          className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200"
        />
      </div>

      {/* Content & Quality Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              {t('omi_insights.avg_duration')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(insights.avgDurationSeconds)}</div>
            <p className="text-xs text-muted-foreground">
              ~{Math.round(insights.avgWordsCount)} {t('omi_insights.words_avg')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-500" />
              {t('omi_insights.avg_segments')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.avgSegmentsPerConversation.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              ~{formatBytes(insights.avgTranscriptTextSizeBytes)} {t('omi_insights.per_transcript')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              {t('omi_insights.avg_score')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.avgOverallScore.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">
              {t('omi_insights.communication_quality')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scalability Projection */}
      {projection && (
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-slate-600" />
              {t('omi_insights.scalability_title')}
            </CardTitle>
            <CardDescription>
              {t('omi_insights.scalability_description', { users: projection.targetUsers })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Storage Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">{t('omi_insights.current_storage')}</p>
                <p className="text-2xl font-bold">{formatBytes(insights.estimatedStorageBytes)}</p>
                <p className="text-xs text-muted-foreground">
                  ~{projection.storagePerUserMB.toFixed(2)} MB/{t('omi_insights.per_user')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">{t('omi_insights.projected_storage')}</p>
                <p className="text-2xl font-bold">{projection.projectedStorageMB.toFixed(1)} MB</p>
                <p className="text-xs text-muted-foreground">
                  {t('omi_insights.for_users', { users: projection.targetUsers })}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('omi_insights.tier_usage')}</span>
                <span className="font-medium">
                  {Math.min(projection.percentageOfTierUsed, 100).toFixed(1)}% {t('omi_insights.of')} {projection.tierInfo.name} ({projection.tierInfo.limitGB} GB)
                </span>
              </div>
              <Progress
                value={Math.min(projection.percentageOfTierUsed, 100)}
                className="h-3"
              />
            </div>

            {/* Tier Recommendation */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">
                  {t('omi_insights.recommended_tier')}:{' '}
                  <Badge
                    variant="secondary"
                    style={{ backgroundColor: projection.tierInfo.color, color: 'white' }}
                  >
                    {projection.tierInfo.name}
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  {projection.percentageOfTierUsed < 50
                    ? t('omi_insights.tier_comfortable')
                    : projection.percentageOfTierUsed < 80
                    ? t('omi_insights.tier_adequate')
                    : t('omi_insights.tier_tight')}
                </p>
              </div>
            </div>

            {/* All Tiers Reference */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {Object.values(SUPABASE_TIERS).map((tier) => (
                <div
                  key={tier.name}
                  className={`p-2 rounded-md ${
                    tier.name === projection.recommendedTier
                      ? 'ring-2 ring-offset-1'
                      : 'opacity-60'
                  }`}
                  style={{
                    backgroundColor: `${tier.color}20`,
                    borderColor: tier.color,
                    ...(tier.name === projection.recommendedTier && {
                      ringColor: tier.color,
                    }),
                  }}
                >
                  <p className="font-semibold" style={{ color: tier.color }}>
                    {tier.name}
                  </p>
                  <p className="text-muted-foreground">{tier.limitGB} GB</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            {t('omi_insights.growth_title')}
          </CardTitle>
          <CardDescription>{t('omi_insights.growth_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">{t('omi_insights.last_7_days')}</p>
              <p className="text-2xl font-bold">{insights.conversationsLast7Days}</p>
              <p className="text-xs text-muted-foreground">
                ~{(insights.conversationsLast7Days / 7).toFixed(1)}/{t('omi_insights.per_day')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('omi_insights.last_30_days')}</p>
              <p className="text-2xl font-bold">{insights.conversationsLast30Days}</p>
              <p className="text-xs text-muted-foreground">
                ~{(insights.conversationsLast30Days / 30).toFixed(1)}/{t('omi_insights.per_day')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('omi_insights.growth_rate')}</p>
              <p className={`text-2xl font-bold ${insights.dailyGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {insights.dailyGrowthRate >= 0 ? '+' : ''}{insights.dailyGrowthRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {t('omi_insights.vs_30_day_avg')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
