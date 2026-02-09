-- Migration: Bypass pending invitation flow
-- Description: Users without company go directly to registration/onboarding instead of pending page
-- This allows new users to complete onboarding even if their domain is not registered

-- Recreate function to get user phase based on their status and role
-- CHANGE: Users without company now go to REGISTRATION instead of NO_COMPANY
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

  -- BYPASS PENDING: If user doesn't exist in maity.users, go directly to registration
  -- (Previously returned 'NO_COMPANY' which sent users to /pending)
  IF NOT FOUND THEN
    -- Original: RETURN 'NO_COMPANY';
    RETURN 'REGISTRATION';
  END IF;

  -- BYPASS PENDING: If user doesn't have a company, go directly to registration
  -- (Previously returned 'NO_COMPANY' which sent users to /pending)
  IF user_record.company_id IS NULL THEN
    -- Original: RETURN 'NO_COMPANY';
    RETURN 'REGISTRATION';
  END IF;

  -- manager users are always ACTIVE (but need company)
  IF user_role = 'manager' THEN
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
    -- In case of any error, return a safe state (go to registration instead of pending)
    -- Original: RETURN 'NO_COMPANY';
    RETURN 'REGISTRATION';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION maity.my_phase() TO authenticated;

-- Also update the public wrapper if it exists
CREATE OR REPLACE FUNCTION public.my_phase()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT maity.my_phase();
$$;

GRANT EXECUTE ON FUNCTION public.my_phase() TO authenticated;
