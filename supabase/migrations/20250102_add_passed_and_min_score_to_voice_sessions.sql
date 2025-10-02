-- Add field to track the minimum score required for this specific session
-- This will be populated when the session is created from voice_profile_scenarios
ALTER TABLE maity.voice_sessions
ADD COLUMN IF NOT EXISTS min_score_to_pass NUMERIC(5,2) CHECK (min_score_to_pass >= 0 AND min_score_to_pass <= 100);

COMMENT ON COLUMN maity.voice_sessions.min_score_to_pass IS 'Minimum score required to pass this session (captured from voice_profile_scenarios at session creation time)';
COMMENT ON COLUMN maity.voice_sessions.passed IS 'Whether the user achieved the minimum score required (calculated when evaluation completes)';
