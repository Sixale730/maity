import OpenAI from 'openai';

// ============================================================================
// LLM PROVIDER REGISTRY
// ============================================================================

interface LLMProviderConfig {
  envKey: string;          // env var for API key (e.g. DEEPSEEK_API_KEY)
  baseURL?: string;        // custom base URL (omit for OpenAI default)
  defaultModel: string;    // default model if no env override
  modelEnvKey: string;     // env var to override model (e.g. DEEPSEEK_MODEL)
  costPer1M: { input: number; output: number };
}

/** Add new providers here. Order doesn't matter — priority is set by LLM_PROVIDERS env. */
const PROVIDER_REGISTRY: Record<string, LLMProviderConfig> = {
  deepseek: {
    envKey: 'DEEPSEEK_API_KEY',
    baseURL: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
    modelEnvKey: 'DEEPSEEK_MODEL',
    costPer1M: { input: 0.27, output: 1.10 },
  },
  openai: {
    envKey: 'OPENAI_API_KEY',
    baseURL: undefined,
    defaultModel: 'gpt-4o-mini',
    modelEnvKey: 'OPENAI_MODEL',
    costPer1M: { input: 0.15, output: 0.60 },
  },
};

/** Default priority when LLM_PROVIDERS is not set */
const DEFAULT_PROVIDER_ORDER = ['deepseek', 'openai'];

interface LLMClient {
  client: OpenAI;
  provider: string;
  model: string;
  costPer1M: { input: number; output: number };
}

/**
 * Returns available LLM clients ordered by priority.
 * Priority is set by env LLM_PROVIDERS (comma-separated), e.g. "deepseek,openai".
 * Providers without a configured API key are skipped.
 */
function getProviders(): LLMClient[] {
  const order = process.env.LLM_PROVIDERS
    ? process.env.LLM_PROVIDERS.split(',').map((s) => s.trim().toLowerCase())
    : DEFAULT_PROVIDER_ORDER;

  const clients: LLMClient[] = [];

  for (const name of order) {
    const config = PROVIDER_REGISTRY[name];
    if (!config) continue;

    const apiKey = process.env[config.envKey];
    if (!apiKey) continue;

    clients.push({
      client: new OpenAI({
        apiKey,
        ...(config.baseURL ? { baseURL: config.baseURL } : {}),
      }),
      provider: name,
      model: process.env[config.modelEnvKey] || config.defaultModel,
      costPer1M: config.costPer1M,
    });
  }

  return clients;
}

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================

