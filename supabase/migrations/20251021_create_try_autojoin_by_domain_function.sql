-- Create RPC function for domain-based autojoin
-- This function attempts to automatically assign a user to a company based on their email domain

-- Main function in maity schema
CREATE OR REPLACE FUNCTION maity.try_autojoin_by_domain(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public
AS $$
DECLARE
  v_user_id UUID;
  v_user_auth_id UUID;
  v_email_domain TEXT;
  v_matching_company RECORD;
  v_existing_company_id UUID;
BEGIN
  -- Get current authenticated user
  v_user_auth_id := auth.uid();

  IF v_user_auth_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'User must be authenticated'
    );
  END IF;

  -- Validate email parameter
  IF p_email IS NULL OR p_email = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'INVALID_EMAIL',
      'message', 'Email is required'
    );
  END IF;

  -- Extract domain from email (everything after @)
  v_email_domain := lower(substring(p_email from '@(.*)$'));

  IF v_email_domain IS NULL OR v_email_domain = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'INVALID_EMAIL_FORMAT',
      'message', 'Could not extract domain from email'
    );
  END IF;

  -- Get user's current company (if any)
  SELECT id, company_id INTO v_user_id, v_existing_company_id
  FROM maity.users
  WHERE auth_id = v_user_auth_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'USER_NOT_FOUND',
      'message', 'User not found in database'
    );
  END IF;

  -- Check if user already has a company assigned
  -- Per requirements: Block if user already has company
  IF v_existing_company_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'USER_ALREADY_HAS_COMPANY',
      'message', 'User already belongs to a company',
      'company_id', v_existing_company_id
    );
  END IF;

  -- Find company with matching domain and autojoin enabled
  SELECT id, name, slug
  INTO v_matching_company
  FROM maity.companies
  WHERE domain = v_email_domain
    AND auto_join_enabled = true
    AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'NO_MATCHING_DOMAIN',
      'message', 'No company found with autojoin enabled for domain: ' || v_email_domain
    );
  END IF;

  -- Assign user to company
  UPDATE maity.users
  SET
    company_id = v_matching_company.id,
    status = 'ACTIVE',
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Assign 'user' role (basic member)
  INSERT INTO maity.user_roles (user_id, role, created_at, updated_at)
  VALUES (v_user_id, 'user', NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET
    role = 'user',
    updated_at = NOW();

  -- Log in company history for auditing
  INSERT INTO maity.user_company_history (
    user_id,
    company_id,
    action,
    invitation_source,
    created_at
  )
  VALUES (
    v_user_id,
    v_matching_company.id,
    'assigned',
    'autojoin_by_domain',
    NOW()
  );

  -- Return success with company details
  RETURN json_build_object(
    'success', true,
    'company_id', v_matching_company.id,
    'company_name', v_matching_company.name,
    'company_slug', v_matching_company.slug,
    'role_assigned', 'user',
    'method', 'autojoin',
    'domain', v_email_domain
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'UNEXPECTED_ERROR',
      'message', 'An unexpected error occurred: ' || SQLERRM
    );
END;
$$;

-- Create public wrapper for the function
CREATE OR REPLACE FUNCTION public.try_autojoin_by_domain(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.try_autojoin_by_domain(p_email);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.try_autojoin_by_domain(TEXT) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION maity.try_autojoin_by_domain IS 'Attempts to automatically assign user to company based on email domain. Returns JSON with success status and company details.';
COMMENT ON FUNCTION public.try_autojoin_by_domain IS 'Public wrapper for maity.try_autojoin_by_domain function';
