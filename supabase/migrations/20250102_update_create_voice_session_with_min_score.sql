-- Update create_voice_session to save min_score_to_pass when creating a session
CREATE OR REPLACE FUNCTION maity.create_voice_session(
  p_user_id UUID,
  p_profile_name VARCHAR,
  p_questionnaire_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
  v_company_id UUID;
  v_profile_scenario_id UUID;
  v_profile_id UUID;
  v_current_scenario_order INTEGER;
  v_difficulty_level INTEGER;
  v_min_score_to_pass NUMERIC;
BEGIN
  -- Obtener company_id del usuario
  SELECT company_id INTO v_company_id
  FROM maity.users
  WHERE id = p_user_id;

  -- Obtener el perfil ID
  SELECT id INTO v_profile_id
  FROM maity.voice_agent_profiles
  WHERE name = p_profile_name;

  -- Cerrar todas las sesiones en progreso del usuario para este perfil
  UPDATE maity.voice_sessions
  SET
    status = 'completed',
    ended_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND status = 'in_progress'
    AND profile_scenario_id IN (
      SELECT vps.id
      FROM maity.voice_profile_scenarios vps
      WHERE vps.profile_id = v_profile_id
    );

  -- Obtener el progreso actual del usuario
  SELECT
    vup.current_scenario_order,
    vup.current_difficulty_level
  INTO v_current_scenario_order, v_difficulty_level
  FROM maity.voice_user_progress vup
  WHERE vup.user_id = p_user_id
    AND vup.profile_id = v_profile_id;

  -- Si no existe progreso, usar valores por defecto
  IF v_current_scenario_order IS NULL THEN
    v_current_scenario_order := 1;
    v_difficulty_level := 1;
  END IF;

  -- Obtener el profile_scenario_id y min_score_to_pass correspondiente
  SELECT vps.id, vps.min_score_to_pass
  INTO v_profile_scenario_id, v_min_score_to_pass
  FROM maity.voice_profile_scenarios vps
  JOIN maity.voice_scenarios vs ON vs.id = vps.scenario_id
  WHERE vps.profile_id = v_profile_id
    AND vs.order_index = v_current_scenario_order
    AND vps.difficulty_id = (
      SELECT id FROM maity.voice_difficulty_levels WHERE level = v_difficulty_level
    );

  -- Crear la sesión con min_score_to_pass
  INSERT INTO maity.voice_sessions (
    user_id,
    company_id,
    profile_scenario_id,
    questionnaire_id,
    status,
    started_at,
    min_score_to_pass
  )
  VALUES (
    p_user_id,
    v_company_id,
    v_profile_scenario_id,
    p_questionnaire_id,
    'in_progress',
    NOW(),
    v_min_score_to_pass
  )
  RETURNING id INTO v_session_id;

  -- Actualizar el contador de sesiones totales
  UPDATE maity.voice_user_progress
  SET
    total_sessions = total_sessions + 1,
    last_session_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND profile_id = v_profile_id;

  RETURN v_session_id;
END;
$$;

-- Recreate public wrapper
CREATE OR REPLACE FUNCTION public.create_voice_session(
  p_user_id UUID,
  p_profile_name VARCHAR,
  p_questionnaire_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.create_voice_session(p_user_id, p_profile_name, p_questionnaire_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_voice_session TO authenticated;
