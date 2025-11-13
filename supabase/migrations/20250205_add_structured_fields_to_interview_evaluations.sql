-- ============================================================================
-- ADD STRUCTURED FIELDS TO INTERVIEW EVALUATIONS
-- Purpose: Add structured analysis fields and improve preview generation
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. ADD STRUCTURED FIELDS TO interview_evaluations
-- ---------------------------------------------------------------------------

ALTER TABLE maity.interview_evaluations
ADD COLUMN IF NOT EXISTS rubrics JSONB,
ADD COLUMN IF NOT EXISTS key_observations JSONB,
ADD COLUMN IF NOT EXISTS amazing_comment TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS is_complete BOOLEAN,
-- Legacy structured fields (for backwards compatibility with old n8n format)
ADD COLUMN IF NOT EXISTS recomendaciones_prioritarias JSONB,
ADD COLUMN IF NOT EXISTS patrones_observados JSONB,
ADD COLUMN IF NOT EXISTS conclusion_general TEXT,
ADD COLUMN IF NOT EXISTS siguiente_paso_sugerido TEXT;

-- Add comments
COMMENT ON COLUMN maity.interview_evaluations.rubrics IS 'Structured rubric scores (claridad, adaptacion, persuasion, estructura, proposito, empatia)';
COMMENT ON COLUMN maity.interview_evaluations.key_observations IS 'Array of key observations from the interview';
COMMENT ON COLUMN maity.interview_evaluations.amazing_comment IS 'Surprising or impressive observation from the analysis';
COMMENT ON COLUMN maity.interview_evaluations.summary IS 'Overall summary of the interview (2-3 sentences)';
COMMENT ON COLUMN maity.interview_evaluations.is_complete IS 'Whether the interview met completion criteria';

-- ---------------------------------------------------------------------------
-- 2. UPDATE get_interview_sessions_history TO GENERATE SMART PREVIEW
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION maity.get_interview_sessions_history(
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  session_id UUID,
  user_id UUID,
  user_name TEXT,
  interviewee_name TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  status TEXT,
  evaluation_status TEXT,
  analysis_preview TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $$
DECLARE
  v_auth_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- Get authenticated user
  v_auth_id := auth.uid();

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM maity.user_roles ur
    JOIN maity.users u ON u.id = ur.user_id
    WHERE u.auth_id = v_auth_id AND ur.role = 'admin'
  ) INTO v_is_admin;

  -- If not admin and p_user_id is NULL or different from current user, raise error
  IF NOT v_is_admin THEN
    IF p_user_id IS NULL THEN
      -- Get user_id for current auth user
      SELECT id INTO p_user_id FROM maity.users WHERE auth_id = v_auth_id;
    ELSIF NOT EXISTS (
      SELECT 1 FROM maity.users WHERE id = p_user_id AND auth_id = v_auth_id
    ) THEN
      RAISE EXCEPTION 'Access denied: cannot view other users sessions';
    END IF;
  END IF;

  -- Return sessions with evaluation data and smart preview
  RETURN QUERY
  SELECT
    s.id AS session_id,
    s.user_id,
    u.name AS user_name,
    e.interviewee_name,
    s.started_at,
    s.ended_at,
    s.duration_seconds,
    s.status,
    e.status AS evaluation_status,
    -- Smart preview: use summary if available, otherwise try to extract from analysis_text
    COALESCE(
      -- First try: direct summary field
      LEFT(e.summary, 150),
      -- Second try: extract first key observation
      CASE
        WHEN jsonb_array_length(COALESCE(e.key_observations, '[]'::jsonb)) > 0
        THEN LEFT(e.key_observations->>0, 150)
        ELSE NULL
      END,
      -- Third try: try to parse summary from analysis_text JSON
      CASE
        WHEN e.analysis_text IS NOT NULL AND e.analysis_text ~ '^\s*\{' THEN
          COALESCE(
            LEFT((e.analysis_text::jsonb)->>'summary', 150),
            LEFT((e.analysis_text::jsonb)->'key_observations'->>0, 150)
          )
        ELSE NULL
      END,
      -- Last resort: first 150 chars of plain text
      LEFT(e.analysis_text, 150)
    ) AS analysis_preview,
    s.created_at
  FROM maity.interview_sessions s
  JOIN maity.users u ON u.id = s.user_id
  LEFT JOIN maity.interview_evaluations e ON e.request_id = s.evaluation_id
  WHERE (p_user_id IS NULL OR s.user_id = p_user_id)
  ORDER BY s.created_at DESC;
END;
$$;

-- Update PUBLIC wrapper (no changes needed, just recreate)
CREATE OR REPLACE FUNCTION public.get_interview_sessions_history(
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  session_id UUID,
  user_id UUID,
  user_name TEXT,
  interviewee_name TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  status TEXT,
  evaluation_status TEXT,
  analysis_preview TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_interview_sessions_history(p_user_id);
END;
$$;

-- Comment
COMMENT ON FUNCTION public.get_interview_sessions_history IS 'Gets interview sessions history with smart preview from summary/observations. Admins see all, users see only their own.';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
