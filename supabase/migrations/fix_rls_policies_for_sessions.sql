-- Migration: Fix RLS policies for sessions tables
-- Description: Correct auth.uid() vs maity.users.id mismatch in RLS policies
-- Created: 2025-11-10
-- Issue: Admins and users cannot see sessions because policies compare wrong UUIDs

-- ============================================================================
-- FIX INTERVIEW_SESSIONS RLS POLICIES
-- ============================================================================

-- Drop incorrect policies
DROP POLICY IF EXISTS "Users can view own interview sessions" ON maity.interview_sessions;
DROP POLICY IF EXISTS "Users can create own interview sessions" ON maity.interview_sessions;
DROP POLICY IF EXISTS "Users can update own interview sessions" ON maity.interview_sessions;
DROP POLICY IF EXISTS "Admins can view all interview sessions" ON maity.interview_sessions;

-- Create corrected SELECT policy for users
CREATE POLICY "Users can view own interview sessions"
  ON maity.interview_sessions
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM maity.users WHERE auth_id = auth.uid()
    )
  );

-- Create corrected INSERT policy for users
CREATE POLICY "Users can create own interview sessions"
  ON maity.interview_sessions
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM maity.users WHERE auth_id = auth.uid()
    )
  );

-- Create corrected UPDATE policy for users
CREATE POLICY "Users can update own interview sessions"
  ON maity.interview_sessions
  FOR UPDATE
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

-- Create corrected admin policy
CREATE POLICY "Admins can view all interview sessions"
  ON maity.interview_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- ============================================================================
-- FIX VOICE_SESSIONS RLS POLICIES
-- ============================================================================

-- Drop existing policies (they may or may not exist)
DROP POLICY IF EXISTS "Users can view own voice sessions" ON maity.voice_sessions;
DROP POLICY IF EXISTS "Users can insert own voice sessions" ON maity.voice_sessions;
DROP POLICY IF EXISTS "Users can update own voice sessions" ON maity.voice_sessions;
DROP POLICY IF EXISTS "Admins can view all voice sessions" ON maity.voice_sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON maity.voice_sessions;
DROP POLICY IF EXISTS "Users can update sessions" ON maity.voice_sessions;

-- Create corrected SELECT policy for users
CREATE POLICY "Users can view own voice sessions"
  ON maity.voice_sessions
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM maity.users WHERE auth_id = auth.uid()
    )
  );

-- Create corrected UPDATE policy for users
CREATE POLICY "Users can update own voice sessions"
  ON maity.voice_sessions
  FOR UPDATE
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

-- Create corrected admin policy for voice_sessions
CREATE POLICY "Admins can view all voice sessions"
  ON maity.voice_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can view own interview sessions" ON maity.interview_sessions IS
'Allows users to view their own interview sessions by joining through maity.users.auth_id';

COMMENT ON POLICY "Admins can view all interview sessions" ON maity.interview_sessions IS
'Allows admins to view all interview sessions by checking role through proper user mapping';

COMMENT ON POLICY "Users can view own voice sessions" ON maity.voice_sessions IS
'Allows users to view their own voice/roleplay sessions by joining through maity.users.auth_id';

COMMENT ON POLICY "Admins can view all voice sessions" ON maity.voice_sessions IS
'Allows admins to view all voice/roleplay sessions by checking role through proper user mapping';
