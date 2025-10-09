import { getSupabase } from './client';
import { AuthResponse, AuthTokenResponsePassword, OAuthResponse, Provider, User } from '@supabase/supabase-js';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpOptions {
  email: string;
  password: string;
  metadata?: {
    name?: string;
    [key: string]: any;
  };
}

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn({ email, password }: AuthCredentials): Promise<AuthTokenResponsePassword> {
    const supabase = getSupabase();
    return await supabase.auth.signInWithPassword({ email, password });
  }

  /**
   * Sign up with email and password
   */
  static async signUp({ email, password, metadata }: SignUpOptions): Promise<AuthResponse> {
    const supabase = getSupabase();
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
  }

  /**
   * Sign in with OAuth provider
   * Note: redirectTo will be handled differently on mobile vs web
   */
  static async signInWithOAuth(
    provider: Provider,
    redirectTo?: string
  ): Promise<OAuthResponse> {
    const supabase = getSupabase();
    return await supabase.auth.signInWithOAuth({
      provider,
      options: redirectTo ? { redirectTo } : undefined,
    });
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<{ error: Error | null }> {
    const supabase = getSupabase();
    return await supabase.auth.signOut();
  }

  /**
   * Get the current user
   */
  static async getCurrentUser(): Promise<User | null> {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  /**
   * Get the current session
   */
  static async getSession() {
    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  /**
   * Reset password for email
   */
  static async resetPassword(email: string, redirectTo?: string) {
    const supabase = getSupabase();
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string) {
    const supabase = getSupabase();
    return await supabase.auth.updateUser({
      password: newPassword,
    });
  }

  /**
   * Update user metadata
   */
  static async updateUserMetadata(metadata: Record<string, any>) {
    const supabase = getSupabase();
    return await supabase.auth.updateUser({
      data: metadata,
    });
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    const supabase = getSupabase();
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Check user's role
   */
  static async getUserRole(): Promise<string | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('get_user_role');

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data;
  }

  /**
   * Check user's phase/status
   */
  static async getUserStatus(): Promise<any> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('my_status');

    if (error) {
      console.error('Error fetching user status:', error);
      return null;
    }

    return data;
  }

  /**
   * Check user's phase
   */
  static async getUserPhase(): Promise<string | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('my_phase');

    if (error) {
      console.error('Error fetching user phase:', error);
      return null;
    }

    return data;
  }
}