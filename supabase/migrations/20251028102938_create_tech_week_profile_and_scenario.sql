-- Migration: Create Tech Week Profile and Scenario
-- Purpose: Add Tech Week as a new voice agent profile for admin-only testing
-- Date: 2025-10-28

-- ==================================================================
-- STEP 1: Create Tech Week Voice Agent Profile
-- ==================================================================

INSERT INTO maity.voice_agent_profiles (
  id,
  name,
  description,
  key_focus,
  communication_style,
  created_at
) VALUES (
  gen_random_uuid(),
  'Tech Week',
  'Agente especializado para sesiones de Tech Week - eventos de tecnología y práctica intensiva.',
  'Evaluación técnica, presentación de proyectos, y práctica de habilidades de comunicación en contextos tecnológicos.',
  'Profesional y técnico, con enfoque en innovación y colaboración. Simula conversaciones típicas de eventos tech, pitch sessions, y networking profesional.',
  now()
)
ON CONFLICT (name) DO NOTHING;

-- ==================================================================
-- STEP 2: Create Tech Week Scenario
-- ==================================================================

INSERT INTO maity.voice_scenarios (
  id,
  name,
  code,
  order_index,
  context,
  instructions,
  rules,
  closing,
  objectives,
  created_at
) VALUES (
  gen_random_uuid(),
  'Tech Week - Sesión General',
  'tech_week_general',
  1,
  'Estás participando en un evento de Tech Week. Este es un espacio para practicar presentaciones técnicas, pitch de proyectos, y conversaciones profesionales en el ecosistema tecnológico. El agente actuará como un evaluador técnico, inversionista, o profesional del sector tech.',
  'Durante esta sesión, el agente Tech Week interactuará contigo simulando diferentes escenarios típicos de eventos tecnológicos: pitch sessions, networking profesional, presentaciones técnicas, o entrevistas técnicas. Prepárate para comunicar tus ideas de forma clara, responder preguntas técnicas, y demostrar tu capacidad de comunicación profesional.',
  'El agente adaptará su nivel de exigencia según tu desempeño, manteniendo un balance entre retroalimentación constructiva y desafío profesional. Se enfocará en evaluar claridad de comunicación, conocimiento técnico, y habilidades de presentación.',
  'Al finalizar, recibirás feedback sobre tu desempeño en: claridad de comunicación, manejo de preguntas técnicas, capacidad de síntesis, y profesionalismo general.',
  jsonb_build_array(
    jsonb_build_object(
      'id', 'objective_1',
      'description', 'Comunicar ideas técnicas de forma clara y accesible'
    ),
    jsonb_build_object(
      'id', 'objective_2',
      'description', 'Responder preguntas técnicas con confianza y precisión'
    ),
    jsonb_build_object(
      'id', 'objective_3',
      'description', 'Demostrar profesionalismo y habilidades de networking'
    )
  ),
  now()
)
ON CONFLICT (code) DO NOTHING;

-- ==================================================================
-- STEP 3: Create Voice Profile Scenario (Link Profile + Scenario)
-- ==================================================================

INSERT INTO maity.voice_profile_scenarios (
  id,
  profile_id,
  scenario_id,
  difficulty_id,
  company_id,
  specific_context,
  key_objections,
  success_criteria,
  talking_points,
  user_instructions,
  min_score_to_pass,
  is_locked,
  unlock_after_scenario,
  created_at
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM maity.voice_agent_profiles WHERE name = 'Tech Week'),
  (SELECT id FROM maity.voice_scenarios WHERE code = 'tech_week_general'),
  (SELECT id FROM maity.voice_difficulty_levels WHERE name = 'Medio' LIMIT 1), -- Default to Medium difficulty
  NULL, -- NULL = global, not company-specific
  'Sesión de práctica general para Tech Week - adaptable a múltiples contextos tecnológicos.',
  jsonb_build_array(
    'Falta de claridad técnica',
    'Respuestas demasiado técnicas o demasiado simples',
    'Dificultad para sintetizar ideas complejas'
  ),
  jsonb_build_array(
    'Comunicación clara de conceptos técnicos',
    'Respuestas concisas y al punto',
    'Manejo profesional de preguntas desafiantes',
    'Capacidad de adaptar el mensaje a la audiencia'
  ),
  jsonb_build_array(
    'Preparar elevator pitch de 60 segundos',
    'Conocer bien tu proyecto o área de expertise',
    'Practicar respuestas a preguntas frecuentes',
    'Mantener profesionalismo y confianza'
  ),
  '🚀 Descripción de la actividad

Este es un ejercicio de práctica para Tech Week - un evento donde profesionales tech presentan proyectos, hacen networking, y participan en sesiones técnicas.

🎯 Objetivo

Desarrollar tu capacidad para comunicar ideas técnicas de forma clara, responder preguntas con confianza, y presentarte profesionalmente en el ecosistema tecnológico.

✅ ¿Qué debes hacer?

• Presenta tu proyecto o área de expertise de forma clara y concisa
• Responde preguntas técnicas con precisión y confianza
• Mantén un balance entre profundidad técnica y claridad
• Demuestra profesionalismo y habilidades de comunicación
• Cierra con siguientes pasos o llamados a la acción

💡 Tip: Adapta tu nivel de tecnicismo según tu interlocutor. Sé claro, conciso, y profesional.',
  70.00, -- Minimum score to pass
  false, -- Not locked - available immediately for admins
  NULL, -- No prerequisite scenario
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM maity.voice_profile_scenarios vps
  WHERE vps.profile_id = (SELECT id FROM maity.voice_agent_profiles WHERE name = 'Tech Week')
    AND vps.scenario_id = (SELECT id FROM maity.voice_scenarios WHERE code = 'tech_week_general')
);

-- ==================================================================
-- STEP 4: Verify Permissions (already granted globally, but good to verify)
-- ==================================================================

-- Ensure authenticated users can read these tables
GRANT SELECT ON maity.voice_agent_profiles TO authenticated;
GRANT SELECT ON maity.voice_scenarios TO authenticated;
GRANT SELECT ON maity.voice_difficulty_levels TO authenticated;
GRANT SELECT ON maity.voice_profile_scenarios TO authenticated;

-- ==================================================================
-- STEP 5: Add Comment for Documentation
-- ==================================================================

COMMENT ON TABLE maity.voice_agent_profiles IS 'Voice agent profiles including Tech Week for admin testing';
COMMENT ON TABLE maity.voice_scenarios IS 'Voice practice scenarios including Tech Week general session';
