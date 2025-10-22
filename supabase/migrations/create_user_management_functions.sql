-- User Management Functions for Admin/Manager Operations
-- Allows admins to manage all users, managers to manage users in their company

-- ============================================================================
-- Function: Get users for management (list view)
-- Admins: see all users
-- Managers: see only users from their company
-- ============================================================================

CREATE OR REPLACE FUNCTION maity.get_users_for_management()
RETURNS TABLE (
  id UUID,
  auth_id UUID,
  name TEXT,
  email TEXT,
  company_id UUID,
  company_name TEXT,
  role app_role,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  registration_form_completed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public, auth
AS $$
DECLARE
  v_user_role app_role;
  v_user_company_id UUID;
BEGIN
  -- Get current user's role
  SELECT ur.role INTO v_user_role
  FROM maity.user_roles ur
  JOIN maity.users u ON u.id = ur.user_id
  WHERE u.auth_id = auth.uid();

  -- Check if user is admin or manager
  IF v_user_role IS NULL OR v_user_role NOT IN ('admin', 'manager') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins and managers can view users';
  END IF;

  -- Get user's company_id (for managers)
  IF v_user_role = 'manager' THEN
    SELECT u.company_id INTO v_user_company_id
    FROM maity.users u
    WHERE u.auth_id = auth.uid();

    IF v_user_company_id IS NULL THEN
      RAISE EXCEPTION 'Manager must be assigned to a company';
    END IF;
  END IF;

  -- Return users based on role
  RETURN QUERY
  SELECT
    u.id,
    u.auth_id,
    u.name,
    u.email,
    u.company_id,
    c.name as company_name,
    COALESCE(ur.role, 'user'::app_role) as role,
    u.status,
    u.created_at,
    u.updated_at,
    u.registration_form_completed
  FROM maity.users u
  LEFT JOIN maity.companies c ON c.id = u.company_id
  LEFT JOIN maity.user_roles ur ON ur.user_id = u.id
  WHERE
    -- Admins see all users
    (v_user_role = 'admin')
    OR
    -- Managers see only users from their company
    (v_user_role = 'manager' AND u.company_id = v_user_company_id)
  ORDER BY u.created_at DESC;
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.get_users_for_management()
RETURNS TABLE (
  id UUID,
  auth_id UUID,
  name TEXT,
  email TEXT,
  company_id UUID,
  company_name TEXT,
  role app_role,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  registration_form_completed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_users_for_management();
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_users_for_management() TO authenticated;

-- ============================================================================
-- Function: Update user role
-- Only admins and managers can update roles
-- Managers can only update roles within their company and cannot create admins
-- ============================================================================

CREATE OR REPLACE FUNCTION maity.update_user_role(
  p_user_id UUID,
  p_new_role app_role
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public, auth
AS $$
DECLARE
  v_current_user_role app_role;
  v_current_user_company_id UUID;
  v_target_user_company_id UUID;
BEGIN
  -- Get current user's role and company
  SELECT ur.role, u.company_id INTO v_current_user_role, v_current_user_company_id
  FROM maity.user_roles ur
  JOIN maity.users u ON u.id = ur.user_id
  WHERE u.auth_id = auth.uid();

  -- Check permissions
  IF v_current_user_role IS NULL OR v_current_user_role NOT IN ('admin', 'manager') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'Only admins and managers can update user roles'
    );
  END IF;

  -- Get target user's company
  SELECT company_id INTO v_target_user_company_id
  FROM maity.users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'USER_NOT_FOUND',
      'message', 'User not found'
    );
  END IF;

  -- Manager restrictions
  IF v_current_user_role = 'manager' THEN
    -- Managers can only update users in their company
    IF v_target_user_company_id != v_current_user_company_id THEN
      RETURN json_build_object(
        'success', false,
        'error', 'UNAUTHORIZED',
        'message', 'Managers can only update users in their company'
      );
    END IF;

    -- Managers cannot create admins
    IF p_new_role = 'admin' THEN
      RETURN json_build_object(
        'success', false,
        'error', 'UNAUTHORIZED',
        'message', 'Managers cannot assign admin role'
      );
    END IF;
  END IF;

  -- Update role
  INSERT INTO maity.user_roles (user_id, role, created_at)
  VALUES (p_user_id, p_new_role, NOW())
  ON CONFLICT (user_id) DO UPDATE SET role = p_new_role;

  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'new_role', p_new_role
  );
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.update_user_role(
  p_user_id UUID,
  p_new_role app_role
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.update_user_role(p_user_id, p_new_role);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_user_role(UUID, app_role) TO authenticated;

-- ============================================================================
-- Function: Update user company
-- Only admins can move users between companies
-- ============================================================================

CREATE OR REPLACE FUNCTION maity.update_user_company(
  p_user_id UUID,
  p_company_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public, auth
AS $$
DECLARE
  v_current_user_role app_role;
BEGIN
  -- Get current user's role
  SELECT ur.role INTO v_current_user_role
  FROM maity.user_roles ur
  JOIN maity.users u ON u.id = ur.user_id
  WHERE u.auth_id = auth.uid();

  -- Only admins can update company assignments
  IF v_current_user_role != 'admin' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'Only admins can change user company assignments'
    );
  END IF;

  -- Validate company exists (if not null)
  IF p_company_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM maity.companies WHERE id = p_company_id) THEN
      RETURN json_build_object(
        'success', false,
        'error', 'COMPANY_NOT_FOUND',
        'message', 'Company not found'
      );
    END IF;
  END IF;

  -- Update user's company
  UPDATE maity.users
  SET company_id = p_company_id, updated_at = NOW()
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'USER_NOT_FOUND',
      'message', 'User not found'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'company_id', p_company_id
  );
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.update_user_company(
  p_user_id UUID,
  p_company_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.update_user_company(p_user_id, p_company_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_user_company(UUID, UUID) TO authenticated;

-- ============================================================================
-- Function: Update user status (activate/deactivate)
-- Admins and managers can update status
-- Managers can only update users in their company
-- ============================================================================

CREATE OR REPLACE FUNCTION maity.update_user_status(
  p_user_id UUID,
  p_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public, auth
AS $$
DECLARE
  v_current_user_role app_role;
  v_current_user_company_id UUID;
  v_target_user_company_id UUID;
BEGIN
  -- Validate status
  IF p_status NOT IN ('ACTIVE', 'INACTIVE', 'PENDING') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'INVALID_STATUS',
      'message', 'Status must be ACTIVE, INACTIVE, or PENDING'
    );
  END IF;

  -- Get current user's role and company
  SELECT ur.role, u.company_id INTO v_current_user_role, v_current_user_company_id
  FROM maity.user_roles ur
  JOIN maity.users u ON u.id = ur.user_id
  WHERE u.auth_id = auth.uid();

  -- Check permissions
  IF v_current_user_role IS NULL OR v_current_user_role NOT IN ('admin', 'manager') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'Only admins and managers can update user status'
    );
  END IF;

  -- Get target user's company
  SELECT company_id INTO v_target_user_company_id
  FROM maity.users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'USER_NOT_FOUND',
      'message', 'User not found'
    );
  END IF;

  -- Manager restriction: can only update users in their company
  IF v_current_user_role = 'manager' AND v_target_user_company_id != v_current_user_company_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'Managers can only update users in their company'
    );
  END IF;

  -- Update status
  UPDATE maity.users
  SET status = p_status, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'status', p_status
  );
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.update_user_status(
  p_user_id UUID,
  p_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.update_user_status(p_user_id, p_status);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_user_status(UUID, TEXT) TO authenticated;

-- ============================================================================
-- Function: Delete user
-- Only admins can delete users
-- Cascades to related records (sessions, evaluations, etc.)
-- ============================================================================

CREATE OR REPLACE FUNCTION maity.delete_user(
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public, auth
AS $$
DECLARE
  v_current_user_role app_role;
  v_user_auth_id UUID;
BEGIN
  -- Get current user's role
  SELECT ur.role INTO v_current_user_role
  FROM maity.user_roles ur
  JOIN maity.users u ON u.id = ur.user_id
  WHERE u.auth_id = auth.uid();

  -- Only admins can delete users
  IF v_current_user_role != 'admin' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'Only admins can delete users'
    );
  END IF;

  -- Get user's auth_id for auth.users deletion
  SELECT auth_id INTO v_user_auth_id
  FROM maity.users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'USER_NOT_FOUND',
      'message', 'User not found'
    );
  END IF;

  -- Delete from maity.users (cascades to related tables)
  DELETE FROM maity.users WHERE id = p_user_id;

  -- Delete from auth.users if auth_id exists
  IF v_user_auth_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = v_user_auth_id;
  END IF;

  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'deleted', true
  );
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.delete_user(
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.delete_user(p_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user(UUID) TO authenticated;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON FUNCTION maity.get_users_for_management IS 'Returns list of users for management. Admins see all users, managers see only users from their company.';
COMMENT ON FUNCTION maity.update_user_role IS 'Updates user role. Admins can assign any role, managers can only assign user/manager roles within their company.';
COMMENT ON FUNCTION maity.update_user_company IS 'Updates user company assignment. Only admins can use this function.';
COMMENT ON FUNCTION maity.update_user_status IS 'Updates user status (ACTIVE/INACTIVE/PENDING). Admins and managers can use this, managers only for their company users.';
COMMENT ON FUNCTION maity.delete_user IS 'Deletes a user and all related data. Only admins can use this function.';
