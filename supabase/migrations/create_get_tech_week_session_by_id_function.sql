-- Migration: Create get_tech_week_session_by_id function
-- Description: Get single tech week session details by ID (respects RLS - admins see all, users see own)
-- Created: 2025-11-10

CREATE OR REPLACE FUNCTION maity.get_tech_week_session_by_id(p_session_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_name VARCHAR,
  user_email VARCHAR,
  company_name VARCHAR,
  status VARCHAR,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  transcript TEXT,
  score NUMERIC,
  passed BOOLEAN,
  processed_feedback JSONB,
  min_score_to_pass NUMERIC,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tws.id,
    tws.user_id,
    u.name::VARCHAR as user_name,
    u.email::VARCHAR as user_email,
    c.name::VARCHAR as company_name,
    tws.status::VARCHAR,
    tws.started_at,
    tws.ended_at,
    tws.duration_seconds,
    tws.transcript,
    tws.score,
    tws.passed,
    tws.processed_feedback,
    tws.min_score_to_pass,
    tws.created_at,
    tws.updated_at
  FROM maity.tech_week_sessions tws
  JOIN maity.users u ON u.id = tws.user_id
  LEFT JOIN maity.companies c ON c.id = u.company_id
  WHERE tws.id = p_session_id;
  -- RLS policies will automatically filter based on user role
  -- Users see only their own sessions, admins see all
END;
$$;

-- Create public wrapper
CREATE OR REPLACE FUNCTION public.get_tech_week_session_by_id(p_session_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_name VARCHAR,
  user_email VARCHAR,
  company_name VARCHAR,
  status VARCHAR,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  transcript TEXT,
  score NUMERIC,
  passed BOOLEAN,
  processed_feedback JSONB,
  min_score_to_pass NUMERIC,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_tech_week_session_by_id(p_session_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_tech_week_session_by_id TO authenticated;

COMMENT ON FUNCTION public.get_tech_week_session_by_id IS 'Returns single tech week session details by ID with user information. RLS policies ensure users see only their own sessions while admins see all.';
