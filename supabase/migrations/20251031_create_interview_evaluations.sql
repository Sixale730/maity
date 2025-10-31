-- ============================================================================
-- INTERVIEW EVALUATIONS MIGRATION
-- Purpose: Create table and functions for interview analysis system
-- Note: Separate from roleplay evaluations, admin-only access
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. CREATE interview_evaluations TABLE
-- ---------------------------------------------------------------------------

CREATE TABLE maity.interview_evaluations (
  -- Primary key (used to track n8n workflow)
  request_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  session_id uuid REFERENCES maity.interview_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES maity.users(id) ON DELETE CASCADE NOT NULL,

  -- Evaluation processing state
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'complete', 'error')),

  -- Results from n8n (text-based analysis)
  analysis_text text,
  interviewee_name text,
  error_message text,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_interview_evaluations_user_id ON maity.interview_evaluations(user_id);
CREATE INDEX idx_interview_evaluations_session_id ON maity.interview_evaluations(session_id);
CREATE INDEX idx_interview_evaluations_request_id ON maity.interview_evaluations(request_id);
CREATE INDEX idx_interview_evaluations_status ON maity.interview_evaluations(status);
CREATE INDEX idx_interview_evaluations_created_at ON maity.interview_evaluations(created_at DESC);

-- Add table comment
COMMENT ON TABLE maity.interview_evaluations IS 'Evaluation results for initial interviews - processed by n8n workflow';
COMMENT ON COLUMN maity.interview_evaluations.analysis_text IS 'AI-generated narrative analysis from n8n';
COMMENT ON COLUMN maity.interview_evaluations.interviewee_name IS 'User name extracted from interview transcript';

-- ---------------------------------------------------------------------------
-- 2. ENABLE RLS ON interview_evaluations
-- ---------------------------------------------------------------------------

ALTER TABLE maity.interview_evaluations ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. CREATE RLS POLICIES FOR interview_evaluations
-- ---------------------------------------------------------------------------

-- Admins can view all interview evaluations
CREATE POLICY "Admins can view all interview_evaluations"
  ON maity.interview_evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Users can view their own interview evaluations
CREATE POLICY "Users can view own interview_evaluations"
  ON maity.interview_evaluations FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM maity.users WHERE auth_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 4. GRANT PERMISSIONS FOR interview_evaluations
-- ---------------------------------------------------------------------------

GRANT SELECT ON maity.interview_evaluations TO authenticated;
-- Note: INSERT/UPDATE handled via RPC functions or service role (n8n webhook)

-- ---------------------------------------------------------------------------
-- 5. ADD evaluation_id COLUMN TO interview_sessions
-- ---------------------------------------------------------------------------

-- Add optional FK to link session with its evaluation
ALTER TABLE maity.interview_sessions
ADD COLUMN evaluation_id uuid REFERENCES maity.interview_evaluations(request_id) ON DELETE SET NULL;

-- Add index
CREATE INDEX idx_interview_sessions_evaluation_id ON maity.interview_sessions(evaluation_id);

-- Add comment
COMMENT ON COLUMN maity.interview_sessions.evaluation_id IS 'Reference to the evaluation request (if created)';

-- ---------------------------------------------------------------------------
-- 6. CREATE RPC FUNCTION: create_interview_evaluation
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION maity.create_interview_evaluation(
  p_session_id UUID,
  p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $$
DECLARE
  v_request_id UUID;
  v_auth_id UUID;
BEGIN
  -- Get the current authenticated user
  v_auth_id := auth.uid();

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Verify the user_id belongs to the authenticated user
  IF NOT EXISTS (
    SELECT 1 FROM maity.users
    WHERE id = p_user_id
    AND auth_id = v_auth_id
  ) THEN
    RAISE EXCEPTION 'Invalid user_id: does not match authenticated user';
  END IF;

  -- Verify session exists and belongs to the user
  IF NOT EXISTS (
    SELECT 1 FROM maity.interview_sessions
    WHERE id = p_session_id
    AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Invalid session_id: session does not exist or does not belong to user';
  END IF;

  -- Generate unique request_id for n8n tracking
  v_request_id := gen_random_uuid();

  -- Create the evaluation record
  INSERT INTO maity.interview_evaluations (
    request_id,
    user_id,
    session_id,
    status
  ) VALUES (
    v_request_id,
    p_user_id,
    p_session_id,
    'pending'
  );

  -- Update session with evaluation_id reference
  UPDATE maity.interview_sessions
  SET
    evaluation_id = v_request_id,
    updated_at = NOW()
  WHERE id = p_session_id;

  RETURN v_request_id;
END;
$$;

-- Create PUBLIC wrapper for create_interview_evaluation
CREATE OR REPLACE FUNCTION public.create_interview_evaluation(
  p_session_id UUID,
  p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.create_interview_evaluation(p_session_id, p_user_id);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_interview_evaluation(UUID, UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.create_interview_evaluation IS 'Creates evaluation request for interview session. Returns request_id for n8n tracking.';

-- ---------------------------------------------------------------------------
-- 7. CREATE RPC FUNCTION: get_interview_sessions_history
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

  -- Return sessions with evaluation data
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
    LEFT(e.analysis_text, 150) AS analysis_preview,
    s.created_at
  FROM maity.interview_sessions s
  JOIN maity.users u ON u.id = s.user_id
  LEFT JOIN maity.interview_evaluations e ON e.request_id = s.evaluation_id
  WHERE (p_user_id IS NULL OR s.user_id = p_user_id)
  ORDER BY s.created_at DESC;
END;
$$;

-- Create PUBLIC wrapper for get_interview_sessions_history
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_interview_sessions_history(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_interview_sessions_history IS 'Gets interview sessions history. Admins see all, users see only their own.';

-- ---------------------------------------------------------------------------
-- 8. ENABLE REALTIME FOR interview_evaluations
-- ---------------------------------------------------------------------------

-- Enable realtime updates so frontend can listen for evaluation completion
ALTER PUBLICATION supabase_realtime ADD TABLE maity.interview_evaluations;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
