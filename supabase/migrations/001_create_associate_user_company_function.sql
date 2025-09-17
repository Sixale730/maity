-- Create function to associate user with company
CREATE OR REPLACE FUNCTION maity.associate_user_company(
  user_auth_id UUID,
  company_uuid UUID,
  user_email TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_record RECORD;
  user_record RECORD;
  result JSON;
BEGIN
  -- Validate inputs
  IF user_auth_id IS NULL OR company_uuid IS NULL OR user_email IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'MISSING_FIELDS',
      'message', 'user_auth_id, company_uuid, and user_email are required'
    );
  END IF;

  -- Validate UUID format for company_uuid
  IF NOT (company_uuid::text ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'INVALID_COMPANY_ID',
      'message', 'Invalid company_uuid format'
    );
  END IF;

  -- Check if company exists and is active
  SELECT id, name, active INTO company_record
  FROM maity.companies
  WHERE id = company_uuid;

  IF NOT FOUND OR NOT company_record.active THEN
    RETURN json_build_object(
      'success', false,
      'error', 'COMPANY_NOT_FOUND',
      'message', 'Company not found or inactive'
    );
  END IF;

  -- Check if user already exists
  SELECT id, company_id INTO user_record
  FROM maity.users
  WHERE id = user_auth_id;

  -- If user doesn't exist, create them
  IF NOT FOUND THEN
    INSERT INTO maity.users (id, email, company_id, created_at, updated_at)
    VALUES (user_auth_id, user_email, company_uuid, NOW(), NOW());
    
    RETURN json_build_object(
      'success', true,
      'message', 'User created and associated with company',
      'company_name', company_record.name,
      'user_id', user_auth_id,
      'company_id', company_uuid
    );
  END IF;

  -- If user exists but doesn't have a company, update them
  IF user_record.company_id IS NULL THEN
    UPDATE maity.users
    SET company_id = company_uuid, updated_at = NOW()
    WHERE id = user_auth_id;
    
    RETURN json_build_object(
      'success', true,
      'message', 'User associated with company',
      'company_name', company_record.name,
      'user_id', user_auth_id,
      'company_id', company_uuid
    );
  END IF;

  -- User already has a company
  RETURN json_build_object(
    'success', true,
    'message', 'User already associated with company',
    'company_name', company_record.name,
    'user_id', user_auth_id,
    'company_id', user_record.company_id,
    'already_associated', true
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
GRANT EXECUTE ON FUNCTION maity.associate_user_company(UUID, UUID, TEXT) TO authenticated;
