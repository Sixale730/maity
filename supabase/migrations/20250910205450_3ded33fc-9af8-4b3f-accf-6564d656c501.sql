-- Fix the delete function 
CREATE OR REPLACE FUNCTION public.delete_company(company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public
AS $$
DECLARE
  result boolean := false;
BEGIN
  DELETE FROM maity.companies
  WHERE id = company_id;
  
  GET DIAGNOSTICS result = FOUND;
  RETURN result;
END;
$$;