-- Fix RLS and permissions for maity schema
-- Execute this in Supabase Dashboard > SQL Editor

-- 1. Create maity schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS maity;

-- 2. Create companies table
CREATE TABLE IF NOT EXISTS maity.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create users table
CREATE TABLE IF NOT EXISTS maity.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  company_id UUID REFERENCES maity.companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insert test company
INSERT INTO maity.companies (id, name, active) 
VALUES ('9368d119-ec44-4d9a-a94f-b1a4bff39d6d', 'Test Company', true)
ON CONFLICT (id) DO NOTHING;

-- 5. TEMPORARILY DISABLE RLS for testing (you can re-enable later)
ALTER TABLE maity.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE maity.users DISABLE ROW LEVEL SECURITY;

-- 6. Grant permissions to authenticated users
GRANT ALL ON maity.companies TO authenticated;
GRANT ALL ON maity.users TO authenticated;

-- 7. Grant usage on schema
GRANT USAGE ON SCHEMA maity TO authenticated;

-- 8. Create a simple RPC function for testing
CREATE OR REPLACE FUNCTION maity.test_function()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 'RPC functions are working!';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION maity.test_function() TO authenticated;

-- 9. Create a function to associate user with company
CREATE OR REPLACE FUNCTION maity.associate_user_company(
  user_auth_id UUID,
  company_uuid UUID,
  user_email TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_record RECORD;
BEGIN
  -- Check if company exists
  SELECT id, name, active INTO company_record
  FROM maity.companies
  WHERE id = company_uuid;

  IF NOT FOUND OR NOT company_record.active THEN
    RETURN json_build_object(
      'success', false,
      'error', 'COMPANY_NOT_FOUND',
      'message', 'Company not found or inactive'
    );
  END IF;

  -- Insert or update user
  INSERT INTO maity.users (id, email, company_id, created_at, updated_at)
  VALUES (user_auth_id, user_email, company_uuid, NOW(), NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    company_id = company_uuid,
    updated_at = NOW();

  RETURN json_build_object(
    'success', true,
    'message', 'User associated with company successfully',
    'company_name', company_record.name
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION maity.associate_user_company(UUID, UUID, TEXT) TO authenticated;
