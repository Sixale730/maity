import { supabase } from './client';

export const AuthService = {
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async signIn({ email, password }: { email: string; password: string }) {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signUp({ email, password, metadata }: { email: string; password: string; metadata?: any }) {
    return await supabase.auth.signUp({
      email,
      password,
      options: metadata ? { data: metadata } : undefined,
    });
  },

  async resetPassword(email: string) {
    return await supabase.auth.resetPasswordForEmail(email);
  },

  async signInWithOAuth(provider: any, options?: any) {
    return await supabase.auth.signInWithOAuth({ provider, options });
  },
};
