# Plan de Implementación - Sistema de Agentes de Voz para Maity

## 📋 Contexto y Análisis del Sistema Actual

### Estructura Existente Relevante:
- **Esquema principal**: `maity`
- **Tabla usuarios**: `maity.users` (id UUID) - 25 usuarios actuales
- **Tabla companies**: `maity.companies` - Sistema multiempresa
- **Tabla sessions**: `maity.sessions` - Sistema de sesiones de coaching existente
- **Tabla roles**: `maity.user_roles` - Sistema de roles (admin, manager, user)
- **Sistema de coaching**: `coaching_sessions`, `plans`, `plan_sessions`
- **RPC Functions existentes**: `my_phase()`, `my_roles()`, `otk()`, etc.

### Integración Propuesta:
El sistema de agentes de voz se integrará como un módulo complementario al sistema de coaching existente, utilizando `maity.users.id` como referencia principal y respetando la estructura multiempresa.

---

## 🎯 FASE 1: FUNDACIÓN - TABLAS BASE ✅ COMPLETADA
**Duración: 2-3 días**
**Prioridad: Alta**
**Estado: COMPLETADA - 2024-01-29**

### 1.1 Crear Esquema de Tablas Maestras

```sql
-- Migración: 001_create_voice_agent_profiles.sql
CREATE TABLE maity.voice_agent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE, -- 'CEO', 'CTO', 'CFO'
  description TEXT,
  key_focus TEXT, -- Áreas de enfoque del agente
  communication_style TEXT, -- Estilo de comunicación
  personality_traits JSONB, -- Rasgos de personalidad adicionales
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migración: 002_create_voice_scenarios.sql
CREATE TABLE maity.voice_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL, -- 'first_visit', 'presentation', etc.
  order_index INTEGER NOT NULL,
  base_context TEXT NOT NULL,
  objectives JSONB NOT NULL,
  estimated_duration INTEGER DEFAULT 300, -- segundos
  category VARCHAR(50), -- 'discovery', 'presentation', 'negotiation', etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migración: 003_create_voice_difficulty_levels.sql
CREATE TABLE maity.voice_difficulty_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER NOT NULL UNIQUE CHECK (level BETWEEN 1 AND 3),
  name VARCHAR(50) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL, -- 'easy', 'medium', 'hard'
  mood_preset VARCHAR(50),
  objection_frequency DECIMAL(3,2) CHECK (objection_frequency BETWEEN 0 AND 1),
  time_pressure BOOLEAN DEFAULT FALSE,
  interruption_tendency DECIMAL(3,2) CHECK (interruption_tendency BETWEEN 0 AND 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_voice_scenarios_order ON maity.voice_scenarios(order_index);
CREATE INDEX idx_voice_scenarios_active ON maity.voice_scenarios(is_active);
```

### 1.2 Crear Tablas de Configuración

```sql
-- Migración: 004_create_voice_profile_scenarios.sql
CREATE TABLE maity.voice_profile_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES maity.voice_agent_profiles(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES maity.voice_scenarios(id) ON DELETE CASCADE,
  difficulty_id UUID NOT NULL REFERENCES maity.voice_difficulty_levels(id),
  company_id UUID REFERENCES maity.companies(id), -- NULL = configuración global
  specific_context TEXT, -- Contexto específico del perfil
  key_objections JSONB, -- Objeciones típicas
  success_criteria JSONB, -- Criterios de éxito
  talking_points JSONB, -- Puntos clave del agente
  min_score_to_pass DECIMAL(5,2) DEFAULT 70.00, -- Score mínimo para pasar
  is_locked BOOLEAN DEFAULT TRUE, -- Se desbloquea progresivamente
  unlock_after_scenario UUID, -- Referencia al escenario previo requerido
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, scenario_id, difficulty_id, COALESCE(company_id, '00000000-0000-0000-0000-000000000000'::UUID))
);

-- Índices compuestos para queries frecuentes
CREATE INDEX idx_voice_profile_scenarios_composite
  ON maity.voice_profile_scenarios(profile_id, scenario_id, difficulty_id);
CREATE INDEX idx_voice_profile_scenarios_company
  ON maity.voice_profile_scenarios(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_voice_profile_scenarios_locked
  ON maity.voice_profile_scenarios(is_locked);
```

### 1.3 Seeds de Datos Iniciales

```sql
-- Migración: 005_seed_initial_voice_data.sql

-- Perfiles de agentes
INSERT INTO maity.voice_agent_profiles (name, description, key_focus, communication_style, personality_traits) VALUES
('CEO', 'Director Ejecutivo',
 'Visión estratégica, ROI, crecimiento del negocio, impacto organizacional',
 'Directo, tiempo limitado, orientado a resultados, busca el panorama general',
 '{"patience_level": "low", "technical_depth": "low", "decision_speed": "fast", "focus": "strategic"}'::JSONB),

('CTO', 'Director de Tecnología',
 'Arquitectura técnica, integraciones, seguridad, escalabilidad, stack tecnológico',
 'Detallista, analítico, busca profundidad técnica, valora la documentación',
 '{"patience_level": "medium", "technical_depth": "high", "decision_speed": "methodical", "focus": "technical"}'::JSONB),

('CFO', 'Director Financiero',
 'Costos, presupuesto, métricas financieras, TCO, periodo de recuperación',
 'Analítico, conservador, orientado a números, busca justificación financiera',
 '{"patience_level": "medium", "technical_depth": "low", "decision_speed": "slow", "focus": "financial"}'::JSONB);

-- Escenarios base
INSERT INTO maity.voice_scenarios (name, code, order_index, base_context, objectives, category, estimated_duration) VALUES
('Primera Visita', 'first_visit', 1,
 'Primer contacto con el prospecto para entender sus necesidades y pain points',
 '{"primary": "Identificar necesidades", "secondary": ["Establecer rapport", "Calificar al lead", "Entender contexto del negocio"]}'::JSONB,
 'discovery', 300),

('Presentación de Producto', 'product_demo', 2,
 'Demostración de la solución adaptada a las necesidades identificadas',
 '{"primary": "Mostrar valor de la solución", "secondary": ["Conectar features con pain points", "Generar interés", "Responder preguntas técnicas"]}'::JSONB,
 'presentation', 420),

('Manejo de Objeciones', 'objection_handling', 3,
 'El cliente presenta dudas y objeciones sobre la solución propuesta',
 '{"primary": "Resolver objeciones efectivamente", "secondary": ["Mantener confianza", "Reforzar propuesta de valor", "Identificar objeciones ocultas"]}'::JSONB,
 'negotiation', 360),

('Negociación y Cierre', 'closing', 4,
 'Negociación de términos y cierre de la venta',
 '{"primary": "Cerrar el acuerdo", "secondary": ["Negociar términos favorables", "Asegurar compromiso", "Definir próximos pasos"]}'::JSONB,
 'closing', 480),

('Seguimiento Post-Demo', 'follow_up', 5,
 'Seguimiento después de la demostración para mantener el momentum',
 '{"primary": "Mantener interés activo", "secondary": ["Resolver dudas pendientes", "Avanzar en el proceso", "Involucrar stakeholders"]}'::JSONB,
 'nurturing', 240);

-- Niveles de dificultad
INSERT INTO maity.voice_difficulty_levels (level, name, code, mood_preset, objection_frequency, time_pressure, interruption_tendency) VALUES
(1, 'Fácil', 'easy', 'receptivo', 0.20, FALSE, 0.10),
(2, 'Medio', 'medium', 'neutral', 0.50, FALSE, 0.30),
(3, 'Difícil', 'hard', 'escéptico', 0.80, TRUE, 0.50);
```

