/**
 * User Management Types
 * Types for user CRUD operations and administration
 */

import type { UserRole } from '../auth/auth.types';

/**
 * User status (different from UserPhase in auth.types)
 */
export type UserStatusType = 'ACTIVE' | 'INACTIVE' | 'PENDING';

/**
 * User data for management view
 */
export interface UserManagement {
  id: string;
  auth_id: string | null;
  name: string;
  email: string;
  company_id: string | null;
  company_name: string | null;
  role: UserRole;
  status: UserStatusType;
  created_at: string;
  updated_at: string;
  registration_form_completed: boolean;
}

/**
 * Response from user management operations (update, delete, etc.)
 */
export interface UserOperationResponse {
  success: boolean;
  error?: string;
  message?: string;
  user_id?: string;
  new_role?: UserRole;
  company_id?: string | null;
  status?: UserStatusType;
  deleted?: boolean;
}

/**
 * Impact analysis for user deletion
 * Shows what will be deleted when user is removed
 */
export interface UserDeletionImpact {
  sessions: number;
  evaluations: number;
  voice_sessions: number;
  form_responses: number;
  tally_submissions: number;
  user_roles: number;
  user_company_history: number;
  voice_progress: number;
}

/**
 * Impact analysis for company deletion
 * Shows users assigned to company before deletion
 */
export interface CompanyDeletionImpact {
  total_users: number;
  admins: number;
  managers: number;
  users: number;
  can_delete: boolean;
}
