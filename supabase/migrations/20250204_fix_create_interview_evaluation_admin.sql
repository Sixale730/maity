-- Fix create_interview_evaluation to allow admins to evaluate any session
-- Also add logic to reuse existing evaluations instead of creating duplicates

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
  v_is_admin BOOLEAN;
  v_existing_evaluation_id UUID;
  v_existing_status TEXT;
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

  -- Check if user is admin
  v_is_admin := EXISTS (
    SELECT 1 FROM maity.user_roles
    WHERE user_id = p_user_id
    AND role = 'admin'
  );

  -- Verify session exists and (belongs to user OR user is admin)
  IF NOT EXISTS (
    SELECT 1 FROM maity.interview_sessions
    WHERE id = p_session_id
    AND (user_id = p_user_id OR v_is_admin)
  ) THEN
    IF v_is_admin THEN
      RAISE EXCEPTION 'Session not found: %', p_session_id;
    ELSE
      RAISE EXCEPTION 'Session not found or not authorized: %', p_session_id;
    END IF;
  END IF;

  -- Check if session already has an evaluation
  SELECT evaluation_id INTO v_existing_evaluation_id
  FROM maity.interview_sessions
  WHERE id = p_session_id;

  -- If evaluation exists, check its status
  IF v_existing_evaluation_id IS NOT NULL THEN
    SELECT status INTO v_existing_status
    FROM maity.interview_evaluations
    WHERE request_id = v_existing_evaluation_id;

    -- Reuse existing evaluation if status is 'error' or 'pending'
    IF v_existing_status IN ('error', 'pending') THEN
      -- Reset the evaluation to pending state
      UPDATE maity.interview_evaluations
      SET
        status = 'pending',
        error_message = NULL,
        updated_at = NOW()
      WHERE request_id = v_existing_evaluation_id;

      RETURN v_existing_evaluation_id;
    END IF;

    -- If status is 'complete' or 'processing', create a new evaluation
    -- (This allows re-evaluation even if previous evaluation succeeded)
  END IF;

  -- Generate unique request_id for tracking
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

-- No need to recreate PUBLIC wrapper - it still calls maity.create_interview_evaluation

COMMENT ON FUNCTION maity.create_interview_evaluation(UUID, UUID) IS
'Creates interview evaluation record. Admins can evaluate any session. Reuses existing evaluation if status is error/pending.';
