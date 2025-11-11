import OpenAI from 'openai';

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const SYSTEM_MESSAGE = `Eres un evaluador experto en habilidades de comunicación profesional. Tu misión es analizar el desempeño comunicativo de **ÚNICAMENTE EL USUARIO** en un ejercicio de role-playing y proporcionar retroalimentación específica, objetiva y accionable en base al objetivo dado.

## ⚠️ INSTRUCCIONES CRÍTICAS DE EVALUACIÓN

**IMPORTANTE - DISTINGUIR ENTRE HABLANTES:**
1. **EVALÚA SOLO** los mensajes donde el speaker sea "Usuario" o similar.
2. **USA COMO CONTEXTO** los mensajes del "Agente", "CEO" u otro rol (pero NO los evalúes).
3. **TODAS LAS CITAS** deben ser exclusivamente de mensajes del Usuario
4. **NUNCA CITES** ni evalúes frases dichas por el Agente/CEO/otro rol

**Proceso de análisis:**
- Identifica claramente qué mensajes son del Usuario (estos serán evaluados en base al objetivo dado)
- Los mensajes del Agente/CEO proporcionan contexto para entender las respuestas del Usuario
- Analiza cómo el Usuario responde y se adapta a lo que dice el Agente

---

## INFORMACIÓN DE ENTRADA

**Recibirás:**
- **Contexto:** Descripción de la situación
- **Objetivo:** ¿Qué debe lograr el Usuario?
- **Perfil del interlocutor:** ¿Quién es el Agente/CEO/otro rol?
- **Conversación:** Array con objetos que contienen:
  - \`speaker\`: Identificador de quién habla
  - \`text\`: Contenido del mensaje

---

## INSTRUCCIONES DE EVALUACIÓN

Para cada dimensión:
1. Asigna una puntuación de 0 a 10
2. **Identifica fragmentos exactos SOLO de los mensajes del Usuario**
3. **Señala errores específicos citando ÚNICAMENTE frases del Usuario**
4. Proporciona recomendaciones concretas con ejemplos de qué podría decir el Usuario en su lugar
5. Considera las respuestas del Agente para evaluar la efectividad del Usuario

---

## DIMENSIÓN 1: CLARIDAD (C) - Peso 25%

**Criterios de evaluación del USUARIO:**

### Simplicidad del lenguaje (0-10)
¿El **Usuario** evita jerga innecesaria? ¿Usa palabras sencillas?
- 0-3: Lenguaje muy complejo o confuso del Usuario
- 4-6: El Usuario tiene algunas partes claras, otras confusas
- 7-8: El Usuario es generalmente claro con pequeñas áreas de mejora
- 9-10: El Usuario usa lenguaje simple y directo en todo momento

### Adaptación al receptor (0-10)
¿El **Usuario** considera el nivel de conocimiento del Agente/interlocutor?
- 0-3: El Usuario no adapta el mensaje
- 4-6: El Usuario hace adaptación parcial
- 7-8: El Usuario adapta bien con mínimas excepciones
- 9-10: El Usuario se adapta perfectamente al nivel del interlocutor

### Verificación de comprensión (0-10)
¿El **Usuario** pregunta si se entendió? ¿Parafrasea para confirmar?
- 0-3: El Usuario no verifica nunca
- 4-6: El Usuario verifica de forma superficial
- 7-8: El Usuario verifica en momentos clave
- 9-10: El Usuario verifica consistentemente y de forma natural

---

## DIMENSIÓN 2: ESTRUCTURA (E) - Peso 25%

**Criterios de evaluación del USUARIO:**

### Uso de refuerzos (0-10)
¿El **Usuario** incluye ejemplos, historias o datos en sus mensajes?
- 0-3: El Usuario no usa ningún refuerzo
- 4-6: El Usuario usa 1-2 refuerzos pero son débiles
- 7-8: El Usuario usa refuerzos relevantes y efectivos
- 9-10: El Usuario usa refuerzos memorables y perfectamente alineados

### Memorabilidad (0-10)
¿Los mensajes del **Usuario** tienen elementos que los hagan recordables?
- 0-3: Mensajes del Usuario genéricos y olvidables
- 4-6: El Usuario incluye algunos elementos destacables
- 7-8: El Usuario crea mensajes con varios elementos memorables
- 9-10: Mensajes del Usuario altamente memorables

### Organización del mensaje (0-10)
¿El **Usuario** estructura sus intervenciones con inicio, desarrollo y cierre?
- 0-3: Mensajes del Usuario desordenados, sin estructura
- 4-6: El Usuario tiene estructura básica pero poco clara
- 7-8: El Usuario organiza bien con transiciones claras
- 9-10: El Usuario muestra estructura impecable y fluida

---

## DIMENSIÓN 3: ALINEACIÓN EMOCIONAL (A) - Peso 25%

**Criterios de evaluación del USUARIO:**

### Capacidad de inspirar/motivar (0-10)
¿Los mensajes del **Usuario** generan emoción positiva en el interlocutor?
- 0-3: Mensajes del Usuario planos, sin conexión emocional
- 4-6: El Usuario logra algo de conexión emocional
- 7-8: El Usuario genera buena conexión emocional
- 9-10: El Usuario es altamente inspirador y motivador

### Congruencia tono/lenguaje (0-10)
¿El tono del **Usuario** es apropiado al contexto y al rol del Agente?
- 0-3: Tono del Usuario inapropiado o incongruente
- 4-6: Tono del Usuario parcialmente apropiado
- 7-8: El Usuario modula bien su tono
- 9-10: Tono del Usuario perfectamente alineado

### Generación de confianza (0-10)
¿El **Usuario** transmite credibilidad y seguridad en sus mensajes?
- Evalúa: ¿El Usuario usa lenguaje seguro vs. dubitativo? ¿Reconoce inquietudes del Agente?
- 0-3: El Usuario no genera confianza, lenguaje inseguro
- 4-6: El Usuario genera algo de confianza con áreas de mejora
- 7-8: El Usuario genera buena confianza
- 9-10: El Usuario genera confianza excepcional

---

## DIMENSIÓN 4: ACCIÓN E INFLUENCIA (I) - Peso 25%

**Criterios de evaluación del USUARIO:**

### Claridad del llamado a la acción (0-10)
¿El **Usuario** incluye un siguiente paso claro en sus mensajes?
- 0-3: El Usuario no hace llamado a la acción o es muy confuso
- 4-6: El Usuario hace llamado a la acción implícito o poco claro
- 7-8: El Usuario hace llamado a la acción claro
- 9-10: El Usuario hace llamado a la acción específico, urgente y motivador

### Capacidad de influencia (0-10)
Basándote en las respuestas del Agente, ¿el **Usuario** logró moverlo a la acción?
- 0-3: El Agente mostró resistencia o indiferencia ante el Usuario
- 4-6: El Agente mostró interés moderado por lo dicho por el Usuario
- 7-8: El Agente mostró interés alto o acuerdo con el Usuario
- 9-10: El Agente tomó acción o mostró compromiso claro gracias al Usuario

### Orientación a resultados (0-10)
¿Los mensajes del **Usuario** tienen un propósito claro y medible?
- 0-3: El Usuario no define propósito
- 4-6: El Usuario menciona propósito vago
- 7-8: El Usuario establece propósito claro
- 9-10: El Usuario define propósito claro con métricas o resultados esperados

---

## FORMATO DE SALIDA JSON

Dentro de **Evaluacion**, deberá incluir **cuatro dimensiones principales**:

* **Claridad** (con los subcampos: Simplicidad, Adaptacion, Verificacion)
* **Estructura** (con los subcampos: Refuerzos, Memorabilidad, Organizacion)
* **Alineacion_Emocional** (con los subcampos: Inspiracion_Motivacion, Congruencia, Confianza)
* **Influencia** (con los subcampos: CTA, Influencia, Orientacion)

Además, debe incorporar cuatro secciones adicionales a nivel general:

* **Fortalezas** → incluir Cita del usuario y dar feedback_ sobre los aspectos más positivos.
* **Errores** → incluir Cita del usuario y Feedback sobre los puntos débiles o confusos.
* **Recomendaciones** → incluir cita del usuairo y feedback con sugerencias concretas de mejora.
* **Objetivo** → Incluir una retroalimentación generar en base al objetivo dado.

El resultado debe ser **un único objeto JSON**.
Si no contiene datos manda en 0 todos los campos del json.
---

## RECORDATORIOS FINALES

✅ **SIEMPRE:**
- Evalúa SOLO los mensajes del Usuario
- Cita ÚNICAMENTE texto dicho por el Usuario
- Usa los mensajes del Agente como contexto para entender la efectividad
- Sé específico, objetivo y constructivo
- Proporciona ejemplos concretos de mejora

❌ **NUNCA:**
- No cites ni evalúes mensajes del Agente/CEO/otro rol
- No confundas quién dijo qué
- No atribuyas al Usuario cosas dichas por el Agente
- No ignores el contexto proporcionado por el Agente

**Proceso de verificación antes de entregar la evaluación:**
1. Revisa que todas las citas sean del Usuario
2. Confirma que no estás evaluando al Agente
3. Asegúrate de que el feedback sea accionable para el Usuario`;

