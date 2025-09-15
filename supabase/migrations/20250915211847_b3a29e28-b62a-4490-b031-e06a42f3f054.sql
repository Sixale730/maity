-- Drop existing function and recreate with registration_form_completed field
DROP FUNCTION IF EXISTS public.get_user_company_info(uuid);

CREATE OR REPLACE FUNCTION public.get_user_company_info(user_auth_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  user_id uuid,
  company_id uuid,
  company_name text,
  company_slug text,
  registration_form_completed boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $function$
  SELECT 
    u.id as user_id,
    u.company_id,
    c.name as company_name,
    c.slug as company_slug,
    u.registration_form_completed
  FROM maity.users u
  LEFT JOIN maity.companies c ON u.company_id = c.id
  WHERE u.auth_id = user_auth_id
  LIMIT 1;
$function$;