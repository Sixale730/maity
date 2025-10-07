-- Add objectives field to get_or_create_user_progress function
-- This allows the voice agent to receive scenario objectives

DROP FUNCTION IF EXISTS public.get_or_create_user_progress(UUID, VARCHAR);
DROP FUNCTION IF EXISTS maity.get_or_create_user_progress(UUID, VARCHAR);

CREATE OR REPLACE FUNCTION maity.get_or_create_user_progress(
  p_user_id UUID,
  p_profile_name VARCHAR
)
RETURNS TABLE(
  progress_id UUID,
  current_scenario_order INTEGER,
  scenarios_completed INTEGER,
  current_scenario_id UUID,
  current_scenario_name VARCHAR,
  current_scenario_code VARCHAR,
  is_locked BOOLEAN,
  min_score_to_pass NUMERIC,
  user_instructions TEXT,
  objectives TEXT,  -- NEW FIELD: Objectives from voice_scenarios
  profile_description TEXT,
  profile_key_focus TEXT,
  profile_communication_style TEXT,
  profile_personality_traits JSONB,
  difficulty_level INTEGER,
  difficulty_name VARCHAR,
  difficulty_mood VARCHAR,
  difficulty_objection_frequency NUMERIC,
  difficulty_time_pressure BOOLEAN,
  difficulty_interruption_tendency NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id UUID;
  v_progress_id UUID;
  v_company_id UUID;
BEGIN
  -- Obtener el ID del perfil
  SELECT id INTO v_profile_id
  FROM maity.voice_agent_profiles
  WHERE name = p_profile_name;

  -- Obtener company_id del usuario
  SELECT company_id INTO v_company_id
  FROM maity.users
  WHERE id = p_user_id;

  -- Buscar progreso existente o crear uno nuevo
  INSERT INTO maity.voice_user_progress (
    user_id,
    profile_id,
    company_id,
    current_scenario_order,
    current_difficulty_level
  )
  VALUES (
    p_user_id,
    v_profile_id,
    v_company_id,
    1,
    1
  )
  ON CONFLICT (user_id, profile_id)
  DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_progress_id;

  -- Retornar información completa
  RETURN QUERY
  SELECT
    vup.id as progress_id,
    vup.current_scenario_order,
    vup.scenarios_completed,
    vps.id as current_scenario_id,
    vs.name as current_scenario_name,
    vs.code as current_scenario_code,
    vps.is_locked,
    vps.min_score_to_pass,
    vps.user_instructions,
    vs.objectives,  -- NEW FIELD: Include objectives from voice_scenarios
    -- Información del perfil
    vap.description as profile_description,
    vap.key_focus as profile_key_focus,
    vap.communication_style as profile_communication_style,
    vap.personality_traits as profile_personality_traits,
    -- Información de dificultad
    vdl.level as difficulty_level,
    vdl.name as difficulty_name,
    vdl.mood_preset as difficulty_mood,
    vdl.objection_frequency as difficulty_objection_frequency,
    vdl.time_pressure as difficulty_time_pressure,
    vdl.interruption_tendency as difficulty_interruption_tendency
  FROM maity.voice_user_progress vup
  JOIN maity.voice_agent_profiles vap ON vap.id = vup.profile_id
  JOIN maity.voice_profile_scenarios vps ON vps.profile_id = vup.profile_id
  JOIN maity.voice_scenarios vs ON vs.id = vps.scenario_id
  JOIN maity.voice_difficulty_levels vdl ON vdl.id = vps.difficulty_id
  WHERE vup.id = v_progress_id
    AND vs.order_index = vup.current_scenario_order
    AND vdl.level = vup.current_difficulty_level
  LIMIT 1;
END;
$$;

-- Create public wrapper
CREATE OR REPLACE FUNCTION public.get_or_create_user_progress(
  p_user_id UUID,
  p_profile_name VARCHAR
)
RETURNS TABLE(
  progress_id UUID,
  current_scenario_order INTEGER,
  scenarios_completed INTEGER,
  current_scenario_id UUID,
  current_scenario_name VARCHAR,
  current_scenario_code VARCHAR,
  is_locked BOOLEAN,
  min_score_to_pass NUMERIC,
  user_instructions TEXT,
  objectives TEXT,  -- NEW FIELD: Objectives from voice_scenarios
  profile_description TEXT,
  profile_key_focus TEXT,
  profile_communication_style TEXT,
  profile_personality_traits JSONB,
  difficulty_level INTEGER,
  difficulty_name VARCHAR,
  difficulty_mood VARCHAR,
  difficulty_objection_frequency NUMERIC,
  difficulty_time_pressure BOOLEAN,
  difficulty_interruption_tendency NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_or_create_user_progress(p_user_id, p_profile_name);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_user_progress TO authenticated;

COMMENT ON FUNCTION maity.get_or_create_user_progress IS 'Get or create user progress for a profile with complete scenario information including objectives';
