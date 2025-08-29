-- Fix security issues: Add RLS policies for user_roles table
CREATE POLICY "Users can view their own role" 
ON public.user_roles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Platform admins can view all roles" 
ON public.user_roles FOR SELECT 
USING (public.get_user_role() = 'platform_admin');

-- Fix search_path for security definer functions
CREATE OR REPLACE FUNCTION public.get_user_role(user_auth_id UUID DEFAULT auth.uid())
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = user_auth_id 
  ORDER BY 
    CASE role 
      WHEN 'platform_admin' THEN 1
      WHEN 'org_admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_company_id(user_auth_id UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id 
  FROM maity.users 
  WHERE auth_id = user_auth_id;
$$;

CREATE OR REPLACE FUNCTION public.has_role(user_auth_id UUID, required_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = user_auth_id
      AND role = required_role
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Enable RLS on public tables that don't have it
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;