---

## 📊 FASE 2: SISTEMA DE SESIONES Y TRACKING ✅ COMPLETADA
**Duración: 3-4 días**
**Prioridad: Alta**
**Estado: COMPLETADA - 2024-01-29**
**Agregado: Tabla de cuestionario pre-práctica**

### 2.1 Tabla Principal de Sesiones de Voz

```sql
-- Migración: 006_create_voice_sessions.sql
CREATE TABLE maity.voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES maity.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES maity.companies(id), -- Para tracking por empresa
  profile_scenario_id UUID NOT NULL REFERENCES maity.voice_profile_scenarios(id),

  -- Estado y tiempo
  status VARCHAR(20) DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'abandoned', 'evaluating')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- Datos de la sesión
  recording_url TEXT, -- URL del audio grabado
  raw_transcript TEXT, -- Transcripción completa
  ai_agent_config JSONB, -- Configuración del agente IA usada

  -- Evaluación y feedback
  processed_feedback JSONB, -- Feedback procesado
  score DECIMAL(5,2) CHECK (score BETWEEN 0 AND 100),
  passed BOOLEAN, -- Si superó el score mínimo

  -- Metadata
  session_metadata JSONB, -- Datos adicionales de la sesión
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para queries comunes
CREATE INDEX idx_voice_sessions_user ON maity.voice_sessions(user_id);
CREATE INDEX idx_voice_sessions_company ON maity.voice_sessions(company_id);
CREATE INDEX idx_voice_sessions_status ON maity.voice_sessions(status);
CREATE INDEX idx_voice_sessions_created ON maity.voice_sessions(created_at DESC);
```

### 2.2 Sistema de Métricas Detalladas

```sql
-- Migración: 007_create_voice_metrics.sql

-- Tipos de métricas predefinidas
CREATE TABLE maity.voice_metric_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'communication', 'sales_technique', 'product_knowledge'
  calculation_method TEXT,
  weight DECIMAL(3,2) DEFAULT 1.0 CHECK (weight BETWEEN 0 AND 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Métricas por sesión
CREATE TABLE maity.voice_session_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES maity.voice_sessions(id) ON DELETE CASCADE,
  metric_type_id UUID NOT NULL REFERENCES maity.voice_metric_types(id),
  metric_value DECIMAL(10,2) NOT NULL,
  normalized_score DECIMAL(5,2), -- Score normalizado 0-100
  metadata JSONB, -- Detalles adicionales de la métrica
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Momentos clave en la conversación
CREATE TABLE maity.voice_session_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES maity.voice_sessions(id) ON DELETE CASCADE,
  moment_type VARCHAR(50) NOT NULL, -- 'objection', 'closing_attempt', 'rapport_building'
  timestamp_seconds INTEGER NOT NULL, -- Segundo en la grabación
  transcript_snippet TEXT,
  ai_analysis JSONB, -- Análisis del momento
  score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_voice_session_metrics_session ON maity.voice_session_metrics(session_id);
CREATE INDEX idx_voice_session_moments_session ON maity.voice_session_moments(session_id);
CREATE INDEX idx_voice_session_moments_type ON maity.voice_session_moments(moment_type);
```

### 2.3 Progreso y Estadísticas del Usuario

```sql
-- Migración: 008_create_voice_user_progress.sql
CREATE TABLE maity.voice_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES maity.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES maity.companies(id),
  profile_id UUID NOT NULL REFERENCES maity.voice_agent_profiles(id),

  -- Progreso actual
  current_scenario_order INTEGER DEFAULT 1,
  current_difficulty_level INTEGER DEFAULT 1,
  scenarios_completed INTEGER DEFAULT 0,
  scenarios_failed INTEGER DEFAULT 0,

  -- Estadísticas
  total_sessions INTEGER DEFAULT 0,
  total_practice_time INTEGER DEFAULT 0, -- segundos
  average_score DECIMAL(5,2),
  best_score DECIMAL(5,2),
  streak_days INTEGER DEFAULT 0,
  last_session_date DATE,

  -- Achievements
  achievements_unlocked INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, profile_id)
);

-- Historial de progreso (para gráficos)
CREATE TABLE maity.voice_progress_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES maity.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES maity.voice_agent_profiles(id),
  date DATE NOT NULL,
  sessions_count INTEGER DEFAULT 0,
  practice_time_seconds INTEGER DEFAULT 0,
  average_score DECIMAL(5,2),
  scenarios_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, profile_id, date)
);

CREATE INDEX idx_voice_user_progress_user ON maity.voice_user_progress(user_id);
CREATE INDEX idx_voice_progress_history_user_date ON maity.voice_progress_history(user_id, date DESC);
```

### 2.4 Políticas RLS

```sql
-- Migración: 009_create_voice_rls_policies.sql

-- RLS para voice_sessions
ALTER TABLE maity.voice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own voice sessions"
  ON maity.voice_sessions FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_id FROM maity.users WHERE id = user_id
  ));

CREATE POLICY "Users can create own voice sessions"
  ON maity.voice_sessions FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT auth_id FROM maity.users WHERE id = user_id
  ));

CREATE POLICY "Users can update own voice sessions"
  ON maity.voice_sessions FOR UPDATE
  USING (auth.uid() IN (
    SELECT auth_id FROM maity.users WHERE id = user_id
  ));

-- RLS para voice_user_progress
ALTER TABLE maity.voice_user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own voice progress"
  ON maity.voice_user_progress FOR ALL
  USING (auth.uid() IN (
    SELECT auth_id FROM maity.users WHERE id = user_id
  ));

-- Managers pueden ver progreso de su empresa
CREATE POLICY "Managers can view company voice progress"
  ON maity.voice_user_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM maity.users u
      JOIN maity.user_roles ur ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid()
      AND ur.role IN ('manager', 'admin')
      AND u.company_id = voice_user_progress.company_id
    )
  );
```

---

## 🎮 FASE 3: GAMIFICACIÓN Y ENGAGEMENT
**Duración: 2-3 días**
**Prioridad: Media**

### 3.1 Sistema de Achievements

