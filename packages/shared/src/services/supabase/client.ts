import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';
import { getEnv } from '../../constants/env';

let supabaseClient: SupabaseClient<Database> | null = null;

export const initializeSupabase = (platform: 'web' | 'mobile'): SupabaseClient<Database> => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const env = getEnv(platform);

  const options = platform === 'web'
    ? {
        auth: {
          storage: typeof window !== 'undefined' ? localStorage : undefined,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        }
      }
    : {
        auth: {
          // For React Native, we'll use AsyncStorage
          // This will be configured when setting up mobile
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        }
      };

  supabaseClient = createClient<Database>(
    env.supabaseUrl,
    env.supabaseAnonKey,
    options
  );

  return supabaseClient;
};

export const getSupabase = (): SupabaseClient<Database> => {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initializeSupabase first.');
  }
  return supabaseClient;
};