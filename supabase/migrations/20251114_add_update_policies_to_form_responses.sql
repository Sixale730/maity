-- Migration: Add UPDATE policies for maity.form_responses
-- Date: 2025-11-14
-- Purpose: Fix RLS violation when users/admins update their self-assessment
--
-- Issue: The table had SELECT and INSERT policies, but was missing UPDATE policies.
-- This caused errors when the updateSelfAssessmentOnly() method tried to update existing records.

-- Policy 1: Users can update own form responses
DO $$
BEGIN
  -- Check if policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'maity'
    AND tablename = 'form_responses'
    AND policyname = 'Users can update own form responses'
  ) THEN
    CREATE POLICY "Users can update own form responses"
      ON maity.form_responses FOR UPDATE
      USING (
        user_id IN (
          SELECT id FROM maity.users WHERE auth_id = auth.uid()
        )
      )
      WITH CHECK (
        user_id IN (
          SELECT id FROM maity.users WHERE auth_id = auth.uid()
        )
      );

    RAISE NOTICE 'Created policy: Users can update own form responses';
  ELSE
    RAISE NOTICE 'Policy already exists: Users can update own form responses';
  END IF;
END $$;

-- Policy 2: Admins can update all form responses
DO $$
BEGIN
  -- Check if policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'maity'
    AND tablename = 'form_responses'
    AND policyname = 'Admins can update all form responses'
  ) THEN
    CREATE POLICY "Admins can update all form responses"
      ON maity.form_responses FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM maity.user_roles ur
          JOIN maity.users u ON ur.user_id = u.id
          WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM maity.user_roles ur
          JOIN maity.users u ON ur.user_id = u.id
          WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
        )
      );

    RAISE NOTICE 'Created policy: Admins can update all form responses';
  ELSE
    RAISE NOTICE 'Policy already exists: Admins can update all form responses';
  END IF;
END $$;

-- Verify policies were created
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'maity'
  AND tablename = 'form_responses'
  AND cmd = 'UPDATE';

  RAISE NOTICE 'Total UPDATE policies on maity.form_responses: %', policy_count;
END $$;
