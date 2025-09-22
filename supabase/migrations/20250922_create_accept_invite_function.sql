-- Create function to accept invite and assign user role based on invite type
CREATE OR REPLACE FUNCTION maity.accept_invite(p_invite_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record RECORD;
  company_record RECORD;
  user_id UUID;
  user_email TEXT;
  role_to_assign TEXT;
  result JSON;
BEGIN
  -- Get current user info
  user_id := auth.uid();

  IF user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'User must be authenticated'
    );
  END IF;

  -- Get user email from auth
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;

  IF user_email IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'USER_NOT_FOUND',
      'message', 'User email not found'
    );
  END IF;

  -- Validate and get invite info
  SELECT id, company_id, audience, is_revoked, expires_at, max_uses, used_count
  INTO invite_record
  FROM maity.invite_links
  WHERE token = p_invite_token;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'INVITE_NOT_FOUND',
      'message', 'Invalid invite token'
    );
  END IF;

  -- Check if invite is revoked
  IF invite_record.is_revoked THEN
    RETURN json_build_object(
      'success', false,
      'error', 'INVITE_REVOKED',
      'message', 'Invite has been revoked'
    );
  END IF;

  -- Check if invite is expired
  IF invite_record.expires_at IS NOT NULL AND invite_record.expires_at < NOW() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'INVITE_EXPIRED',
      'message', 'Invite has expired'
    );
  END IF;

  -- Check if invite has reached max uses
  IF invite_record.max_uses IS NOT NULL AND invite_record.used_count >= invite_record.max_uses THEN
    RETURN json_build_object(
      'success', false,
      'error', 'INVITE_EXHAUSTED',
      'message', 'Invite has reached maximum uses'
    );
  END IF;

  -- Get company info
  SELECT id, name, is_active
  INTO company_record
  FROM maity.companies
  WHERE id = invite_record.company_id;

  IF NOT FOUND OR NOT company_record.is_active THEN
    RETURN json_build_object(
      'success', false,
      'error', 'COMPANY_NOT_FOUND',
      'message', 'Company not found or inactive'
    );
  END IF;

  -- Determine role based on invite audience
  CASE invite_record.audience
    WHEN 'platform_admin' THEN
      role_to_assign := 'platform_admin';
    WHEN 'admin' THEN
      role_to_assign := 'org_admin';
    WHEN 'user' THEN
      role_to_assign := 'user';
    ELSE
      role_to_assign := 'user'; -- default to user role
  END CASE;

  -- Create or update user in maity.users
  INSERT INTO maity.users (auth_id, email, company_id, created_at, updated_at)
  VALUES (user_id, user_email, invite_record.company_id, NOW(), NOW())
  ON CONFLICT (auth_id) DO UPDATE SET
    company_id = EXCLUDED.company_id,
    updated_at = NOW()
    WHERE maity.users.company_id IS NULL; -- Only update if user doesn't have a company

  -- Insert or update user role
  INSERT INTO maity.user_roles (user_id, role, created_at, updated_at)
  VALUES (user_id, role_to_assign, NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = NOW();

  -- Increment invite usage count
  UPDATE maity.invite_links
  SET used_count = used_count + 1,
      updated_at = NOW()
  WHERE id = invite_record.id;

  -- Return success response
  RETURN json_build_object(
    'success', true,
    'message', 'Invite accepted successfully',
    'company_name', company_record.name,
    'company_id', invite_record.company_id,
    'role_assigned', role_to_assign,
    'user_id', user_id
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION maity.accept_invite(TEXT) TO authenticated;