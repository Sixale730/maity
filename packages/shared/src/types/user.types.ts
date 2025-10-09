export type UserRole = 'admin' | 'manager' | 'user' | null;

export interface UserProfile {
  id: string;
  auth_id: string;
  name: string;
  company_id?: string;
  role?: string;
  email?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at?: string;
}

export interface UserStatus {
  phase: 'ACTIVE' | 'REGISTRATION' | 'NO_COMPANY' | 'PENDING' | 'UNAUTHORIZED';
  hasCompany: boolean;
  isActive: boolean;
  needsOnboarding: boolean;
}