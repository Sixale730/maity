-- Add objectives field to get_user_sessions_history function
-- This allows the session history page to display scenario objectives

DROP FUNCTION IF EXISTS public.get_user_sessions_history(UUID);
DROP FUNCTION IF EXISTS maity.get_user_sessions_history(UUID);

CREATE OR REPLACE FUNCTION maity.get_user_sessions_history(p_auth_id UUID)
RETURNS TABLE (
  id UUID,
  session_id UUID,
  user_id UUID,
  profile_name VARCHAR,
  scenario_name VARCHAR,
  scenario_code VARCHAR,
  objectives TEXT,  -- NEW FIELD: Objectives from voice_scenarios
  difficulty_level INTEGER,
  score NUMERIC,
  passed BOOLEAN,
  min_score_to_pass NUMERIC,
  processed_feedback JSONB,
  status VARCHAR,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  raw_transcript TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vs.id,
    vs.id as session_id,
    vs.user_id,
    vap.name::VARCHAR as profile_name,
    vsc.name::VARCHAR as scenario_name,
    vsc.code::VARCHAR as scenario_code,
    vsc.objectives,  -- NEW FIELD: Include objectives from voice_scenarios
    vdl.level as difficulty_level,
    vs.score,
    vs.passed,
    vs.min_score_to_pass,
    vs.processed_feedback,
    vs.status::VARCHAR,
    vs.started_at,
    vs.ended_at,
    vs.duration_seconds,
    vs.raw_transcript
  FROM maity.voice_sessions vs
  JOIN maity.users u ON u.id = vs.user_id
  JOIN maity.voice_profile_scenarios vps ON vps.id = vs.profile_scenario_id
  JOIN maity.voice_agent_profiles vap ON vap.id = vps.profile_id
  JOIN maity.voice_scenarios vsc ON vsc.id = vps.scenario_id
  JOIN maity.voice_difficulty_levels vdl ON vdl.id = vps.difficulty_id
  WHERE u.auth_id = p_auth_id
  ORDER BY vs.started_at DESC;
END;
$$;

-- Create public wrapper
CREATE OR REPLACE FUNCTION public.get_user_sessions_history(p_auth_id UUID)
RETURNS TABLE (
  id UUID,
  session_id UUID,
  user_id UUID,
  profile_name VARCHAR,
  scenario_name VARCHAR,
  scenario_code VARCHAR,
  objectives TEXT,  -- NEW FIELD: Objectives from voice_scenarios
  difficulty_level INTEGER,
  score NUMERIC,
  passed BOOLEAN,
  min_score_to_pass NUMERIC,
  processed_feedback JSONB,
  status VARCHAR,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  raw_transcript TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_user_sessions_history(p_auth_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_sessions_history TO authenticated;

COMMENT ON FUNCTION maity.get_user_sessions_history IS 'Returns complete session history for a user with all related details including objectives';
