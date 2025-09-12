-- Move user_roles table to maity schema and fix foreign key relationships

-- First, create the app_role enum in maity schema if it doesn't exist
CREATE TYPE maity.app_role AS ENUM ('platform_admin', 'org_admin', 'user');

-- Create user_roles table in maity schema
CREATE TABLE maity.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role maity.app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Add foreign key constraint to maity.users
ALTER TABLE maity.user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES maity.users(auth_id) ON DELETE CASCADE;

-- Enable RLS on the new table
ALTER TABLE maity.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the new table
CREATE POLICY "Platform admins can view all roles" 
ON maity.user_roles 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM maity.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'platform_admin'
    )
);

CREATE POLICY "Users can view their own role" 
ON maity.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Update the get_user_role function to use maity schema
CREATE OR REPLACE FUNCTION public.get_user_role(user_auth_id uuid DEFAULT auth.uid())
RETURNS maity.app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'maity', 'public'
AS $$
  SELECT role 
  FROM maity.user_roles 
  WHERE user_id = user_auth_id 
  ORDER BY 
    CASE role 
      WHEN 'platform_admin' THEN 1
      WHEN 'org_admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1;
$$;

-- Update the has_role function to use maity schema
CREATE OR REPLACE FUNCTION public.has_role(user_auth_id uuid, required_role maity.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'maity', 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM maity.user_roles
    WHERE user_id = user_auth_id
      AND role = required_role
  );
$$;

-- Create a trigger function to automatically assign user role on user creation
CREATE OR REPLACE FUNCTION maity.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'maity', 'public'
AS $$
BEGIN
  INSERT INTO maity.user_roles (user_id, role)
  VALUES (NEW.auth_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on maity.users table
CREATE OR REPLACE TRIGGER on_user_created_assign_role
  AFTER INSERT ON maity.users
  FOR EACH ROW EXECUTE FUNCTION maity.handle_new_user_role();

-- Drop the old public schema objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_role();
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA maity TO authenticated;
GRANT SELECT ON maity.user_roles TO authenticated;