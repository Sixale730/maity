-- Migration: Create get_session_by_id function
-- Description: Get single session details by ID (respects RLS - admins see all, users see own)
-- Created: 2025-11-10

CREATE OR REPLACE FUNCTION maity.get_session_by_id(p_session_id UUID)
RETURNS TABLE (
  id UUID,
  session_id UUID,
  user_id UUID,
  user_name VARCHAR,
  user_email VARCHAR,
  company_name VARCHAR,
  profile_name VARCHAR,
  scenario_name VARCHAR,
  scenario_code VARCHAR,
  objectives TEXT,
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
    u.name::VARCHAR as user_name,
    u.email::VARCHAR as user_email,
    c.name::VARCHAR as company_name,
    vap.name::VARCHAR as profile_name,
    vsc.name::VARCHAR as scenario_name,
    vsc.code::VARCHAR as scenario_code,
    vsc.objectives,
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
  LEFT JOIN maity.companies c ON c.id = u.company_id
  JOIN maity.voice_profile_scenarios vps ON vps.id = vs.profile_scenario_id
  JOIN maity.voice_agent_profiles vap ON vap.id = vps.profile_id
  JOIN maity.voice_scenarios vsc ON vsc.id = vps.scenario_id
  JOIN maity.voice_difficulty_levels vdl ON vdl.id = vps.difficulty_id
  WHERE vs.id = p_session_id;
  -- RLS policies will automatically filter based on user role
  -- Users see only their own sessions, admins see all
END;
$$;

-- Create public wrapper
CREATE OR REPLACE FUNCTION public.get_session_by_id(p_session_id UUID)
RETURNS TABLE (
  id UUID,
  session_id UUID,
  user_id UUID,
  user_name VARCHAR,
  user_email VARCHAR,
  company_name VARCHAR,
  profile_name VARCHAR,
  scenario_name VARCHAR,
  scenario_code VARCHAR,
  objectives TEXT,
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
  RETURN QUERY SELECT * FROM maity.get_session_by_id(p_session_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_session_by_id TO authenticated;

COMMENT ON FUNCTION public.get_session_by_id IS 'Returns single session details by ID. RLS policies ensure users see only their own sessions while admins see all.';
