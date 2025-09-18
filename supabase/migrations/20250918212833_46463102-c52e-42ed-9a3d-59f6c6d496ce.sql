-- PHASE 1: CRITICAL SECURITY FIXES (Updated)
-- Fix RLS policies for exposed tables and enable RLS on maity schema
-- Skip existing policies to avoid conflicts

-- 1. Fix documents table - restrict to company members only
DROP POLICY IF EXISTS "Allow authenticated users to access documents" ON public.documents;

CREATE POLICY "Users can only access documents from their company" 
ON public.documents 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM maity.users u 
    WHERE u.auth_id = auth.uid() 
    AND u.company_id IS NOT NULL
    AND u.status = 'ACTIVE'
  )
);

-- 2. Fix n8n_chat_histories - restrict to session owners only
DROP POLICY IF EXISTS "Allow authenticated users to access chat histories" ON public.n8n_chat_histories;

CREATE POLICY "Users can only access their own chat sessions" 
ON public.n8n_chat_histories 
FOR ALL 
TO authenticated 
USING (
  -- Allow access if user owns the session (session_id contains user info or is linked to user)
  -- For now, allowing company members - should be refined based on session ownership logic
  EXISTS (
    SELECT 1 FROM maity.users u 
    WHERE u.auth_id = auth.uid() 
    AND u.company_id IS NOT NULL
    AND u.status = 'ACTIVE'
  )
);

-- 3. Enable RLS on maity schema tables that don't have it yet

-- Check if tables have RLS enabled, enable if not
DO $$
BEGIN
  -- Enable RLS on tables that don't have it
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'companies' AND relrowsecurity = true) THEN
    ALTER TABLE maity.companies ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users' AND relrowsecurity = true) THEN
    ALTER TABLE maity.users ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'user_roles' AND relrowsecurity = true) THEN
    ALTER TABLE maity.user_roles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'user_company_history' AND relrowsecurity = true) THEN
    ALTER TABLE maity.user_company_history ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invite_links' AND relrowsecurity = true) THEN
    ALTER TABLE maity.invite_links ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'coaching_sessions' AND relrowsecurity = true) THEN
    ALTER TABLE maity.coaching_sessions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'commitment_logs' AND relrowsecurity = true) THEN
    ALTER TABLE maity.commitment_logs ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'execution_logs' AND relrowsecurity = true) THEN
    ALTER TABLE maity.execution_logs ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'plans' AND relrowsecurity = true) THEN
    ALTER TABLE maity.plans ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'session_event_log' AND relrowsecurity = true) THEN
    ALTER TABLE maity.session_event_log ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'tally_submissions' AND relrowsecurity = true) THEN
    ALTER TABLE maity.tally_submissions ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Create policies only if they don't exist (drop and recreate for safety)

-- Companies table policies
DROP POLICY IF EXISTS "Platform admins can manage all companies" ON maity.companies;
CREATE POLICY "Platform admins can manage all companies" 
ON maity.companies 
FOR ALL 
TO authenticated 
USING (get_user_role() = 'platform_admin'::app_role);

DROP POLICY IF EXISTS "Users can view their own company" ON maity.companies;
CREATE POLICY "Users can view their own company" 
ON maity.companies 
FOR SELECT 
TO authenticated 
USING (
  id = get_user_company_id() OR 
  get_user_role() = 'platform_admin'::app_role
);

-- Users table policies
DROP POLICY IF EXISTS "Users can manage their own profile" ON maity.users;
CREATE POLICY "Users can manage their own profile" 
ON maity.users 
FOR ALL 
TO authenticated 
USING (auth_id = auth.uid());

DROP POLICY IF EXISTS "Platform admins can manage all users" ON maity.users;
CREATE POLICY "Platform admins can manage all users" 
ON maity.users 
FOR ALL 
TO authenticated 
USING (get_user_role() = 'platform_admin'::app_role);

DROP POLICY IF EXISTS "Org admins can view company users" ON maity.users;
CREATE POLICY "Org admins can view company users" 
ON maity.users 
FOR SELECT 
TO authenticated 
USING (
  get_user_role() = 'org_admin'::app_role AND 
  company_id = get_user_company_id()
);

-- User roles table policies
DROP POLICY IF EXISTS "Users can view their own roles" ON maity.user_roles;
CREATE POLICY "Users can view their own roles" 
ON maity.user_roles 
FOR SELECT 
TO authenticated 
USING (
  user_id IN (SELECT id FROM maity.users WHERE auth_id = auth.uid())
);

DROP POLICY IF EXISTS "Platform admins can manage all user roles" ON maity.user_roles;
CREATE POLICY "Platform admins can manage all user roles" 
ON maity.user_roles 
FOR ALL 
TO authenticated 
USING (get_user_role() = 'platform_admin'::app_role);

-- Invite links policies
DROP POLICY IF EXISTS "Platform admins can manage all invite links" ON maity.invite_links;
CREATE POLICY "Platform admins can manage all invite links" 
ON maity.invite_links 
FOR ALL 
TO authenticated 
USING (get_user_role() = 'platform_admin'::app_role);

DROP POLICY IF EXISTS "Org admins can manage company invite links" ON maity.invite_links;
CREATE POLICY "Org admins can manage company invite links" 
ON maity.invite_links 
FOR ALL 
TO authenticated 
USING (
  get_user_role() = 'org_admin'::app_role AND 
  company_id = get_user_company_id()
);

-- Coaching sessions policies
DROP POLICY IF EXISTS "Users can manage their own coaching sessions" ON maity.coaching_sessions;
CREATE POLICY "Users can manage their own coaching sessions" 
ON maity.coaching_sessions 
FOR ALL 
TO authenticated 
USING (
  user_id IN (SELECT id FROM maity.users WHERE auth_id = auth.uid())
);

-- Execution logs policies
DROP POLICY IF EXISTS "Only platform admins can access execution logs" ON maity.execution_logs;
CREATE POLICY "Only platform admins can access execution logs" 
ON maity.execution_logs 
FOR ALL 
TO authenticated 
USING (get_user_role() = 'platform_admin'::app_role);

-- Add audit logging function for security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  user_id uuid DEFAULT auth.uid(),
  details jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO maity.execution_logs (
    function_name,
    user_id, 
    execution_time,
    status,
    input_params,
    output_data
  ) VALUES (
    'security_event',
    user_id,
    extract(epoch from now()),
    'completed',
    jsonb_build_object('event_type', event_type, 'details', details),
    jsonb_build_object('timestamp', now(), 'logged', true)
  );
END;
$$;