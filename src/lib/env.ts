const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const env = {
  // Supabase Configuration
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,

  // ElevenLabs Configuration
  elevenLabsApiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
  elevenLabsAgentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID,

  // ElevenLabs Test Configuration for Roleplay
  elevenLabsApiKeyTest: import.meta.env.VITE_ELEVENLABS_API_KEY_TEST,
  elevenLabsAgentIdTest: import.meta.env.VITE_ELEVENLABS_AGENT_ID_TEST,

  // App Configuration
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:8080',

  // API Configuration
  // En desarrollo: usa VITE_API_URL si está configurado (para API local), sino usa la API de producción
  apiUrl: isDevelopment
    ? (import.meta.env.VITE_API_URL || 'https://api.maity.com.mx')
    : 'https://api.maity.com.mx',

  // n8n Webhook Configuration for Voice Evaluations
  // Para testing: Visita https://webhook.site para obtener una URL temporal
  // En producción: Actualiza VITE_N8N_WEBHOOK_URL con tu URL de n8n
  n8nWebhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || '',

  // Environment flags
  isDevelopment,
  isProduction,
};