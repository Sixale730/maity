import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';
import { env } from '../../constants/env';

let supabaseClient: SupabaseClient<Database> | null = null;

export const initializeSupabase = (): SupabaseClient<Database> => {
  if (supabaseClient) {
    return supabaseClient;
  }

  supabaseClient = createClient<Database>(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      auth: {
        storage: typeof window !== 'undefined' ? localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    }
  );

  return supabaseClient;
};

export const getSupabase = (): SupabaseClient<Database> => {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initializeSupabase first.');
  }
  return supabaseClient;
};