// ===== API Layer =====
// Supabase Client
export {
  supabase,
  initializeSupabase,
  getSupabase,
  isSupabaseInitialized,
  createSupabaseClient,
  type SupabaseConfig
} from './api/client/supabase';

// ===== Types =====
export * from './types/user.types';
export type { Database } from './types/database.types';
export type { DatabaseWithMaity, MaitySchema } from './types/database-maity.types';
export type { Database as SupabaseDatabase } from './services/supabase/types';

// ===== Constants =====
export * from './constants/translations';
export * from './constants/env';
export * from './constants/colors';
export * from './constants/appUrl';

// ===== Utils =====
export * from './utils/cn';
export * from './utils/urlHelpers';
export * from './utils/jwt';

// ===== Domain: Auth =====
export { AuthService, buildRedirectTo } from './domain/auth/auth.service';
export type {
  UserPhase,
  LoginCredentials,
  SignUpData,
  OAuthProvider,
  PostLoginOptions,
  PostLoginResult,
  UserRole,
  UserStatus
} from './domain/auth/auth.types';
export * from './domain/auth/hooks/useStatusValidation';

// ===== Domain: Organizations =====
export { OrganizationService } from './domain/organizations/organization.service';
export * from './domain/organizations/organization.types';
export * from './domain/organizations/invite.service';
export * from './domain/organizations/company.persistence';
export { AutojoinService, type AutojoinResult } from './domain/organizations/autojoin.service';
export * from './domain/organizations/hooks/useCompanyAssociation';
export * from './domain/organizations/hooks/useAutojoinCheck';

// ===== Domain: Users =====
export { UserService } from './domain/users/user.service';
export * from './domain/users/user.types';
export * from './domain/users/tally.service';
export * from './domain/users/hooks/useFormResponses';
export * from './domain/users/hooks/useOnboardingStatus';

// ===== Domain: Roleplay =====
export { RoleplayService } from './domain/roleplay/roleplay.service';
export * from './domain/roleplay/roleplay.types';

// ===== Domain: Interview =====
export { InterviewService } from './domain/interview/interview.service';
export * from './domain/interview/interview.types';
export * from './domain/interview/hooks/useInterviewEvaluationRealtime';
export * from './domain/interview/hooks/useInterviewRadarScores';

// ===== Domain: Registration =====
export { RegistrationFormService } from './domain/registration/registration.service';
export * from './domain/registration/registration.types';

// ===== Domain: Tech Week =====
export { TechWeekService, type TechWeekSessionUpdate } from './domain/tech-week';

// ===== Domain: Coach =====
export { CoachService } from './domain/coach/coach.service';
export { DiagnosticInterviewService } from './domain/coach/diagnostic-interview.service';
export * from './domain/coach/coach.types';
export * from './domain/coach/hooks/useElevenLabsVoice';
export * from './domain/coach/hooks/useElevenLabsConversation';
export * from './domain/coach/hooks/useElevenLabsChat';
export * from './domain/coach/hooks/useVoiceConversation';
export * from './domain/coach/hooks/useEvaluationRealtime';
export * from './domain/coach/hooks/useDiagnosticInterview';

// ===== Domain: Dashboard =====
export { DashboardService } from './domain/dashboard/dashboard.service';
export * from './domain/dashboard/dashboard.types';

// ===== Domain: Analytics =====
export { AnalyticsService } from './domain/analytics/analytics.service';
export * from './domain/analytics/analytics.types';

// ===== Domain: Agent Configuration =====
export { AgentConfigService } from './domain/agent-config/agent-config.service';
export * from './domain/agent-config/agent-config.types';
export * from './domain/agent-config/hooks/useAgentConfig';

// ===== Domain: AI Resources =====
export { AIResourcesService } from './domain/ai-resources/ai-resources.service';
export type { AIResource, CreateResourceInput } from './domain/ai-resources/ai-resources.service';
export * from './domain/ai-resources/hooks/useAIResources';

// ===== Domain: Learning Path =====
export { LearningPathService } from './domain/learning-path/learning-path.service';
export * from './domain/learning-path/learning-path.types';
export * from './domain/learning-path/hooks/useLearningPath';

// ===== Domain: Avatar =====
export { AvatarService } from './domain/avatar/avatar.service';
export * from './domain/avatar/avatar.types';
export * from './domain/avatar/items.types';
export * from './domain/avatar/attachment-points';
export * from './domain/avatar/hooks/useAvatar';

// ===== Domain: Hero Journey =====
export { HeroJourneyService } from './domain/hero-journey/hero-journey.service';
export * from './domain/hero-journey/hero-journey.types';
export * from './domain/hero-journey/hooks/useHeroJourney';

// ===== Domain: SVG Assets =====
export { SVGAssetsService } from './domain/svg-assets/svg-assets.service';
export * from './domain/svg-assets/svg-assets.types';
export * from './domain/svg-assets/hooks/useSVGAssets';

// ===== Contexts =====
export * from './contexts/LanguageContext';

// ===== Services =====
export { PDFService, type DimensionData, type SessionPDFData } from './services/pdf.service';

// ===== Hooks =====
export { useUserRole } from './hooks/useUserRole';
