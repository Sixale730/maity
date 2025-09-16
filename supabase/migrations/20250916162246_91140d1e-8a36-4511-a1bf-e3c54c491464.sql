-- Create a simple company assignment function
CREATE OR REPLACE FUNCTION public.assign_company_simple(user_auth_id uuid, company_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $function$
DECLARE
  target_company_id uuid;
  target_company_name text;
  user_id uuid;
BEGIN
  -- Get company by slug
  SELECT id, name INTO target_company_id, target_company_name
  FROM maity.companies
  WHERE slug = company_slug AND is_active = true
  LIMIT 1;
  
  IF target_company_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'COMPANY_NOT_FOUND',
      'message', 'Company not found'
    );
  END IF;
  
  -- Get user by auth_id
  SELECT id INTO user_id
  FROM maity.users
  WHERE auth_id = user_auth_id
  LIMIT 1;
  
  IF user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'USER_NOT_FOUND',
      'message', 'User not found'
    );
  END IF;
  
  -- Simple update - no complex logic
  UPDATE maity.users
  SET company_id = target_company_id, status = 'ACTIVE'
  WHERE id = user_id;
  
  -- Record in history
  INSERT INTO maity.user_company_history (user_id, company_id, action)
  VALUES (user_id, target_company_id, 'assigned');
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Company assigned successfully',
    'company_name', target_company_name,
    'company_id', target_company_id
  );
END;
$function$