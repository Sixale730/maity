-- 1) Create roles table in maity using existing enum type to avoid breaking deps
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'app_role'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('platform_admin', 'org_admin', 'user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS maity.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Ensure FK targets maity.users(auth_id) so it aligns with your domain users
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

-- 2) Migrate existing data from public.user_roles when possible
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_roles'
  ) THEN
    INSERT INTO maity.user_roles (user_id, role, created_at)
    SELECT ur.user_id, ur.role, COALESCE(ur.created_at, now())
    FROM public.user_roles ur
    JOIN maity.users u ON u.auth_id = ur.user_id
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- 3) RLS for maity.user_roles (use security definer function to avoid recursion)
ALTER TABLE maity.user_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='maity' AND tablename='user_roles' AND policyname='Users can view their own role'
  ) THEN
    CREATE POLICY "Users can view their own role"
    ON maity.user_roles
    FOR SELECT
    USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='maity' AND tablename='user_roles' AND policyname='Platform admins can view all roles'
  ) THEN
    CREATE POLICY "Platform admins can view all roles"
    ON maity.user_roles
    FOR SELECT
    USING (public.has_role(auth.uid(), 'platform_admin'));
  END IF;
END $$;

-- 4) Keep function signatures but point them to maity.user_roles
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

-- 5) Trigger to default a 'user' role when maity.users is created
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

DROP TRIGGER IF EXISTS on_user_created_assign_role ON maity.users;
CREATE TRIGGER on_user_created_assign_role
AFTER INSERT ON maity.users
FOR EACH ROW EXECUTE FUNCTION maity.handle_new_user_role();

-- 6) Remove auth.users-based trigger if it exists to prevent pre-maity insertion
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'on_auth_user_created' AND n.nspname = 'auth' AND c.relname='users'
  ) THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;
END $$;

-- Drop the old function only if it exists in public (it may not)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'handle_new_user_role' AND n.nspname = 'public'
  ) THEN
    DROP FUNCTION public.handle_new_user_role();
  END IF;
END $$;

-- 7) Optionally drop the old public.user_roles to avoid confusion (after migration)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_roles'
  ) THEN
    DROP TABLE public.user_roles CASCADE;
  END IF;
END $$;

-- 8) Grants
GRANT USAGE ON SCHEMA maity TO authenticated;
GRANT SELECT ON maity.user_roles TO authenticated;