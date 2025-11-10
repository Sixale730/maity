-- Migration: Create get_session_details_admin function for admin access to session details
-- Description: Allows admins to view full session details for any user
-- Created: 2025-11-10

-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.get_session_details_admin(UUID);
DROP FUNCTION IF EXISTS maity.get_session_details_admin(UUID);

-- Create function in maity schema
CREATE OR REPLACE FUNCTION maity.get_session_details_admin(
  p_session_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_result JSON;
BEGIN
  -- Check if caller is admin
  SELECT EXISTS (
    SELECT 1 FROM maity.user_roles
    WHERE user_id = (SELECT id FROM maity.users WHERE auth_id = auth.uid())
      AND role = 'admin'
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can access this function'
      USING ERRCODE = '42501';
  END IF;

  -- Try to find session in voice_sessions first
  SELECT json_build_object(
    'sessionId', vs.id,
    'type', CASE
      WHEN vap.name = 'Tech Week' THEN 'tech_week'
      ELSE 'roleplay'
    END,
    'userId', vs.user_id,
    'userName', u.name,
    'userEmail', u.email,
    'companyId', vs.company_id,
    'companyName', c.name,
    'profileName', vap.name,
    'scenarioName', vsc.name,
    'status', vs.status,
    'startedAt', vs.started_at,
    'endedAt', vs.ended_at,
    'duration', vs.duration_seconds,
    'score', vs.score,
    'passed', vs.passed,
    'conversationId', vs.conversation_id,
    'questionnaireId', vs.questionnaire_id,
    'profileScenarioId', vs.profile_scenario_id
  )
  FROM maity.voice_sessions vs
  JOIN maity.users u ON vs.user_id = u.id
  LEFT JOIN maity.companies c ON vs.company_id = c.id
  JOIN maity.voice_profile_scenarios vps ON vs.profile_scenario_id = vps.id
  JOIN maity.voice_agent_profiles vap ON vps.profile_id = vap.id
  JOIN maity.voice_scenarios vsc ON vps.scenario_id = vsc.id
  WHERE vs.id = p_session_id
  INTO v_result;

  -- If found in voice_sessions, return it
  IF v_result IS NOT NULL THEN
    RETURN v_result;
  END IF;

  -- Otherwise, try interview_sessions
  SELECT json_build_object(
    'sessionId', ins.id,
    'type', 'interview',
    'userId', ins.user_id,
    'userName', u.name,
    'userEmail', u.email,
    'companyId', u.company_id,
    'companyName', c.name,
    'status', ins.status,
    'startedAt', ins.started_at,
    'endedAt', ins.ended_at,
    'duration', ins.duration_seconds,
    'score', ins.score,
    'passed', ins.passed,
    'conversationId', ins.conversation_id
  )
  FROM maity.interview_sessions ins
  JOIN maity.users u ON ins.user_id = u.id
  LEFT JOIN maity.companies c ON u.company_id = c.id
  WHERE ins.id = p_session_id
  INTO v_result;

  -- If found in interview_sessions, return it
  IF v_result IS NOT NULL THEN
    RETURN v_result;
  END IF;

  -- Session not found
  RAISE EXCEPTION 'Session not found: %', p_session_id
    USING ERRCODE = '42P01';
END;
$$;

-- Create public wrapper
CREATE OR REPLACE FUNCTION public.get_session_details_admin(p_session_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.get_session_details_admin(p_session_id);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_session_details_admin TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_session_details_admin IS 'Admin-only function to retrieve full session details for any session (voice_sessions or interview_sessions). Returns JSON with session type, user info, company info, and all session fields.';