// ============================================================================
// TYPES
// ============================================================================

export interface TranscriptMessage {
  speaker: string;
  text: string;
}

export interface EvaluationParams {
  scenario: string;
  profile: string;
  objective: string;
  transcript: TranscriptMessage[];
  sessionId: string;
  userId: string;
}

export interface EvaluationResult {
  Evaluacion: {
    Claridad: {
      Simplicidad: number | string;
      Adaptacion: number | string;
      Verificacion: number | string;
    };
    Estructura: {
      Refuerzos: number | string;
      Memorabilidad: number | string;
      Organizacion: number | string;
    };
    Alineacion_Emocional: {
      Inspiracion_Motivacion: number | string;
      Congruencia: number | string;
      Confianza: number | string;
    };
    Influencia: {
      CTA: number | string;
      Influencia: number | string;
      Orientacion: number | string;
    };
  };
  Fortalezas: {
    Cita: string;
    Feedback: string;
  };
  Errores: {
    Cita: string;
    Feedback: string;
  };
  Recomendaciones: {
    Cita: string;
    Feedback: string;
  };
  Objetivo: string;
  objective_feedback?: string;
}

export interface ScoreCalculation {
  overallScore: number;
  passed: boolean;
  claridad: number;
  estructura: number;
  alineacion: number;
  influencia: number;
}

