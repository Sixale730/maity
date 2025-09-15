-- Create function to assign user to company (company_id column already exists)
CREATE OR REPLACE FUNCTION public.assign_user_to_company(user_auth_id uuid, company_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $function$
DECLARE
  target_company_id uuid;
BEGIN
  -- Get company ID by slug
  SELECT id INTO target_company_id
  FROM maity.companies
  WHERE slug = company_slug AND is_active = true
  LIMIT 1;
  
  IF target_company_id IS NULL THEN
    RAISE EXCEPTION 'Company with slug % not found or inactive', company_slug;
  END IF;
  
  -- Assign company to user
  UPDATE maity.users
  SET company_id = target_company_id
  WHERE auth_id = user_auth_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with auth_id % not found', user_auth_id;
  END IF;
END;
$function$;

-- Assign "Privada" company to users without a company
UPDATE maity.users 
SET company_id = (
  SELECT id FROM maity.companies WHERE slug = 'privada' LIMIT 1
)
WHERE company_id IS NULL;