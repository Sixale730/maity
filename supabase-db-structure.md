# Estructura de Base de Datos para Sistema de Agentes de Voz

## 📊 Tablas Principales

### 1. **profiles** (Perfiles de agentes)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL, -- 'CEO', 'CTO', 'CFO'
  description TEXT,
  key_focus TEXT, -- 'números', 'visión', 'técnico'
  communication_style TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. **scenarios** (Escenarios base)
```sql
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL, -- 'Primera visita', 'Presentación', etc.
  order_index INTEGER NOT NULL, -- 1, 2, 3, 4, 5
  base_context TEXT NOT NULL, -- Contexto general del escenario
  objectives JSONB, -- Objetivos específicos del escenario
  estimated_duration INTEGER DEFAULT 300, -- segundos (5 min default)
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. **difficulty_levels** (Niveles de dificultad)
```sql
CREATE TABLE difficulty_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER NOT NULL, -- 1, 2, 3
  name VARCHAR(50) NOT NULL, -- 'Fácil', 'Medio', 'Difícil'
  mood_preset VARCHAR(50), -- 'receptivo', 'neutral', 'escéptico'
  objection_frequency DECIMAL(3,2), -- 0.2, 0.5, 0.8
  time_pressure BOOLEAN DEFAULT FALSE,
  interruption_tendency DECIMAL(3,2), -- 0.1, 0.3, 0.6
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. **profile_scenarios** (Configuración específica por perfil)
```sql
CREATE TABLE profile_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  difficulty_id UUID REFERENCES difficulty_levels(id),
  specific_context TEXT, -- Contexto adaptado al perfil
  key_objections JSONB, -- Objeciones típicas de ese perfil
  success_criteria JSONB, -- Criterios específicos del perfil
  talking_points JSONB, -- Puntos clave que el agente mencionará
  is_locked BOOLEAN DEFAULT TRUE, -- Se desbloquea progresivamente
  UNIQUE(profile_id, scenario_id, difficulty_id)
);
```

### 5. **sessions** (Sesiones de práctica)
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_scenario_id UUID REFERENCES profile_scenarios(id),
  status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_seconds INTEGER,
  recording_url TEXT, -- URL del audio si lo guardas
  raw_transcript TEXT, -- Transcripción cruda
  processed_feedback JSONB, -- Feedback procesado de n8n
  score DECIMAL(5,2), -- Puntuación 0-100
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 6. **session_metrics** (Métricas detalladas)
```sql
CREATE TABLE session_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  metric_type VARCHAR(50), -- 'talk_ratio', 'objection_handling', etc.
  metric_value DECIMAL(10,2),
  metadata JSONB, -- Datos adicionales de la métrica
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7. **user_progress** (Progreso del usuario)
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id),
  current_scenario_order INTEGER DEFAULT 1,
  scenarios_completed INTEGER DEFAULT 0,
  total_practice_time INTEGER DEFAULT 0, -- segundos totales
  average_score DECIMAL(5,2),
  last_session_date TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, profile_id)
);
```

### 8. **achievements** (Logros/Gamificación - Opcional para MVP)
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  criteria JSONB, -- Condiciones para obtenerlo
  icon_url TEXT,
  points INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 9. **user_achievements** (Logros desbloqueados)
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

## 🚀 Datos Iniciales (Seeds)

### Insertar Perfiles
```sql
INSERT INTO profiles (name, description, key_focus, communication_style) VALUES
('CEO', 'Director Ejecutivo - Enfocado en visión y ROI', 'Visión estratégica, ROI, crecimiento del negocio', 'Directo, tiempo limitado, orientado a resultados'),
('CTO', 'Director de Tecnología - Enfocado en arquitectura y capacidades', 'Especificaciones técnicas, integraciones, seguridad', 'Detallista, analítico, busca profundidad técnica'),
('CFO', 'Director Financiero - Enfocado en números y presupuesto', 'Costos, presupuesto, métricas financieras, TCO', 'Analítico, conservador, orientado a números');
```

### Insertar Escenarios
```sql
INSERT INTO scenarios (name, order_index, base_context, objectives) VALUES
('Primera visita', 1, 'Primer contacto con el prospecto para entender sus necesidades', '{"main": "Identificar pain points", "secondary": ["Establecer rapport", "Calificar al lead"]}'),
('Presentación de producto', 2, 'Demostración de la solución adaptada a sus necesidades', '{"main": "Mostrar valor", "secondary": ["Conectar features con necesidades", "Generar interés"]}'),
('Manejo de objeciones', 3, 'El cliente presenta dudas y objeciones sobre la solución', '{"main": "Resolver objeciones", "secondary": ["Mantener confianza", "Reforzar valor"]}'),
('Cierre', 4, 'Negociación final y cierre de la venta', '{"main": "Cerrar el deal", "secondary": ["Negociar términos", "Asegurar compromiso"]}'),
('Postventa', 5, 'Seguimiento inicial después de la implementación', '{"main": "Asegurar satisfacción", "secondary": ["Identificar upsell", "Obtener referidos"]}');
```