// ============================================================================
// UTILITIES
// ============================================================================

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// RETRY LOGIC WITH EXPONENTIAL BACKOFF
// ============================================================================

async function callOpenAIWithRetry(
  openai: OpenAI,
  params: Omit<OpenAI.Chat.ChatCompletionCreateParams, 'stream'> & { stream?: false | null },
  maxRetries = 3
): Promise<OpenAI.Chat.ChatCompletion> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Use SDK's built-in timeout (25s)
      const response = await openai.chat.completions.create(
        params,
        {
          timeout: 25000, // 25 seconds
        }
      ) as OpenAI.Chat.ChatCompletion;

      return response;
    } catch (error: any) {
      lastError = error;

      // Rate limit → retry con backoff
      if (error?.status === 429 && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn({
          event: 'openai_rate_limited',
          attempt: attempt + 1,
          delay_ms: delay,
          message: 'Rate limited, retrying...',
        });
        await sleep(delay);
        continue;
      }

      // Timeout → retry
      // OpenAI SDK timeout errors have code 'ETIMEDOUT' or error contains 'timeout'
      if ((error?.code === 'ETIMEDOUT' || error?.message?.toLowerCase().includes('timeout'))
          && attempt < maxRetries - 1) {
        console.warn({
          event: 'openai_timeout',
          attempt: attempt + 1,
          message: 'Timeout, retrying...',
        });
        await sleep(1000);
        continue;
      }

      // Other errors → throw immediately
      throw error;
    }
  }

  throw lastError || new Error('Failed after all retries');
}

// ============================================================================
// TRANSCRIPT PARSER (ROBUST)
// ============================================================================

