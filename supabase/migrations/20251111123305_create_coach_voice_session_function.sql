-- Create Coach Voice Session Function
-- This function creates voice sessions for Coach (without requiring profile/scenario)
-- Unlike Roleplay, Coach doesn't need predefined scenarios or questionnaires

-- Step 1: Create function in maity schema
CREATE OR REPLACE FUNCTION maity.create_coach_voice_session(
  p_company_id UUID DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public
AS $$
DECLARE
  v_session_id UUID;
  v_user_id UUID;
  v_company_id UUID;
BEGIN
  -- Get user_id from authenticated user
  SELECT id, company_id INTO v_user_id, v_company_id
  FROM maity.users
  WHERE auth_id = auth.uid();

  -- Validate user exists
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for auth_id: %', auth.uid();
  END IF;

  -- Use provided company_id, fallback to user's company_id
  v_company_id := COALESCE(p_company_id, v_company_id);

  -- Create session without profile_scenario_id (NULL for Coach)
  INSERT INTO maity.voice_sessions (
    user_id,
    company_id,
    profile_scenario_id,  -- NULL for Coach sessions
    status,
    started_at,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    v_company_id,
    NULL,  -- Coach doesn't have predefined scenarios
    'in_progress',
    NOW(),
    NOW(),
    NOW()
  )
  RETURNING id INTO v_session_id;

  -- Return session info
  RETURN jsonb_build_object(
    'id', v_session_id,
    'user_id', v_user_id,
    'company_id', v_company_id,
    'status', 'in_progress'
  );
END;
$$;

-- Step 2: Create public wrapper (REQUIRED for RPC calls from frontend)
CREATE OR REPLACE FUNCTION public.create_coach_voice_session(
  p_company_id UUID DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.create_coach_voice_session(p_company_id);
END;
$$;

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION public.create_coach_voice_session TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION public.create_coach_voice_session IS
'Creates a voice session for Coach (general coaching without predefined scenarios). Returns session info including id.';
