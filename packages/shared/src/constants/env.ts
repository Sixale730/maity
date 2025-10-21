interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  elevenLabsApiKey?: string;
  elevenLabsAgentId?: string;
  apiUrl: string;
  appUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  n8nWebhookUrl?: string;
}

// Default environment configuration for web
// The web app will override these with actual values from import.meta.env at runtime
export const env: EnvConfig = {
  supabaseUrl: 'https://nhlrtflkxoojvhbyocet.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHJ0ZmxreG9vanZoYnlvY2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjY3MTUsImV4cCI6MjA2Nzc0MjcxNX0.u7FqcLjO1sVxy-L3yrHp0JkC0WKv9xCQxFBwsVixqbw',
  elevenLabsApiKey: undefined,
  elevenLabsAgentId: undefined,
  apiUrl: 'https://api.maity.com.mx',
  appUrl: 'http://localhost:8080',
  isDevelopment: false,
  isProduction: true,
  n8nWebhookUrl: undefined,
};