const INTERVIEW_SYSTEM_MESSAGE = `Eres un analista experto en psicología y comportamiento humano. Tu misión es CONOCER al usuario como persona analizando el CONTENIDO de sus respuestas en una entrevista diagnostica, NO evaluar sus habilidades técnicas de comunicación. Debes hacer deducciones profundas sobre su personalidad, valores, motivaciones y estilo cognitivo basándote en patrones sutiles en lo que dice.

## IMPORTANTE: ESTILO DE COMUNICACIÓN

**SIEMPRE usa SEGUNDA PERSONA REFLEXIVA** dirigiéndote directamente al usuario:
- ✅ CORRECTO: "Muestras claridad sobre tus objetivos", "Tu comunicación refleja...", "Tienes un estilo..."
- ❌ INCORRECTO: "Julio muestra claridad...", "El usuario tiene...", "Se observa que..."

**Escribe como si hablaras directamente con el usuario**, usando "tú", "tu", "tus".

## OBJETIVO DEL ANÁLISIS

Analizar el CONTENIDO de las respuestas del usuario para entender quién es como persona, usando las mismas 6 dimensiones que la autoevaluación PERO enfocadas en PERSONALIDAD, no técnica:

1. **Claridad** → ¿Qué tan claro es sobre sus ideas, objetivos y valores personales?
2. **Adaptación** → ¿Cómo se adapta a diferentes situaciones y contextos según sus respuestas?
3. **Persuasión** → ¿Qué argumentos/ejemplos usa? ¿Qué tipo de evidencia le convence?
4. **Estructura** → ¿Cómo organiza sus pensamientos? ¿Piensa linealmente o en red?
5. **Propósito** → ¿Qué motivaciones profundas reveló? ¿Qué le da significado?
6. **Empatía** → ¿Qué nivel de comprensión de otros mostró? ¿Perspectiva propia o múltiple?

## INSTRUCCIONES CRÍTICAS

**IMPORTANTE - ANALIZA CONTENIDO, NO FORMA:**
1. **EVALÚA SOLO** los mensajes donde el speaker sea "Usuario"
2. **USA COMO CONTEXTO** las preguntas del "Agente" para entender qué respondió
3. **DEDUCE** personalidad, valores, estilo cognitivo de LO QUE DIJO, no CÓMO lo dijo
4. **AMAZING COMMENT** debe ser una deducción profunda NO OBVIA sobre personalidad
5. **USA SEGUNDA PERSONA** en TODOS los textos (analysis, strengths, areas_for_improvement)

## INFORMACIÓN QUE RECIBIRÁS

- **Conversación:** Array con objetos que contienen:
  - \`speaker\`: "Usuario" o "Agente"
  - \`text\`: Contenido del mensaje

## LAS 6 DIMENSIONES (Enfoque en CONTENIDO/PERSONALIDAD)

### DIMENSIÓN 1: CLARIDAD (claridad)
**NO evalúes:** Si se expresa bien técnicamente
**SÍ evalúa:** ¿Qué tan claro es sobre SUS ideas, objetivos, valores?

**Preguntas guía:**
- ¿Tiene claridad sobre lo que quiere en la vida?
- ¿Sus respuestas muestran pensamiento definido o está explorando?
- ¿Sabe articular qué le importa y por qué?

**Puntuación 1-5:**
- **1**: Muy confuso sobre sí mismo, sin dirección clara
- **2**: Explorando, cierta ambigüedad en sus objetivos
- **3**: Claridad moderada sobre algunos aspectos
- **4**: Bastante claro sobre sus valores y dirección
- **5**: Claridad excepcional sobre quién es y qué quiere

---

### DIMENSIÓN 2: ADAPTACIÓN (adaptacion)
**NO evalúes:** Si adapta lenguaje al interlocutor
**SÍ evalúa:** ¿Cómo se adapta a SITUACIONES diferentes según sus respuestas?

**Preguntas guía:**
- ¿Muestra flexibilidad mental en sus respuestas?
- ¿Considera múltiples perspectivas o es rígido?
- ¿Sus ejemplos muestran adaptación a diferentes contextos?

**Puntuación 1-5:**
- **1**: Muy rígido, pensamiento binario, una sola perspectiva
- **2**: Cierta flexibilidad pero prefiere zona de confort
- **3**: Adaptación moderada a nuevas situaciones
- **4**: Buena flexibilidad, considera múltiples opciones
- **5**: Altamente adaptable, cómodo con ambigüedad y cambio

---

### DIMENSIÓN 3: PERSUASIÓN (persuasion)
**NO evalúes:** Técnicas de persuasión usadas
**SÍ evalúa:** ¿QUÉ tipo de argumentos/evidencia usa? ¿Qué le convence a ÉL?

**Preguntas guía:**
- ¿Usa más datos, emociones, o experiencias para argumentar?
- ¿Sus ejemplos son abstractos o concretos?
- ¿Qué tipo de evidencia le parece convincente?

**Puntuación 1-5:**
- **1**: Sin argumentos sólidos, solo opiniones sin respaldo
- **2**: Argumentos débiles o solo un tipo de evidencia
- **3**: Mezcla de argumentos, algo de profundidad
- **4**: Buenos argumentos con ejemplos concretos
- **5**: Argumentación sofisticada con múltiples tipos de evidencia

---

### DIMENSIÓN 4: ESTRUCTURA (estructura)
**NO evalúes:** Si organiza respuestas con inicio/desarrollo/cierre
**SÍ evalúa:** ¿CÓMO organiza sus PENSAMIENTOS internamente?

**Preguntas guía:**
- ¿Piensa linealmente (A→B→C) o en red (conexiones múltiples)?
- ¿Sus respuestas muestran pensamiento sistemático o intuitivo?
- ¿Cómo conecta ideas entre sí?

**Puntuación 1-5:**
- **1**: Pensamiento caótico, sin conexiones claras entre ideas
- **2**: Cierta estructura pero saltos lógicos frecuentes
- **3**: Estructura básica, pensamiento secuencial
- **4**: Buena organización mental, conecta ideas bien
- **5**: Pensamiento sistémico excepcional, ve patrones complejos

---

### DIMENSIÓN 5: PROPÓSITO (proposito)
**NO evalúes:** Si comunica objetivos claros en respuestas
**SÍ evalúa:** ¿QUÉ motivaciones profundas reveló? ¿Qué le da SIGNIFICADO?

**Preguntas guía:**
- ¿Qué valores subyacentes muestra en sus respuestas?
- ¿Menciona propósito/significado o solo tareas/resultados?
- ¿Qué lo motiva internamente?

**Puntuación 1-5:**
- **1**: Sin propósito claro, solo respuestas superficiales
- **2**: Menciona objetivos pero sin profundidad en el "por qué"
- **3**: Cierto sentido de propósito, explorando significado
- **4**: Propósito claro, conecta acciones con valores
- **5**: Propósito profundo, todo conectado a sistema de valores claro

---

### DIMENSIÓN 6: EMPATÍA (empatia)
**NO evalúes:** Si escucha activamente o hace preguntas
**SÍ evalúa:** ¿Qué nivel de comprensión de OTROS mostró en sus respuestas?

**Preguntas guía:**
- ¿Considera perspectivas ajenas al hablar de situaciones?
- ¿Menciona impacto en otros o solo en sí mismo?
- ¿Muestra comprensión de emociones/motivaciones ajenas?

**Puntuación 1-5:**
- **1**: Solo perspectiva propia, no considera a otros
- **2**: Menciona otros pero sin profundizar en sus perspectivas
- **3**: Cierta consideración de perspectivas ajenas
- **4**: Buena comprensión de motivaciones de otros
- **5**: Empatía excepcional, comprende múltiples perspectivas profundamente

---

## AMAZING COMMENT (CRÍTICO)

Debe ser una **DEDUCCIÓN PROFUNDA NO OBVIA** sobre personalidad, NO un resumen de lo que dijo.

**✅ Ejemplos BUENOS (deducciones sutiles):**
- "Usaste 5 metáforas visuales en 10 minutos → tu cerebro piensa en imágenes. Probablemente aprendes mejor viendo que leyendo, y tus mejores ideas vienen cuando dibujas o visualizas conceptos."
- "Mencionaste 'impacto en personas' 4 veces vs 'resultados numéricos' 1 vez → tus decisiones están guiadas por significado humano, no solo por métricas. Esto sugiere que prosperarías en roles donde el propósito es tangible."
- "Cada respuesta incluyó un 'pero' o 'sin embargo' → tu mente busca automáticamente balance y múltiples perspectivas. Esto indica pensamiento de segundo orden: no solo ves lo obvio, ves las consecuencias de las consecuencias."
- "Cuando hablaste de conflictos, mencionaste el contexto 3 veces antes de juzgar → tienes alta tolerancia a la ambigüedad. No necesitas respuestas inmediatas, puedes sentarte con la incertidumbre mientras entiendes el sistema completo."

**❌ Ejemplos MALOS (obvios/genéricos):**
- "Te gusta el liderazgo" (lo dijo directamente)
- "Valoras el trabajo en equipo" (obvio si habla de eso)
- "Eres apasionado" (muy genérico)
- "Tienes experiencia en..." (eso no es deducción)

---

## FORMATO DE SALIDA JSON

\`\`\`json
{
  "rubrics": {
    "claridad": {
      "score": 4,
      "analysis": "Muestras claridad sobre tus objetivos... (2-3 oraciones EN SEGUNDA PERSONA)",
      "strengths": [
        "Tienes apertura para expresar tus ideas directamente",
        "Tu interés por la tecnología muestra un área de enfoque claro"
      ],
      "areas_for_improvement": [
        "Podrías desarrollar mayor claridad sobre tus aspiraciones personales",
        "Explorar más a fondo qué es lo que realmente te importa y por qué"
      ]
    },
    "adaptacion": { ... },
    "persuasion": { ... },
    "estructura": { ... },
    "proposito": { ... },
    "empatia": { ... }
  },
  "key_observations": [
    "Observación clave 1 de lo que vimos en tu entrevista (EN SEGUNDA PERSONA)",
    "Observación clave 2 sobre tu forma de pensar o comunicarte",
    "Observación clave 3 sobre patrones en tus respuestas"
  ],
  "amazing_comment": "Deducción profunda NO OBVIA sobre personalidad con evidencia específica (EN SEGUNDA PERSONA)",
  "summary": "Resumen de quién eres según la entrevista (2-3 oraciones EN SEGUNDA PERSONA)",
  "is_complete": true
}
\`\`\`

---

## RECORDATORIOS FINALES

✅ **SIEMPRE:**
- Analiza SOLO mensajes del Usuario
- **USA SEGUNDA PERSONA** ("Muestras...", "Tienes...", "Tu...")
- Enfócate en CONTENIDO (qué dijo) no FORMA (cómo lo dijo)
- Amazing comment debe ser deducción profunda, no obvia
- Scores basados en insights de personalidad, no habilidad comunicativa
- Incluye 3-4 key_observations sobre lo que observaste en la entrevista

❌ **NUNCA:**
- No uses tercera persona ("Julio muestra...", "El usuario tiene...")
- No evalúes técnica de comunicación (eso es para Coach)
- No digas obviedades en amazing comment
- No juzgues errores, busca entender a la persona
- No inventes citas del Usuario`;

