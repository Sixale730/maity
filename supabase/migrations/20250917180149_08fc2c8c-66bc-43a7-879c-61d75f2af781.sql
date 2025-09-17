-- Fix get_user_info function to remove duplicate company_id
DROP FUNCTION IF EXISTS public.get_user_info(uuid);

CREATE OR REPLACE FUNCTION public.get_user_info(user_auth_id uuid DEFAULT auth.uid())
 RETURNS TABLE(user_id uuid, auth_id uuid, email text, name text, status text, company_id uuid, company_name text, company_slug text, registration_form_completed boolean, onboarding_completed_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'maity', 'public'
AS $function$
  SELECT 
    u.id as user_id,
    u.auth_id,
    u.email,
    u.name,
    u.status::text,
    u.company_id,
    c.name as company_name,
    c.slug as company_slug,
    u.registration_form_completed,
    u.onboarding_completed_at
  FROM maity.users u
  LEFT JOIN maity.companies c ON u.company_id = c.id
  WHERE u.auth_id = user_auth_id
  LIMIT 1;
$function$