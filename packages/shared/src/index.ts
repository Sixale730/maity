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

// ===== Domain: Coach =====
export { CoachService } from './domain/coach/coach.service';
export * from './domain/coach/coach.types';
export * from './domain/coach/hooks/useElevenLabsVoice';
export * from './domain/coach/hooks/useElevenLabsConversation';
export * from './domain/coach/hooks/useElevenLabsChat';
export * from './domain/coach/hooks/useVoiceConversation';
export * from './domain/coach/hooks/useEvaluationRealtime';

// ===== Domain: Dashboard =====
export { DashboardService } from './domain/dashboard/dashboard.service';
export * from './domain/dashboard/dashboard.types';

// ===== Contexts =====
export * from './contexts/LanguageContext';

// ===== Hooks =====
export { useUserRole } from './hooks/useUserRole';
