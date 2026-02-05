/**
 * Omi Admin Insights Types
 * Platform-wide analytics for Omi conversations
 */

/**
 * Raw response from the get_omi_admin_insights RPC
 */
export interface OmiAdminInsightsRaw {
  total_conversations: number;
  total_transcript_segments: number;
  total_users_with_conversations: number;
  total_users: number;
  avg_conversations_per_user: number;
  median_conversations_per_user: number;
  users_with_zero_conversations: number;
  avg_transcript_text_size_bytes: number;
  avg_segments_per_conversation: number;
  avg_duration_seconds: number;
  avg_words_count: number;
  avg_overall_score: number;
  conversations_with_feedback: number;
  estimated_storage_bytes: number;
  conversations_last_7_days: number;
  conversations_last_30_days: number;
}

/**
 * Transformed insights for frontend consumption
 */
export interface OmiAdminInsights {
  // Counts
  totalConversations: number;
  totalTranscriptSegments: number;
  totalUsersWithConversations: number;
  totalUsers: number;

  // Engagement metrics
  avgConversationsPerUser: number;
  medianConversationsPerUser: number;
  usersWithZeroConversations: number;

  // Content metrics
  avgTranscriptTextSizeBytes: number;
  avgSegmentsPerConversation: number;
  avgDurationSeconds: number;
  avgWordsCount: number;

  // Quality metrics
  avgOverallScore: number;
  conversationsWithFeedback: number;
  feedbackCoveragePercent: number;

  // Storage
  estimatedStorageBytes: number;
  estimatedStorageMB: number;

  // Growth
  conversationsLast7Days: number;
  conversationsLast30Days: number;
  dailyGrowthRate: number;
}

/**
 * Supabase tier limits
 */
export type SupabaseTier = 'Free' | 'Pro' | 'Team';

export interface SupabaseTierInfo {
  name: SupabaseTier;
  limitBytes: number;
  limitMB: number;
  limitGB: number;
  color: string;
}

export const SUPABASE_TIERS: Record<SupabaseTier, SupabaseTierInfo> = {
  Free: {
    name: 'Free',
    limitBytes: 500 * 1024 * 1024, // 500MB
    limitMB: 500,
    limitGB: 0.5,
    color: '#22c55e', // green
  },
  Pro: {
    name: 'Pro',
    limitBytes: 8 * 1024 * 1024 * 1024, // 8GB
    limitMB: 8192,
    limitGB: 8,
    color: '#3b82f6', // blue
  },
  Team: {
    name: 'Team',
    limitBytes: 16 * 1024 * 1024 * 1024, // 16GB
    limitMB: 16384,
    limitGB: 16,
    color: '#a855f7', // purple
  },
};

/**
 * Scalability projection result
 */
export interface ScalabilityProjection {
  currentUsers: number;
  targetUsers: number;
  currentStorageMB: number;
  projectedStorageMB: number;
  storagePerUserMB: number;
  recommendedTier: SupabaseTier;
  percentageOfTierUsed: number;
  tierInfo: SupabaseTierInfo;
}

/**
 * Calculate scalability projection for a target number of users
 */
export function calculateScalabilityProjection(
  insights: OmiAdminInsights,
  targetUsers: number
): ScalabilityProjection {
  const currentUsers = Math.max(insights.totalUsersWithConversations, 1);
  const storagePerUserMB = insights.estimatedStorageMB / currentUsers;
  const projectedStorageMB = storagePerUserMB * targetUsers;
  const projectedStorageBytes = projectedStorageMB * 1024 * 1024;

  // Determine recommended tier
  let recommendedTier: SupabaseTier = 'Free';
  if (projectedStorageBytes > SUPABASE_TIERS.Pro.limitBytes) {
    recommendedTier = 'Team';
  } else if (projectedStorageBytes > SUPABASE_TIERS.Free.limitBytes) {
    recommendedTier = 'Pro';
  }

  const tierInfo = SUPABASE_TIERS[recommendedTier];
  const percentageOfTierUsed = (projectedStorageBytes / tierInfo.limitBytes) * 100;

  return {
    currentUsers,
    targetUsers,
    currentStorageMB: insights.estimatedStorageMB,
    projectedStorageMB,
    storagePerUserMB,
    recommendedTier,
    percentageOfTierUsed,
    tierInfo,
  };
}

/**
 * Transform raw RPC response to frontend format
 */
export function transformOmiInsights(raw: OmiAdminInsightsRaw): OmiAdminInsights {
  const totalConversations = raw.total_conversations || 0;
  const conversationsWithFeedback = raw.conversations_with_feedback || 0;
  const estimatedStorageBytes = raw.estimated_storage_bytes || 0;
  const conversationsLast7Days = raw.conversations_last_7_days || 0;
  const conversationsLast30Days = raw.conversations_last_30_days || 0;

  // Calculate feedback coverage percentage
  const feedbackCoveragePercent = totalConversations > 0
    ? (conversationsWithFeedback / totalConversations) * 100
    : 0;

  // Calculate daily growth rate (7-day average vs 30-day average)
  const avg7Day = conversationsLast7Days / 7;
  const avg30Day = conversationsLast30Days / 30;
  const dailyGrowthRate = avg30Day > 0
    ? ((avg7Day - avg30Day) / avg30Day) * 100
    : 0;

  return {
    totalConversations,
    totalTranscriptSegments: raw.total_transcript_segments || 0,
    totalUsersWithConversations: raw.total_users_with_conversations || 0,
    totalUsers: raw.total_users || 0,
    avgConversationsPerUser: raw.avg_conversations_per_user || 0,
    medianConversationsPerUser: raw.median_conversations_per_user || 0,
    usersWithZeroConversations: raw.users_with_zero_conversations || 0,
    avgTranscriptTextSizeBytes: raw.avg_transcript_text_size_bytes || 0,
    avgSegmentsPerConversation: raw.avg_segments_per_conversation || 0,
    avgDurationSeconds: raw.avg_duration_seconds || 0,
    avgWordsCount: raw.avg_words_count || 0,
    avgOverallScore: raw.avg_overall_score || 0,
    conversationsWithFeedback,
    feedbackCoveragePercent,
    estimatedStorageBytes,
    estimatedStorageMB: estimatedStorageBytes / (1024 * 1024),
    conversationsLast7Days,
    conversationsLast30Days,
    dailyGrowthRate,
  };
}
