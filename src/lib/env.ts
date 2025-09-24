const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const env = {
  // Supabase Configuration
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,

  // ElevenLabs Configuration
  elevenLabsApiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
  elevenLabsAgentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID,

  // App Configuration
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:8080',

  // API Configuration
  // En desarrollo: usa VITE_API_URL si está configurado (para API local), sino usa la API de producción
  apiUrl: isDevelopment
    ? (import.meta.env.VITE_API_URL || 'https://api.maity.com.mx')
    : 'https://api.maity.com.mx',

  // Environment flags
  isDevelopment,
  isProduction,
};