import { supabase } from '../../api/client/supabase';
import type { UserRole, UserPhase, UserStatus } from './auth.types';
import type { Session, User } from '@supabase/supabase-js';
import { hasProperty } from '../../types/supabase-helpers';

/**
 * AuthService - Encapsulates authentication and user status operations
 */
export class AuthService {
  /**
   * Ensures the user exists in the database
   * Creates user record if it doesn't exist
   */
  static async ensureUser(): Promise<void> {
    const { error } = await supabase.rpc('ensure_user');
    if (error) {
      console.error('Error ensuring user exists:', error);
      throw error;
    }
  }

  /**
   * Gets the roles for the current authenticated user
   * @returns Array of user roles (admin, manager, user)
   */
  static async getMyRoles(): Promise<UserRole[]> {
    const { data, error } = await supabase.rpc('my_roles');
    if (error) {
      console.error('Error getting user roles:', error);
      throw error;
    }
    return (data ?? []) as UserRole[];
  }

  /**
   * Gets the current phase of the authenticated user
   * @returns User phase (ACTIVE, REGISTRATION, NO_COMPANY, PENDING, UNAUTHORIZED)
   */
  static async getMyPhase(): Promise<UserPhase> {
    const { data, error } = await supabase.rpc('my_phase');
    if (error) {
      console.error('Error getting user phase:', error);
      throw error;
    }

    // Handle different response formats
    let phase: string;
    if (typeof data === 'string') {
      phase = data.toUpperCase();
    } else if (data && hasProperty(data, 'phase')) {
      phase = String(data.phase).toUpperCase();
    } else if (Array.isArray(data) && data[0] && hasProperty(data[0], 'phase')) {
      phase = String(data[0].phase).toUpperCase();
    } else {
      phase = '';
    }

    return phase as UserPhase;
  }

  /**
   * Gets the current status of the authenticated user
   * @returns User status object with registration and company info
   */
  static async getMyStatus(): Promise<UserStatus[]> {
    const { data, error } = await supabase.rpc('my_status');
    if (error) {
      console.error('Error getting user status:', error);
      throw error;
    }
    return data ?? [];
  }

  /**
   * Marks the onboarding as complete for the current user
   */
  static async completeOnboarding(): Promise<void> {
    const { error } = await supabase.rpc('complete_onboarding');
    if (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  /**
   * Gets the current user's session
   */
  static async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  /**
   * Gets the current authenticated user
   */
  static async getUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  /**
   * Gets the role for the current authenticated user
   * @returns User role (admin, manager, or user)
   */
  static async getUserRole(): Promise<UserRole> {
    const { data, error } = await supabase.rpc('get_user_role');
    if (error) {
      console.error('Error getting user role:', error);
      throw error;
    }
    return (data ?? 'user') as UserRole;
  }

  /**
   * Marks the platform tour as completed for the current user
   */
  static async markTourCompleted(): Promise<void> {
    const { error } = await supabase.rpc('mark_tour_completed');
    if (error) {
      console.error('Error marking tour completed:', error);
      throw error;
    }
  }
}

/**
 * Helper function to build OAuth redirect URL
 * @param returnTo - Optional path to return to after auth
 * @param companyId - Optional company ID for invitation context
 * @returns Full redirect URL for OAuth callback
 */
export function buildRedirectTo(
    returnTo?: string | null,
    companyId?: string | null
  ): string {
    const origin = window.location.origin;                 // usa el origen actual (dev/prod)
    const url = new URL('/auth/callback', origin);         // tu callback (regístralo en Supabase)

    // Sanitiza returnTo: solo mismo origen y lo guarda como ruta relativa
    if (returnTo) {
      try {
        const candidate = new URL(returnTo, origin);
        if (candidate.origin === origin) {
          const rel = candidate.pathname + candidate.search + candidate.hash;
          if (rel.startsWith('/')) url.searchParams.set('returnTo', rel);
        }
      } catch { /* ignora valores inválidos */ }
    }

    if (companyId) url.searchParams.set('company', companyId);
    return url.toString();                                  // sin slash final extra
  }
  