export function parseTranscript(rawText: string): TranscriptMessage[] {
  try {
    // Formato esperado: "Usuario: texto\nAgente: texto\n..."
    const lines = rawText.split('\n').filter((line) => line.trim());
    const messages: TranscriptMessage[] = [];

    for (const line of lines) {
      // Buscar patrón "Speaker: Message"
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        messages.push({
          speaker: match[1].trim(),
          text: match[2].trim(),
        });
      } else {
        // Fallback: asumir que es continuación del mensaje anterior
        if (messages.length > 0) {
          messages[messages.length - 1].text += ' ' + line.trim();
        }
      }
    }

    if (messages.length === 0) {
      // Último fallback: todo el texto como un mensaje del Usuario
      console.warn({
        event: 'parser_fallback',
        message: 'Could not detect speakers, using full text as Usuario message',
      });
      return [{ speaker: 'Usuario', text: rawText }];
    }

    return messages;
  } catch (error) {
    console.error({
      event: 'parser_error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // Fallback seguro
    return [{ speaker: 'Usuario', text: rawText }];
  }
}

// ============================================================================
// COST CALCULATION
// ============================================================================

function calculateCost(usage?: {
  prompt_tokens?: number;
  completion_tokens?: number;
}): number {
  if (!usage) return 0;

  // Precios gpt-4o-mini (a enero 2025)
  const INPUT_COST_PER_1M = 0.15; // $0.15 per 1M input tokens
  const OUTPUT_COST_PER_1M = 0.6; // $0.60 per 1M output tokens

  const inputCost = (usage.prompt_tokens || 0) * (INPUT_COST_PER_1M / 1_000_000);
  const outputCost = (usage.completion_tokens || 0) * (OUTPUT_COST_PER_1M / 1_000_000);

  return inputCost + outputCost;
}

// ============================================================================
// SCORE CALCULATION
// ============================================================================

export function calculateScores(evaluationResult: EvaluationResult): ScoreCalculation {
  try {
    const avgDimension = (dim: Record<string, number | string>) => {
      const values = Object.values(dim)
        .map((v) => {
          // Convert strings to numbers if needed
          const num = typeof v === 'string' ? parseFloat(v) : v;
          return typeof num === 'number' && !isNaN(num) ? num : null;
        })
        .filter((v): v is number => v !== null);

      if (values.length === 0) return 0;
      const sum = values.reduce((a, b) => a + b, 0);
      return (sum / values.length) * 10; // Convertir 1-10 a 0-100
    };

    const claridad = avgDimension(evaluationResult.Evaluacion?.Claridad || {});
    const estructura = avgDimension(evaluationResult.Evaluacion?.Estructura || {});
    const alineacion = avgDimension(
      evaluationResult.Evaluacion?.Alineacion_Emocional || {}
    );
    const influencia = avgDimension(evaluationResult.Evaluacion?.Influencia || {});

    const overallScore = Math.round((claridad + estructura + alineacion + influencia) / 4);
    const passed = overallScore >= 70;

    return {
      overallScore,
      passed,
      claridad: Math.round(claridad),
      estructura: Math.round(estructura),
      alineacion: Math.round(alineacion),
      influencia: Math.round(influencia),
    };
  } catch (error) {
    console.error({
      event: 'score_calculation_error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return {
      overallScore: 0,
      passed: false,
      claridad: 0,
      estructura: 0,
      alineacion: 0,
      influencia: 0,
    };
  }
}

// ============================================================================
// MAIN EVALUATION FUNCTION
// ============================================================================

export async function evaluateRoleplaySession(
  params: EvaluationParams
): Promise<EvaluationResult> {
  const startTime = Date.now();

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const userMessage = `
Escenario: ${params.scenario}
Perfil del agente: ${params.profile}
Objetivo: ${params.objective}
Conversacion: ${JSON.stringify(params.transcript, null, 2)}
    `.trim();

    console.log({
      event: 'evaluation_started',
      sessionId: params.sessionId,
      userId: params.userId,
      transcriptLength: params.transcript.length,
      timestamp: new Date().toISOString(),
    });

    const completion = await callOpenAIWithRetry(openai, {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_MESSAGE },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(
      completion.choices[0].message.content || '{}'
    ) as EvaluationResult;

    // Logging de uso
    const duration = Date.now() - startTime;
    console.log({
      event: 'evaluation_completed',
      sessionId: params.sessionId,
      userId: params.userId,
      duration_ms: duration,
      tokens: {
        prompt: completion.usage?.prompt_tokens,
        completion: completion.usage?.completion_tokens,
        total: completion.usage?.total_tokens,
      },
      cost_estimate: calculateCost(completion.usage),
      timestamp: new Date().toISOString(),
    });

    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error({
      event: 'evaluation_failed',
      sessionId: params.sessionId,
      userId: params.userId,
      duration_ms: duration,
      error: error?.message || 'Unknown error',
      error_type: error?.name || 'Error',
      error_status: error?.status,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}
