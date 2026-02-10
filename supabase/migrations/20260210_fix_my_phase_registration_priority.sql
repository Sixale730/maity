-- Migration: Fix my_phase() variable shadowing and incorrect FK join
-- Description: Fix two bugs causing infinite redirect loop for regular users:
--   1. Variable `user_id` shadows column `user_id` in user_roles table.
--      With plpgsql.variable_conflict = 'error' (Supabase default), the query
--      `WHERE user_id = user_id` throws a runtime error caught by EXCEPTION block,
--      always returning 'REGISTRATION'.
--   2. user_roles.user_id references users.id (internal UUID), not auth.uid().
--      Direct `WHERE user_id = auth.uid()` would never match even without shadowing.
-- Fix: Rename variable to v_auth_id, JOIN through maity.users (same pattern as my_roles()).

CREATE OR REPLACE FUNCTION maity.my_phase()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auth_id UUID;
  user_record RECORD;
  user_role TEXT;
BEGIN
  v_auth_id := auth.uid();

  IF v_auth_id IS NULL THEN
    RETURN 'UNAUTHORIZED';
  END IF;

  -- JOIN through users table (user_roles.user_id → users.id, NOT auth.uid)
  SELECT ur.role INTO user_role
  FROM maity.users u
  JOIN maity.user_roles ur ON u.id = ur.user_id
  WHERE u.auth_id = v_auth_id;

  IF user_role IS NULL THEN
    user_role := 'user';
  END IF;

  IF user_role = 'admin' THEN
    RETURN 'ACTIVE';
  END IF;

  SELECT u.auth_id, u.company_id, u.registration_form_completed
  INTO user_record
  FROM maity.users u
  WHERE u.auth_id = v_auth_id;

  IF NOT FOUND THEN
    RETURN 'REGISTRATION';
  END IF;

  IF user_role = 'manager' THEN
    RETURN 'ACTIVE';
  END IF;

  IF user_record.registration_form_completed = TRUE THEN
    RETURN 'ACTIVE';
  END IF;

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
