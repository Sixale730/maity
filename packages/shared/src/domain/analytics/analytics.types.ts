/**
 * Analytics Types
 * Types for admin analytics and statistics
 */

export interface AnalyticsOverview {
  totalInterviews: number;
  totalRoleplaySessions: number;
  averageScore: number;
  passRate: number;
  totalDuration: number; // in seconds
  averageDuration: number; // in seconds
}

export interface SessionsByCompany {
  companyId: string;
  companyName: string;
  interviewCount: number;
  roleplayCount: number;
  averageScore: number;
  passRate: number;
}

export interface SessionsByProfile {
  profileId: string;
  profileName: string;
  sessionCount: number;
  averageScore: number;
  passRate: number;
}

export interface SessionsByScenario {
  scenarioId: string;
  scenarioName: string;
  sessionCount: number;
  averageScore: number;
  passRate: number;
}

export interface ScoreDistribution {
  range: string; // "0-20", "21-40", "41-60", "61-80", "81-100"
  count: number;
}

export interface SessionTimeline {
  date: string; // ISO date
  interviewCount: number;
  roleplayCount: number;
  averageScore: number;
}

export interface SessionListItem {
  id: string;
  type: 'interview' | 'roleplay';
  userId: string;
  userName: string;
  companyId: string | null;
  companyName: string | null;
  profileName?: string; // Only for roleplay
  scenarioName?: string; // Only for roleplay
  score: number | null;
  passed: boolean | null;
  duration: number | null; // in seconds
  status: string;
  startedAt: string; // ISO date
  endedAt: string | null; // ISO date
}

export interface AnalyticsFilters {
  companyId?: string;
  type?: 'interview' | 'roleplay' | 'all';
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  profileId?: string; // For roleplay only
  scenarioId?: string; // For roleplay only
}

export interface AnalyticsDashboardData {
  overview: AnalyticsOverview;
  sessionsByCompany: SessionsByCompany[];
  sessionsByProfile: SessionsByProfile[];
  sessionsByScenario: SessionsByScenario[];
  scoreDistribution: ScoreDistribution[];
  timeline: SessionTimeline[];
  recentSessions: SessionListItem[];
}
