-- Create RPC function for creating evaluations
-- This function bypasses RLS and ensures proper user validation

CREATE OR REPLACE FUNCTION maity.create_evaluation(
  p_request_id UUID,
  p_user_id UUID,
  p_session_id UUID DEFAULT NULL
) RETURNS maity.evaluations AS $$
DECLARE
  v_evaluation maity.evaluations;
  v_auth_id UUID;
BEGIN
  -- Get the current auth user
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
    RAISE EXCEPTION 'Invalid user_id';
  END IF;

  -- Verify session_id belongs to the user if provided
  IF p_session_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM maity.voice_sessions
      WHERE id = p_session_id
      AND user_id = p_user_id
    ) THEN
      RAISE EXCEPTION 'Invalid session_id';
    END IF;
  END IF;

  -- Create the evaluation
  INSERT INTO maity.evaluations (
    user_id,
    request_id,
    session_id,
    status
  ) VALUES (
    p_user_id,
    p_request_id,
    p_session_id,
    'pending'
  ) RETURNING * INTO v_evaluation;

  RETURN v_evaluation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION maity.create_evaluation TO authenticated;

-- Add comment
COMMENT ON FUNCTION maity.create_evaluation IS 'Creates a new evaluation record for voice transcript processing';

-- Create PUBLIC wrapper function (required for Supabase client access)
CREATE OR REPLACE FUNCTION public.create_evaluation(
  p_request_id UUID,
  p_user_id UUID,
  p_session_id UUID DEFAULT NULL
) RETURNS maity.evaluations AS $$
BEGIN
  -- Simply call the maity schema function
  RETURN maity.create_evaluation(p_request_id, p_user_id, p_session_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_evaluation TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.create_evaluation IS 'Public wrapper for maity.create_evaluation';

-- Update RLS policies for evaluations table
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own evaluations" ON maity.evaluations;
DROP POLICY IF EXISTS "Users can insert own evaluations" ON maity.evaluations;

-- Create new policies
CREATE POLICY "Users can view own evaluations"
  ON maity.evaluations FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM maity.users WHERE auth_id = auth.uid()
    )
  );

-- No INSERT policy needed as we use RPC function
-- Service role can still update via backend API

-- Add helpful index for request_id lookups
CREATE INDEX IF NOT EXISTS idx_evaluations_request_id
  ON maity.evaluations(request_id);

-- Add index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_evaluations_user_id
  ON maity.evaluations(user_id);

-- Add index for session_id lookups
CREATE INDEX IF NOT EXISTS idx_evaluations_session_id
  ON maity.evaluations(session_id)
  WHERE session_id IS NOT NULL;