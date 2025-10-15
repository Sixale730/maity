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

export const getEnv = (platform: 'web' | 'mobile'): EnvConfig => {
  if (platform === 'mobile') {
    // For React Native with Expo - use process.env which Expo inlines at build time
    const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
    return {
      supabaseUrl: (process.env as any).EXPO_PUBLIC_SUPABASE_URL || 'https://nhlrtflkxoojvhbyocet.supabase.co',
      supabaseAnonKey: (process.env as any).EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHJ0ZmxreG9vanZoYnlvY2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjY3MTUsImV4cCI6MjA2Nzc0MjcxNX0.u7FqcLjO1sVxy-L3yrHp0JkC0WKv9xCQxFBwsVixqbw',
      elevenLabsApiKey: (process.env as any).EXPO_PUBLIC_ELEVENLABS_API_KEY,
      elevenLabsAgentId: (process.env as any).EXPO_PUBLIC_ELEVENLABS_AGENT_ID,
      apiUrl: (process.env as any).EXPO_PUBLIC_API_URL || 'https://api.maity.com.mx',
      appUrl: (process.env as any).EXPO_PUBLIC_APP_URL || 'https://www.maity.com.mx',
      isDevelopment: isDev,
      isProduction: !isDev,
      n8nWebhookUrl: (process.env as any).EXPO_PUBLIC_N8N_WEBHOOK_URL,
    };
  }

  // For web (Vite) - Just use default values since we can't access import.meta safely
  // The web app will override these with actual values from import.meta.env at runtime
  return {
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
};

// Export a default env object for web (most common use case in the shared package)
export const env = getEnv('web');