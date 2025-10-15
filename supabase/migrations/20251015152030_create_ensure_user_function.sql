-- Create ensure_user function in maity schema
-- This function ensures a user record exists in maity.users for the authenticated user
-- If the user doesn't exist, it creates one with basic information from auth.users

-- Drop existing function if it exists (in case of type change)
DROP FUNCTION IF EXISTS maity.ensure_user();
DROP FUNCTION IF EXISTS public.ensure_user();

CREATE OR REPLACE FUNCTION maity.ensure_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public, auth
AS $$
DECLARE
  v_auth_id uuid;
  v_email text;
  v_name text;
  v_exists boolean;
BEGIN
  -- Get the authenticated user's ID
  v_auth_id := auth.uid();

  -- If no authenticated user, exit
  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user already exists in maity.users
  SELECT EXISTS(
    SELECT 1 FROM maity.users WHERE auth_id = v_auth_id
  ) INTO v_exists;

  -- If user doesn't exist, create it
  IF NOT v_exists THEN
    -- Get user information from auth.users
    SELECT
      email,
      COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', split_part(email, '@', 1))
    INTO v_email, v_name
    FROM auth.users
    WHERE id = v_auth_id;

    -- Insert new user record
    INSERT INTO maity.users (
      auth_id,
      email,
      name,
      status,
      registration_form_completed,
      created_at,
      updated_at
    ) VALUES (
      v_auth_id,
      v_email,
      COALESCE(v_name, ''),
      'PENDING',
      false,
      now(),
      now()
    );
  END IF;
END;
$$;

-- Create public wrapper function to expose it to the client
CREATE OR REPLACE FUNCTION public.ensure_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM maity.ensure_user();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.ensure_user() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.ensure_user() IS 'Ensures a user record exists in maity.users for the authenticated user. Creates one if it does not exist.';