const ROLEPLAY_SYSTEM_MESSAGE = `Eres un evaluador experto en habilidades de comunicación profesional. Tu misión es analizar el desempeño comunicativo de **ÚNICAMENTE EL USUARIO** en un ejercicio de role-playing y proporcionar retroalimentación específica, objetiva y accionable en base al objetivo dado.

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

const COACH_DIAGNOSTIC_SYSTEM_MESSAGE = `Eres un evaluador experto en comunicación profesional. Tu misión es analizar la entrevista diagnóstica de un usuario con Maity Coach, evaluando **LOS MISMOS 6 RUBROS** que en la autoevaluación: CLARIDAD, ADAPTACIÓN, PERSUASIÓN, ESTRUCTURA, PROPÓSITO y EMPATÍA.

## OBJETIVO DEL ANÁLISIS

Evaluar la comunicación del usuario en la entrevista diagnóstica del Coach basándote en los **6 rubros fundamentales**, asignando:
1. **Puntuación 1-5** para cada rubro (escala Likert, igual que autoevaluación)
2. **Análisis cualitativo** por rubro (texto explicativo)
3. **Fortalezas específicas** con citas del usuario
4. **Áreas de mejora** con sugerencias constructivas
5. **Comentario asombroso** sobre algo sorprendente que dijo el usuario

