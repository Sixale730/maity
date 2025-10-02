-- Create function to update user progress when they pass a scenario
CREATE OR REPLACE FUNCTION maity.update_voice_user_progress_on_pass(
  p_user_id UUID,
  p_profile_scenario_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id UUID;
  v_scenario_order INTEGER;
  v_difficulty_level INTEGER;
  v_current_scenario_order INTEGER;
  v_current_difficulty_level INTEGER;
  v_total_scenarios_at_current_order INTEGER;
BEGIN
  -- Get profile_id, scenario order, and difficulty from profile_scenario_id
  SELECT
    vps.profile_id,
    vs.order_index,
    vdl.level
  INTO v_profile_id, v_scenario_order, v_difficulty_level
  FROM maity.voice_profile_scenarios vps
  JOIN maity.voice_scenarios vs ON vs.id = vps.scenario_id
  JOIN maity.voice_difficulty_levels vdl ON vdl.id = vps.difficulty_id
  WHERE vps.id = p_profile_scenario_id;

  -- If profile scenario not found, exit
  IF v_profile_id IS NULL THEN
    RAISE NOTICE 'Profile scenario not found: %', p_profile_scenario_id;
    RETURN;
  END IF;

  -- Get current user progress
  SELECT
    current_scenario_order,
    current_difficulty_level
  INTO v_current_scenario_order, v_current_difficulty_level
  FROM maity.voice_user_progress
  WHERE user_id = p_user_id AND profile_id = v_profile_id;

  -- Only update progress if this was the current scenario at current difficulty
  IF v_scenario_order = v_current_scenario_order AND v_difficulty_level = v_current_difficulty_level THEN

    -- Increment scenarios_completed
    UPDATE maity.voice_user_progress
    SET
      scenarios_completed = scenarios_completed + 1,
      last_session_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = p_user_id AND profile_id = v_profile_id;

    -- Check how many scenarios exist at the current order_index
    SELECT COUNT(DISTINCT vps.id)
    INTO v_total_scenarios_at_current_order
    FROM maity.voice_profile_scenarios vps
    JOIN maity.voice_scenarios vs ON vs.id = vps.scenario_id
    WHERE vps.profile_id = v_profile_id
      AND vs.order_index = v_current_scenario_order;

    -- If this was the last difficulty level for this scenario, advance to next scenario
    -- Assuming difficulty levels go 1, 2, 3, etc. and we want to advance after completing all
    -- For now, we'll advance to next scenario after completing each difficulty
    -- (You can adjust this logic based on your progression requirements)

    UPDATE maity.voice_user_progress
    SET
      current_scenario_order = current_scenario_order + 1,
      current_difficulty_level = 1, -- Reset to level 1 for new scenario
      updated_at = NOW()
    WHERE user_id = p_user_id
      AND profile_id = v_profile_id
      -- Only advance if there are more scenarios
      AND EXISTS (
        SELECT 1
        FROM maity.voice_scenarios vs
        WHERE vs.order_index > v_current_scenario_order
      );

    RAISE NOTICE 'User progress updated: user_id=%, profile_id=%, completed scenario order=%, difficulty=%',
      p_user_id, v_profile_id, v_scenario_order, v_difficulty_level;
  ELSE
    RAISE NOTICE 'Scenario was not current (order: % vs %, difficulty: % vs %), progress not advanced',
      v_scenario_order, v_current_scenario_order, v_difficulty_level, v_current_difficulty_level;
  END IF;
END;
$$;

-- Create public wrapper
CREATE OR REPLACE FUNCTION public.update_voice_user_progress_on_pass(
  p_user_id UUID,
  p_profile_scenario_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM maity.update_voice_user_progress_on_pass(p_user_id, p_profile_scenario_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_voice_user_progress_on_pass TO authenticated;

COMMENT ON FUNCTION maity.update_voice_user_progress_on_pass IS 'Updates user progress when they pass a scenario - increments completed count and advances to next scenario';
