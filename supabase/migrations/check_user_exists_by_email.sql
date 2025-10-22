-- =====================================================
-- Function: check_user_exists_by_email
-- Description: Checks if a user exists in maity.users by email
-- Security: Returns only boolean, no sensitive data exposed
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.check_user_exists_by_email(TEXT);
DROP FUNCTION IF EXISTS maity.check_user_exists_by_email(TEXT);

-- Create function in maity schema
CREATE OR REPLACE FUNCTION maity.check_user_exists_by_email(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public
AS $$
BEGIN
  -- Simply check if a user with this email exists
  RETURN EXISTS (
    SELECT 1
    FROM maity.users
    WHERE LOWER(email) = LOWER(p_email)
  );
END;
$$;

-- Create public wrapper
CREATE OR REPLACE FUNCTION public.check_user_exists_by_email(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public
AS $$
BEGIN
  RETURN maity.check_user_exists_by_email(p_email);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_user_exists_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_exists_by_email(TEXT) TO anon;

-- Add comment
COMMENT ON FUNCTION public.check_user_exists_by_email(TEXT) IS
'Checks if a user with the given email exists in the system. Returns boolean only, no sensitive data exposed. Available to anonymous users for better UX in login flow.';
