/**
 * Communication Analyzer Service
 *
 * Analyzes user communication style from conversation segments.
 * Uses LLM provider priority from LLM_PROVIDERS env (default: deepseek,openai).
 * Ported from maity-mobile/api/services/communication_analyzer.py
 */

import OpenAI from 'openai';

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_TOKENS = 1200;
const TEMPERATURE = 0.7;
const TIMEOUT_MS = 20000;
const MIN_USER_WORDS = 15;
const MAX_TRANSCRIPT_CHARS = 4000;

// ============================================================================
// LLM PROVIDER (mirrors registry from openai.service.ts)
// ============================================================================

interface ProviderConfig {
  envKey: string;
  baseURL?: string;
  defaultModel: string;
  modelEnvKey: string;
}

const PROVIDER_REGISTRY: Record<string, ProviderConfig> = {
  deepseek: { envKey: 'DEEPSEEK_API_KEY', baseURL: 'https://api.deepseek.com', defaultModel: 'deepseek-chat', modelEnvKey: 'DEEPSEEK_MODEL' },
  openai:   { envKey: 'OPENAI_API_KEY',   baseURL: undefined,                  defaultModel: 'gpt-4o-mini',   modelEnvKey: 'OPENAI_MODEL' },
};

interface LLMClient {
  client: OpenAI;
  provider: string;
  model: string;
}

function getProviders(): LLMClient[] {
  const order = process.env.LLM_PROVIDERS
    ? process.env.LLM_PROVIDERS.split(',').map((s) => s.trim().toLowerCase())
    : ['deepseek', 'openai'];

  const clients: LLMClient[] = [];
  for (const name of order) {
    const config = PROVIDER_REGISTRY[name];
    if (!config) continue;
    const apiKey = process.env[config.envKey];
    if (!apiKey) continue;
    clients.push({
      client: new OpenAI({ apiKey, ...(config.baseURL ? { baseURL: config.baseURL } : {}) }),
      provider: name,
      model: process.env[config.modelEnvKey] || config.defaultModel,
    });
  }
  return clients;
}

// ============================================================================
// TYPES
// ============================================================================

export interface TranscriptSegment {
  text: string;
  speaker?: string;
  speaker_id?: number;
  is_user?: boolean;
  start?: number;
  end?: number;
}

export interface CommunicationObservations {
  clarity: string;
  structure: string;
  calls_to_action: string;
  objections: string;
}

export interface CommunicationCounters {
  pero_count: number;
  objection_words: Record<string, number>;
  objections_received: string[];
  objections_made: string[];
  filler_words: Record<string, number>;
}

// ============================================================================
// NEW TYPES - Radiografía de comunicación
// ============================================================================

export interface Radiografia {
  muletillas_detectadas: Record<string, number>; // LLM detecta dinámicamente
  muletillas_total: number;
  muletillas_frecuencia: string; // "1 cada X palabras"
  ratio_habla: number; // usuario/otros
  palabras_usuario: number;
  palabras_otros: number;
}

export interface PreguntasAnalisis {
  preguntas_usuario: string[]; // preguntas hechas por el usuario
  preguntas_otros: string[]; // preguntas hechas por otros
  total_usuario: number;
  total_otros: number;
}

export interface AccionUsuario {
  descripcion: string;
  tiene_fecha: boolean; // si mencionó cuándo
}

export interface TemaSinCerrar {
  tema: string;
  razon: string; // por qué quedó abierto
}

export interface TemasAnalisis {
  temas_tratados: string[];
  acciones_usuario: AccionUsuario[]; // solo acciones del usuario principal
  temas_sin_cerrar: TemaSinCerrar[];
}

// ============================================================================