```sql
-- Migración: 010_create_voice_achievements.sql

-- Definición de logros
CREATE TABLE maity.voice_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'milestone', 'performance', 'streak', 'special'
  tier VARCHAR(20), -- 'bronze', 'silver', 'gold', 'platinum'

  -- Criterios
  criteria_type VARCHAR(50) NOT NULL, -- 'sessions_count', 'score_threshold', 'streak_days'
  criteria_value JSONB NOT NULL,

  -- Recompensas
  points INTEGER DEFAULT 10,
  badge_icon TEXT,
  badge_color VARCHAR(7), -- Hex color

  -- Control
  is_active BOOLEAN DEFAULT TRUE,
  is_secret BOOLEAN DEFAULT FALSE, -- Logros ocultos hasta desbloquear
  order_index INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logros desbloqueados por usuario
CREATE TABLE maity.voice_user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES maity.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES maity.voice_achievements(id),
  session_id UUID REFERENCES maity.voice_sessions(id), -- Sesión donde se desbloqueó
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, achievement_id)
);

-- Sistema de puntos
CREATE TABLE maity.voice_user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES maity.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES maity.companies(id),

  -- Puntos totales
  total_points INTEGER DEFAULT 0,
  spent_points INTEGER DEFAULT 0, -- Para futuro sistema de rewards
  available_points INTEGER GENERATED ALWAYS AS (total_points - spent_points) STORED,

  -- Puntos por periodo (para leaderboards)
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,

  -- Rankings
  global_rank INTEGER,
  company_rank INTEGER,

  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Historial de puntos
CREATE TABLE maity.voice_points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES maity.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  points_type VARCHAR(50) NOT NULL, -- 'session_complete', 'achievement', 'streak_bonus'
  reason TEXT,
  reference_id UUID, -- ID de sesión o achievement
  reference_type VARCHAR(50), -- 'session', 'achievement'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_user_achievements_user ON maity.voice_user_achievements(user_id);
CREATE INDEX idx_voice_user_points_rankings ON maity.voice_user_points(global_rank, company_rank);
CREATE INDEX idx_voice_points_history_user ON maity.voice_points_history(user_id, created_at DESC);
```

### 3.2 Seeds de Achievements

```sql
-- Migración: 011_seed_voice_achievements.sql

INSERT INTO maity.voice_achievements (code, name, description, category, tier, criteria_type, criteria_value, points) VALUES
-- Milestones
('first_session', 'Primera Llamada', 'Completa tu primera sesión de práctica', 'milestone', 'bronze', 'sessions_count', '{"count": 1}'::JSONB, 10),
('sessions_10', 'Vendedor Activo', 'Completa 10 sesiones de práctica', 'milestone', 'silver', 'sessions_count', '{"count": 10}'::JSONB, 50),
('sessions_50', 'Veterano de Ventas', 'Completa 50 sesiones de práctica', 'milestone', 'gold', 'sessions_count', '{"count": 50}'::JSONB, 200),

-- Performance
('perfect_score', 'Llamada Perfecta', 'Obtén 100 puntos en una sesión', 'performance', 'platinum', 'score_threshold', '{"score": 100}'::JSONB, 100),
('high_scorer', 'Alto Rendimiento', 'Obtén más de 90 puntos en 5 sesiones', 'performance', 'gold', 'score_threshold', '{"score": 90, "count": 5}'::JSONB, 75),

-- Streaks
('streak_7', 'Semana Consistente', 'Practica 7 días seguidos', 'streak', 'silver', 'streak_days', '{"days": 7}'::JSONB, 30),
('streak_30', 'Mes Imparable', 'Practica 30 días seguidos', 'streak', 'platinum', 'streak_days', '{"days": 30}'::JSONB, 150),

-- Perfiles específicos
('ceo_master', 'Maestro CEO', 'Completa todos los escenarios con el CEO', 'special', 'gold', 'profile_complete', '{"profile": "CEO"}'::JSONB, 100),
('cto_master', 'Maestro CTO', 'Completa todos los escenarios con el CTO', 'special', 'gold', 'profile_complete', '{"profile": "CTO"}'::JSONB, 100),
('cfo_master', 'Maestro CFO', 'Completa todos los escenarios con el CFO', 'special', 'gold', 'profile_complete', '{"profile": "CFO"}'::JSONB, 100);
```

---

## 🔧 FASE 4: FUNCIONES Y PROCEDIMIENTOS
**Duración: 3-4 días**
**Prioridad: Alta**

### 4.1 Funciones Core de Sesión

```sql
-- Migración: 012_create_voice_session_functions.sql

-- Iniciar nueva sesión de voz
CREATE OR REPLACE FUNCTION maity.start_voice_session(
  p_user_id UUID,
  p_profile_scenario_id UUID
) RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_company_id UUID;
  v_is_locked BOOLEAN;
BEGIN
  -- Obtener company_id del usuario
  SELECT company_id INTO v_company_id
  FROM maity.users
  WHERE id = p_user_id;

  -- Verificar que el escenario esté desbloqueado
  SELECT is_locked INTO v_is_locked
  FROM maity.voice_profile_scenarios
  WHERE id = p_profile_scenario_id;

  IF v_is_locked THEN
    RAISE EXCEPTION 'Scenario is locked for user %', p_user_id;
  END IF;

  -- Crear nueva sesión
  INSERT INTO maity.voice_sessions (
    user_id,
    company_id,
    profile_scenario_id,
    status
  ) VALUES (
    p_user_id,
    v_company_id,
    p_profile_scenario_id,
    'in_progress'
  ) RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Finalizar sesión de voz
CREATE OR REPLACE FUNCTION maity.end_voice_session(
  p_session_id UUID,
  p_transcript TEXT,
  p_recording_url TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE maity.voice_sessions
  SET
    status = 'evaluating',
    ended_at = NOW(),
    duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at)),
    raw_transcript = p_transcript,
    recording_url = p_recording_url,
    updated_at = NOW()
  WHERE id = p_session_id
    AND status = 'in_progress';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session % not found or not in progress', p_session_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procesar feedback de sesión
CREATE OR REPLACE FUNCTION maity.process_voice_session_feedback(
  p_session_id UUID,
  p_feedback JSONB,
  p_score DECIMAL(5,2)
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_profile_id UUID;
  v_scenario_id UUID;
  v_min_score DECIMAL(5,2);
  v_passed BOOLEAN;
BEGIN
  -- Obtener datos de la sesión
  SELECT
    vs.user_id,
    vps.profile_id,
    vps.scenario_id,
    vps.min_score_to_pass
  INTO v_user_id, v_profile_id, v_scenario_id, v_min_score
  FROM maity.voice_sessions vs
  JOIN maity.voice_profile_scenarios vps ON vs.profile_scenario_id = vps.id
  WHERE vs.id = p_session_id;

  -- Determinar si pasó
  v_passed := p_score >= COALESCE(v_min_score, 70);

  -- Actualizar sesión
  UPDATE maity.voice_sessions
  SET
    processed_feedback = p_feedback,
    score = p_score,
    passed = v_passed,
    status = 'completed',
    updated_at = NOW()
  WHERE id = p_session_id;

  -- Actualizar progreso del usuario
  PERFORM maity.update_voice_user_progress(v_user_id, v_profile_id, p_score, v_passed);

  -- Verificar achievements
  PERFORM maity.check_voice_achievements(v_user_id, p_session_id);

  -- Si pasó, desbloquear siguiente escenario
  IF v_passed THEN
    PERFORM maity.unlock_next_voice_scenario(v_user_id, v_profile_id, v_scenario_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.2 Funciones de Progreso

```sql
-- Migración: 013_create_voice_progress_functions.sql

