-- =====================================================================
-- Update RPC Functions to Handle agent_id
-- Purpose: Add agent_id parameter to scenario CRUD functions
-- Date: 2025-11-21
-- =====================================================================

-- =====================================================================
-- 1. UPDATE get_all_voice_scenarios_admin to return agent_id
-- =====================================================================

DROP FUNCTION IF EXISTS public.get_all_voice_scenarios_admin();
DROP FUNCTION IF EXISTS maity.get_all_voice_scenarios_admin();

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
  agent_id TEXT,
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
    vs.agent_id,
    vs.is_active,
    vs.created_at,
    vs.updated_at
  FROM maity.voice_scenarios vs
  ORDER BY vs.order_index, vs.name;
END;
$$;

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
  agent_id TEXT,
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

-- =====================================================================
-- 2. UPDATE create_voice_scenario to accept agent_id
-- =====================================================================

DROP FUNCTION IF EXISTS public.create_voice_scenario(VARCHAR, VARCHAR, INTEGER, TEXT, JSONB, VARCHAR, TEXT, TEXT, TEXT, INTEGER, VARCHAR);
DROP FUNCTION IF EXISTS maity.create_voice_scenario(VARCHAR, VARCHAR, INTEGER, TEXT, JSONB, VARCHAR, TEXT, TEXT, TEXT, INTEGER, VARCHAR);

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
  p_category VARCHAR,
  p_agent_id TEXT DEFAULT NULL
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
    agent_id,
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
    p_agent_id,
    TRUE
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

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
  p_category VARCHAR,
  p_agent_id TEXT DEFAULT NULL
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
    p_category,
    p_agent_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_voice_scenario TO authenticated;

-- =====================================================================
-- 3. UPDATE update_voice_scenario to accept agent_id
-- =====================================================================

DROP FUNCTION IF EXISTS public.update_voice_scenario(UUID, VARCHAR, VARCHAR, INTEGER, TEXT, JSONB, VARCHAR, TEXT, TEXT, TEXT, INTEGER, VARCHAR, BOOLEAN);
DROP FUNCTION IF EXISTS maity.update_voice_scenario(UUID, VARCHAR, VARCHAR, INTEGER, TEXT, JSONB, VARCHAR, TEXT, TEXT, TEXT, INTEGER, VARCHAR, BOOLEAN);

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
  p_agent_id TEXT,
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
    agent_id = p_agent_id,
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
  p_agent_id TEXT,
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
    p_agent_id,
    p_is_active
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_voice_scenario TO authenticated;

-- =====================================================================
-- COMMENTS
-- =====================================================================

COMMENT ON FUNCTION maity.get_all_voice_scenarios_admin IS 'Returns ALL voice scenarios (including inactive) with agent_id for admin';
COMMENT ON FUNCTION maity.create_voice_scenario IS 'Creates a new voice scenario with optional agent_id (admin only)';
COMMENT ON FUNCTION maity.update_voice_scenario IS 'Updates an existing voice scenario including agent_id (admin only)';
