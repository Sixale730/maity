# Omi Life-Logging Integration Plan

## 📋 Resumen Ejecutivo

Integración del dispositivo Omi wearable con la app móvil Maity para captura y análisis continuo de conversaciones diarias. Usa transcripción vía Whisper API, almacenamiento vectorial con Supabase pgvector, y análisis con OpenAI.

**Stack Tecnológico:**
- Hardware: Omi device (OPUS codec via BLE)
- Transcripción: OpenAI Whisper API
- Embeddings: OpenAI text-embedding-3-large (3072 dims)
- Vector DB: Supabase pgvector
- Storage: Supabase PostgreSQL
- VAD: @ricky0123/vad-react-native (local)
- Background Service: react-native-background-actions

**Ventajas vs Stack Omi Oficial:**
- 78% más económico ($22/mes vs $100/mes)
- Ya integrado con Supabase existente
- Sin necesidad de Firebase, Pinecone, Redis externos
- Máxima precisión con Whisper

---

## 🏗️ Arquitectura General

```
┌──────────────────────────────────────────────────────────┐
│                    Omi Device (Hardware)                  │
│  - Graba audio continuo (todo el día)                    │
│  - Codec: OPUS                                           │
│  - Envía via BLE a app                                   │
└──────────────────┬───────────────────────────────────────┘
                   │ BLE Stream (OPUS packets)
                   ↓
┌──────────────────────────────────────────────────────────┐
│              React Native App (Background)                │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  OmiLifeLoggingService (24/7 Background)        │   │
│  │                                                  │   │
│  │  1. BLE Handler → Recibe OPUS streaming        │   │
│  │  2. VAD Processor → Detecta voz vs silencio    │   │
│  │  3. Segment Builder → Agrupa conversaciones    │   │
│  │  4. Segment Processor → Procesa al completar   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
└──────────────────┬───────────────────────────────────────┘
                   │ Audio Segments
                   ↓
┌──────────────────────────────────────────────────────────┐
│                   Processing Pipeline                     │
│                                                           │
│  Audio Segment (PCM/OPUS)                                │
│         ↓                                                 │
│  Whisper API (Transcription)                             │
│         ↓                                                 │
│  OpenAI Embeddings (text-embedding-3-large)              │
│         ↓                                                 │
│  Supabase pgvector (Storage + Semantic Search)           │
│         ↓                                                 │
│  Post-Processing (Categorization, Action Items, etc)     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Tabla: `omi_memories`

Almacena cada conversación transcrita con su embedding vectorial.

```sql
CREATE TABLE omi_memories (
  -- Identificadores
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  session_id UUID REFERENCES omi_recording_sessions(id),

  -- Contenido principal
  transcript TEXT NOT NULL,
  audio_url TEXT, -- URL en Supabase Storage (opcional)

  -- Duración y metadata básica
  duration_seconds INTEGER NOT NULL,
  word_count INTEGER,

  -- Vector embedding (3072 dimensiones)
  embedding VECTOR(3072),

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata contextual
  device_id TEXT,
  location JSONB, -- {lat: number, lng: number, address: string}

  -- Categorización (generada por GPT-4 post-procesamiento)
  category TEXT, -- 'meeting', 'conversation', 'personal', 'work', 'note'
  tags TEXT[], -- ['proyecto', 'cliente', 'urgente']
  people_mentioned TEXT[], -- ['Juan', 'María']

  -- Análisis avanzado (opcional, generado offline)
  sentiment TEXT, -- 'positive', 'neutral', 'negative'
  summary TEXT, -- Resumen corto de 1-2 oraciones
  action_items TEXT[], -- Tareas identificadas
  key_topics TEXT[], -- Temas principales

  -- Constraints
  CONSTRAINT omi_memories_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT omi_memories_category_check
    CHECK (category IN ('meeting', 'conversation', 'personal', 'work', 'note', NULL)),
  CONSTRAINT omi_memories_sentiment_check
    CHECK (sentiment IN ('positive', 'neutral', 'negative', NULL))
);

-- Índice vectorial (IVFFlat para búsqueda rápida)
CREATE INDEX omi_memories_embedding_idx ON omi_memories
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Índices para queries comunes
CREATE INDEX omi_memories_user_started_idx
  ON omi_memories(user_id, started_at DESC);
CREATE INDEX omi_memories_user_category_idx
  ON omi_memories(user_id, category) WHERE category IS NOT NULL;
CREATE INDEX omi_memories_tags_idx
  ON omi_memories USING gin(tags);
CREATE INDEX omi_memories_created_idx
  ON omi_memories(created_at DESC);
```

### Tabla: `omi_recording_sessions`

Trackea sesiones de grabación activas (cuando el usuario activa Omi).

```sql
CREATE TABLE omi_recording_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  device_id TEXT NOT NULL,

  -- Estado de la sesión
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'stopped'

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_audio_at TIMESTAMPTZ, -- Última vez que recibió audio
  ended_at TIMESTAMPTZ,

  -- Estadísticas acumuladas
  total_memories_created INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,

  -- Metadata del dispositivo
  battery_level INTEGER, -- % batería del Omi
  firmware_version TEXT,

  -- Metadata de la app
  app_version TEXT,
  metadata JSONB, -- Datos adicionales flexibles

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT omi_recording_sessions_status_check
    CHECK (status IN ('active', 'paused', 'stopped'))
);

