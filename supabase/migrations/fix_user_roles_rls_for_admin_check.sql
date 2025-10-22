-- Fix RLS policy on user_roles to allow SELECT for admin verification
-- The existing "Users can view their own role" policy incorrectly compares
-- user_id (UUID from maity.users.id) with auth.uid() (UUID from auth.users.id / maity.users.auth_id)
-- This causes the companies UPDATE policy to fail when checking if user is admin

-- Add a new policy that allows users to SELECT their own role using the correct auth_id comparison
CREATE POLICY "Users can view own role via auth_id"
  ON maity.user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id
      FROM maity.users
      WHERE auth_id = auth.uid()
    )
  );

-- Update comment for documentation
COMMENT ON POLICY "Users can view own role via auth_id" ON maity.user_roles IS
  'Allows authenticated users to view their own role by matching auth_id. Required for RLS policies that verify user roles (e.g., companies UPDATE policy).';
