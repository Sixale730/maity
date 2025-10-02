-- Create function to initialize voice progress for a user with a specific profile
CREATE OR REPLACE FUNCTION maity.create_initial_voice_progress(
  p_auth_id UUID,
  p_profile_name VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
  v_profile_id UUID;
  v_progress_id UUID;
BEGIN
  -- Get user_id and company_id from auth_id
  SELECT id, company_id INTO v_user_id, v_company_id
  FROM maity.users
  WHERE auth_id = p_auth_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for auth_id: %', p_auth_id;
  END IF;

  -- Get profile_id from profile name
  SELECT id INTO v_profile_id
  FROM maity.voice_agent_profiles
  WHERE name = p_profile_name AND is_active = TRUE;

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found or inactive: %', p_profile_name;
  END IF;

  -- Check if progress already exists for this user and profile
  SELECT id INTO v_progress_id
  FROM maity.voice_user_progress
  WHERE user_id = v_user_id AND profile_id = v_profile_id;

  -- If it exists, return the existing id
  IF v_progress_id IS NOT NULL THEN
    RETURN v_progress_id;
  END IF;

  -- Create new progress record
  INSERT INTO maity.voice_user_progress (
    user_id,
    company_id,
    profile_id,
    current_scenario_order,
    current_difficulty_level,
    scenarios_completed,
    scenarios_failed,
    total_sessions,
    total_practice_time,
    streak_days
  )
  VALUES (
    v_user_id,
    v_company_id,
    v_profile_id,
    1, -- Start at first scenario
    1, -- Start at easiest difficulty
    0,
    0,
    0,
    0,
    0
  )
  RETURNING id INTO v_progress_id;

  RETURN v_progress_id;
END;
$$;

-- Create public wrapper
CREATE OR REPLACE FUNCTION public.create_initial_voice_progress(
  p_auth_id UUID,
  p_profile_name VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.create_initial_voice_progress(p_auth_id, p_profile_name);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_initial_voice_progress TO authenticated;

COMMENT ON FUNCTION maity.create_initial_voice_progress IS 'Creates initial voice progress record for a user with a specific profile';