-- Actualizar progreso del usuario
CREATE OR REPLACE FUNCTION maity.update_voice_user_progress(
  p_user_id UUID,
  p_profile_id UUID,
  p_score DECIMAL(5,2),
  p_passed BOOLEAN
) RETURNS VOID AS $$
DECLARE
  v_total_sessions INTEGER;
  v_total_score DECIMAL;
  v_company_id UUID;
BEGIN
  -- Obtener company_id
  SELECT company_id INTO v_company_id
  FROM maity.users WHERE id = p_user_id;

  -- Insertar o actualizar progreso
  INSERT INTO maity.voice_user_progress (
    user_id, company_id, profile_id, total_sessions,
    average_score, best_score, last_session_date
  ) VALUES (
    p_user_id, v_company_id, p_profile_id, 1,
    p_score, p_score, CURRENT_DATE
  )
  ON CONFLICT (user_id, profile_id) DO UPDATE
  SET
    total_sessions = voice_user_progress.total_sessions + 1,
    scenarios_completed = CASE
      WHEN p_passed THEN voice_user_progress.scenarios_completed + 1
      ELSE voice_user_progress.scenarios_completed
    END,
    scenarios_failed = CASE
      WHEN NOT p_passed THEN voice_user_progress.scenarios_failed + 1
      ELSE voice_user_progress.scenarios_failed
    END,
    average_score = (
      (voice_user_progress.average_score * voice_user_progress.total_sessions + p_score) /
      (voice_user_progress.total_sessions + 1)
    ),
    best_score = GREATEST(voice_user_progress.best_score, p_score),
    last_session_date = CURRENT_DATE,
    streak_days = CASE
      WHEN voice_user_progress.last_session_date = CURRENT_DATE - INTERVAL '1 day'
        THEN voice_user_progress.streak_days + 1
      WHEN voice_user_progress.last_session_date < CURRENT_DATE - INTERVAL '1 day'
        THEN 1
      ELSE voice_user_progress.streak_days
    END,
    updated_at = NOW();

  -- Actualizar historial diario
  INSERT INTO maity.voice_progress_history (
    user_id, profile_id, date, sessions_count, average_score
  ) VALUES (
    p_user_id, p_profile_id, CURRENT_DATE, 1, p_score
  )
  ON CONFLICT (user_id, profile_id, date) DO UPDATE
  SET
    sessions_count = voice_progress_history.sessions_count + 1,
    average_score = (
      (voice_progress_history.average_score * voice_progress_history.sessions_count + p_score) /
      (voice_progress_history.sessions_count + 1)
    );
END;
$$ LANGUAGE plpgsql;

-- Desbloquear siguiente escenario
CREATE OR REPLACE FUNCTION maity.unlock_next_voice_scenario(
  p_user_id UUID,
  p_profile_id UUID,
  p_current_scenario_id UUID
) RETURNS VOID AS $$
DECLARE
  v_next_order INTEGER;
  v_company_id UUID;
BEGIN
  -- Obtener company_id del usuario
  SELECT company_id INTO v_company_id
  FROM maity.users WHERE id = p_user_id;

  -- Obtener orden del siguiente escenario
  SELECT order_index + 1 INTO v_next_order
  FROM maity.voice_scenarios
  WHERE id = p_current_scenario_id;

  -- Desbloquear siguiente escenario para todas las dificultades
  UPDATE maity.voice_profile_scenarios vps
  SET is_locked = FALSE, updated_at = NOW()
  WHERE vps.profile_id = p_profile_id
    AND vps.scenario_id IN (
      SELECT id FROM maity.voice_scenarios
      WHERE order_index = v_next_order
    )
    AND (vps.company_id = v_company_id OR vps.company_id IS NULL);

  -- Actualizar progreso
  UPDATE maity.voice_user_progress
  SET
    current_scenario_order = v_next_order,
    updated_at = NOW()
  WHERE user_id = p_user_id AND profile_id = p_profile_id;
END;
$$ LANGUAGE plpgsql;
```

### 4.3 Funciones de Gamificación

```sql
-- Migración: 014_create_voice_gamification_functions.sql

-- Verificar y otorgar achievements
CREATE OR REPLACE FUNCTION maity.check_voice_achievements(
  p_user_id UUID,
  p_session_id UUID
) RETURNS SETOF UUID AS $$
DECLARE
  v_achievement RECORD;
  v_unlocked_id UUID;
  v_session_score DECIMAL(5,2);
  v_total_sessions INTEGER;
  v_streak_days INTEGER;
BEGIN
  -- Obtener datos relevantes
  SELECT score INTO v_session_score
  FROM maity.voice_sessions WHERE id = p_session_id;

  SELECT total_sessions, streak_days
  INTO v_total_sessions, v_streak_days
  FROM maity.voice_user_progress
  WHERE user_id = p_user_id;

  -- Verificar cada achievement activo
  FOR v_achievement IN
    SELECT * FROM maity.voice_achievements
    WHERE is_active = TRUE
      AND id NOT IN (
        SELECT achievement_id
        FROM maity.voice_user_achievements
        WHERE user_id = p_user_id
      )
  LOOP
    -- Evaluar criterios según tipo
    IF v_achievement.criteria_type = 'sessions_count'
       AND v_total_sessions >= (v_achievement.criteria_value->>'count')::INTEGER THEN

      INSERT INTO maity.voice_user_achievements (user_id, achievement_id, session_id)
      VALUES (p_user_id, v_achievement.id, p_session_id)
      RETURNING id INTO v_unlocked_id;

      -- Otorgar puntos
      PERFORM maity.award_voice_points(
        p_user_id,
        v_achievement.points,
        'achievement',
        'Achievement: ' || v_achievement.name,
        v_achievement.id
      );

      RETURN NEXT v_achievement.id;

    ELSIF v_achievement.criteria_type = 'score_threshold'
          AND v_session_score >= (v_achievement.criteria_value->>'score')::DECIMAL THEN

      -- Similar lógica para otros tipos...

    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Otorgar puntos