export interface CommunicationFeedback {
  strengths: string[];
  areas_to_improve: string[];
  observations: CommunicationObservations;
  summary: string;
  counters?: CommunicationCounters;
  overall_score?: number;
  clarity?: number;
  structure?: number;
  empatia?: number;
  vocabulario?: number;
  objetivo?: number;
  feedback?: string;
  // New fields - Radiografía
  radiografia?: Radiografia;
  preguntas?: PreguntasAnalisis;
  temas?: TemasAnalisis;
}

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const SYSTEM_PROMPT = `Eres un coach experto en comunicación efectiva. Analiza las intervenciones del USUARIO en la siguiente conversación y proporciona feedback constructivo en español.

IMPORTANTE: Solo analiza los mensajes del USUARIO, no los de otros participantes.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:

{
  "strengths": ["fortaleza1", "fortaleza2", "fortaleza3"],
  "areas_to_improve": ["area1", "area2", "area3"],
  "observations": {
    "clarity": "Observación sobre claridad del mensaje (1-2 oraciones)",
    "structure": "Observación sobre estructura del mensaje (1-2 oraciones)",
    "calls_to_action": "Observación sobre llamados a la acción (1-2 oraciones)",
    "objections": "Observación sobre manejo de objeciones (1-2 oraciones)"
  },
  "summary": "Resumen de 1 oración (max 300 chars)",
  "counters": {
    "pero_count": 0,
    "objection_words": {"pero": 0, "sin embargo": 0, "aunque": 0, "no obstante": 0},
    "objections_received": ["objeción1"],
    "objections_made": ["objeción1"],
    "filler_words": {"este": 0, "o sea": 0, "como que": 0, "bueno": 0, "eh": 0, "mmm": 0}
  },
  "overall_score": 7,
  "clarity": 8,
  "structure": 6,
  "empatia": 7,
  "vocabulario": 8,
  "objetivo": 6,
  "feedback": "Feedback general breve",

  "radiografia": {
    "muletillas_detectadas": {"este": 5, "o sea": 3},
    "muletillas_total": 8,
    "muletillas_frecuencia": "1 cada 45 palabras",
    "ratio_habla": 1.3,
    "palabras_usuario": 450,
    "palabras_otros": 350
  },

  "preguntas": {
    "preguntas_usuario": ["¿Qué opinas de...?"],
    "preguntas_otros": ["¿Por qué decidiste...?"],
    "total_usuario": 1,
    "total_otros": 1
  },

  "temas": {
    "temas_tratados": ["presupuesto", "plazos"],
    "acciones_usuario": [
      {"descripcion": "Enviar propuesta", "tiene_fecha": true}
    ],
    "temas_sin_cerrar": [
      {"tema": "Recursos", "razon": "Pendiente confirmación"}
    ]
  }
}

Reglas:
- strengths: 2-4 items máximo 5
- areas_to_improve: 2-4 items máximo 5
- Cada observación: 1-2 oraciones
- summary: máximo 300 caracteres
- Scores: 0-10
- Si hay muy poco contenido, devuelve scores bajos y menciona la falta de datos

RADIOGRAFÍA DE LA CONVERSACIÓN:
- muletillas_detectadas: Identifica palabras o frases repetidas innecesariamente por el USUARIO (ej: "este", "o sea", "básicamente", "digamos", "como que", "bueno", "pues", "verdad", "¿no?"). Solo incluye las que aparezcan 2+ veces.
- muletillas_total: Suma total de todas las muletillas detectadas
- muletillas_frecuencia: "1 cada X palabras" calculado como palabras_usuario / muletillas_total
- ratio_habla: Calcula palabras_usuario / palabras_otros (1.0 = igual participación)
- palabras_usuario: Cuenta las palabras del USUARIO
- palabras_otros: Cuenta las palabras de los OTROS participantes

PREGUNTAS:
- preguntas_usuario: Lista las preguntas que hizo el USUARIO (máx 5, textual o resumidas)
- preguntas_otros: Lista las preguntas que hicieron los OTROS (máx 5)
- total_usuario/total_otros: Conteo total de preguntas de cada parte

TEMAS Y ACCIONES:
- temas_tratados: Lista 3-6 temas principales discutidos en la conversación
- acciones_usuario: Compromisos o tareas que el USUARIO asumió o se comprometió a hacer. Solo del USUARIO, no de otros. Indica si mencionó fecha/momento concreto.
- temas_sin_cerrar: Temas que se discutieron pero no llegaron a conclusión o decisión clara. Explica brevemente por qué quedó abierto.

MÉTRICAS DE COMUNICACIÓN (0-10):
- clarity: Qué tan claro y comprensible es el mensaje del usuario
- structure: Organización y estructura del discurso
- empatia: Capacidad del USUARIO de escuchar, hacer preguntas y conectar con otros (solo evalúa al usuario principal)
- vocabulario: Riqueza léxica, uso de términos apropiados, evitar muletillas
- objetivo: Qué tan enfocada estuvo la conversación hacia metas concretas con fechas y responsables`;

// ============================================================================
// UTILITIES
// ============================================================================

function buildTranscript(segments: TranscriptSegment[]): { transcript: string; userWordCount: number; otherWordCount: number } {
  // Filter user segments if marked, otherwise assume all are from user
  const hasUserMarks = segments.some((s) => s.is_user !== undefined);

  const lines: string[] = [];
  let userWordCount = 0;
  let otherWordCount = 0;

  for (const segment of segments) {
    const isUser = hasUserMarks ? segment.is_user : true;
    const label = isUser ? 'Usuario' : 'Otro';
    lines.push(`${label}: ${segment.text}`);

    const wordCount = segment.text.split(/\s+/).length;
    if (isUser) {
      userWordCount += wordCount;
    } else {
      otherWordCount += wordCount;
    }
  }

  return {
    transcript: lines.join('\n'),
    userWordCount,
    otherWordCount,
  };
}

