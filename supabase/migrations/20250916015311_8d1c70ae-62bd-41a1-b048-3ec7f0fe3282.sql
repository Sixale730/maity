-- Update get_user_info to also search by email when auth_id is not found
CREATE OR REPLACE FUNCTION public.get_user_info(user_auth_id uuid DEFAULT auth.uid())
 RETURNS TABLE(user_id uuid, auth_id uuid, email text, name text, status text, company_id uuid, company_name text, company_slug text, registration_form_completed boolean, onboarding_completed_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'maity', 'public'
AS $function$
  -- First try to find by auth_id
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
  
  UNION ALL
  
  -- If not found by auth_id, try by email from auth.users
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
  WHERE u.auth_id IS NULL 
    AND u.email = (SELECT email FROM auth.users WHERE id = user_auth_id)
    AND NOT EXISTS (
      SELECT 1 FROM maity.users WHERE auth_id = user_auth_id
    )
  
  LIMIT 1;
$function$

-- Create function to update user auth_id and status
CREATE OR REPLACE FUNCTION public.update_user_auth_status(user_auth_id uuid, user_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'maity', 'public'
AS $function$
BEGIN
  -- Update user with auth_id and set status to ACTIVE
  UPDATE maity.users 
  SET 
    auth_id = user_auth_id,
    status = 'ACTIVE'
  WHERE email = user_email AND auth_id IS NULL;
END;
$function$