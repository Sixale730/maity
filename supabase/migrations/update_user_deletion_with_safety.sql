-- Enhanced user deletion with safety checks and impact analysis
-- Prevents self-deletion, checks for last admin, shows deletion impact

-- ============================================================================
-- Function: Get user deletion impact (what will be deleted)
-- Returns count of all related records that will be deleted
-- ============================================================================

CREATE OR REPLACE FUNCTION maity.get_user_deletion_impact(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public, auth
AS $$
DECLARE
  v_impact JSON;
BEGIN
  -- Build impact object with counts from each table
  SELECT json_build_object(
    'sessions', (SELECT COUNT(*) FROM maity.sessions WHERE session_id = p_user_id),
    'evaluations', (SELECT COUNT(*) FROM maity.evaluations WHERE user_id = p_user_id),
    'voice_sessions', (SELECT COUNT(*) FROM maity.voice_sessions WHERE user_id = p_user_id),
    'form_responses', (SELECT COUNT(*) FROM maity.form_responses WHERE user_id = p_user_id),
    'tally_submissions', (SELECT COUNT(*) FROM maity.tally_submissions WHERE user_id = p_user_id),
    'user_roles', (SELECT COUNT(*) FROM maity.user_roles WHERE user_id = p_user_id),
    'user_company_history', (SELECT COUNT(*) FROM maity.user_company_history WHERE user_id = p_user_id),
    'voice_progress', (SELECT COUNT(*) FROM maity.voice_user_progress WHERE user_id = p_user_id)
  ) INTO v_impact;

  RETURN v_impact;
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.get_user_deletion_impact(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.get_user_deletion_impact(p_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_deletion_impact(UUID) TO authenticated;

-- ============================================================================
-- Function: Enhanced delete_user with safety checks
-- Prevents self-deletion and last admin deletion
-- ============================================================================

CREATE OR REPLACE FUNCTION maity.delete_user(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public, auth
AS $$
DECLARE
  v_current_user_role app_role;
  v_current_user_id UUID;
  v_user_auth_id UUID;
  v_target_user_role app_role;
  v_admin_count INTEGER;
BEGIN
  -- Get current user's ID and role
  SELECT u.id, ur.role INTO v_current_user_id, v_current_user_role
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

  -- SAFETY CHECK 1: Prevent self-deletion
  IF v_current_user_id = p_user_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'SELF_DELETION_NOT_ALLOWED',
      'message', 'You cannot delete your own account. Ask another admin to do it.'
    );
  END IF;

  -- Get target user's auth_id and role
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

  SELECT role INTO v_target_user_role
  FROM maity.user_roles
  WHERE user_id = p_user_id;

  -- SAFETY CHECK 2: Prevent deleting last admin
  IF v_target_user_role = 'admin' THEN
    SELECT COUNT(*) INTO v_admin_count
    FROM maity.user_roles
    WHERE role = 'admin';

    IF v_admin_count <= 1 THEN
      RETURN json_build_object(
        'success', false,
        'error', 'LAST_ADMIN',
        'message', 'Cannot delete the last admin in the system. Assign admin role to another user first.'
      );
    END IF;
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

-- Public wrapper (already exists, just updating)
CREATE OR REPLACE FUNCTION public.delete_user(p_user_id UUID)
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
-- Function: Get company deletion impact (check users before delete)
-- ============================================================================

CREATE OR REPLACE FUNCTION maity.get_company_deletion_impact(p_company_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public, auth
AS $$
DECLARE
  v_impact JSON;
  v_user_count INTEGER;
  v_admin_count INTEGER;
  v_manager_count INTEGER;
  v_user_role_count INTEGER;
BEGIN
  -- Count users by role
  SELECT COUNT(*) INTO v_user_count
  FROM maity.users
  WHERE company_id = p_company_id;

  SELECT COUNT(*) INTO v_admin_count
  FROM maity.users u
  JOIN maity.user_roles ur ON ur.user_id = u.id
  WHERE u.company_id = p_company_id AND ur.role = 'admin';

  SELECT COUNT(*) INTO v_manager_count
  FROM maity.users u
  JOIN maity.user_roles ur ON ur.user_id = u.id
  WHERE u.company_id = p_company_id AND ur.role = 'manager';

  SELECT COUNT(*) INTO v_user_role_count
  FROM maity.users u
  JOIN maity.user_roles ur ON ur.user_id = u.id
  WHERE u.company_id = p_company_id AND ur.role = 'user';

  -- Build impact object
  SELECT json_build_object(
    'total_users', v_user_count,
    'admins', v_admin_count,
    'managers', v_manager_count,
    'users', v_user_role_count,
    'can_delete', v_user_count = 0
  ) INTO v_impact;

  RETURN v_impact;
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.get_company_deletion_impact(p_company_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.get_company_deletion_impact(p_company_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_company_deletion_impact(UUID) TO authenticated;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON FUNCTION maity.get_user_deletion_impact IS
  'Returns count of all related records that will be deleted when user is deleted. Used to show impact before confirmation.';

COMMENT ON FUNCTION maity.delete_user IS
  'Enhanced user deletion with safety checks: prevents self-deletion and last admin deletion. Cascades to all related records.';

COMMENT ON FUNCTION maity.get_company_deletion_impact IS
  'Returns count of users assigned to company by role. Used to prevent deletion of companies with assigned users.';
