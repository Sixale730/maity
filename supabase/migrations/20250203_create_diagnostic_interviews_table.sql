-- =====================================================
-- Table: diagnostic_interviews
-- Description: Stores Coach diagnostic interview evaluations
-- Evaluates 6 rubrics (same as self-assessment): Claridad, Adaptación, Persuasión, Estructura, Propósito, Empatía
-- Related to: Coach first interview evaluation feature
-- =====================================================

-- Create diagnostic_interviews table
CREATE TABLE IF NOT EXISTS maity.diagnostic_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES maity.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES maity.voice_sessions(id) ON DELETE SET NULL,
  transcript TEXT NOT NULL,
  rubrics JSONB NOT NULL,
  amazing_comment TEXT,
  summary TEXT,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX idx_diagnostic_interviews_user_id ON maity.diagnostic_interviews(user_id);
CREATE INDEX idx_diagnostic_interviews_session_id ON maity.diagnostic_interviews(session_id);
CREATE INDEX idx_diagnostic_interviews_is_complete ON maity.diagnostic_interviews(is_complete);

-- Enable RLS
ALTER TABLE maity.diagnostic_interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own diagnostic interviews
CREATE POLICY "Users can view own diagnostic interviews"
  ON maity.diagnostic_interviews
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own diagnostic interviews
CREATE POLICY "Users can create own diagnostic interviews"
  ON maity.diagnostic_interviews
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own diagnostic interviews
CREATE POLICY "Users can update own diagnostic interviews"
  ON maity.diagnostic_interviews
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can view all diagnostic interviews
CREATE POLICY "Admins can view all diagnostic interviews"
  ON maity.diagnostic_interviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all diagnostic interviews
CREATE POLICY "Admins can update all diagnostic interviews"
  ON maity.diagnostic_interviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete diagnostic interviews
CREATE POLICY "Admins can delete diagnostic interviews"
  ON maity.diagnostic_interviews
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add comments
COMMENT ON TABLE maity.diagnostic_interviews IS 'Stores Coach diagnostic interview evaluations with rubrics';
COMMENT ON COLUMN maity.diagnostic_interviews.user_id IS 'Reference to the user who completed the diagnostic interview';
COMMENT ON COLUMN maity.diagnostic_interviews.session_id IS 'Reference to the voice session (from voice_sessions table)';
COMMENT ON COLUMN maity.diagnostic_interviews.transcript IS 'Raw transcript of the diagnostic interview conversation';
COMMENT ON COLUMN maity.diagnostic_interviews.rubrics IS 'JSONB object containing evaluation of 6 rubrics: claridad, adaptacion, persuasion, estructura, proposito, empatia. Each rubric has: score (1-5), analysis (text), strengths (array), areas_for_improvement (array)';
COMMENT ON COLUMN maity.diagnostic_interviews.amazing_comment IS 'AI-generated comment highlighting something surprising/impressive from the user';
COMMENT ON COLUMN maity.diagnostic_interviews.summary IS 'Overall summary of the diagnostic interview';
COMMENT ON COLUMN maity.diagnostic_interviews.is_complete IS 'Whether the interview met completion criteria';

-- Note on future restriction:
-- To enforce "one diagnostic interview per user" in the future, uncomment this:
-- CREATE UNIQUE INDEX idx_diagnostic_interviews_one_per_user
--   ON maity.diagnostic_interviews(user_id)
--   WHERE is_complete = true;
--
-- This will allow only ONE completed diagnostic interview per user.
