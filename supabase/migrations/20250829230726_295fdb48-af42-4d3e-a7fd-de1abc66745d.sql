-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('platform_admin', 'org_admin', 'user');

-- Create user_roles table to link auth.users with roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_auth_id UUID DEFAULT auth.uid())
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
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

-- Security definer function to get user's company_id from maity.users
CREATE OR REPLACE FUNCTION public.get_user_company_id(user_auth_id UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT company_id 
  FROM maity.users 
  WHERE auth_id = user_auth_id;
$$;

-- Security definer function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(user_auth_id UUID, required_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = user_auth_id
      AND role = required_role
  );
$$;

-- Function to automatically assign 'user' role when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Trigger to assign default role on user creation
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_role();

-- Enable RLS on key maity tables
ALTER TABLE maity.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE maity.companies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for maity.users
CREATE POLICY "Platform admins can view all users" 
ON maity.users FOR SELECT 
USING (public.get_user_role() = 'platform_admin');

CREATE POLICY "Org admins can view users in their company" 
ON maity.users FOR SELECT 
USING (
  public.get_user_role() = 'org_admin' 
  AND company_id = public.get_user_company_id()
);

CREATE POLICY "Users can view their own data" 
ON maity.users FOR SELECT 
USING (auth_id = auth.uid());

-- RLS Policies for maity.companies
CREATE POLICY "Platform admins can view all companies" 
ON maity.companies FOR SELECT 
USING (public.get_user_role() = 'platform_admin');

CREATE POLICY "Org admins can view their company" 
ON maity.companies FOR SELECT 
USING (
  public.get_user_role() = 'org_admin' 
  AND id = public.get_user_company_id()
);

CREATE POLICY "Users can view their company" 
ON maity.companies FOR SELECT 
USING (id = public.get_user_company_id());