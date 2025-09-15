-- Fix complete_onboarding to mark registration_form_completed as true
CREATE OR REPLACE FUNCTION public.complete_onboarding(submission_data jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $$
DECLARE
  user_auth_id uuid := auth.uid();
  maity_user_id uuid;
BEGIN
  -- Get the maity.users.id for the current authenticated user
  SELECT id INTO maity_user_id FROM maity.users WHERE auth_id = user_auth_id;
  
  IF maity_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found in maity.users table';
  END IF;

  -- Mark onboarding as completed AND registration form as completed
  UPDATE maity.users 
  SET 
    onboarding_completed_at = now(),
    registration_form_completed = true
  WHERE id = maity_user_id
    AND onboarding_completed_at IS NULL;
    
  -- Store submission data if provided
  IF submission_data IS NOT NULL THEN
    INSERT INTO maity.tally_submissions (user_id, submission_data, tally_response_id)
    VALUES (
      maity_user_id, 
      submission_data,
      COALESCE(submission_data->>'responseId', submission_data->>'response_id', gen_random_uuid()::text)
    )
    ON CONFLICT (user_id, tally_response_id) DO NOTHING;
  END IF;
END;
$$;

-- Improve provision_user to handle company assignment and roles
CREATE OR REPLACE FUNCTION public.provision_user(target_company_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $$
DECLARE
  user_auth_id uuid := auth.uid();
  user_email text;
  maity_user_id uuid;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = user_auth_id;
  
  -- Insert user into maity.users if not exists, get the user ID
  INSERT INTO maity.users (auth_id, email, name, status, company_id)
  VALUES (
    user_auth_id, 
    user_email,
    COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = user_auth_id), 
             SPLIT_PART(user_email, '@', 1)),
    'ACTIVE',
    target_company_id
  )
  ON CONFLICT (auth_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, maity.users.name),
    company_id = COALESCE(EXCLUDED.company_id, maity.users.company_id)
  RETURNING id INTO maity_user_id;

  -- If user already existed, get their ID
  IF maity_user_id IS NULL THEN
    SELECT id INTO maity_user_id FROM maity.users WHERE auth_id = user_auth_id;
  END IF;
  
  -- Assign default user role using the maity.users.id (NOT auth.uid())
  INSERT INTO maity.user_roles (user_id, role)
  VALUES (maity_user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Create function specifically for invitation flow
CREATE OR REPLACE FUNCTION public.provision_user_with_company(company_slug text, invitation_source text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $$
DECLARE
  user_auth_id uuid := auth.uid();
  target_company_id uuid;
  target_company_name text;
  maity_user_id uuid;
  user_email text;
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
      'message', 'Company not found or inactive'
    );
  END IF;
  
  -- Get user email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = user_auth_id;
  
  -- Insert/update user with company assignment
  INSERT INTO maity.users (auth_id, email, name, status, company_id)
  VALUES (
    user_auth_id, 
    user_email,
    COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = user_auth_id), 
             SPLIT_PART(user_email, '@', 1)),
    'ACTIVE',
    target_company_id
  )
  ON CONFLICT (auth_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, maity.users.name),
    company_id = target_company_id,
    status = 'ACTIVE'
  RETURNING id INTO maity_user_id;

  -- Assign user role
  INSERT INTO maity.user_roles (user_id, role)
  VALUES (maity_user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Record in history
  INSERT INTO maity.user_company_history (
    user_id, 
    company_id, 
    action,
    invitation_source
  ) VALUES (
    maity_user_id, 
    target_company_id, 
    'assigned',
    invitation_source
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'action', 'ASSIGNED',
    'message', 'User provisioned and assigned to company successfully',
    'company_name', target_company_name,
    'company_id', target_company_id
  );
END;
$$;