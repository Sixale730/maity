-- Fix RLS policy for UPDATE on companies table
-- Add WITH CHECK clause to validate new row values during UPDATE operations
-- This fixes the "PGRST116: The result contains 0 rows" error when admins try to save autojoin configuration

-- Drop existing policy
DROP POLICY IF EXISTS "Admins can update companies" ON maity.companies;

-- Recreate policy with WITH CHECK clause
CREATE POLICY "Admins can update companies"
  ON maity.companies
  FOR UPDATE
  USING (
    -- Allow selection if user is admin
    EXISTS (
      SELECT 1
      FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid()
      AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    -- Validate new values if user is admin
    EXISTS (
      SELECT 1
      FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- Update comment for documentation
COMMENT ON POLICY "Admins can update companies" ON maity.companies IS
  'Allows admin users to update company records including autojoin configuration (domain, auto_join_enabled). WITH CHECK clause validates new row values.';