function truncateTranscript(transcript: string, maxChars: number = MAX_TRANSCRIPT_CHARS): string {
  if (transcript.length <= maxChars) return transcript;
  return transcript.slice(0, maxChars) + '\n[Transcripción truncada...]';
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Analyze communication from transcript segments.
 * Returns null on error or insufficient content.
 */
export async function analyzeCommunication(
  segments: TranscriptSegment[]
): Promise<CommunicationFeedback | null> {
  if (!segments || segments.length === 0) {
    console.log('[communication-analyzer] No segments provided');
    return null;
  }

  const { transcript, userWordCount, otherWordCount } = buildTranscript(segments);

  // Check minimum content
  if (userWordCount < MIN_USER_WORDS) {
    console.log(`[communication-analyzer] Insufficient user words: ${userWordCount}/${MIN_USER_WORDS}`);
    return {
      strengths: ['Participación en la conversación'],
      areas_to_improve: ['Proporcionar más contenido para un análisis completo'],
      observations: {
        clarity: 'Contenido insuficiente para evaluar claridad.',
        structure: 'Contenido insuficiente para evaluar estructura.',
        calls_to_action: 'Contenido insuficiente para evaluar llamados a la acción.',
        objections: 'Contenido insuficiente para evaluar manejo de objeciones.',
      },
      summary: 'Conversación muy breve para un análisis detallado.',
      overall_score: 5,
      clarity: 5,
      structure: 5,
      empatia: 5,
      vocabulario: 5,
      objetivo: 5,
      // Radiografía básica para contenido insuficiente
      radiografia: {
        muletillas_detectadas: {},
        muletillas_total: 0,
        muletillas_frecuencia: 'N/A',
        ratio_habla: otherWordCount > 0 ? userWordCount / otherWordCount : 1,
        palabras_usuario: userWordCount,
        palabras_otros: otherWordCount,
      },
      preguntas: {
        preguntas_usuario: [],
        preguntas_otros: [],
        total_usuario: 0,
        total_otros: 0,
      },
      temas: {
        temas_tratados: [],
        acciones_usuario: [],
        temas_sin_cerrar: [],
      },
    };
  }

  const truncated = truncateTranscript(transcript);
  // Prepend word counts to help LLM with radiografía calculations
  const userMessage = `[Conteo de palabras: Usuario=${userWordCount}, Otros=${otherWordCount}]\n\n${truncated}`;
  const requestParams = {
    messages: [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: userMessage },
    ],
    response_format: { type: 'json_object' as const },
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
  };

  // Iterate providers by priority (LLM_PROVIDERS env)
  const providers = getProviders();

  for (const llm of providers) {
    try {
      const completion = await llm.client.chat.completions.create(
        { ...requestParams, model: llm.model },
        { timeout: TIMEOUT_MS }
      );

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        console.error(`[communication-analyzer] Empty response from ${llm.provider}`);
        continue;
      }

      const result = JSON.parse(content) as CommunicationFeedback;

      console.log('[communication-analyzer] Analysis completed', {
        provider: llm.provider,
        model: llm.model,
        userWords: userWordCount,
        otherWords: otherWordCount,
        overallScore: result.overall_score,
        hasRadiografia: !!result.radiografia,
      });

      return result;
    } catch (error) {
      console.warn(`[communication-analyzer] ${llm.provider} failed, trying next provider...`, error);
    }
  }

  console.error('[communication-analyzer] All providers failed');
  return null;
}

/**
 * Aggregate feedback from multiple conversations.
 */
export function aggregateFeedback(
  feedbackList: CommunicationFeedback[]
): {
  top_strengths: string[];
  top_areas_to_improve: string[];
  conversations_analyzed: number;
} {
  const strengthsCount: Record<string, number> = {};
  const areasCount: Record<string, number> = {};

  for (const feedback of feedbackList) {
    for (const strength of feedback.strengths || []) {
      strengthsCount[strength] = (strengthsCount[strength] || 0) + 1;
    }
    for (const area of feedback.areas_to_improve || []) {
      areasCount[area] = (areasCount[area] || 0) + 1;
    }
  }

  // Sort by frequency and take top 5
  const topStrengths = Object.entries(strengthsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key]) => key);

  const topAreas = Object.entries(areasCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key]) => key);

  return {
    top_strengths: topStrengths,
    top_areas_to_improve: topAreas,
    conversations_analyzed: feedbackList.length,
  };
}
