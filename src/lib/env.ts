/**
 * Centralized Environment Configuration
 *
 * This module provides type-safe access to environment variables.
 * All environment variables should be accessed through this module
 * instead of directly using import.meta.env.
 *
 * Usage:
 *   import { env } from '@/lib/env';
 *   const url = env.supabaseUrl;
 */

export interface EnvConfig {
  // Supabase Configuration
  supabaseUrl: string;
  supabaseAnonKey: string;

  // API Configuration
  apiUrl: string;

  // Application URLs
  appUrl: string;
  canonicalUrl: string;

  // ElevenLabs Configuration (optional)
  elevenLabsApiKey?: string;
  elevenLabsAgentId?: string;
  elevenLabsInterviewAgentId?: string;
  elevenLabsTechWeekAgentId?: string;

  // n8n Integration (optional)
  n8nWebhookUrl?: string;
  n8nInterviewWebhookUrl?: string;
  n8nBackendSecret?: string;

  // Tally Form Integration (optional)
  tallyFormUrl?: string;
  tallyWebhookSecret?: string;

  // CORS Configuration (optional)
  corsOrigins?: string;
  cookieDomain?: string;

  // Environment Flags
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Gets environment variable value from the appropriate source
 * Uses import.meta.env for Vite
 */
function getEnvValue(key: string): string | undefined {
  // For Vite: use import.meta.env
  return (import.meta.env as any)[key];
}

/**
 * Gets a required environment variable
 * Throws an error if the variable is not defined
 */
function getRequired(key: string): string {
  const value = getEnvValue(key);
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please add it to your .env file or environment configuration.\n` +
      `See .env.example for reference.`
    );
  }
  return value;
}

/**
 * Gets an optional environment variable
 * Returns undefined if not set
 */
function getOptional(key: string): string | undefined {
  return getEnvValue(key) || undefined;
}

/**
 * Validates and returns the environment configuration
 * This function is called once at module initialization
 */
function loadEnvironment(): EnvConfig {
  return {
    // Required Supabase config
    supabaseUrl: getRequired('VITE_SUPABASE_URL'),
    supabaseAnonKey: getRequired('VITE_SUPABASE_ANON_KEY'),

    // Required API config
    apiUrl: getRequired('VITE_API_URL'),

    // Required app URLs
    appUrl: getRequired('VITE_APP_URL'),
    canonicalUrl: getOptional('VITE_CANONICAL_URL') || getRequired('VITE_APP_URL'),

    // Optional integrations
    elevenLabsApiKey: getOptional('VITE_ELEVENLABS_API_KEY_TEST'),
    elevenLabsAgentId: getOptional('VITE_ELEVENLABS_AGENT_ID_TEST'),
    elevenLabsInterviewAgentId: getOptional('VITE_ELEVENLABS_INTERVIEW_AGENT_ID'),
    elevenLabsTechWeekAgentId: getOptional('VITE_ELEVENLABS_TECH_WEEK_AGENT_ID'),
    n8nWebhookUrl: getOptional('VITE_N8N_WEBHOOK_URL'),
    n8nInterviewWebhookUrl: getOptional('VITE_N8N_INTERVIEW_WEBHOOK_URL'),
    n8nBackendSecret: getOptional('VITE_N8N_BACKEND_SECRET'),
    tallyFormUrl: getOptional('VITE_TALLY_FORM_URL'),
    tallyWebhookSecret: getOptional('VITE_TALLY_WEBHOOK_SECRET'),

    // Optional CORS/cookie config
    corsOrigins: getOptional('VITE_CORS_ORIGINS'),
    cookieDomain: getOptional('VITE_COOKIE_DOMAIN'),

    // Environment detection (use import.meta.env for Vite)
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  };
}

/**
 * Singleton environment configuration
 * Loaded once at module initialization
 */
export const env = loadEnvironment();

/**
 * Helper to check if we're in development mode
 */
export const isDev = env.isDevelopment;

/**
 * Helper to check if we're in production mode
 */
export const isProd = env.isProduction;
