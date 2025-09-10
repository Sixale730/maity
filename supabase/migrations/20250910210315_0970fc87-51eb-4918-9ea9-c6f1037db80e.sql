-- Recreate missing functions for companies management

-- Function to get all companies
CREATE OR REPLACE FUNCTION public.get_companies()
RETURNS TABLE (
  id uuid,
  name text,
  plan text,
  timezone text,
  is_active boolean,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = maity, public
AS $$
  SELECT id, name, plan, timezone, is_active, created_at
  FROM maity.companies
  WHERE get_user_role() = 'platform_admin'::app_role
  ORDER BY created_at DESC;
$$;

-- Function to create a company
CREATE OR REPLACE FUNCTION public.create_company(company_name text)
RETURNS TABLE (
  id uuid,
  name text,
  plan text,
  timezone text,
  is_active boolean,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = maity, public
AS $$
  INSERT INTO maity.companies (name)
  VALUES (company_name)
  RETURNING id, name, plan, timezone, is_active, created_at;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_companies() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_company(text) TO authenticated;