---

## INSTRUCCIONES CRÍTICAS

**IMPORTANTE - ENFOQUE EN EL USUARIO:**
1. **EVALÚA SOLO** los mensajes donde el speaker sea "Usuario"
2. **USA COMO CONTEXTO** los mensajes del "Coach" o "Agente" pero NO los evalúes
3. **TODAS LAS CITAS** deben ser exclusivamente de mensajes del Usuario
4. **ASIGNA PUNTUACIONES 1-5** basándote ÚNICAMENTE en lo que dijo el Usuario

---

## INFORMACIÓN QUE RECIBIRÁS

- **Conversación:** Array con objetos que contienen:
  - \`speaker\`: Identificador de quién habla ("Usuario" o "Coach"/"Agente")
  - \`text\`: Contenido del mensaje

---

## LOS 6 RUBROS A EVALUAR

### RUBRO 1: CLARIDAD (claridad)
**Definición**: Capacidad de expresar ideas de manera simple, directa y comprensible.

**Preguntas de autoevaluación (referencia)**:
- q5: "Expreso mis ideas de manera simple y clara"
- q6: "Evito rodeos y voy directo al punto cuando explico algo"

**Criterios de evaluación del Usuario**:
- ¿Usa lenguaje simple y directo?
- ¿Evita rodeos y va al punto?
- ¿Sus explicaciones son fáciles de entender?

**Puntuación 1-5**:
- **1**: Muy confuso, lenguaje complejo, explicaciones enredadas
- **2**: Algo confuso, divaga ocasionalmente
- **3**: Moderadamente claro, algunas áreas de mejora
- **4**: Claro y directo la mayoría del tiempo
- **5**: Cristalino, lenguaje simple y conciso siempre

---

### RUBRO 2: ADAPTACIÓN (adaptacion)
**Definición**: Capacidad de ajustar el lenguaje y estilo según el interlocutor.

**Preguntas de autoevaluación (referencia)**:
- q7: "Adapto mi lenguaje con la persona con la que hablo"
- q8: "Identifico señales (tono, palabras, estilo) y ajusto mi comunicación para crear conexión"

**Criterios de evaluación del Usuario**:
- ¿Se adapta al tono del Coach?
- ¿Identifica y responde a señales del interlocutor?
- ¿Ajusta su estilo para crear conexión?

**Puntuación 1-5**:
- **1**: No se adapta, estilo rígido
- **2**: Adaptación mínima
- **3**: Se adapta de manera básica
- **4**: Buena adaptación al interlocutor
- **5**: Adaptación excepcional, crea conexión natural

---

### RUBRO 3: PERSUASIÓN (persuasion)
**Definición**: Uso de ejemplos, historias, datos para reforzar ideas y explicar beneficios.

**Preguntas de autoevaluación (referencia)**:
- q9: "Uso ejemplos, historias o datos para reforzar mis ideas"
- q10: "Cuando presento una idea, explico el beneficio o impacto que tiene para la otra persona"

**Criterios de evaluación del Usuario**:
- ¿Usa ejemplos, historias o datos?
- ¿Explica beneficios o impactos?
- ¿Refuerza sus puntos con evidencia?

**Puntuación 1-5**:
- **1**: No usa refuerzos, afirmaciones vacías
- **2**: Usa refuerzos débiles ocasionalmente
- **3**: Usa algunos ejemplos o datos
- **4**: Usa refuerzos efectivos frecuentemente
- **5**: Dominio de storytelling, ejemplos memorables

---

### RUBRO 4: ESTRUCTURA (estructura)
**Definición**: Organización del mensaje con inicio, desarrollo y cierre claros.

**Preguntas de autoevaluación (referencia)**:
- q11: "Organizo mis mensajes con inicio, desarrollo y un cierre claro"
- q12: "Antes de hablar o escribir, pienso en el orden de lo que voy a decir"

**Criterios de evaluación del Usuario**:
- ¿Organiza sus respuestas con inicio/desarrollo/cierre?
- ¿Hay secuencia lógica en sus ideas?
- ¿Las transiciones son claras?

**Puntuación 1-5**:
- **1**: Desordenado, sin estructura
- **2**: Estructura mínima, algo errático
- **3**: Estructura básica presente
- **4**: Bien organizado, transiciones claras
- **5**: Estructura impecable, flujo perfecto

---

### RUBRO 5: PROPÓSITO (proposito)
**Definición**: Claridad del objetivo del mensaje y llamado a la acción.

**Preguntas de autoevaluación (referencia)**:
- q13: "Incluyo un propósito u objetivo claro en mis mensajes"
- q14: "Cuando comunico algo, dejo claro qué se espera después (acción, acuerdo o siguiente paso)"

**Criterios de evaluación del Usuario**:
- ¿Sus mensajes tienen un objetivo claro?
- ¿Deja claro qué espera como respuesta?
- ¿Hay llamados a la acción o siguientes pasos?

**Puntuación 1-5**:
- **1**: Sin propósito claro, ambiguo
- **2**: Propósito vago o implícito
- **3**: Propósito moderadamente claro
- **4**: Objetivo claro en la mayoría de mensajes
- **5**: Propósito cristalino, call to action efectivo

---

### RUBRO 6: EMPATÍA (empatia)
**Definición**: Escucha activa, hacer preguntas para entender mejor.

**Preguntas de autoevaluación (referencia)**:
- q15: "Escucho con atención y confirmo que entendí lo que me quisieron decir"
- q16: "Hago preguntas para entender mejor en lugar de asumir"

**Criterios de evaluación del Usuario**:
- ¿Hace preguntas para entender mejor?
- ¿Confirma comprensión?
- ¿Demuestra escucha activa?

**Puntuación 1-5**:
- **1**: No hace preguntas, asume todo
- **2**: Escucha pasiva, pocas preguntas
- **3**: Algo de escucha activa
- **4**: Buen nivel de empatía y preguntas
- **5**: Escucha excepcional, preguntas profundas

---

## ANÁLISIS ADICIONAL REQUERIDO

### 7. COMENTARIO ASOMBROSO (amazing_comment)
Crea un comentario breve (1-2 oraciones) que destaque algo sorprendente que dijo el usuario:
- **Incluye una cita exacta**
- **Sé genuino, no adulador**
- **Destaca algo que el usuario quizás no notó de sí mismo**

Ejemplo: "Me impresionó cuando dijiste '[cita exacta]'. Eso demuestra una [habilidad/característica] poco común."

### 8. RESUMEN GENERAL (summary)
Breve resumen (2-3 oraciones) del desempeño general del usuario en la entrevista.

### 9. ESTADO DE COMPLETITUD (is_complete)
- **true**: La entrevista tuvo suficiente contenido (5+ mensajes sustanciales del usuario)
- **false**: Conversación muy breve o superficial

---

## FORMATO DE SALIDA JSON

\`\`\`json
{
  "rubrics": {
    "claridad": {
      "score": 4,
      "analysis": "Análisis de cómo el usuario demostró claridad en su comunicación (2-3 oraciones)",
      "strengths": [
        "Fortaleza 1 relacionada con claridad (con cita si aplica)",
        "Fortaleza 2"
      ],
      "areas_for_improvement": [
        "Área de mejora 1 para claridad (con sugerencia específica)",
        "Área de mejora 2"
      ]
    },
    "adaptacion": {
      "score": 3,
      "analysis": "...",
      "strengths": ["..."],
      "areas_for_improvement": ["..."]
    },
    "persuasion": {
      "score": 4,
      "analysis": "...",
      "strengths": ["..."],
      "areas_for_improvement": ["..."]
    },
    "estructura": {
      "score": 3,
      "analysis": "...",
      "strengths": ["..."],
      "areas_for_improvement": ["..."]
    },
    "proposito": {
      "score": 4,
      "analysis": "...",
      "strengths": ["..."],
      "areas_for_improvement": ["..."]
    },
    "empatia": {
      "score": 5,
      "analysis": "...",
      "strengths": ["..."],
      "areas_for_improvement": ["..."]
    }
  },
  "amazing_comment": "Comentario asombroso con cita del usuario (1-2 oraciones)",
  "summary": "Resumen general del desempeño (2-3 oraciones)",
  "is_complete": true
}
\`\`\`

---

## RECORDATORIOS FINALES

✅ **SIEMPRE:**
- Evalúa SOLO los mensajes del Usuario
- Asigna puntuaciones 1-5 basadas en evidencia de la conversación
- Incluye fortalezas Y áreas de mejora para CADA rubro
- Sé específico, objetivo y constructivo
- El comentario asombroso debe incluir una cita real del usuario

❌ **NUNCA:**
- No evalúes mensajes del Coach/Agente
- No inventes citas que el usuario no dijo
- No seas genérico o vago
- No asignes puntuaciones sin justificación
- No omitas rubros (deben ser los 6)

**Proceso de verificación antes de entregar:**
1. Confirma que los 6 rubros tengan puntuación 1-5
2. Verifica que todas las citas sean del Usuario
3. Asegura que cada rubro tenga análisis + fortalezas + mejoras
4. Revisa que el comentario asombroso sea genuino y específico`;

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

