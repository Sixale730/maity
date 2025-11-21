-- =====================================================================
-- Agent Configuration CRUD Functions
-- Purpose: Allow admins to modify voice agent profiles and scenarios
-- Date: 2025-11-21
-- =====================================================================

-- =====================================================================
-- VOICE AGENT PROFILES FUNCTIONS
-- =====================================================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_all_voice_agent_profiles_admin();
DROP FUNCTION IF EXISTS maity.get_all_voice_agent_profiles_admin();
DROP FUNCTION IF EXISTS public.update_voice_agent_profile(UUID, VARCHAR, TEXT, TEXT, TEXT, JSONB, VARCHAR, VARCHAR, BOOLEAN);
DROP FUNCTION IF EXISTS maity.update_voice_agent_profile(UUID, VARCHAR, TEXT, TEXT, TEXT, JSONB, VARCHAR, VARCHAR, BOOLEAN);
DROP FUNCTION IF EXISTS public.create_voice_agent_profile(VARCHAR, TEXT, TEXT, TEXT, JSONB, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS maity.create_voice_agent_profile(VARCHAR, TEXT, TEXT, TEXT, JSONB, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS public.toggle_voice_agent_profile_active(UUID);
DROP FUNCTION IF EXISTS maity.toggle_voice_agent_profile_active(UUID);

-- Get ALL voice agent profiles (including inactive) for admin
CREATE OR REPLACE FUNCTION maity.get_all_voice_agent_profiles_admin()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  key_focus TEXT,
  communication_style TEXT,
  personality_traits JSONB,
  area VARCHAR,
  impact VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can access all profiles';
  END IF;

  RETURN QUERY
  SELECT
    vap.id,
    vap.name,
    vap.description,
    vap.key_focus,
    vap.communication_style,
    vap.personality_traits,
    vap.area,
    vap.impact,
    vap.is_active,
    vap.created_at,
    vap.updated_at
  FROM maity.voice_agent_profiles vap
  ORDER BY vap.name;
END;
$$;

-- Public wrapper for get_all_voice_agent_profiles_admin
CREATE OR REPLACE FUNCTION public.get_all_voice_agent_profiles_admin()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  key_focus TEXT,
  communication_style TEXT,
  personality_traits JSONB,
  area VARCHAR,
  impact VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_all_voice_agent_profiles_admin();
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_voice_agent_profiles_admin TO authenticated;

-- Update voice agent profile
CREATE OR REPLACE FUNCTION maity.update_voice_agent_profile(
  p_id UUID,
  p_name VARCHAR,
  p_description TEXT,
  p_key_focus TEXT,
  p_communication_style TEXT,
  p_personality_traits JSONB,
  p_area VARCHAR,
  p_impact VARCHAR,
  p_is_active BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update profiles';
  END IF;

  -- Update the profile
  UPDATE maity.voice_agent_profiles
  SET
    name = p_name,
    description = p_description,
    key_focus = p_key_focus,
    communication_style = p_communication_style,
    personality_traits = p_personality_traits,
    area = p_area,
    impact = p_impact,
    is_active = p_is_active,
    updated_at = NOW()
  WHERE id = p_id
  RETURNING id INTO v_updated_id;

  IF v_updated_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found with id: %', p_id;
  END IF;

  RETURN v_updated_id;
END;
$$;

-- Public wrapper for update_voice_agent_profile
CREATE OR REPLACE FUNCTION public.update_voice_agent_profile(
  p_id UUID,
  p_name VARCHAR,
  p_description TEXT,
  p_key_focus TEXT,
  p_communication_style TEXT,
  p_personality_traits JSONB,
  p_area VARCHAR,
  p_impact VARCHAR,
  p_is_active BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.update_voice_agent_profile(
    p_id,
    p_name,
    p_description,
    p_key_focus,
    p_communication_style,
    p_personality_traits,
    p_area,
    p_impact,
    p_is_active
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_voice_agent_profile TO authenticated;

-- Create new voice agent profile
CREATE OR REPLACE FUNCTION maity.create_voice_agent_profile(
  p_name VARCHAR,
  p_description TEXT,
  p_key_focus TEXT,
  p_communication_style TEXT,
  p_personality_traits JSONB,
  p_area VARCHAR,
  p_impact VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can create profiles';
  END IF;

  -- Insert the new profile
  INSERT INTO maity.voice_agent_profiles (
    name,
    description,
    key_focus,
    communication_style,
    personality_traits,
    area,
    impact,
    is_active
  )
  VALUES (
    p_name,
    p_description,
    p_key_focus,
    p_communication_style,
    p_personality_traits,
    p_area,
    p_impact,
    TRUE
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

-- Public wrapper for create_voice_agent_profile
CREATE OR REPLACE FUNCTION public.create_voice_agent_profile(
  p_name VARCHAR,
  p_description TEXT,
  p_key_focus TEXT,
  p_communication_style TEXT,
  p_personality_traits JSONB,
  p_area VARCHAR,
  p_impact VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.create_voice_agent_profile(
    p_name,
    p_description,
    p_key_focus,
    p_communication_style,
    p_personality_traits,
    p_area,
    p_impact
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_voice_agent_profile TO authenticated;

-- Toggle profile active status (soft delete)
CREATE OR REPLACE FUNCTION maity.toggle_voice_agent_profile_active(
  p_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_status BOOLEAN;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can toggle profile status';
  END IF;

  -- Toggle the is_active status
  UPDATE maity.voice_agent_profiles
  SET
    is_active = NOT is_active,
    updated_at = NOW()
  WHERE id = p_id
  RETURNING is_active INTO v_new_status;

  IF v_new_status IS NULL THEN
    RAISE EXCEPTION 'Profile not found with id: %', p_id;
  END IF;

  RETURN v_new_status;
END;
$$;

-- Public wrapper for toggle_voice_agent_profile_active
CREATE OR REPLACE FUNCTION public.toggle_voice_agent_profile_active(
  p_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.toggle_voice_agent_profile_active(p_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_voice_agent_profile_active TO authenticated;

-- =====================================================================
-- VOICE SCENARIOS FUNCTIONS
-- =====================================================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_all_voice_scenarios_admin();
DROP FUNCTION IF EXISTS maity.get_all_voice_scenarios_admin();
DROP FUNCTION IF EXISTS public.update_voice_scenario(UUID, VARCHAR, VARCHAR, INTEGER, TEXT, JSONB, VARCHAR, TEXT, TEXT, TEXT, INTEGER, VARCHAR, BOOLEAN);
DROP FUNCTION IF EXISTS maity.update_voice_scenario(UUID, VARCHAR, VARCHAR, INTEGER, TEXT, JSONB, VARCHAR, TEXT, TEXT, TEXT, INTEGER, VARCHAR, BOOLEAN);
DROP FUNCTION IF EXISTS public.create_voice_scenario(VARCHAR, VARCHAR, INTEGER, TEXT, JSONB, VARCHAR, TEXT, TEXT, TEXT, INTEGER, VARCHAR);
DROP FUNCTION IF EXISTS maity.create_voice_scenario(VARCHAR, VARCHAR, INTEGER, TEXT, JSONB, VARCHAR, TEXT, TEXT, TEXT, INTEGER, VARCHAR);
DROP FUNCTION IF EXISTS public.toggle_voice_scenario_active(UUID);
DROP FUNCTION IF EXISTS maity.toggle_voice_scenario_active(UUID);

-- Get ALL voice scenarios (including inactive) for admin
CREATE OR REPLACE FUNCTION maity.get_all_voice_scenarios_admin()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  code VARCHAR,
  order_index INTEGER,
  context TEXT,
  objectives JSONB,
  skill VARCHAR,
  instructions TEXT,
  rules TEXT,
  closing TEXT,
  estimated_duration INTEGER,
  category VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can access all scenarios';
  END IF;

  RETURN QUERY
  SELECT
    vs.id,
    vs.name,
    vs.code,
    vs.order_index,
    vs.context,
    vs.objectives,
    vs.skill,
    vs.instructions,
    vs.rules,
    vs.closing,
    vs.estimated_duration,
    vs.category,
    vs.is_active,
    vs.created_at,
    vs.updated_at
  FROM maity.voice_scenarios vs
  ORDER BY vs.order_index, vs.name;
END;
$$;

-- Public wrapper for get_all_voice_scenarios_admin
CREATE OR REPLACE FUNCTION public.get_all_voice_scenarios_admin()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  code VARCHAR,
  order_index INTEGER,
  context TEXT,
  objectives JSONB,
  skill VARCHAR,
  instructions TEXT,
  rules TEXT,
  closing TEXT,
  estimated_duration INTEGER,
  category VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_all_voice_scenarios_admin();
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_voice_scenarios_admin TO authenticated;

-- Update voice scenario
CREATE OR REPLACE FUNCTION maity.update_voice_scenario(
  p_id UUID,
  p_name VARCHAR,
  p_code VARCHAR,
  p_order_index INTEGER,
  p_context TEXT,
  p_objectives JSONB,
  p_skill VARCHAR,
  p_instructions TEXT,
  p_rules TEXT,
  p_closing TEXT,
  p_estimated_duration INTEGER,
  p_category VARCHAR,
  p_is_active BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update scenarios';
  END IF;

  -- Update the scenario
  UPDATE maity.voice_scenarios
  SET
    name = p_name,
    code = p_code,
    order_index = p_order_index,
    context = p_context,
    objectives = p_objectives,
    skill = p_skill,
    instructions = p_instructions,
    rules = p_rules,
    closing = p_closing,
    estimated_duration = p_estimated_duration,
    category = p_category,
    is_active = p_is_active,
    updated_at = NOW()
  WHERE id = p_id
  RETURNING id INTO v_updated_id;

  IF v_updated_id IS NULL THEN
    RAISE EXCEPTION 'Scenario not found with id: %', p_id;
  END IF;

  RETURN v_updated_id;
END;
$$;

-- Public wrapper for update_voice_scenario
CREATE OR REPLACE FUNCTION public.update_voice_scenario(
  p_id UUID,
  p_name VARCHAR,
  p_code VARCHAR,
  p_order_index INTEGER,
  p_context TEXT,
  p_objectives JSONB,
  p_skill VARCHAR,
  p_instructions TEXT,
  p_rules TEXT,
  p_closing TEXT,
  p_estimated_duration INTEGER,
  p_category VARCHAR,
  p_is_active BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.update_voice_scenario(
    p_id,
    p_name,
    p_code,
    p_order_index,
    p_context,
    p_objectives,
    p_skill,
    p_instructions,
    p_rules,
    p_closing,
    p_estimated_duration,
    p_category,
    p_is_active
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_voice_scenario TO authenticated;

-- Create new voice scenario
CREATE OR REPLACE FUNCTION maity.create_voice_scenario(
  p_name VARCHAR,
  p_code VARCHAR,
  p_order_index INTEGER,
  p_context TEXT,
  p_objectives JSONB,
  p_skill VARCHAR,
  p_instructions TEXT,
  p_rules TEXT,
  p_closing TEXT,
  p_estimated_duration INTEGER,
  p_category VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can create scenarios';
  END IF;

  -- Insert the new scenario
  INSERT INTO maity.voice_scenarios (
    name,
    code,
    order_index,
    context,
    objectives,
    skill,
    instructions,
    rules,
    closing,
    estimated_duration,
    category,
    is_active
  )
  VALUES (
    p_name,
    p_code,
    p_order_index,
    p_context,
    p_objectives,
    p_skill,
    p_instructions,
    p_rules,
    p_closing,
    p_estimated_duration,
    p_category,
    TRUE
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

-- Public wrapper for create_voice_scenario
CREATE OR REPLACE FUNCTION public.create_voice_scenario(
  p_name VARCHAR,
  p_code VARCHAR,
  p_order_index INTEGER,
  p_context TEXT,
  p_objectives JSONB,
  p_skill VARCHAR,
  p_instructions TEXT,
  p_rules TEXT,
  p_closing TEXT,
  p_estimated_duration INTEGER,
  p_category VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.create_voice_scenario(
    p_name,
    p_code,
    p_order_index,
    p_context,
    p_objectives,
    p_skill,
    p_instructions,
    p_rules,
    p_closing,
    p_estimated_duration,
    p_category
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_voice_scenario TO authenticated;

-- Toggle scenario active status (soft delete)
CREATE OR REPLACE FUNCTION maity.toggle_voice_scenario_active(
  p_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_status BOOLEAN;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can toggle scenario status';
  END IF;

  -- Toggle the is_active status
  UPDATE maity.voice_scenarios
  SET
    is_active = NOT is_active,
    updated_at = NOW()
  WHERE id = p_id
  RETURNING is_active INTO v_new_status;

  IF v_new_status IS NULL THEN
    RAISE EXCEPTION 'Scenario not found with id: %', p_id;
  END IF;

  RETURN v_new_status;
END;
$$;

-- Public wrapper for toggle_voice_scenario_active
CREATE OR REPLACE FUNCTION public.toggle_voice_scenario_active(
  p_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.toggle_voice_scenario_active(p_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_voice_scenario_active TO authenticated;

-- =====================================================================
-- COMMENTS
-- =====================================================================

COMMENT ON FUNCTION maity.get_all_voice_agent_profiles_admin IS 'Returns ALL voice agent profiles (including inactive) for admin';
COMMENT ON FUNCTION maity.update_voice_agent_profile IS 'Updates an existing voice agent profile (admin only)';
COMMENT ON FUNCTION maity.create_voice_agent_profile IS 'Creates a new voice agent profile (admin only)';
COMMENT ON FUNCTION maity.toggle_voice_agent_profile_active IS 'Toggles the active status of a voice agent profile (admin only)';

COMMENT ON FUNCTION maity.get_all_voice_scenarios_admin IS 'Returns ALL voice scenarios (including inactive) for admin';
COMMENT ON FUNCTION maity.update_voice_scenario IS 'Updates an existing voice scenario (admin only)';
COMMENT ON FUNCTION maity.create_voice_scenario IS 'Creates a new voice scenario (admin only)';
COMMENT ON FUNCTION maity.toggle_voice_scenario_active IS 'Toggles the active status of a voice scenario (admin only)';
