export const env = {
  // Supabase Configuration
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,

  // ElevenLabs Configuration
  elevenLabsApiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
  elevenLabsAgentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID,

  // App Configuration
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:8080',
};