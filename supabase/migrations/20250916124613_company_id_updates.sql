-- Update company handling functions to use company_id instead of slug
CREATE OR REPLACE FUNCTION public.assign_company_simple(user_auth_id uuid, company_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $function$
DECLARE
  target_company_name text;
  user_id uuid;
BEGIN
  SELECT name INTO target_company_name
  FROM maity.companies
  WHERE id = company_id AND is_active = true
  LIMIT 1;

  IF target_company_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'COMPANY_NOT_FOUND',
      'message', 'Company not found'
    );
  END IF;

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

  UPDATE maity.users
  SET company_id = assign_company_simple.company_id,
      status = 'ACTIVE'
  WHERE id = user_id;

  INSERT INTO maity.user_company_history (user_id, company_id, action)
  VALUES (user_id, assign_company_simple.company_id, 'assigned');

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Company assigned successfully',
    'company_name', target_company_name,
    'company_id', assign_company_simple.company_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.provision_user_with_company(company_id uuid, invitation_source text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $function$
DECLARE
  user_auth_id uuid := auth.uid();
  target_company_name text;
  maity_user_id uuid;
  user_email text;
BEGIN
  SELECT name INTO target_company_name
  FROM maity.companies
  WHERE id = company_id AND is_active = true
  LIMIT 1;

  IF target_company_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'COMPANY_NOT_FOUND',
      'message', 'Company not found or inactive'
    );
  END IF;

  SELECT email INTO user_email FROM auth.users WHERE id = user_auth_id;

  INSERT INTO maity.users (auth_id, email, name, status, company_id)
  VALUES (
    user_auth_id,
    user_email,
    COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = user_auth_id),
             SPLIT_PART(user_email, '@', 1)),
    'ACTIVE',
    provision_user_with_company.company_id
  )
  ON CONFLICT (auth_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, maity.users.name),
    company_id = provision_user_with_company.company_id,
    status = 'ACTIVE'
  RETURNING id INTO maity_user_id;

  INSERT INTO maity.user_roles (user_id, role)
  VALUES (maity_user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO maity.user_company_history (
    user_id,
    company_id,
    action,
    invitation_source
  ) VALUES (
    maity_user_id,
    provision_user_with_company.company_id,
    'assigned',
    invitation_source
  );

  RETURN jsonb_build_object(
    'success', true,
    'action', 'ASSIGNED',
    'message', 'User provisioned and assigned to company successfully',
    'company_name', target_company_name,
    'company_id', provision_user_with_company.company_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_company_invitation(
  user_auth_id uuid,
  company_id uuid,
  invitation_source text DEFAULT NULL,
  force_assign boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $function$
DECLARE
  target_company_name text;
  current_user_id uuid;
  current_company_id uuid;
  current_company_name text;
BEGIN
  SELECT name INTO target_company_name
  FROM maity.companies
  WHERE id = company_id AND is_active = true
  LIMIT 1;

  IF target_company_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'COMPANY_NOT_FOUND',
      'message', 'Company not found or inactive'
    );
  END IF;

  SELECT id, company_id INTO current_user_id, current_company_id
  FROM maity.users
  WHERE auth_id = user_auth_id
  LIMIT 1;

  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'USER_NOT_FOUND',
      'message', 'User not found'
    );
  END IF;

  IF current_company_id IS NOT NULL THEN
    SELECT name INTO current_company_name
    FROM maity.companies
    WHERE id = current_company_id;
  END IF;

  IF current_company_id = company_id THEN
    RETURN jsonb_build_object(
      'success', true,
      'action', 'NO_CHANGE',
      'message', 'User already assigned to this company',
      'company_name', target_company_name
    );
  END IF;

  IF current_company_id IS NULL OR force_assign THEN
    UPDATE maity.users
    SET company_id = handle_company_invitation.company_id,
        status = 'ACTIVE'
    WHERE id = current_user_id;

    INSERT INTO maity.user_company_history (
      user_id,
      company_id,
      action,
      previous_company_id,
      invitation_source
    ) VALUES (
      current_user_id,
      handle_company_invitation.company_id,
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

  RETURN jsonb_build_object(
    'success', false,
    'action', 'CONFIRMATION_REQUIRED',
    'message', 'User already has a company assigned',
    'current_company', jsonb_build_object(
      'id', current_company_id,
      'name', current_company_name
    ),
    'target_company', jsonb_build_object(
      'id', handle_company_invitation.company_id,
      'name', target_company_name
    ),
    'invitation_source', invitation_source
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_user_company_invitation(
  user_auth_id uuid,
  user_email text,
  company_id uuid,
  invitation_source text DEFAULT NULL::text,
  force_assign boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $function$
DECLARE
  target_company_name text;
  current_user_id uuid;
  current_company_id uuid;
  current_company_name text;
BEGIN
  SELECT name INTO target_company_name
  FROM maity.companies
  WHERE id = company_id AND is_active = true
  LIMIT 1;

  IF target_company_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'COMPANY_NOT_FOUND',
      'message', 'Company not found or inactive'
    );
  END IF;

  SELECT id, company_id INTO current_user_id, current_company_id
  FROM maity.users
  WHERE auth_id = user_auth_id
  LIMIT 1;

  IF current_user_id IS NULL AND user_email IS NOT NULL THEN
    SELECT id, company_id INTO current_user_id, current_company_id
    FROM maity.users
    WHERE email = user_email
    LIMIT 1;

    IF current_user_id IS NOT NULL THEN
      UPDATE maity.users
      SET auth_id = user_auth_id,
          status = 'ACTIVE'
      WHERE id = current_user_id;
    END IF;
  END IF;

  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'USER_NOT_FOUND',
      'message', 'User needs to be provisioned first'
    );
  END IF;

  IF current_company_id IS NOT NULL THEN
    SELECT name INTO current_company_name
    FROM maity.companies
    WHERE id = current_company_id;
  END IF;

  IF current_company_id = company_id THEN
    RETURN jsonb_build_object(
      'success', true,
      'action', 'NO_CHANGE',
      'message', 'User already assigned to this company',
      'company_name', target_company_name
    );
  END IF;

  IF current_company_id IS NULL OR force_assign THEN
    UPDATE maity.users
    SET company_id = handle_user_company_invitation.company_id,
        status = 'ACTIVE'
    WHERE id = current_user_id;

    INSERT INTO maity.user_company_history (
      user_id,
      company_id,
      action,
      previous_company_id,
      invitation_source
    ) VALUES (
      current_user_id,
      handle_user_company_invitation.company_id,
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

  RETURN jsonb_build_object(
    'success', false,
    'action', 'CONFIRMATION_REQUIRED',
    'message', 'User already has a company assigned',
    'current_company', jsonb_build_object(
      'id', current_company_id,
      'name', current_company_name
    ),
    'target_company', jsonb_build_object(
      'id', handle_user_company_invitation.company_id,
      'name', target_company_name
    ),
    'invitation_source', invitation_source
  );
END;
$function$;
