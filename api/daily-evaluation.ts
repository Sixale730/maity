/**
 * Daily Evaluation Endpoint
 *
 * Generates LLM-powered daily evaluation summaries for a user's
 * communication performance. Reads SQL-aggregated data from
 * maity.daily_evaluations, calls the LLM for a narrative summary,
 * then updates the row.
 *
 * POST /api/daily-evaluation
 * Body: { user_id: UUID, date: "YYYY-MM-DD" }
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import OpenAI from 'openai';

// ============================================================================
// SCHEMAS
// ============================================================================

const RequestSchema = z.object({
  user_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// ============================================================================
// CORS
// ============================================================================

function setCors(req: VercelRequest, res: VercelResponse): boolean {
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:8080'];
  const origin = req.headers.origin;
  if (origin && corsOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', corsOrigins[0]);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

// ============================================================================
// LLM PROVIDERS
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
// PROMPT
// ============================================================================

interface DailyEvalRow {
  id: string;
  user_id: string;
  evaluation_date: string;
  conversations_count: number;
  total_duration_seconds: number;
  avg_overall_score: number | null;
  avg_clarity: number | null;
  avg_structure: number | null;
  avg_empatia: number | null;
  muletillas_total: number | null;
  muletillas_rate: number | null;
  avg_ratio_habla: number | null;
  temas_tratados: number | null;
  acciones_count: number | null;
  temas_sin_cerrar_count: number | null;
  top_strengths: string[] | null;
  top_areas_to_improve: string[] | null;
  status: string;
}

interface ConversationDetail {
  id: string;
  title: string;
  duration_seconds: number | null;
  score: number | null;
  feedback: string | null;
}

function buildPrompt(row: DailyEvalRow, conversations: ConversationDetail[]): string {
  const conversationLines = conversations
    .map((c) => `- ${c.title || 'Sin título'} (score: ${c.score ?? 'N/A'}, ${Math.round((c.duration_seconds ?? 0) / 60)}min): ${c.feedback || 'Sin feedback'}`)
    .join('\n');

  return `Eres un coach experto en comunicación. Analiza el RESUMEN DIARIO de reuniones del usuario.

DATOS DEL DIA:
- Conversaciones: ${row.conversations_count}
- Duración total: ${Math.round((row.total_duration_seconds ?? 0) / 60)} minutos
- Scores promedio: overall=${row.avg_overall_score ?? 'N/A'}, clarity=${row.avg_clarity ?? 'N/A'}, structure=${row.avg_structure ?? 'N/A'}, empatía=${row.avg_empatia ?? 'N/A'}
- Muletillas: ${row.muletillas_total ?? 0} (rate: ${row.muletillas_rate ?? 0} por 100 palabras)
- Ratio habla: ${row.avg_ratio_habla ?? 'N/A'}
- Temas tratados: ${row.temas_tratados ?? 0}
- Compromisos: ${row.acciones_count ?? 0}
- Temas sin cerrar: ${row.temas_sin_cerrar_count ?? 0}
- Fortalezas frecuentes: ${(row.top_strengths ?? []).join(', ') || 'N/A'}
- Áreas de mejora frecuentes: ${(row.top_areas_to_improve ?? []).join(', ') || 'N/A'}

RESUMEN DE CONVERSACIONES:
${conversationLines || 'Sin conversaciones detalladas'}

Responde UNICAMENTE con JSON:
{
  "daily_summary": "Resumen narrativo de 2-3 oraciones sobre el desempeño comunicativo del día",
  "daily_insights": {
    "patron_principal": "Patrón dominante observado hoy",
    "recomendacion": "Una acción concreta para mejorar mañana",
    "tendencia": "improving|stable|declining",
    "highlight": "El mejor momento comunicativo del día",
    "riesgo": "Área de mayor riesgo si no se atiende"
  }
}`;
}

// ============================================================================
// LLM CALL
// ============================================================================

interface DailyInsights {
  patron_principal: string;
  recomendacion: string;
  tendencia: string;
  highlight: string;
  riesgo: string;
}

interface LLMResponse {
  daily_summary: string;
  daily_insights: DailyInsights;
}

async function callLLM(prompt: string): Promise<LLMResponse> {
  const providers = getProviders();
  if (providers.length === 0) {
    throw new Error('No LLM providers configured');
  }

  let lastError: Error | null = null;
  for (const { client, provider, model } of providers) {
    try {
      console.log({ event: 'llm_attempt', provider, model });
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('Empty LLM response');

      const parsed = JSON.parse(content) as LLMResponse;
      if (!parsed.daily_summary || !parsed.daily_insights) {
        throw new Error('Invalid LLM response structure');
      }

      console.log({ event: 'llm_success', provider, model });
      return parsed;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error({ event: 'llm_error', provider, model, error: lastError.message });
    }
  }

  throw lastError || new Error('All LLM providers failed');
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  if (setCors(req, res)) return;

  // Method check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    // Validate input
    const body = RequestSchema.parse(req.body);

    // Init Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: 'MISSING_CONFIG' });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }
    const accessToken = authHeader.substring(7);

    // Allow service_role key as bearer token OR validate user token
    if (accessToken !== serviceRoleKey) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (authError || !user) {
        return res.status(401).json({ error: 'INVALID_TOKEN' });
      }
    }

    // Fetch daily_evaluation row
    const { data: evalRow, error: evalError } = await supabase
      .schema('maity')
      .from('daily_evaluations')
      .select('*')
      .eq('user_id', body.user_id)
      .eq('evaluation_date', body.date)
      .maybeSingle();

    if (evalError) {
      console.error('Error fetching daily_evaluation:', evalError);
      return res.status(500).json({ error: 'DB_ERROR', details: evalError.message });
    }

    // If no row or no conversations, skip
    if (!evalRow || evalRow.conversations_count === 0) {
      return res.status(200).json({ ok: true, skipped: true });
    }

    // Update status to processing
    const { error: statusError } = await supabase
      .schema('maity')
      .from('daily_evaluations')
      .update({ status: 'processing' })
      .eq('id', evalRow.id);

    if (statusError) {
      console.error('Error setting processing status:', statusError);
    }

    // Fetch conversation details for that day
    const { data: conversations, error: convError } = await supabase
      .schema('maity')
      .from('omi_conversations')
      .select('id, title, duration_seconds, communication_feedback, created_at')
      .eq('user_id', body.user_id)
      .eq('deleted', false)
      .eq('discarded', false)
      .not('communication_feedback', 'is', null)
      .order('created_at', { ascending: true });

    if (convError) {
      console.error('Error fetching conversations:', convError);
    }

    // Filter conversations for the target date (America/Mexico_City timezone)
    // Since we can't do timezone conversion in the Supabase JS client filter,
    // we do a date-range filter
    const dateStart = new Date(`${body.date}T06:00:00.000Z`); // ~midnight CST
    const dateEnd = new Date(`${body.date}T06:00:00.000Z`);
    dateEnd.setDate(dateEnd.getDate() + 1);

    const dayConversations: ConversationDetail[] = (conversations || [])
      .filter((c: any) => {
        // If created_at is available, use it for filtering
        if (c.created_at) {
          const t = new Date(c.created_at).getTime();
          return t >= dateStart.getTime() && t < dateEnd.getTime();
        }
        return true;
      })
      .map((c: any) => ({
        id: c.id,
        title: c.title,
        duration_seconds: c.duration_seconds,
        score: c.communication_feedback?.overall_score ?? null,
        feedback: c.communication_feedback?.feedback ?? null,
      }));

    // Build prompt and call LLM
    const prompt = buildPrompt(evalRow as DailyEvalRow, dayConversations);

    let llmResult: LLMResponse;
    try {
      llmResult = await callLLM(prompt);
    } catch (llmError) {
      console.error('LLM failed:', llmError);
      // Set status to error
      await supabase
        .schema('maity')
        .from('daily_evaluations')
        .update({ status: 'error' })
        .eq('id', evalRow.id);

      return res.status(500).json({ error: 'LLM_FAILED', details: llmError instanceof Error ? llmError.message : String(llmError) });
    }

    // Update daily_evaluations with LLM results
    const { error: updateError } = await supabase
      .schema('maity')
      .from('daily_evaluations')
      .update({
        daily_summary: llmResult.daily_summary,
        daily_insights: llmResult.daily_insights,
        status: 'complete',
      })
      .eq('id', evalRow.id);

    if (updateError) {
      console.error('Error updating daily_evaluation:', updateError);
      return res.status(500).json({ error: 'DB_UPDATE_ERROR', details: updateError.message });
    }

    console.log({
      event: 'daily_evaluation_complete',
      userId: body.user_id,
      date: body.date,
      evalId: evalRow.id,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'INVALID_INPUT', details: error.errors });
    }
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
}
