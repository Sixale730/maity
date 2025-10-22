-- =====================================================
-- Table: interview_sessions
-- Description: Stores user interview practice sessions
-- Related to: "Mi primer entrevista" feature
-- =====================================================

-- Create interview_sessions table
CREATE TABLE IF NOT EXISTS maity.interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES maity.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  raw_transcript TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  processed_feedback JSONB,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX idx_interview_sessions_user_id ON maity.interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_status ON maity.interview_sessions(status);
CREATE INDEX idx_interview_sessions_created_at ON maity.interview_sessions(created_at DESC);

-- Enable RLS
ALTER TABLE maity.interview_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own sessions
CREATE POLICY "Users can view own interview sessions"
  ON maity.interview_sessions
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own sessions
CREATE POLICY "Users can create own interview sessions"
  ON maity.interview_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own sessions
CREATE POLICY "Users can update own interview sessions"
  ON maity.interview_sessions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can view all sessions
CREATE POLICY "Admins can view all interview sessions"
  ON maity.interview_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Note: updated_at trigger not added - function update_updated_at_column() needs to be created first

-- Add comments
COMMENT ON TABLE maity.interview_sessions IS 'Stores practice interview sessions for users';
COMMENT ON COLUMN maity.interview_sessions.user_id IS 'Reference to the user who participated in the interview';
COMMENT ON COLUMN maity.interview_sessions.duration_seconds IS 'Duration of the interview in seconds';
COMMENT ON COLUMN maity.interview_sessions.raw_transcript IS 'Raw transcript of the interview conversation';
COMMENT ON COLUMN maity.interview_sessions.score IS 'Final score from 0-100';
COMMENT ON COLUMN maity.interview_sessions.processed_feedback IS 'AI-generated feedback and evaluation';
COMMENT ON COLUMN maity.interview_sessions.status IS 'Current status: in_progress, completed, or cancelled';
