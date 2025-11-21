-- =====================================================================
-- Add agent_id Column to voice_scenarios
-- Purpose: Allow each scenario to have its own ElevenLabs agent ID
-- Date: 2025-11-21
-- =====================================================================

-- Add agent_id column to voice_scenarios table
ALTER TABLE maity.voice_scenarios
ADD COLUMN IF NOT EXISTS agent_id TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN maity.voice_scenarios.agent_id IS 'ElevenLabs agent ID for this scenario (e.g., agent_5901kakktagnf739xrp8k320qq6j). Each scenario has its own agent. Profiles (CEO, CTO, CFO) use the same agent but with different profile variables.';

-- Optional: Add check constraint to validate agent_id format
ALTER TABLE maity.voice_scenarios
ADD CONSTRAINT check_agent_id_format
CHECK (agent_id IS NULL OR agent_id ~ '^agent_[a-z0-9]+$');

-- Index for faster lookups by agent_id (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_voice_scenarios_agent_id
ON maity.voice_scenarios(agent_id)
WHERE agent_id IS NOT NULL;
