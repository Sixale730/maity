-- Add RLS policies for INSERT/UPDATE operations needed by autojoin function
-- This completes the SECURITY INVOKER migration by adding RLS policies
-- for write operations on user_roles and user_company_history tables

-- ============================================================================
-- user_roles: Add INSERT and UPDATE policies
-- ============================================================================

-- Policy: Allow users to insert their own role during autojoin
CREATE POLICY "Users can insert their own role"
  ON maity.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow insert if the user_id being inserted matches the user's own ID
    user_id IN (
      SELECT id FROM maity.users WHERE auth_id = auth.uid()
    )
  );

-- Policy: Allow users to update their own role during autojoin
CREATE POLICY "Users can update their own role"
  ON maity.user_roles
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow update if the user_id matches the user's own ID
    user_id IN (
      SELECT id FROM maity.users WHERE auth_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Ensure the updated record still belongs to the same user
    user_id IN (
      SELECT id FROM maity.users WHERE auth_id = auth.uid()
    )
  );

-- ============================================================================
-- user_company_history: Add INSERT policy
-- ============================================================================

-- Policy: Allow users to insert their own company history during autojoin
CREATE POLICY "Users can insert their own company history"
  ON maity.user_company_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow insert if the user_id being inserted matches the user's own ID
    user_id IN (
      SELECT id FROM maity.users WHERE auth_id = auth.uid()
    )
  );

-- ============================================================================
-- Add comments for documentation
-- ============================================================================

COMMENT ON POLICY "Users can insert their own role" ON maity.user_roles IS
  'Allows authenticated users to insert their own role record during autojoin process. Required for SECURITY INVOKER context.';

COMMENT ON POLICY "Users can update their own role" ON maity.user_roles IS
  'Allows authenticated users to update their own role record during autojoin process. Required for SECURITY INVOKER context.';

COMMENT ON POLICY "Users can insert their own company history" ON maity.user_company_history IS
  'Allows authenticated users to insert their own company history record during autojoin process. Required for SECURITY INVOKER context.';
