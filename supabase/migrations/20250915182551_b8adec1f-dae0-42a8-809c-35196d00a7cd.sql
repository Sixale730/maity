-- Step 1: Drop existing trigger that depends on public.handle_new_user_role
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;

-- Step 2: Drop the function that's blocking us
DROP FUNCTION IF EXISTS public.handle_new_user_role() CASCADE;

-- Step 3: Create maity.user_roles table (preserve existing enum)
CREATE TABLE IF NOT EXISTS maity.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Step 4: Add foreign key to maity.users(auth_id)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'maity_user_roles_user_id_fkey'
  ) THEN
    ALTER TABLE maity.user_roles
    ADD CONSTRAINT maity_user_roles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES maity.users(auth_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 5: Migrate existing data if public.user_roles exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_roles'
  ) THEN
    INSERT INTO maity.user_roles (user_id, role, created_at)
    SELECT ur.user_id, ur.role, COALESCE(ur.created_at, now())
    FROM public.user_roles ur
    WHERE EXISTS (SELECT 1 FROM maity.users u WHERE u.auth_id = ur.user_id)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- Step 6: Enable RLS and create policies
ALTER TABLE maity.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own role" ON maity.user_roles;
CREATE POLICY "Users can view their own role"
ON maity.user_roles
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Platform admins can view all roles" ON maity.user_roles;
CREATE POLICY "Platform admins can view all roles"
ON maity.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'platform_admin'));

-- Step 7: Update functions to use maity.user_roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_auth_id uuid DEFAULT auth.uid())
RETURNS public.app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'maity','public'
AS $$
  SELECT role
  FROM maity.user_roles
  WHERE user_id = user_auth_id
  ORDER BY CASE role 
    WHEN 'platform_admin' THEN 1
    WHEN 'org_admin' THEN 2
    WHEN 'user' THEN 3
  END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(user_auth_id uuid, required_role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'maity','public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM maity.user_roles
    WHERE user_id = user_auth_id
      AND role = required_role
  );
$$;

-- Step 8: Create new trigger function for maity.users
CREATE OR REPLACE FUNCTION maity.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'maity','public'
AS $$
BEGIN
  INSERT INTO maity.user_roles (user_id, role)
  VALUES (NEW.auth_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Step 9: Create trigger on maity.users
DROP TRIGGER IF EXISTS on_user_created_assign_role ON maity.users;
CREATE TRIGGER on_user_created_assign_role
AFTER INSERT ON maity.users
FOR EACH ROW EXECUTE FUNCTION maity.handle_new_user_role();

-- Step 10: Clean up old table
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Step 11: Grant permissions
GRANT USAGE ON SCHEMA maity TO authenticated;
GRANT SELECT ON maity.user_roles TO authenticated;