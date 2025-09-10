-- Create functions to manage maity.companies from the frontend

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

-- Function to delete a company
CREATE OR REPLACE FUNCTION public.delete_company(company_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = maity, public
AS $$
  DELETE FROM maity.companies
  WHERE id = company_id;
  SELECT FOUND;
$$;