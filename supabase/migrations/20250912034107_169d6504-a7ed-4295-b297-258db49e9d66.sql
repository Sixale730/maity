-- Drop existing functions first
DROP FUNCTION IF EXISTS public.create_company(text);
DROP FUNCTION IF EXISTS public.get_companies();

-- Recreate create_company function with slug auto-generation
CREATE OR REPLACE FUNCTION public.create_company(company_name text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  plan text,
  timezone text,
  is_active boolean,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = maity, public
AS $$
  INSERT INTO maity.companies (name, slug)
  VALUES (
    company_name, 
    LOWER(REGEXP_REPLACE(REGEXP_REPLACE(company_name, '[^\w\s-]', '', 'g'), '\s+', '-', 'g'))
  )
  RETURNING id, name, slug, plan, timezone, is_active, created_at;
$$;

-- Recreate get_companies function to include slug
CREATE OR REPLACE FUNCTION public.get_companies()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  plan text,
  timezone text,
  is_active boolean,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = maity, public
AS $$
  SELECT id, name, slug, plan, timezone, is_active, created_at
  FROM maity.companies
  WHERE get_user_role() = 'platform_admin'::app_role
  ORDER BY created_at DESC;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_companies() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_company(text) TO authenticated;