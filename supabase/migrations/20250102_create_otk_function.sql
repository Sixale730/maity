-- Create OTK (One-Time Key) generation function for Tally form integration
-- This function generates secure tokens for form submissions

-- First ensure the otk table exists
CREATE TABLE IF NOT EXISTS maity.otk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  auth_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_otk_token ON maity.otk(token) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_otk_auth_id ON maity.otk(auth_id);
CREATE INDEX IF NOT EXISTS idx_otk_expires_at ON maity.otk(expires_at) WHERE used_at IS NULL;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.otk(text, integer);
DROP FUNCTION IF EXISTS maity.otk(text, integer);

-- Create the main OTK generation function in maity schema
CREATE OR REPLACE FUNCTION maity.otk(
  p_auth_id TEXT,
  p_ttl_minutes INTEGER DEFAULT 120
)
RETURNS TABLE(
  token TEXT,
  email TEXT,
  company_id UUID,
  role TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $$
DECLARE
    v_token TEXT;
    v_email TEXT;
    v_company_id UUID;
    v_role TEXT;
    v_expires_at TIMESTAMPTZ;
    v_auth_uuid UUID;
BEGIN
    -- Convert text to UUID
    v_auth_uuid := p_auth_id::UUID;

    -- Generate secure random token
    v_token := encode(gen_random_bytes(32), 'hex');

    -- Get user info
    SELECT u.email, u.company_id, COALESCE(ur.role, 'user')
    INTO v_email, v_company_id, v_role
    FROM maity.users u
    LEFT JOIN maity.user_roles ur ON u.id = ur.user_id
    WHERE u.auth_id = v_auth_uuid;

    -- Validate user exists
    IF v_email IS NULL THEN
        RAISE EXCEPTION 'User not found for auth_id %', p_auth_id;
    END IF;

    -- Calculate expiration
    v_expires_at := NOW() + (p_ttl_minutes || ' minutes')::INTERVAL;

    -- Insert token
    INSERT INTO maity.otk (token, auth_id, expires_at, created_at)
    VALUES (v_token, v_auth_uuid, v_expires_at, NOW());

    -- Return result
    RETURN QUERY SELECT v_token, v_email, v_company_id, v_role, v_expires_at;
END;
$$;

-- Create public wrapper function
CREATE OR REPLACE FUNCTION public.otk(
  p_auth_id TEXT,
  p_ttl_minutes INTEGER DEFAULT 120
)
RETURNS TABLE(
  token TEXT,
  email TEXT,
  company_id UUID,
  role TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY SELECT * FROM maity.otk(p_auth_id, p_ttl_minutes);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.otk TO authenticated;
GRANT EXECUTE ON FUNCTION public.otk TO service_role;

-- Add comment
COMMENT ON FUNCTION maity.otk IS 'Generates one-time tokens for Tally form integration with configurable TTL';
