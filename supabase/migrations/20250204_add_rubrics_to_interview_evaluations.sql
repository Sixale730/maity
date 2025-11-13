-- Add rubrics column to interview_evaluations table
-- This allows storing structured evaluation data (same format as diagnostic_interviews)

-- Add rubrics column (JSONB for structured data)
ALTER TABLE maity.interview_evaluations
ADD COLUMN IF NOT EXISTS rubrics JSONB;

-- Add amazing_comment column (insight about user's personality)
ALTER TABLE maity.interview_evaluations
ADD COLUMN IF NOT EXISTS amazing_comment TEXT;

-- Add summary column (overall summary of interview)
ALTER TABLE maity.interview_evaluations
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Add is_complete column (whether interview met completion criteria)
ALTER TABLE maity.interview_evaluations
ADD COLUMN IF NOT EXISTS is_complete BOOLEAN DEFAULT false;

-- Add index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_interview_evaluations_rubrics
ON maity.interview_evaluations USING GIN (rubrics);

-- Add index for is_complete lookups
CREATE INDEX IF NOT EXISTS idx_interview_evaluations_is_complete
ON maity.interview_evaluations(is_complete);

COMMENT ON COLUMN maity.interview_evaluations.rubrics IS
'JSONB structure with 6 rubrics (claridad, adaptacion, persuasion, estructura, proposito, empatia), each containing: score (1-5), analysis, strengths[], areas_for_improvement[]';

COMMENT ON COLUMN maity.interview_evaluations.amazing_comment IS
'Deep personality insight deduced from interview responses - not obvious observations';

COMMENT ON COLUMN maity.interview_evaluations.summary IS
'Overall summary of who the user is based on interview';

COMMENT ON COLUMN maity.interview_evaluations.is_complete IS
'Whether the interview had sufficient content for meaningful evaluation (5+ meaningful exchanges)';