### Insertar Niveles de Dificultad
```sql
INSERT INTO difficulty_levels (level, name, mood_preset, objection_frequency, time_pressure, interruption_tendency) VALUES
(1, 'Fácil', 'receptivo', 0.2, FALSE, 0.1),
(2, 'Medio', 'neutral', 0.5, FALSE, 0.3),
(3, 'Difícil', 'escéptico', 0.8, TRUE, 0.5);
```

## 🔐 Row Level Security (RLS)

### Para la tabla sessions
```sql
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id);
```

### Para la tabla user_progress
```sql
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);
```

## 📈 Vistas Útiles

### Vista de Dashboard del Usuario
```sql
CREATE VIEW user_dashboard AS
SELECT 
  u.id as user_id,
  p.name as current_profile,
  up.current_scenario_order,
  up.scenarios_completed,
  up.average_score,
  up.total_practice_time,
  COUNT(DISTINCT s.id) as total_sessions,
  MAX(s.created_at) as last_practice
FROM 
  auth.users u
  LEFT JOIN user_progress up ON u.id = up.user_id
  LEFT JOIN profiles p ON up.profile_id = p.id
  LEFT JOIN sessions s ON u.id = s.user_id
GROUP BY 
  u.id, p.name, up.current_scenario_order, 
  up.scenarios_completed, up.average_score, up.total_practice_time;
```

### Vista de Leaderboard
```sql
CREATE VIEW leaderboard AS
SELECT 
  u.email,
  COUNT(DISTINCT s.id) as total_sessions,
  AVG(s.score) as average_score,
  SUM(s.duration_seconds) as total_practice_time,
  COUNT(DISTINCT ua.achievement_id) as achievements_count
FROM 
  auth.users u
  LEFT JOIN sessions s ON u.id = s.user_id
  LEFT JOIN user_achievements ua ON u.id = ua.user_id
WHERE 
  s.status = 'completed'
GROUP BY 
  u.id, u.email
ORDER BY 
  average_score DESC, total_sessions DESC;
```

## 🔄 Funciones de Base de Datos

### Función para desbloquear siguiente escenario
```sql
CREATE OR REPLACE FUNCTION unlock_next_scenario(p_user_id UUID, p_profile_id UUID)
RETURNS void AS $$
DECLARE
  v_current_order INTEGER;
BEGIN
  -- Obtener el orden actual
  SELECT current_scenario_order INTO v_current_order
  FROM user_progress
  WHERE user_id = p_user_id AND profile_id = p_profile_id;
  
  -- Desbloquear el siguiente escenario
  UPDATE profile_scenarios ps
  SET is_locked = FALSE
  WHERE ps.profile_id = p_profile_id
    AND ps.scenario_id IN (
      SELECT id FROM scenarios 
      WHERE order_index = v_current_order + 1
    );
    
  -- Actualizar progreso
  UPDATE user_progress
  SET current_scenario_order = v_current_order + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id AND profile_id = p_profile_id;
END;
$$ LANGUAGE plpgsql;
```

## 💡 Recomendaciones de Implementación

### Estados de Ánimo por Dificultad:
- **Fácil**: Cliente receptivo, pocas interrupciones, abierto a escuchar
- **Medio**: Cliente neutral, algunas objeciones, tiempo moderado
- **Difícil**: Cliente escéptico, muchas objeciones, con prisa, interrumpe frecuentemente

### Métricas Clave a Rastrear:
1. **Talk Ratio**: Porcentaje de tiempo que habla el vendedor vs cliente
2. **Response Time**: Tiempo de respuesta a objeciones
3. **Keywords Hit**: Palabras clave mencionadas según el perfil
4. **Objection Resolution**: Objeciones resueltas exitosamente
5. **Closing Strength**: Fuerza del cierre (basado en técnicas usadas)

### Flujo de Desbloqueo:
1. Usuario completa escenario con score >= 70
2. Se desbloquea el siguiente escenario del mismo perfil
3. Al completar los 5 escenarios, se sugiere cambiar de perfil
4. Opcional: Desbloquear dificultades superiores con scores altos

### Integración con n8n:
- Webhook en Supabase cuando se crea una sesión
- n8n procesa la transcripción
- n8n actualiza `processed_feedback` y `score` en la sesión
- n8n inserta métricas detalladas en `session_metrics`

## 🎯 MVP Mínimo:
1. Implementar tablas: profiles, scenarios, difficulty_levels, profile_scenarios, sessions
2. Crear las políticas RLS básicas
3. Insertar datos seed
4. Vista de dashboard simple
5. Agregar user_progress y métricas después del primer release