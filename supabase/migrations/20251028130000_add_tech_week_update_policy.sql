-- Migration: Add UPDATE policies for tech_week_evaluations
-- Created: 2025-10-28
-- Purpose: Allow service role (n8n backend) and admins to UPDATE tech_week_evaluations
--          This fixes the issue where evaluations stay in 'pending' status forever
--          because the evaluation-complete API couldn't update them due to missing RLS policies

-- ===========================================================================
-- PROBLEM:
-- - tech_week_evaluations has RLS enabled
-- - Only SELECT policies exist
-- - When n8n calls /api/evaluation-complete, UPDATE fails
-- - Evaluations stay in 'pending' status
--
-- SOLUTION:
-- - Add UPDATE policy for service role (n8n backend)
-- - Add UPDATE policy for admins (manual intervention if needed)
-- - Grant UPDATE permission to authenticated role
-- ===========================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. CREATE UPDATE POLICY FOR SERVICE ROLE
-- ---------------------------------------------------------------------------
-- This allows the n8n backend (using SUPABASE_SERVICE_ROLE_KEY) to update
-- evaluation records when processing is complete.
-- Service role bypasses RLS by default, but explicit policy is good practice.

CREATE POLICY "Service role can update tech_week_evaluations"
  ON maity.tech_week_evaluations FOR UPDATE
  USING (true)  -- Allow all reads (service role bypasses RLS anyway)
  WITH CHECK (true);  -- Allow all writes (service role bypasses RLS anyway)

-- ---------------------------------------------------------------------------
-- 2. CREATE UPDATE POLICY FOR ADMINS
-- ---------------------------------------------------------------------------
-- This allows admin users to manually update evaluations if needed
-- (e.g., to fix issues, reprocess, or manually set scores)

CREATE POLICY "Admins can update tech_week_evaluations"
  ON maity.tech_week_evaluations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- 3. GRANT UPDATE PERMISSION
-- ---------------------------------------------------------------------------
-- Grant UPDATE permission to authenticated users
-- (RLS policies will control who can actually perform updates)

GRANT UPDATE ON maity.tech_week_evaluations TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. ADD COMMENTS
-- ---------------------------------------------------------------------------

COMMENT ON POLICY "Service role can update tech_week_evaluations"
  ON maity.tech_week_evaluations IS
  'Allows n8n backend (using service_role key) to complete Tech Week evaluations by updating status, score, and result';

COMMENT ON POLICY "Admins can update tech_week_evaluations"
  ON maity.tech_week_evaluations IS
  'Allows admin users to manually update Tech Week evaluations for troubleshooting or corrections';

-- ---------------------------------------------------------------------------
-- 5. VERIFICATION
-- ---------------------------------------------------------------------------
-- After applying this migration, verify with:
--
-- SELECT policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'maity'
--   AND tablename = 'tech_week_evaluations'
--   AND cmd = 'UPDATE';

COMMIT;
