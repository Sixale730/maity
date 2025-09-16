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