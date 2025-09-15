-- Fix complete_onboarding function to properly handle tally submissions using maity.users.id
CREATE OR REPLACE FUNCTION public.complete_onboarding(submission_data jsonb DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'maity','public'
AS $$
DECLARE
  user_auth_id uuid := auth.uid();
  maity_user_id uuid;
BEGIN
  -- Get the maity.users.id for the current authenticated user
  SELECT id INTO maity_user_id FROM maity.users WHERE auth_id = user_auth_id;
  
  IF maity_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found in maity.users table';
  END IF;

  -- Mark onboarding as completed
  UPDATE maity.users 
  SET onboarding_completed_at = now()
  WHERE id = maity_user_id
    AND onboarding_completed_at IS NULL;
    
  -- Store submission data if provided
  IF submission_data IS NOT NULL THEN
    INSERT INTO maity.tally_submissions (user_id, submission_data)
    VALUES (maity_user_id, submission_data)
    ON CONFLICT (user_id, tally_response_id) DO NOTHING;
  END IF;
END;
$$;