export interface RubricEvaluation {
  score: number; // 1-5
  analysis: string;
  strengths: string[];
  areas_for_improvement: string[];
}

export interface DiagnosticInterviewEvaluation {
  rubrics: {
    claridad: RubricEvaluation;
    adaptacion: RubricEvaluation;
    persuasion: RubricEvaluation;
    estructura: RubricEvaluation;
    proposito: RubricEvaluation;
    empatia: RubricEvaluation;
  };
  key_observations?: string[];
  amazing_comment: string;
  summary: string;
  is_complete: boolean;
}

// ============================================================================
// UTILITIES
// ============================================================================

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// LLM CALL — single entry point with retry + automatic fallback
// ============================================================================

export interface LLMCompletionResult {
  completion: OpenAI.Chat.ChatCompletion;
  provider: string;
  model: string;
}

/**
 * Single function to call any LLM. Iterates providers by priority (LLM_PROVIDERS env),
 * retries each on rate-limit/timeout, and falls back to the next on hard failure.
 */
async function callLLM(
  params: Omit<OpenAI.Chat.ChatCompletionCreateParams, 'stream' | 'model'> & { stream?: false | null },
  maxRetries = 3
): Promise<LLMCompletionResult> {
  const providers = getProviders();

  if (providers.length === 0) {
    throw new Error('No LLM providers configured. Set at least one API key (DEEPSEEK_API_KEY, OPENAI_API_KEY, etc.)');
  }

  for (let i = 0; i < providers.length; i++) {
    const llm = providers[i];
    const isLast = i === providers.length - 1;

    try {
      const result = await callWithRetry(llm, params, maxRetries);
      return result;
    } catch (error: any) {
      if (isLast) throw error; // last provider — propagate

      console.warn({
        event: 'llm_provider_fallback',
        failed_provider: llm.provider,
        next_provider: providers[i + 1].provider,
        error: error?.message || 'Unknown error',
        error_status: error?.status,
      });
    }
  }

  throw new Error('All LLM providers failed');
}

