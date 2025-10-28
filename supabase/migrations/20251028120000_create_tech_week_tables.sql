-- ============================================================================
-- TECH WEEK ISOLATED TABLES MIGRATION
-- Purpose: Create separate tables for Tech Week sessions and evaluations
-- Note: These tables are isolated from roleplay (voice_sessions/evaluations)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. CREATE tech_week_sessions TABLE
-- ---------------------------------------------------------------------------

CREATE TABLE maity.tech_week_sessions (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User reference (REQUIRED)
  user_id uuid REFERENCES maity.users(id) NOT NULL,

  -- Session lifecycle
  status varchar DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'evaluating')),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,

  -- Conversation data
  transcript text,

  -- Evaluation results (populated after n8n evaluation)
  score numeric CHECK (score >= 0 AND score <= 100),
  passed boolean,
  processed_feedback jsonb,

  -- Metadata
  session_metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_tech_week_sessions_user_id ON maity.tech_week_sessions(user_id);
CREATE INDEX idx_tech_week_sessions_status ON maity.tech_week_sessions(status);
CREATE INDEX idx_tech_week_sessions_started_at ON maity.tech_week_sessions(started_at DESC);

-- Add table comment
COMMENT ON TABLE maity.tech_week_sessions IS 'Tech Week voice practice sessions - isolated from roleplay system';

-- ---------------------------------------------------------------------------
-- 2. ENABLE RLS ON tech_week_sessions
-- ---------------------------------------------------------------------------

ALTER TABLE maity.tech_week_sessions ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. CREATE RLS POLICIES FOR tech_week_sessions
-- ---------------------------------------------------------------------------

-- Users can view their own Tech Week sessions
CREATE POLICY "Users can view own tech_week_sessions"
  ON maity.tech_week_sessions FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM maity.users WHERE auth_id = auth.uid()
    )
  );

-- Users can insert their own Tech Week sessions
CREATE POLICY "Users can insert own tech_week_sessions"
  ON maity.tech_week_sessions FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM maity.users WHERE auth_id = auth.uid()
    )
  );

-- Users can update their own Tech Week sessions
CREATE POLICY "Users can update own tech_week_sessions"
  ON maity.tech_week_sessions FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM maity.users WHERE auth_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM maity.users WHERE auth_id = auth.uid()
    )
  );

-- Admins can view all Tech Week sessions
CREATE POLICY "Admins can view all tech_week_sessions"
  ON maity.tech_week_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- 4. GRANT PERMISSIONS FOR tech_week_sessions
-- ---------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE ON maity.tech_week_sessions TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. CREATE tech_week_evaluations TABLE
-- ---------------------------------------------------------------------------

CREATE TABLE maity.tech_week_evaluations (
  -- Primary key (used to track n8n workflow)
  request_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  session_id uuid REFERENCES maity.tech_week_sessions(id) NOT NULL,
  user_id uuid REFERENCES maity.users(id) NOT NULL,

  -- Evaluation processing state
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'complete', 'error')),

  -- Results from n8n
  score numeric CHECK (score >= 0 AND score <= 100),
  passed boolean,
  result jsonb,
  error_message text,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_tech_week_evaluations_user_id ON maity.tech_week_evaluations(user_id);
CREATE INDEX idx_tech_week_evaluations_session_id ON maity.tech_week_evaluations(session_id);
CREATE INDEX idx_tech_week_evaluations_request_id ON maity.tech_week_evaluations(request_id);
CREATE INDEX idx_tech_week_evaluations_status ON maity.tech_week_evaluations(status);

-- Add table comment
COMMENT ON TABLE maity.tech_week_evaluations IS 'Evaluation results for Tech Week sessions - processed by n8n workflow';

-- ---------------------------------------------------------------------------
-- 6. ENABLE RLS ON tech_week_evaluations
-- ---------------------------------------------------------------------------

ALTER TABLE maity.tech_week_evaluations ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 7. CREATE RLS POLICIES FOR tech_week_evaluations
-- ---------------------------------------------------------------------------

-- Users can view their own Tech Week evaluations
CREATE POLICY "Users can view own tech_week_evaluations"
  ON maity.tech_week_evaluations FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM maity.users WHERE auth_id = auth.uid()
    )
  );

-- Admins can view all Tech Week evaluations
CREATE POLICY "Admins can view all tech_week_evaluations"
  ON maity.tech_week_evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- 8. GRANT PERMISSIONS FOR tech_week_evaluations
-- ---------------------------------------------------------------------------

GRANT SELECT ON maity.tech_week_evaluations TO authenticated;
-- Note: INSERT/UPDATE handled via RPC functions or service role (n8n webhook)

-- ---------------------------------------------------------------------------
-- 9. CREATE RPC FUNCTION: create_tech_week_session
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION maity.create_tech_week_session(
  p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM maity.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Invalid user_id: user does not exist';
  END IF;

  -- Close any in_progress Tech Week sessions for this user
  UPDATE maity.tech_week_sessions
  SET
    status = 'abandoned',
    ended_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND status = 'in_progress';

  -- Create new Tech Week session
  INSERT INTO maity.tech_week_sessions (
    user_id,
    status,
    started_at
  )
  VALUES (
    p_user_id,
    'in_progress',
    NOW()
  )
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$;

-- Create PUBLIC wrapper for create_tech_week_session
CREATE OR REPLACE FUNCTION public.create_tech_week_session(
  p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.create_tech_week_session(p_user_id);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_tech_week_session(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.create_tech_week_session IS 'Creates a new Tech Week session for a user. Abandons any in-progress sessions.';

-- ---------------------------------------------------------------------------
-- 10. CREATE RPC FUNCTION: create_tech_week_evaluation
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION maity.create_tech_week_evaluation(
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
    SELECT 1 FROM maity.tech_week_sessions
    WHERE id = p_session_id
    AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Invalid session_id: session does not exist or does not belong to user';
  END IF;

  -- Generate unique request_id for n8n tracking
  v_request_id := gen_random_uuid();

  -- Create the evaluation record
  INSERT INTO maity.tech_week_evaluations (
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

  -- Update session status to 'evaluating'
  UPDATE maity.tech_week_sessions
  SET
    status = 'evaluating',
    updated_at = NOW()
  WHERE id = p_session_id;

  RETURN v_request_id;
END;
$$;

-- Create PUBLIC wrapper for create_tech_week_evaluation
CREATE OR REPLACE FUNCTION public.create_tech_week_evaluation(
  p_session_id UUID,
  p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.create_tech_week_evaluation(p_session_id, p_user_id);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_tech_week_evaluation(UUID, UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.create_tech_week_evaluation IS 'Creates evaluation request for Tech Week session. Returns request_id for n8n tracking.';

-- ---------------------------------------------------------------------------
-- 11. ENABLE REALTIME FOR tech_week_evaluations
-- ---------------------------------------------------------------------------

-- Enable realtime updates so frontend can listen for evaluation completion
ALTER PUBLICATION supabase_realtime ADD TABLE maity.tech_week_evaluations;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