CREATE OR REPLACE FUNCTION maity.award_voice_points(
  p_user_id UUID,
  p_points INTEGER,
  p_type VARCHAR(50),
  p_reason TEXT,
  p_reference_id UUID DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Obtener company_id
  SELECT company_id INTO v_company_id
  FROM maity.users WHERE id = p_user_id;

  -- Registrar en historial
  INSERT INTO maity.voice_points_history (
    user_id, points, points_type, reason, reference_id
  ) VALUES (
    p_user_id, p_points, p_type, p_reason, p_reference_id
  );

  -- Actualizar totales
  INSERT INTO maity.voice_user_points (
    user_id, company_id, total_points, weekly_points, monthly_points
  ) VALUES (
    p_user_id, v_company_id, p_points, p_points, p_points
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    total_points = voice_user_points.total_points + p_points,
    weekly_points = voice_user_points.weekly_points + p_points,
    monthly_points = voice_user_points.monthly_points + p_points,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 FASE 5: VISTAS Y REPORTES
**Duración: 2 días**
**Prioridad: Media**

### 5.1 Vistas de Dashboard

```sql
-- Migración: 015_create_voice_dashboard_views.sql

-- Vista principal del dashboard de usuario
CREATE OR REPLACE VIEW maity.voice_user_dashboard AS
SELECT
  u.id AS user_id,
  u.name AS user_name,
  u.email,
  c.name AS company_name,

  -- Progreso actual
  vup.profile_id,
  vap.name AS current_profile,
  vup.current_scenario_order,
  vup.current_difficulty_level,
  vup.scenarios_completed,
  vup.scenarios_failed,

  -- Estadísticas
  vup.total_sessions,
  vup.total_practice_time,
  vup.average_score,
  vup.best_score,
  vup.streak_days,
  vup.last_session_date,

  -- Gamificación
  vpts.total_points,
  vpts.global_rank,
  vpts.company_rank,
  vup.achievements_unlocked,

  -- Última sesión
  last_session.id AS last_session_id,
  last_session.created_at AS last_session_date_time,
  last_session.score AS last_session_score

FROM maity.users u
LEFT JOIN maity.companies c ON u.company_id = c.id
LEFT JOIN maity.voice_user_progress vup ON u.id = vup.user_id
LEFT JOIN maity.voice_agent_profiles vap ON vup.profile_id = vap.id
LEFT JOIN maity.voice_user_points vpts ON u.id = vpts.user_id
LEFT JOIN LATERAL (
  SELECT id, created_at, score
  FROM maity.voice_sessions
  WHERE user_id = u.id
  ORDER BY created_at DESC
  LIMIT 1
) last_session ON TRUE;

-- Vista de leaderboard
CREATE OR REPLACE VIEW maity.voice_leaderboard AS
WITH ranked_users AS (
  SELECT
    u.id,
    u.name,
    u.email,
    c.name AS company_name,
    vpts.total_points,
    vpts.weekly_points,
    vpts.monthly_points,
    COUNT(DISTINCT vs.id) AS total_sessions,
    AVG(vs.score) AS average_score,
    COUNT(DISTINCT vua.achievement_id) AS achievements_count,
    MAX(vs.created_at) AS last_activity,

    -- Rankings
    ROW_NUMBER() OVER (ORDER BY vpts.total_points DESC) AS global_rank,
    ROW_NUMBER() OVER (PARTITION BY u.company_id ORDER BY vpts.total_points DESC) AS company_rank,
    ROW_NUMBER() OVER (ORDER BY vpts.weekly_points DESC) AS weekly_rank,
    ROW_NUMBER() OVER (ORDER BY vpts.monthly_points DESC) AS monthly_rank

  FROM maity.users u
  LEFT JOIN maity.companies c ON u.company_id = c.id
  LEFT JOIN maity.voice_user_points vpts ON u.id = vpts.user_id
  LEFT JOIN maity.voice_sessions vs ON u.id = vs.user_id AND vs.status = 'completed'
  LEFT JOIN maity.voice_user_achievements vua ON u.id = vua.user_id
  GROUP BY u.id, u.name, u.email, c.name, vpts.total_points,
           vpts.weekly_points, vpts.monthly_points, u.company_id
)
SELECT * FROM ranked_users
ORDER BY global_rank;

-- Vista de métricas por escenario
CREATE OR REPLACE VIEW maity.voice_scenario_performance AS
SELECT
  vs.user_id,
  u.name AS user_name,
  vap.name AS profile_name,
  vsc.name AS scenario_name,
  vdl.name AS difficulty_level,
  COUNT(*) AS attempts,
  AVG(vs.score) AS avg_score,
  MAX(vs.score) AS best_score,
  MIN(vs.score) AS worst_score,
  AVG(vs.duration_seconds) AS avg_duration,
  SUM(CASE WHEN vs.passed THEN 1 ELSE 0 END) AS times_passed,
  SUM(CASE WHEN NOT vs.passed THEN 1 ELSE 0 END) AS times_failed,
  ROUND(100.0 * SUM(CASE WHEN vs.passed THEN 1 ELSE 0 END) / COUNT(*), 2) AS pass_rate

FROM maity.voice_sessions vs
JOIN maity.users u ON vs.user_id = u.id
JOIN maity.voice_profile_scenarios vps ON vs.profile_scenario_id = vps.id
JOIN maity.voice_agent_profiles vap ON vps.profile_id = vap.id
JOIN maity.voice_scenarios vsc ON vps.scenario_id = vsc.id
JOIN maity.voice_difficulty_levels vdl ON vps.difficulty_id = vdl.id
WHERE vs.status = 'completed'
GROUP BY vs.user_id, u.name, vap.name, vsc.name, vdl.name;
```

### 5.2 Vistas para Managers

```sql
-- Migración: 016_create_voice_manager_views.sql

-- Vista de equipo para managers
CREATE OR REPLACE VIEW maity.voice_team_overview AS
SELECT
  c.id AS company_id,
  c.name AS company_name,
  COUNT(DISTINCT u.id) AS total_users,
  COUNT(DISTINCT vs.user_id) AS active_users,
  COUNT(vs.id) AS total_sessions,
  AVG(vs.score) AS team_avg_score,
  SUM(vs.duration_seconds) / 3600.0 AS total_practice_hours,

  -- Métricas de la última semana
  COUNT(DISTINCT CASE
    WHEN vs.created_at >= CURRENT_DATE - INTERVAL '7 days'
    THEN vs.user_id
  END) AS active_users_week,

  COUNT(CASE
    WHEN vs.created_at >= CURRENT_DATE - INTERVAL '7 days'
    THEN 1
  END) AS sessions_this_week,

  AVG(CASE
    WHEN vs.created_at >= CURRENT_DATE - INTERVAL '7 days'
    THEN vs.score
  END) AS avg_score_week

FROM maity.companies c
LEFT JOIN maity.users u ON c.id = u.company_id
LEFT JOIN maity.voice_sessions vs ON u.id = vs.user_id AND vs.status = 'completed'
GROUP BY c.id, c.name;

-- Top performers por empresa
CREATE OR REPLACE VIEW maity.voice_company_top_performers AS
SELECT
  u.company_id,
  u.id AS user_id,
  u.name AS user_name,
  u.email,
  vup.total_sessions,
  vup.average_score,
  vup.scenarios_completed,
  vpts.total_points,
  vpts.company_rank,
  ROW_NUMBER() OVER (
    PARTITION BY u.company_id
    ORDER BY vup.average_score DESC, vup.total_sessions DESC
  ) AS performance_rank

FROM maity.users u
JOIN maity.voice_user_progress vup ON u.id = vup.user_id
LEFT JOIN maity.voice_user_points vpts ON u.id = vpts.user_id
WHERE vup.total_sessions > 0;
```

---

## 🔌 FASE 6: INTEGRACIONES Y APIs
**Duración: 3-4 días**
**Prioridad: Alta**

### 6.1 Funciones RPC para Frontend

```sql
-- Migración: 017_create_voice_rpc_functions.sql

-- Obtener escenarios disponibles para el usuario
CREATE OR REPLACE FUNCTION maity.get_available_voice_scenarios(
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  scenario_id UUID,
  profile_id UUID,
  profile_name VARCHAR,
  scenario_name VARCHAR,
  scenario_order INTEGER,
  difficulty_id UUID,
  difficulty_name VARCHAR,
  difficulty_level INTEGER,
  is_locked BOOLEAN,
  unlock_requirements TEXT,
  best_score DECIMAL,
  attempts INTEGER,
  last_attempt TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Si no se proporciona user_id, usar el del auth context
  p_user_id := COALESCE(p_user_id, (
    SELECT id FROM maity.users WHERE auth_id = auth.uid()
  ));

  RETURN QUERY
  SELECT
    vps.id AS scenario_id,
    vps.profile_id,
    vap.name AS profile_name,
    vs.name AS scenario_name,
    vs.order_index AS scenario_order,
    vps.difficulty_id,
    vdl.name AS difficulty_name,
    vdl.level AS difficulty_level,
    vps.is_locked,
    CASE
      WHEN vps.unlock_after_scenario IS NOT NULL THEN
        'Complete scenario: ' || prev_s.name
      ELSE NULL
    END AS unlock_requirements,
    (
      SELECT MAX(score)
      FROM maity.voice_sessions
      WHERE user_id = p_user_id
        AND profile_scenario_id = vps.id
    ) AS best_score,
    (
      SELECT COUNT(*)
      FROM maity.voice_sessions
      WHERE user_id = p_user_id
        AND profile_scenario_id = vps.id
    ) AS attempts,
    (
      SELECT MAX(created_at)
      FROM maity.voice_sessions
      WHERE user_id = p_user_id
        AND profile_scenario_id = vps.id
    ) AS last_attempt

  FROM maity.voice_profile_scenarios vps
  JOIN maity.voice_agent_profiles vap ON vps.profile_id = vap.id
  JOIN maity.voice_scenarios vs ON vps.scenario_id = vs.id
  JOIN maity.voice_difficulty_levels vdl ON vps.difficulty_id = vdl.id
  LEFT JOIN maity.voice_scenarios prev_s ON vps.unlock_after_scenario = prev_s.id
  WHERE vap.is_active = TRUE
    AND vs.is_active = TRUE
    AND (
      vps.company_id = (SELECT company_id FROM maity.users WHERE id = p_user_id)
      OR vps.company_id IS NULL
    )
  ORDER BY vap.name, vs.order_index, vdl.level;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Obtener estadísticas del usuario
CREATE OR REPLACE FUNCTION maity.get_voice_user_stats(
  p_user_id UUID DEFAULT NULL,
  p_period VARCHAR(20) DEFAULT 'all' -- 'all', 'week', 'month'
)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  p_user_id := COALESCE(p_user_id, (
    SELECT id FROM maity.users WHERE auth_id = auth.uid()
  ));

  WITH user_stats AS (
    SELECT
      COUNT(*) AS total_sessions,
      AVG(score) AS average_score,
      MAX(score) AS best_score,
      SUM(duration_seconds) AS total_practice_seconds,
      COUNT(DISTINCT DATE(created_at)) AS practice_days,
      COUNT(DISTINCT profile_scenario_id) AS unique_scenarios
    FROM maity.voice_sessions
    WHERE user_id = p_user_id
      AND status = 'completed'
      AND CASE
        WHEN p_period = 'week' THEN created_at >= CURRENT_DATE - INTERVAL '7 days'
        WHEN p_period = 'month' THEN created_at >= CURRENT_DATE - INTERVAL '30 days'
        ELSE TRUE
      END
  ),
  achievements AS (
    SELECT COUNT(*) AS total_achievements
    FROM maity.voice_user_achievements
    WHERE user_id = p_user_id
  ),
  points AS (
    SELECT
      total_points,
      global_rank,
      company_rank
    FROM maity.voice_user_points
    WHERE user_id = p_user_id
  ),
  recent_sessions AS (
    SELECT
      json_agg(
        json_build_object(
          'id', vs.id,
          'profile', vap.name,
          'scenario', vsc.name,
          'difficulty', vdl.name,
          'score', vs.score,
          'duration', vs.duration_seconds,
          'date', vs.created_at
        ) ORDER BY vs.created_at DESC
      ) AS sessions
    FROM maity.voice_sessions vs
    JOIN maity.voice_profile_scenarios vps ON vs.profile_scenario_id = vps.id
    JOIN maity.voice_agent_profiles vap ON vps.profile_id = vap.id
    JOIN maity.voice_scenarios vsc ON vps.scenario_id = vsc.id
    JOIN maity.voice_difficulty_levels vdl ON vps.difficulty_id = vdl.id
    WHERE vs.user_id = p_user_id
      AND vs.status = 'completed'
    LIMIT 10
  )
  SELECT json_build_object(
    'summary', json_build_object(
      'total_sessions', COALESCE(us.total_sessions, 0),
      'average_score', ROUND(COALESCE(us.average_score, 0), 2),
      'best_score', COALESCE(us.best_score, 0),
      'total_practice_hours', ROUND(COALESCE(us.total_practice_seconds, 0) / 3600.0, 2),
      'practice_days', COALESCE(us.practice_days, 0),
      'unique_scenarios', COALESCE(us.unique_scenarios, 0)
    ),
    'gamification', json_build_object(
      'total_achievements', COALESCE(a.total_achievements, 0),
      'total_points', COALESCE(p.total_points, 0),
      'global_rank', p.global_rank,
      'company_rank', p.company_rank
    ),
    'recent_sessions', COALESCE(rs.sessions, '[]'::json)
  ) INTO v_stats
  FROM user_stats us
  CROSS JOIN achievements a
  LEFT JOIN points p ON TRUE
  CROSS JOIN recent_sessions rs;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Obtener detalles de sesión
CREATE OR REPLACE FUNCTION maity.get_voice_session_details(
  p_session_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_details JSON;
BEGIN
  SELECT json_build_object(
    'session', row_to_json(vs.*),
    'profile', vap.name,
    'scenario', vsc.name,
    'difficulty', vdl.name,
    'metrics', (
      SELECT json_agg(
        json_build_object(
          'type', vmt.name,
          'value', vsm.metric_value,
          'score', vsm.normalized_score
        )
      )
      FROM maity.voice_session_metrics vsm
      JOIN maity.voice_metric_types vmt ON vsm.metric_type_id = vmt.id
      WHERE vsm.session_id = p_session_id
    ),
    'moments', (
      SELECT json_agg(
        json_build_object(
          'type', moment_type,
          'timestamp', timestamp_seconds,
          'transcript', transcript_snippet,
          'score', score
        ) ORDER BY timestamp_seconds
      )
      FROM maity.voice_session_moments
      WHERE session_id = p_session_id
    )
  ) INTO v_details
  FROM maity.voice_sessions vs
  JOIN maity.voice_profile_scenarios vps ON vs.profile_scenario_id = vps.id
  JOIN maity.voice_agent_profiles vap ON vps.profile_id = vap.id
  JOIN maity.voice_scenarios vsc ON vps.scenario_id = vsc.id
  JOIN maity.voice_difficulty_levels vdl ON vps.difficulty_id = vdl.id
  WHERE vs.id = p_session_id
    AND vs.user_id = (SELECT id FROM maity.users WHERE auth_id = auth.uid());

  RETURN v_details;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

### 6.2 Funciones Administrativas

```sql
-- Migración: 018_create_voice_admin_functions.sql

-- Función para admins: estadísticas de plataforma
CREATE OR REPLACE FUNCTION maity.admin_get_voice_platform_stats()
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  -- Verificar que el usuario sea admin
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles ur
    JOIN maity.users u ON ur.user_id = u.id
    WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  WITH platform_stats AS (
    SELECT
      COUNT(DISTINCT user_id) AS total_users,
      COUNT(*) AS total_sessions,
      AVG(score) AS avg_score,
      SUM(duration_seconds) / 3600.0 AS total_hours,
      COUNT(DISTINCT company_id) AS active_companies
    FROM maity.voice_sessions
    WHERE status = 'completed'
  ),
  daily_stats AS (
    SELECT
      DATE(created_at) AS date,
      COUNT(*) AS sessions,
      COUNT(DISTINCT user_id) AS users,
      AVG(score) AS avg_score
    FROM maity.voice_sessions
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      AND status = 'completed'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  ),
  profile_usage AS (
    SELECT
      vap.name AS profile,
      COUNT(*) AS sessions,
      AVG(vs.score) AS avg_score
    FROM maity.voice_sessions vs
    JOIN maity.voice_profile_scenarios vps ON vs.profile_scenario_id = vps.id
    JOIN maity.voice_agent_profiles vap ON vps.profile_id = vap.id
    WHERE vs.status = 'completed'
    GROUP BY vap.name
  )
  SELECT json_build_object(
    'overview', row_to_json(platform_stats.*),
    'daily_activity', json_agg(DISTINCT daily_stats.*),
    'profile_usage', json_agg(DISTINCT profile_usage.*)
  ) INTO v_stats
  FROM platform_stats
  CROSS JOIN daily_stats
  CROSS JOIN profile_usage;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Función para managers: estadísticas de empresa
CREATE OR REPLACE FUNCTION maity.manager_get_voice_team_stats(
  p_company_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
  v_user_company_id UUID;
BEGIN
  -- Obtener company_id del usuario actual si no se proporciona
  IF p_company_id IS NULL THEN
    SELECT company_id INTO v_user_company_id
    FROM maity.users
    WHERE auth_id = auth.uid();
    p_company_id := v_user_company_id;
  END IF;

  -- Verificar que el usuario sea manager de la empresa
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles ur
    JOIN maity.users u ON ur.user_id = u.id
    WHERE u.auth_id = auth.uid()
      AND ur.role IN ('manager', 'admin')
      AND u.company_id = p_company_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Manager access required for this company';
  END IF;

  SELECT json_build_object(
    'team_overview', (
      SELECT row_to_json(t.*)
      FROM maity.voice_team_overview t
      WHERE t.company_id = p_company_id
    ),
    'top_performers', (
      SELECT json_agg(
        json_build_object(
          'user_id', user_id,
          'name', user_name,
          'email', email,
          'sessions', total_sessions,
          'avg_score', average_score,
          'points', total_points,
          'rank', company_rank
        )
      )
      FROM maity.voice_company_top_performers
      WHERE company_id = p_company_id
        AND performance_rank <= 10
    ),
    'recent_activity', (
      SELECT json_agg(
        json_build_object(
          'user', u.name,
          'profile', vap.name,
          'scenario', vsc.name,
          'score', vs.score,
          'date', vs.created_at
        ) ORDER BY vs.created_at DESC
      )
      FROM maity.voice_sessions vs
      JOIN maity.users u ON vs.user_id = u.id
      JOIN maity.voice_profile_scenarios vps ON vs.profile_scenario_id = vps.id
      JOIN maity.voice_agent_profiles vap ON vps.profile_id = vap.id
      JOIN maity.voice_scenarios vsc ON vps.scenario_id = vsc.id
      WHERE u.company_id = p_company_id
        AND vs.status = 'completed'
      LIMIT 20
    )
  ) INTO v_stats;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

---

## 🧪 FASE 7: TESTING Y VALIDACIÓN
**Duración: 2 días**
**Prioridad: Media**

### 7.1 Datos de Prueba

```sql
-- Migración: 019_create_test_data.sql (Solo para desarrollo)

-- Función para generar datos de prueba
CREATE OR REPLACE FUNCTION maity.generate_voice_test_data()
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_profile_scenario_id UUID;
  v_session_id UUID;
  v_score DECIMAL(5,2);
BEGIN
  -- Solo ejecutar en desarrollo
  IF current_database() = 'production' THEN
    RAISE EXCEPTION 'Cannot run test data generation in production';
  END IF;

  -- Para cada usuario existente
  FOR v_user_id IN
    SELECT id FROM maity.users LIMIT 5
  LOOP
    -- Crear algunas sesiones de prueba
    FOR v_profile_scenario_id IN
      SELECT id FROM maity.voice_profile_scenarios
      WHERE is_locked = FALSE
      LIMIT 3
    LOOP
      -- Generar score aleatorio
      v_score := 60 + random() * 40;

      -- Crear sesión
      INSERT INTO maity.voice_sessions (
        user_id, profile_scenario_id, status,
        started_at, ended_at, duration_seconds,
        score, passed
      ) VALUES (
        v_user_id, v_profile_scenario_id, 'completed',
        NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', 1800,
        v_score, v_score >= 70
      ) RETURNING id INTO v_session_id;

      -- Crear métricas de prueba
      INSERT INTO maity.voice_session_metrics (
        session_id, metric_type_id, metric_value, normalized_score
      )
      SELECT
        v_session_id,
        id,
        50 + random() * 50,
        50 + random() * 50
      FROM maity.voice_metric_types
      LIMIT 5;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 7.2 Tests de Validación

```sql
-- Migración: 020_create_validation_tests.sql

-- Función para validar integridad del sistema
CREATE OR REPLACE FUNCTION maity.validate_voice_system()
RETURNS TABLE (
  test_name VARCHAR(100),
  status VARCHAR(20),
  message TEXT
) AS $$
BEGIN
  -- Test 1: Verificar tablas creadas
  RETURN QUERY
  SELECT
    'Tables exist'::VARCHAR(100),
    CASE
      WHEN COUNT(*) = 20 THEN 'PASS'::VARCHAR(20)
      ELSE 'FAIL'::VARCHAR(20)
    END,
    'Expected 20 voice tables, found ' || COUNT(*)::TEXT
  FROM information_schema.tables
  WHERE table_schema = 'maity'
    AND table_name LIKE 'voice_%';

  -- Test 2: Verificar RLS habilitado
  RETURN QUERY
  SELECT
    'RLS enabled'::VARCHAR(100),
    CASE
      WHEN COUNT(*) >= 2 THEN 'PASS'::VARCHAR(20)
      ELSE 'FAIL'::VARCHAR(20)
    END,
    'RLS enabled on ' || COUNT(*)::TEXT || ' tables'
  FROM pg_tables
  WHERE schemaname = 'maity'
    AND tablename LIKE 'voice_%'
    AND rowsecurity = TRUE;

  -- Test 3: Verificar funciones RPC
  RETURN QUERY
  SELECT
    'RPC functions exist'::VARCHAR(100),
    CASE
      WHEN COUNT(*) >= 10 THEN 'PASS'::VARCHAR(20)
      ELSE 'FAIL'::VARCHAR(20)
    END,
    'Found ' || COUNT(*)::TEXT || ' voice RPC functions'
  FROM information_schema.routines
  WHERE routine_schema = 'maity'
    AND routine_name LIKE '%voice%';

  -- Más tests según necesidad...

  RETURN;
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 FASE 8: DEPLOYMENT Y MONITOREO
**Duración: 1-2 días**
**Prioridad: Alta**

### 8.1 Triggers de Mantenimiento

```sql
-- Migración: 021_create_voice_maintenance.sql

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION maity.update_voice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas con updated_at
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'maity'
      AND table_name LIKE 'voice_%'
      AND column_name = 'updated_at'
  LOOP
    EXECUTE format('
      CREATE TRIGGER trigger_update_%I_updated_at
      BEFORE UPDATE ON maity.%I
      FOR EACH ROW
      EXECUTE FUNCTION maity.update_voice_updated_at()',
      t.table_name, t.table_name
    );
  END LOOP;
END $$;

-- Job para resetear puntos semanales/mensuales
CREATE OR REPLACE FUNCTION maity.reset_voice_periodic_points()
RETURNS VOID AS $$
BEGIN
  -- Reset semanal (ejecutar los lunes)
  IF EXTRACT(DOW FROM CURRENT_DATE) = 1 THEN
    UPDATE maity.voice_user_points
    SET weekly_points = 0
    WHERE weekly_points > 0;
  END IF;

  -- Reset mensual (ejecutar el día 1)
  IF EXTRACT(DAY FROM CURRENT_DATE) = 1 THEN
    UPDATE maity.voice_user_points
    SET monthly_points = 0
    WHERE monthly_points > 0;
  END IF;

  -- Actualizar rankings
  WITH ranked AS (
    SELECT
      user_id,
      ROW_NUMBER() OVER (ORDER BY total_points DESC) AS new_global_rank,
      ROW_NUMBER() OVER (PARTITION BY company_id ORDER BY total_points DESC) AS new_company_rank
    FROM maity.voice_user_points
  )
  UPDATE maity.voice_user_points p
  SET
    global_rank = r.new_global_rank,
    company_rank = r.new_company_rank
  FROM ranked r
  WHERE p.user_id = r.user_id;
END;
$$ LANGUAGE plpgsql;
```

### 8.2 Monitoreo y Alertas

```sql
-- Migración: 022_create_voice_monitoring.sql

-- Vista de salud del sistema
CREATE OR REPLACE VIEW maity.voice_system_health AS
SELECT
  -- Actividad reciente
  (SELECT COUNT(*) FROM maity.voice_sessions
   WHERE created_at >= CURRENT_DATE) AS sessions_today,

  (SELECT COUNT(DISTINCT user_id) FROM maity.voice_sessions
   WHERE created_at >= CURRENT_DATE) AS active_users_today,

  -- Performance
  (SELECT AVG(score) FROM maity.voice_sessions
   WHERE created_at >= CURRENT_DATE AND status = 'completed') AS avg_score_today,

  -- Estado del sistema
  (SELECT COUNT(*) FROM maity.voice_sessions
   WHERE status = 'in_progress'
   AND started_at < NOW() - INTERVAL '2 hours') AS stuck_sessions,

  (SELECT COUNT(*) FROM maity.voice_sessions
   WHERE status = 'evaluating'
   AND ended_at < NOW() - INTERVAL '1 hour') AS pending_evaluations,

  -- Última actividad
  (SELECT MAX(created_at) FROM maity.voice_sessions) AS last_session_created,

  NOW() AS check_time;

-- Función para limpiar sesiones abandonadas
CREATE OR REPLACE FUNCTION maity.cleanup_voice_abandoned_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE maity.voice_sessions
  SET
    status = 'abandoned',
    ended_at = COALESCE(ended_at, NOW()),
    updated_at = NOW()
  WHERE status = 'in_progress'
    AND started_at < NOW() - INTERVAL '3 hours';

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
```

---

## 📝 RESUMEN DE IMPLEMENTACIÓN

### Orden de Ejecución de Migraciones:
1. **Fase 1**: 001-005 (Tablas base y seeds)
2. **Fase 2**: 006-009 (Sesiones y RLS)
3. **Fase 3**: 010-011 (Gamificación)
4. **Fase 4**: 012-014 (Funciones core)
5. **Fase 5**: 015-016 (Vistas)
6. **Fase 6**: 017-018 (RPC y APIs)
7. **Fase 7**: 019-020 (Testing - solo dev)
8. **Fase 8**: 021-022 (Mantenimiento)

### Puntos Clave de Integración:
- ✅ Usa `maity.users.id` como referencia principal
- ✅ Respeta estructura multiempresa existente
- ✅ Compatible con sistema de roles actual
- ✅ RLS implementado para seguridad
- ✅ Funciones RPC siguiendo patrones existentes
- ✅ Preparado para integración con n8n futura

### Métricas de Éxito:
- Usuarios activos diarios > 20%
- Promedio de sesiones por usuario > 3/semana
- Score promedio > 75%
- Tasa de retención > 60% mensual

### Próximos Pasos Post-Implementación:
1. Integración con frontend React existente
2. Configuración de webhooks para n8n
3. Implementación de servicio de IA para evaluación
4. Dashboard de analytics para managers
5. Sistema de notificaciones y recordatorios

**Tiempo Total Estimado**: 18-25 días
**Complejidad**: Media-Alta
**Impacto Esperado**: Alto en engagement y diferenciación