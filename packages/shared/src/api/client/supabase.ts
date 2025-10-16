/**
 * Supabase Client Configuration
 *
 * This module provides a Supabase client that must be initialized
 * with environment-specific configuration before use.
 *
 * IMPORTANT: Call initializeSupabase() at app startup before
 * using the supabase client.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { DatabaseWithMaity } from '../../types/database-maity.types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  storage?: Storage;
}

/**
 * Supabase client singleton
 * Must be initialized via initializeSupabase() before use
 */
export let supabase: SupabaseClient<DatabaseWithMaity>;

let isInitialized = false;

/**
 * Initializes the Supabase client with the provided configuration
 *
 * @param config - Supabase configuration (URL, anon key, storage)
 * @returns The initialized Supabase client
 *
 * @example
 * ```typescript
 * import { initializeSupabase } from '@maity/shared';
 * import { env } from '@/lib/env';
 *
 * initializeSupabase({
 *   url: env.supabaseUrl,
 *   anonKey: env.supabaseAnonKey,
 * });
 * ```
 */
export function initializeSupabase(config: SupabaseConfig): SupabaseClient<DatabaseWithMaity> {
  if (isInitialized) {
    console.warn('[Supabase] Client already initialized. Skipping re-initialization.');
    return supabase;
  }

  if (!config.url || !config.anonKey) {
    throw new Error(
      '[Supabase] Missing required configuration: url and anonKey are required.\n' +
      'Please call initializeSupabase() with valid configuration before using the client.'
    );
  }

  supabase = createClient<DatabaseWithMaity>(config.url, config.anonKey, {
    auth: {
      storage: config.storage || localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  isInitialized = true;

  console.log('[Supabase] Client initialized successfully');

  return supabase;
}

/**
 * Gets the current Supabase client
 * Throws an error if the client hasn't been initialized
 *
 * @returns The Supabase client instance
 */
export function getSupabase(): SupabaseClient<DatabaseWithMaity> {
  if (!isInitialized || !supabase) {
    throw new Error(
      '[Supabase] Client not initialized. Call initializeSupabase() at app startup.\n' +
      'See packages/shared/src/api/client/supabase.ts for usage.'
    );
  }
  return supabase;
}

/**
 * Checks if the Supabase client has been initialized
 *
 * @returns true if initialized, false otherwise
 */
export function isSupabaseInitialized(): boolean {
  return isInitialized;
}

/**
 * Creates a new Supabase client instance (for testing or special cases)
 * Does not affect the singleton instance
 *
 * @param config - Supabase configuration
 * @returns A new Supabase client instance
 */
export function createSupabaseClient(config: SupabaseConfig): SupabaseClient<DatabaseWithMaity> {
  return createClient<DatabaseWithMaity>(config.url, config.anonKey, {
    auth: {
      storage: config.storage || localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