CREATE INDEX omi_recording_sessions_user_idx
  ON omi_recording_sessions(user_id, created_at DESC);
CREATE INDEX omi_recording_sessions_status_idx
  ON omi_recording_sessions(status) WHERE status = 'active';
```

---

## 🔧 RPC Functions

### 1. Búsqueda Semántica

```sql
CREATE OR REPLACE FUNCTION search_omi_memories(
  p_user_id UUID,
  p_query_embedding VECTOR(3072),
  p_limit INTEGER DEFAULT 10,
  p_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  transcript TEXT,
  summary TEXT,
  similarity FLOAT,
  started_at TIMESTAMPTZ,
  category TEXT,
  tags TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.transcript,
    m.summary,
    1 - (m.embedding <=> p_query_embedding) as similarity,
    m.started_at,
    m.category,
    m.tags
  FROM omi_memories m
  WHERE m.user_id = p_user_id
    AND 1 - (m.embedding <=> p_query_embedding) >= p_threshold
  ORDER BY m.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION search_omi_memories TO authenticated;
```

**Uso desde TypeScript:**
```typescript
// Buscar "¿Qué dije sobre el proyecto?"
const queryEmbedding = await createEmbedding('proyecto');
const { data } = await supabase.rpc('search_omi_memories', {
  p_user_id: userId,
  p_query_embedding: queryEmbedding,
  p_limit: 10,
  p_threshold: 0.7,
});
```

### 2. Crear Sesión de Grabación

```sql
CREATE OR REPLACE FUNCTION create_omi_recording_session(
  p_user_id UUID,
  p_device_id TEXT,
  p_app_version TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  INSERT INTO omi_recording_sessions (
    user_id,
    device_id,
    app_version
  )
  VALUES (p_user_id, p_device_id, p_app_version)
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_omi_recording_session TO authenticated;
```

### 3. Guardar Memory

```sql
CREATE OR REPLACE FUNCTION create_omi_memory(
  p_user_id UUID,
  p_session_id UUID,
  p_transcript TEXT,
  p_embedding VECTOR(3072),
  p_started_at TIMESTAMPTZ,
  p_ended_at TIMESTAMPTZ,
  p_duration_seconds INTEGER,
  p_device_id TEXT,
  p_location JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_memory_id UUID;
  v_word_count INTEGER;
BEGIN
  -- Calcular word count
  v_word_count := array_length(string_to_array(p_transcript, ' '), 1);

  -- Insertar memory
  INSERT INTO omi_memories (
    user_id, session_id, transcript, embedding,
    started_at, ended_at, duration_seconds,
    device_id, word_count, location
  )
  VALUES (
    p_user_id, p_session_id, p_transcript, p_embedding,
    p_started_at, p_ended_at, p_duration_seconds,
    p_device_id, v_word_count, p_location
  )
  RETURNING id INTO v_memory_id;

  -- Actualizar estadísticas de sesión
  UPDATE omi_recording_sessions
  SET
    total_memories_created = total_memories_created + 1,
    total_duration_seconds = total_duration_seconds + p_duration_seconds,
    last_audio_at = NOW()
  WHERE id = p_session_id;

  RETURN v_memory_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_omi_memory TO authenticated;
```

---

## 🎙️ Background Service Architecture

### Flujo del Servicio en Background

```typescript
// Pseudocódigo del flujo principal

class OmiLifeLoggingService {
  1. startRecording()
     ├─ Verificar permisos (BLE, audio, location, background)
     ├─ Conectar a Omi device via BLE
     ├─ Crear session en DB
     ├─ Iniciar foreground service (Android)
     └─ Comenzar loop principal

  2. mainLoop() {
     while (recording) {
       ├─ Recibir audio chunk via BLE
       ├─ Decodificar OPUS → PCM
       ├─ Pasar a VAD processor
       └─ VAD decide: ¿seguir o procesar?
     }
  }

  3. VAD Processor {
     ├─ Analizar frame de audio
     ├─ ¿Hay voz? → agregar a buffer
     ├─ ¿Silencio > 2s? → disparar processSegment()
     └─ Retornar resultado
  }

  4. processSegment() {
     ├─ Tomar audio buffer completo
     ├─ Guardar temp file
     ├─ Transcribir con Whisper API
     ├─ Generar embedding con OpenAI
     ├─ Guardar en Supabase
     ├─ Limpiar buffer y temp files
     └─ Notificar usuario (opcional)
  }
}
```

### Componentes Clave

**1. BLE Audio Stream Handler**
- Mantiene conexión BLE estable
- Recibe paquetes OPUS continuos
- Maneja reconexión automática
- Monitorea calidad de señal

**2. VAD Processor**
- Ejecuta en tiempo real
- Analiza cada frame (30ms típico)
- Detecta inicio/fin de voz
- Threshold configurable
- Silencio de 2 segundos = fin de segment

**3. Segment Processor**
- Recibe audio completo cuando VAD termina
- Transcribe con Whisper API
- Genera embedding vectorial
- Guarda en DB con metadata
- Maneja errores y retries

---

## 💰 Estimación de Costos

### Costos por API (OpenAI)

**Whisper API:**
- $0.006 por minuto de audio

**Embeddings API:**
- text-embedding-3-large: $0.00013 per 1K tokens
- Transcript típico: ~500 tokens
- Costo por embedding: $0.000065

### Escenario: Usuario Intenso

**Audio capturado:** 2 horas/día
**Segments:** ~20 conversaciones/día
**Duración promedio:** 6 minutos/conversación

**Costos Diarios:**
```
Transcripción: 20 segments × 6 min × $0.006 = $0.72
Embeddings: 20 × $0.000065 = $0.0013
TOTAL DIARIO: $0.72
```

**Costos Mensuales:**
```
Transcripción: $0.72 × 30 = $21.60
Embeddings: $0.0013 × 30 = $0.04
Storage (Supabase): $0 (gratis hasta 500MB)
TOTAL MENSUAL: ~$22
```

### Comparación con Stack Omi Oficial

| Servicio | Omi Oficial | Tu Stack |
|----------|-------------|----------|
| Transcripción | Deepgram $30 | Whisper $22 |
| Vector DB | Pinecone $70 | pgvector $0 |
| Cache | Redis $10 | Supabase $0 |
| **TOTAL** | **$110/mes** | **$22/mes** |

**Ahorro: 80%**

---

## 🚀 Roadmap de Implementación

### Fase 1: Database Setup (Día 1)
- [x] Habilitar pgvector extension
- [ ] Crear tablas omi_memories y omi_recording_sessions
- [ ] Crear RPC functions
- [ ] Crear índices
- [ ] Testing de queries

### Fase 2: Dependencies & Config (Día 1-2)
- [ ] Instalar paquetes npm
- [ ] Configurar permisos (app.json)
- [ ] Agregar variables de entorno
- [ ] Setup OpenAI client

### Fase 3: Core Services (Día 3-5)
- [ ] VAD Processor
- [ ] Segment Processor
- [ ] Extender omiBluetoothService
- [ ] OmiLifeLoggingService (background)

### Fase 4: API Integration (Día 5-6)
- [ ] Hook de Whisper transcription
- [ ] Hook de OpenAI embeddings
- [ ] Manejo de errores y retries

### Fase 5: UI Components (Día 7-8)
- [ ] OmiLifeLoggingScreen (control principal)
- [ ] OmiSearchScreen (búsqueda semántica)
- [ ] OmiAnalyticsScreen (dashboard)
- [ ] Navegación y routing

### Fase 6: Testing & Polish (Día 9-10)
- [ ] Testing end-to-end
- [ ] Optimización de batería
- [ ] Manejo de edge cases
- [ ] Documentación de usuario

---

## 📝 Features Planificadas

### MVP (v1.0)
- ✅ Grabación continua en background
- ✅ Transcripción con Whisper
- ✅ Almacenamiento con embeddings
- ✅ Búsqueda semántica básica
- ✅ Timeline de memories

### v1.1
- [ ] Categorización automática con GPT-4
- [ ] Detección de action items
- [ ] Análisis de sentimiento
- [ ] Resumen diario automatizado

### v1.2
- [ ] Notificaciones inteligentes
- [ ] Export de memories (PDF, Markdown)
- [ ] Integración con calendario
- [ ] Multi-device sync

### v2.0
- [ ] Análisis de patrones de conversación
- [ ] Insights sobre temas recurrentes
- [ ] Sugerencias proactivas
- [ ] Dashboard analytics avanzado

---

## 🐛 Troubleshooting Común

Ver `OMI_TROUBLESHOOTING.md` para guía completa.

### Background Service no se mantiene activo
- **Android**: Asegurar foreground service notification
- **iOS**: Verificar background modes en Info.plist

### VAD no detecta voz correctamente
- Ajustar threshold en env vars
- Verificar sample rate del audio (16kHz esperado)

### Conexión BLE se cae frecuentemente
- Implementar exponential backoff en reconexión
- Verificar distancia del dispositivo
- Revisar batería del Omi

### Embeddings fallan al guardarse
- Verificar dimensiones (debe ser 3072)
- Verificar que pgvector esté habilitado
- Revisar permisos RLS en Supabase

---

## 📚 Referencias

- [Supabase pgvector Docs](https://supabase.com/docs/guides/database/extensions/pgvector)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [React Native Background Actions](https://github.com/Rapsssito/react-native-background-actions)
- [VAD for React Native](https://github.com/ricky0123/vad)

---

**Última actualización:** 2025-10-13
**Versión:** 1.0
**Estado:** En implementación
