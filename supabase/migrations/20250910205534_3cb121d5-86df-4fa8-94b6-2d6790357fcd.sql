-- Simplified delete function that just returns void
CREATE OR REPLACE FUNCTION public.delete_company(company_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = maity, public
AS $$
  DELETE FROM maity.companies
  WHERE id = company_id;
$$;