import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://nhlrtflkxoojvhbyocet.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHJ0ZmxreG9vanZoYnlvY2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjY3MTUsImV4cCI6MjA2Nzc0MjcxNX0.u7FqcLjO1sVxy-L3yrHp0JkC0WKv9xCQxFBwsVixqbw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export const getSupabase = () => supabase;
