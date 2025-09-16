-- Improve handle_user_company_invitation to set status to ACTIVE when assigning company
CREATE OR REPLACE FUNCTION public.handle_user_company_invitation(user_auth_id uuid, user_email text, company_slug text, invitation_source text DEFAULT NULL::text, force_assign boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'maity', 'public'
AS $function$
DECLARE
  target_company_id uuid;
  target_company_name text;
  current_user_id uuid;
  current_company_id uuid;
  current_company_name text;
  result jsonb;
BEGIN
  -- Get company ID by slug
  SELECT id, name INTO target_company_id, target_company_name
  FROM maity.companies
  WHERE slug = company_slug AND is_active = true
  LIMIT 1;
  
  IF target_company_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'COMPANY_NOT_FOUND',
      'message', 'Company not found or inactive'
    );
  END IF;
  
  -- Try to find user by auth_id first, then by email if not found
  SELECT id, company_id INTO current_user_id, current_company_id
  FROM maity.users
  WHERE auth_id = user_auth_id
  LIMIT 1;
  
  -- If not found by auth_id, try by email and update auth_id
  IF current_user_id IS NULL AND user_email IS NOT NULL THEN
    SELECT id, company_id INTO current_user_id, current_company_id
    FROM maity.users
    WHERE email = user_email
    LIMIT 1;
    
    -- Update auth_id to link the user properly
    IF current_user_id IS NOT NULL THEN
      UPDATE maity.users
      SET auth_id = user_auth_id, status = 'ACTIVE'
      WHERE id = current_user_id;
    END IF;
  END IF;
  
  -- If still no user found, they need to be provisioned first
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'USER_NOT_FOUND',
      'message', 'User needs to be provisioned first'
    );
  END IF;
  
  -- Get current company name if exists
  IF current_company_id IS NOT NULL THEN
    SELECT name INTO current_company_name
    FROM maity.companies
    WHERE id = current_company_id;
  END IF;
  
  -- Check if user already has this company
  IF current_company_id = target_company_id THEN
    RETURN jsonb_build_object(
      'success', true,
      'action', 'NO_CHANGE',
      'message', 'User already assigned to this company',
      'company_name', target_company_name
    );
  END IF;
  
  -- If user has no company or force_assign is true, assign directly
  IF current_company_id IS NULL OR force_assign THEN
    -- Update user's company and set status to ACTIVE
    UPDATE maity.users
    SET company_id = target_company_id, status = 'ACTIVE'
    WHERE id = current_user_id;
    
    -- Record the assignment in history
    INSERT INTO maity.user_company_history (
      user_id, 
      company_id, 
      action, 
      previous_company_id,
      invitation_source
    ) VALUES (
      current_user_id, 
      target_company_id, 
      CASE WHEN current_company_id IS NULL THEN 'assigned' ELSE 'transferred' END,
      current_company_id,
      invitation_source
    );
    
    RETURN jsonb_build_object(
      'success', true,
      'action', CASE WHEN current_company_id IS NULL THEN 'ASSIGNED' ELSE 'TRANSFERRED' END,
      'message', 'User assigned to company successfully',
      'company_name', target_company_name,
      'previous_company_name', current_company_name
    );
  END IF;
  
  -- User has a different company - requires confirmation
  RETURN jsonb_build_object(
    'success', false,
    'action', 'CONFIRMATION_REQUIRED',
    'message', 'User already has a company assigned',
    'current_company', jsonb_build_object(
      'id', current_company_id,
      'name', current_company_name
    ),
    'target_company', jsonb_build_object(
      'id', target_company_id,
      'name', target_company_name,
      'slug', company_slug
    ),
    'invitation_source', invitation_source
  );
END;
$function$;

-- Create function to get comprehensive user information
CREATE OR REPLACE FUNCTION public.get_user_info(user_auth_id uuid DEFAULT auth.uid())
 RETURNS TABLE(
   user_id uuid,
   auth_id uuid,
   email text,
   name text,
   status text,
   company_id uuid,
   company_name text,
   company_slug text,
   registration_form_completed boolean,
   onboarding_completed_at timestamp with time zone
 )
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
$function$;