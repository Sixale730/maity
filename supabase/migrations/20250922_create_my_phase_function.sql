-- Create function to get user phase based on their status and role
CREATE OR REPLACE FUNCTION maity.my_phase()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  user_record RECORD;
  user_role TEXT;
BEGIN
  -- Get current user ID
  user_id := auth.uid();

  IF user_id IS NULL THEN
    RETURN 'UNAUTHORIZED';
  END IF;

  -- Get user info from maity.users
  SELECT auth_id, company_id, registration_form_completed
  INTO user_record
  FROM maity.users
  WHERE auth_id = user_id;

  -- If user doesn't exist in maity.users, they need a company
  IF NOT FOUND THEN
    RETURN 'NO_COMPANY';
  END IF;

  -- If user doesn't have a company, they need one
  IF user_record.company_id IS NULL THEN
    RETURN 'NO_COMPANY';
  END IF;

  -- Get user role
  SELECT role INTO user_role
  FROM maity.user_roles
  WHERE user_id = user_id;

  -- If no role found, default to 'user'
  IF user_role IS NULL THEN
    user_role := 'user';
  END IF;

  -- platform_admin and org_admin users are always ACTIVE (skip registration)
  IF user_role = 'platform_admin' OR user_role = 'org_admin' THEN
    RETURN 'ACTIVE';
  END IF;

  -- For regular users, check if they completed registration
  IF user_record.registration_form_completed IS NULL OR user_record.registration_form_completed = FALSE THEN
    RETURN 'REGISTRATION';
  END IF;

  -- User has company and completed registration
  RETURN 'ACTIVE';

EXCEPTION
  WHEN OTHERS THEN
    -- In case of any error, return a safe state
    RETURN 'NO_COMPANY';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION maity.my_phase() TO authenticated;