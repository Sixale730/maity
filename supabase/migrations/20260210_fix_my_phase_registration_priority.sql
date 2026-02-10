-- Migration: Fix my_phase() registration priority
-- Description: Reorder logic so registration_form_completed=TRUE → ACTIVE takes priority
-- over company_id IS NULL → REGISTRATION. This prevents infinite REGISTRATION loop
-- for users who completed onboarding but have no company assigned.

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

  -- Get user role FIRST (before checking company)
  SELECT role INTO user_role
  FROM maity.user_roles
  WHERE user_id = user_id;

  -- If no role found, default to 'user'
  IF user_role IS NULL THEN
    user_role := 'user';
  END IF;

  -- admin users are always ACTIVE (regardless of company)
  IF user_role = 'admin' THEN
    RETURN 'ACTIVE';
  END IF;

  -- Get user info from maity.users
  SELECT auth_id, company_id, registration_form_completed
  INTO user_record
  FROM maity.users
  WHERE auth_id = user_id;

  -- If user doesn't exist in maity.users, go directly to registration
  IF NOT FOUND THEN
    RETURN 'REGISTRATION';
  END IF;

  -- manager users are always ACTIVE (regardless of company)
  IF user_role = 'manager' THEN
    RETURN 'ACTIVE';
  END IF;

  -- FIX: Check registration_form_completed BEFORE company_id
  -- This prevents infinite REGISTRATION loop for users who completed
  -- onboarding but don't have a company assigned yet
  IF user_record.registration_form_completed = TRUE THEN
    RETURN 'ACTIVE';
  END IF;

  -- User hasn't completed registration → send to onboarding
  -- (regardless of whether they have a company or not)
  RETURN 'REGISTRATION';

EXCEPTION
  WHEN OTHERS THEN
    RETURN 'REGISTRATION';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION maity.my_phase() TO authenticated;

-- Update the public wrapper
CREATE OR REPLACE FUNCTION public.my_phase()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT maity.my_phase();
$$;

GRANT EXECUTE ON FUNCTION public.my_phase() TO authenticated;