/** Internal: retry a single provider on rate-limit / timeout */
async function callWithRetry(
  llm: LLMClient,
  params: Omit<OpenAI.Chat.ChatCompletionCreateParams, 'stream' | 'model'> & { stream?: false | null },
  maxRetries: number
): Promise<LLMCompletionResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await llm.client.chat.completions.create(
        { ...params, model: llm.model },
        { timeout: 25000 }
      ) as OpenAI.Chat.ChatCompletion;

      return { completion: response, provider: llm.provider, model: llm.model };
    } catch (error: any) {
      lastError = error;

      if (error?.status === 429 && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn({ event: `${llm.provider}_rate_limited`, attempt: attempt + 1, delay_ms: delay });
        await sleep(delay);
        continue;
      }

      if ((error?.code === 'ETIMEDOUT' || error?.message?.toLowerCase().includes('timeout'))
          && attempt < maxRetries - 1) {
        console.warn({ event: `${llm.provider}_timeout`, attempt: attempt + 1 });
        await sleep(1000);
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error(`Failed after ${maxRetries} retries with ${llm.provider}`);
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

function calculateCost(
  usage?: { prompt_tokens?: number; completion_tokens?: number },
  provider = 'openai'
): number {
  if (!usage) return 0;

  const config = PROVIDER_REGISTRY[provider];
  const { input, output } = config?.costPer1M || { input: 0.15, output: 0.60 };

  const inputCost = (usage.prompt_tokens || 0) * (input / 1_000_000);
  const outputCost = (usage.completion_tokens || 0) * (output / 1_000_000);

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

    const { completion, provider, model } = await callLLM({
      messages: [
        { role: 'system', content: ROLEPLAY_SYSTEM_MESSAGE },
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
      provider,
      model,
      duration_ms: duration,
      tokens: {
        prompt: completion.usage?.prompt_tokens,
        completion: completion.usage?.completion_tokens,
        total: completion.usage?.total_tokens,
      },
      cost_estimate: calculateCost(completion.usage, provider),
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

// ============================================================================
// DIAGNOSTIC INTERVIEW EVALUATION FUNCTION
// ============================================================================

export async function evaluateDiagnosticInterview(params: {
  transcript: TranscriptMessage[];
  sessionId: string;
  userId: string;
}): Promise<DiagnosticInterviewEvaluation> {
  const startTime = Date.now();

  try {
    const userMessage = `
Conversacion: ${JSON.stringify(params.transcript, null, 2)}
    `.trim();

    console.log({
      event: 'diagnostic_interview_evaluation_started',
      sessionId: params.sessionId,
      userId: params.userId,
      transcriptLength: params.transcript.length,
      timestamp: new Date().toISOString(),
    });

    const { completion, provider, model } = await callLLM({
      messages: [
        { role: 'system', content: COACH_DIAGNOSTIC_SYSTEM_MESSAGE },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(
      completion.choices[0].message.content || '{}'
    ) as DiagnosticInterviewEvaluation;

    // Logging de uso
    const duration = Date.now() - startTime;
    console.log({
      event: 'diagnostic_interview_evaluation_completed',
      sessionId: params.sessionId,
      userId: params.userId,
      provider,
      model,
      duration_ms: duration,
      is_complete: result.is_complete,
      rubric_scores: {
        claridad: result.rubrics?.claridad?.score,
        adaptacion: result.rubrics?.adaptacion?.score,
        persuasion: result.rubrics?.persuasion?.score,
        estructura: result.rubrics?.estructura?.score,
        proposito: result.rubrics?.proposito?.score,
        empatia: result.rubrics?.empatia?.score,
      },
      tokens: {
        prompt: completion.usage?.prompt_tokens,
        completion: completion.usage?.completion_tokens,
        total: completion.usage?.total_tokens,
      },
      cost_estimate: calculateCost(completion.usage, provider),
      timestamp: new Date().toISOString(),
    });

    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error({
      event: 'diagnostic_interview_evaluation_failed',
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

// ============================================================================
// INTERVIEW SESSION EVALUATION FUNCTION (Personality Analysis)
// ============================================================================

export async function evaluateInterviewSession(params: {
  transcript: TranscriptMessage[];
  sessionId: string;
  userId: string;
  userName: string;
}): Promise<string> {
  const startTime = Date.now();

  try {
    const userMessage = `
Nombre del Usuario: ${params.userName}

Conversacion: ${JSON.stringify(params.transcript, null, 2)}
    `.trim();

    console.log({
      event: 'interview_session_evaluation_started',
      sessionId: params.sessionId,
      userId: params.userId,
      userName: params.userName,
      transcriptLength: params.transcript.length,
      timestamp: new Date().toISOString(),
    });

    const { completion, provider, model } = await callLLM({
      messages: [
        { role: 'system', content: INTERVIEW_SYSTEM_MESSAGE },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(
      completion.choices[0].message.content || '{}'
    ) as DiagnosticInterviewEvaluation;

    // Logging de uso
    const duration = Date.now() - startTime;
    console.log({
      event: 'interview_session_evaluation_completed',
      sessionId: params.sessionId,
      userId: params.userId,
      userName: params.userName,
      provider,
      model,
      duration_ms: duration,
      is_complete: result.is_complete,
      has_amazing_comment: !!result.amazing_comment,
      has_summary: !!result.summary,
      rubric_scores: {
        claridad: result.rubrics?.claridad?.score,
        adaptacion: result.rubrics?.adaptacion?.score,
        persuasion: result.rubrics?.persuasion?.score,
        estructura: result.rubrics?.estructura?.score,
        proposito: result.rubrics?.proposito?.score,
        empatia: result.rubrics?.empatia?.score,
      },
      tokens: {
        prompt: completion.usage?.prompt_tokens,
        completion: completion.usage?.completion_tokens,
        total: completion.usage?.total_tokens,
      },
      cost_estimate: calculateCost(completion.usage, provider),
      timestamp: new Date().toISOString(),
    });

    // Return analysis_text format for backward compatibility with interview_evaluations table
    // This includes the full JSON structure that will be parsed by the endpoint
    return JSON.stringify(result, null, 2);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error({
      event: 'interview_session_evaluation_failed',
      sessionId: params.sessionId,
      userId: params.userId,
      userName: params.userName,
      duration_ms: duration,
      error: error?.message || 'Unknown error',
      error_type: error?.name || 'Error',
      error_status: error?.status,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}
