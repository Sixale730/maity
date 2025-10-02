-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_voice_agent_profiles();
DROP FUNCTION IF EXISTS maity.get_voice_agent_profiles();

-- Create function to get all voice agent profiles
CREATE OR REPLACE FUNCTION maity.get_voice_agent_profiles()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  key_focus TEXT,
  communication_style TEXT,
  personality_traits JSONB,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vap.id,
    vap.name,
    vap.description,
    vap.key_focus,
    vap.communication_style,
    vap.personality_traits,
    vap.is_active
  FROM maity.voice_agent_profiles vap
  WHERE vap.is_active = TRUE
  ORDER BY vap.name;
END;
$$;

-- Create public wrapper
CREATE OR REPLACE FUNCTION public.get_voice_agent_profiles()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  key_focus TEXT,
  communication_style TEXT,
  personality_traits JSONB,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_voice_agent_profiles();
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_voice_agent_profiles TO authenticated;

COMMENT ON FUNCTION maity.get_voice_agent_profiles IS 'Returns all active voice agent profiles';
