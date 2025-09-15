-- Create function to get company by ID
CREATE OR REPLACE FUNCTION public.get_company_by_id(company_id uuid)
 RETURNS TABLE(id uuid, name text, slug text, plan text, timezone text, is_active boolean, created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'maity', 'public'
AS $function$
  SELECT id, name, slug, plan, timezone, is_active, created_at
  FROM maity.companies
  WHERE companies.id = company_id AND companies.is_active = true
  LIMIT 1;
$function$