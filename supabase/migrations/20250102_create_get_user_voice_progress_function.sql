-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_user_voice_progress(UUID);
DROP FUNCTION IF EXISTS maity.get_user_voice_progress(UUID);

-- Create function to get user's voice progress for all profiles
CREATE OR REPLACE FUNCTION maity.get_user_voice_progress(p_auth_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  profile_id UUID,
  current_scenario_order INTEGER,
  current_difficulty_level INTEGER,
  scenarios_completed INTEGER,
  scenarios_failed INTEGER,
  total_sessions INTEGER,
  total_practice_time INTEGER,
  average_score NUMERIC,
  best_score NUMERIC,
  streak_days INTEGER,
  last_session_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    vup.id,
    vup.user_id,
    vup.profile_id,
    vup.current_scenario_order,
    vup.current_difficulty_level,
    vup.scenarios_completed,
    vup.scenarios_failed,
    vup.total_sessions,
    vup.total_practice_time,
    vup.average_score,
    vup.best_score,
    vup.streak_days,
    vup.last_session_date
  FROM maity.voice_user_progress vup
  JOIN maity.users u ON u.id = vup.user_id
  WHERE u.auth_id = p_auth_id
  ORDER BY vup.created_at;
END;
$$;

-- Create public wrapper
CREATE OR REPLACE FUNCTION public.get_user_voice_progress(p_auth_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  profile_id UUID,
  current_scenario_order INTEGER,
  current_difficulty_level INTEGER,
  scenarios_completed INTEGER,
  scenarios_failed INTEGER,
  total_sessions INTEGER,
  total_practice_time INTEGER,
  average_score NUMERIC,
  best_score NUMERIC,
  streak_days INTEGER,
  last_session_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_user_voice_progress(p_auth_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_voice_progress TO authenticated;

COMMENT ON FUNCTION maity.get_user_voice_progress IS 'Returns user voice progress for all profiles';
