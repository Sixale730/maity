-- Migration: Create Learning Path Tables
-- Description: Tables for Duolingo-style learning path roadmap with resources + scenarios
-- Version: 1.0

-- ============================================
-- TABLE 1: learning_path_templates
-- Master template for learning paths (supports future AI personalization)
-- ============================================

CREATE TABLE IF NOT EXISTS maity.learning_path_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT false,
  company_id UUID REFERENCES maity.companies(id) ON DELETE SET NULL,
  created_by UUID REFERENCES maity.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_learning_path_templates_company ON maity.learning_path_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_templates_default ON maity.learning_path_templates(is_default, is_active);

-- ============================================
-- TABLE 2: learning_path_nodes
-- Individual nodes in a learning path (polymorphic design)
-- ============================================

CREATE TABLE IF NOT EXISTS maity.learning_path_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES maity.learning_path_templates(id) ON DELETE CASCADE,

  -- Node positioning
  order_index INTEGER NOT NULL,
  visual_position VARCHAR(10) DEFAULT 'center' CHECK (visual_position IN ('left', 'center', 'right')),

  -- Polymorphic content reference
  node_type VARCHAR(20) NOT NULL CHECK (node_type IN ('resource', 'scenario', 'quiz', 'video', 'checkpoint')),
  resource_id UUID REFERENCES maity.ai_resources(id) ON DELETE SET NULL,
  scenario_id UUID REFERENCES maity.voice_scenarios(id) ON DELETE SET NULL,

  -- Node metadata
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'circle',
  color TEXT DEFAULT 'blue',
  estimated_duration INTEGER, -- seconds

  -- Unlock configuration (for future complex logic)
  unlock_after_node_id UUID REFERENCES maity.learning_path_nodes(id) ON DELETE SET NULL,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_order_per_template UNIQUE (template_id, order_index),
  CONSTRAINT valid_content_reference CHECK (
    (node_type = 'resource' AND resource_id IS NOT NULL) OR
    (node_type = 'scenario' AND scenario_id IS NOT NULL) OR
    (node_type IN ('quiz', 'video', 'checkpoint'))
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_learning_path_nodes_template ON maity.learning_path_nodes(template_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_nodes_order ON maity.learning_path_nodes(template_id, order_index);
CREATE INDEX IF NOT EXISTS idx_learning_path_nodes_type ON maity.learning_path_nodes(node_type);

-- ============================================
-- TABLE 3: user_learning_paths
-- User's assigned learning path (supports personalization)
-- ============================================

CREATE TABLE IF NOT EXISTS maity.user_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES maity.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES maity.learning_path_templates(id) ON DELETE CASCADE,

  -- Personalization fields (for future AI)
  is_personalized BOOLEAN DEFAULT false,
  personalization_config JSONB,

  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT one_active_path_per_user UNIQUE (user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_learning_paths_user ON maity.user_learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_paths_template ON maity.user_learning_paths(template_id);

-- ============================================
-- TABLE 4: user_node_progress
-- Tracks user progress per node
-- ============================================

CREATE TABLE IF NOT EXISTS maity.user_node_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES maity.users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES maity.learning_path_nodes(id) ON DELETE CASCADE,
  user_path_id UUID REFERENCES maity.user_learning_paths(id) ON DELETE CASCADE,

  -- Status tracking
  status VARCHAR(20) DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed', 'skipped')),

  -- Completion data
  completed_at TIMESTAMPTZ,
  score NUMERIC(5,2), -- 0-100 for scenario nodes
  attempts INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- seconds

  -- For resource nodes: track if opened
  last_accessed_at TIMESTAMPTZ,

  -- Reference to voice_sessions for scenario nodes
  session_id UUID REFERENCES maity.voice_sessions(id) ON DELETE SET NULL,

  -- Additional completion data
  completion_data JSONB,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_user_node UNIQUE (user_id, node_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_node_progress_user ON maity.user_node_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_node_progress_node ON maity.user_node_progress(node_id);
CREATE INDEX IF NOT EXISTS idx_user_node_progress_status ON maity.user_node_progress(user_id, status);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE maity.learning_path_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE maity.learning_path_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE maity.user_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE maity.user_node_progress ENABLE ROW LEVEL SECURITY;

-- Templates: Users see global + their company's templates
CREATE POLICY "users_can_view_accessible_templates"
  ON maity.learning_path_templates
  FOR SELECT
  TO authenticated
  USING (
    is_active = true AND (
      company_id IS NULL OR
      company_id IN (
        SELECT company_id FROM maity.users WHERE auth_id = auth.uid()
      )
    )
  );

-- Templates: Admins can manage all
CREATE POLICY "admins_can_manage_templates"
  ON maity.learning_path_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Nodes: Users see nodes from accessible templates
CREATE POLICY "users_can_view_accessible_nodes"
  ON maity.learning_path_nodes
  FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    template_id IN (
      SELECT id FROM maity.learning_path_templates
      WHERE is_active = true AND (
        company_id IS NULL OR
        company_id IN (SELECT company_id FROM maity.users WHERE auth_id = auth.uid())
      )
    )
  );

-- Nodes: Admins can manage all
CREATE POLICY "admins_can_manage_nodes"
  ON maity.learning_path_nodes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- User paths: Users see own paths
CREATE POLICY "users_can_view_own_path"
  ON maity.user_learning_paths
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM maity.users WHERE auth_id = auth.uid())
  );

-- User paths: Users can insert/update own paths
CREATE POLICY "users_can_manage_own_path"
  ON maity.user_learning_paths
  FOR ALL
  TO authenticated
  USING (
    user_id IN (SELECT id FROM maity.users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    user_id IN (SELECT id FROM maity.users WHERE auth_id = auth.uid())
  );

-- User paths: Managers can view team paths
CREATE POLICY "managers_can_view_team_paths"
  ON maity.user_learning_paths
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM maity.users manager
      JOIN maity.user_roles ur ON manager.id = ur.user_id OR manager.auth_id = ur.user_id
      JOIN maity.users target ON target.id = user_learning_paths.user_id
      WHERE manager.auth_id = auth.uid()
        AND ur.role IN ('manager', 'admin')
        AND manager.company_id = target.company_id
    )
  );

-- User progress: Users see own progress
CREATE POLICY "users_can_view_own_progress"
  ON maity.user_node_progress
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM maity.users WHERE auth_id = auth.uid())
  );

-- User progress: Users can manage own progress
CREATE POLICY "users_can_manage_own_progress"
  ON maity.user_node_progress
  FOR ALL
  TO authenticated
  USING (
    user_id IN (SELECT id FROM maity.users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    user_id IN (SELECT id FROM maity.users WHERE auth_id = auth.uid())
  );

-- User progress: Managers can view team progress
CREATE POLICY "managers_can_view_team_progress"
  ON maity.user_node_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM maity.users manager
      JOIN maity.user_roles ur ON manager.id = ur.user_id OR manager.auth_id = ur.user_id
      JOIN maity.users target ON target.id = user_node_progress.user_id
      WHERE manager.auth_id = auth.uid()
        AND ur.role IN ('manager', 'admin')
        AND manager.company_id = target.company_id
    )
  );

-- GRANT permissions
GRANT SELECT, INSERT, UPDATE ON maity.learning_path_templates TO authenticated;
GRANT SELECT ON maity.learning_path_nodes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON maity.user_learning_paths TO authenticated;
GRANT SELECT, INSERT, UPDATE ON maity.user_node_progress TO authenticated;

-- ============================================
-- RPC Functions
-- ============================================

-- Function: Get user's learning path with progress
CREATE OR REPLACE FUNCTION maity.get_user_learning_path(p_user_id UUID)
RETURNS TABLE (
  node_id UUID,
  order_index INTEGER,
  visual_position VARCHAR,
  node_type VARCHAR,
  title TEXT,
  description TEXT,
  icon TEXT,
  color TEXT,
  estimated_duration INTEGER,
  status VARCHAR,
  score NUMERIC,
  attempts INTEGER,
  completed_at TIMESTAMPTZ,
  resource_id UUID,
  resource_url TEXT,
  resource_title TEXT,
  scenario_id UUID,
  scenario_code VARCHAR,
  scenario_name TEXT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_template_id UUID;
BEGIN
  -- Get user's assigned template
  SELECT ulp.template_id INTO v_template_id
  FROM maity.user_learning_paths ulp
  WHERE ulp.user_id = p_user_id;

  -- If no path assigned, return empty
  IF v_template_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    n.id AS node_id,
    n.order_index,
    n.visual_position,
    n.node_type,
    n.title,
    n.description,
    n.icon,
    n.color,
    n.estimated_duration,
    COALESCE(p.status,
      CASE
        WHEN n.order_index = 1 THEN 'available'::VARCHAR
        ELSE 'locked'::VARCHAR
      END
    ) AS status,
    p.score,
    COALESCE(p.attempts, 0) AS attempts,
    p.completed_at,
    n.resource_id,
    r.url AS resource_url,
    r.title AS resource_title,
    n.scenario_id,
    s.code AS scenario_code,
    s.name AS scenario_name
  FROM maity.learning_path_nodes n
  LEFT JOIN maity.user_node_progress p ON p.node_id = n.id AND p.user_id = p_user_id
  LEFT JOIN maity.ai_resources r ON r.id = n.resource_id
  LEFT JOIN maity.voice_scenarios s ON s.id = n.scenario_id
  WHERE n.template_id = v_template_id
    AND n.is_active = true
  ORDER BY n.order_index;
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.get_user_learning_path(p_user_id UUID)
RETURNS TABLE (
  node_id UUID,
  order_index INTEGER,
  visual_position VARCHAR,
  node_type VARCHAR,
  title TEXT,
  description TEXT,
  icon TEXT,
  color TEXT,
  estimated_duration INTEGER,
  status VARCHAR,
  score NUMERIC,
  attempts INTEGER,
  completed_at TIMESTAMPTZ,
  resource_id UUID,
  resource_url TEXT,
  resource_title TEXT,
  scenario_id UUID,
  scenario_code VARCHAR,
  scenario_name TEXT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_user_learning_path(p_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_learning_path TO authenticated;

-- Function: Initialize learning path for a new user
CREATE OR REPLACE FUNCTION maity.initialize_user_learning_path(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_template_id UUID;
  v_user_path_id UUID;
  v_first_node_id UUID;
  v_company_id UUID;
BEGIN
  -- Check if user already has a path
  SELECT id INTO v_user_path_id
  FROM maity.user_learning_paths
  WHERE user_id = p_user_id;

  IF v_user_path_id IS NOT NULL THEN
    RETURN v_user_path_id;
  END IF;

  -- Get user's company
  SELECT company_id INTO v_company_id FROM maity.users WHERE id = p_user_id;

  -- Find default template (company-specific first, then global)
  SELECT id INTO v_template_id
  FROM maity.learning_path_templates
  WHERE is_default = true
    AND is_active = true
    AND (company_id = v_company_id OR company_id IS NULL)
  ORDER BY company_id DESC NULLS LAST
  LIMIT 1;

  IF v_template_id IS NULL THEN
    RAISE EXCEPTION 'No default learning path template found';
  END IF;

  -- Create user learning path
  INSERT INTO maity.user_learning_paths (user_id, template_id)
  VALUES (p_user_id, v_template_id)
  RETURNING id INTO v_user_path_id;

  -- Initialize first node as available
  SELECT id INTO v_first_node_id
  FROM maity.learning_path_nodes
  WHERE template_id = v_template_id
    AND order_index = 1
    AND is_active = true;

  IF v_first_node_id IS NOT NULL THEN
    INSERT INTO maity.user_node_progress (user_id, node_id, user_path_id, status)
    VALUES (p_user_id, v_first_node_id, v_user_path_id, 'available');
  END IF;

  RETURN v_user_path_id;
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.initialize_user_learning_path(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN maity.initialize_user_learning_path(p_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.initialize_user_learning_path TO authenticated;

-- Function: Complete a learning node and unlock next
CREATE OR REPLACE FUNCTION maity.complete_learning_node(
  p_user_id UUID,
  p_node_id UUID,
  p_score NUMERIC DEFAULT NULL,
  p_session_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_node maity.learning_path_nodes;
  v_next_node maity.learning_path_nodes;
  v_user_path_id UUID;
  v_all_completed BOOLEAN;
BEGIN
  -- Get current node
  SELECT * INTO v_node FROM maity.learning_path_nodes WHERE id = p_node_id;

  IF v_node IS NULL THEN
    RAISE EXCEPTION 'Node not found';
  END IF;

  -- Get user's path id
  SELECT id INTO v_user_path_id
  FROM maity.user_learning_paths
  WHERE user_id = p_user_id AND template_id = v_node.template_id;

  -- Update current node progress
  INSERT INTO maity.user_node_progress (user_id, node_id, user_path_id, status, score, completed_at, session_id, attempts)
  VALUES (p_user_id, p_node_id, v_user_path_id, 'completed', p_score, NOW(), p_session_id, 1)
  ON CONFLICT (user_id, node_id) DO UPDATE SET
    status = 'completed',
    score = COALESCE(p_score, user_node_progress.score),
    completed_at = NOW(),
    session_id = COALESCE(p_session_id, user_node_progress.session_id),
    attempts = user_node_progress.attempts + 1,
    updated_at = NOW();

  -- Find and unlock next node
  SELECT * INTO v_next_node
  FROM maity.learning_path_nodes
  WHERE template_id = v_node.template_id
    AND order_index = v_node.order_index + 1
    AND is_active = true;

  IF v_next_node IS NOT NULL THEN
    INSERT INTO maity.user_node_progress (user_id, node_id, user_path_id, status)
    VALUES (p_user_id, v_next_node.id, v_user_path_id, 'available')
    ON CONFLICT (user_id, node_id) DO UPDATE SET
      status = CASE
        WHEN user_node_progress.status = 'locked' THEN 'available'
        ELSE user_node_progress.status
      END,
      updated_at = NOW();
  ELSE
    -- No next node - check if path is complete
    SELECT NOT EXISTS (
      SELECT 1 FROM maity.learning_path_nodes n
      LEFT JOIN maity.user_node_progress p ON p.node_id = n.id AND p.user_id = p_user_id
      WHERE n.template_id = v_node.template_id
        AND n.is_active = true
        AND (p.status IS NULL OR p.status != 'completed')
    ) INTO v_all_completed;

    IF v_all_completed THEN
      UPDATE maity.user_learning_paths
      SET completed_at = NOW(), updated_at = NOW()
      WHERE user_id = p_user_id AND template_id = v_node.template_id;
    END IF;
  END IF;

  RETURN json_build_object(
    'success', true,
    'completed_node_id', p_node_id,
    'unlocked_node_id', v_next_node.id,
    'path_completed', v_next_node IS NULL AND v_all_completed
  );
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.complete_learning_node(
  p_user_id UUID,
  p_node_id UUID,
  p_score NUMERIC DEFAULT NULL,
  p_session_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN maity.complete_learning_node(p_user_id, p_node_id, p_score, p_session_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_learning_node TO authenticated;

-- Function: Start a node (mark as in_progress)
CREATE OR REPLACE FUNCTION maity.start_learning_node(
  p_user_id UUID,
  p_node_id UUID
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_path_id UUID;
  v_template_id UUID;
BEGIN
  -- Get template from node
  SELECT template_id INTO v_template_id
  FROM maity.learning_path_nodes
  WHERE id = p_node_id;

  -- Get user's path id
  SELECT id INTO v_user_path_id
  FROM maity.user_learning_paths
  WHERE user_id = p_user_id AND template_id = v_template_id;

  INSERT INTO maity.user_node_progress (user_id, node_id, user_path_id, status, last_accessed_at)
  VALUES (p_user_id, p_node_id, v_user_path_id, 'in_progress', NOW())
  ON CONFLICT (user_id, node_id) DO UPDATE SET
    status = CASE
      WHEN user_node_progress.status IN ('available', 'locked') THEN 'in_progress'
      ELSE user_node_progress.status
    END,
    last_accessed_at = NOW(),
    updated_at = NOW();
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.start_learning_node(
  p_user_id UUID,
  p_node_id UUID
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM maity.start_learning_node(p_user_id, p_node_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_learning_node TO authenticated;

-- Function: Get team learning progress (for managers)
CREATE OR REPLACE FUNCTION maity.get_team_learning_progress(p_manager_id UUID)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  total_nodes INTEGER,
  completed_nodes INTEGER,
  progress_percentage NUMERIC,
  current_node_title TEXT,
  last_activity TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_company_id UUID;
  v_is_manager BOOLEAN;
BEGIN
  -- Check if user is manager or admin
  SELECT EXISTS (
    SELECT 1 FROM maity.users u
    JOIN maity.user_roles ur ON u.id = ur.user_id OR u.auth_id = ur.user_id
    WHERE u.id = p_manager_id AND ur.role IN ('manager', 'admin')
  ) INTO v_is_manager;

  IF NOT v_is_manager THEN
    RAISE EXCEPTION 'Only managers and admins can view team progress';
  END IF;

  -- Get manager's company
  SELECT company_id INTO v_company_id
  FROM maity.users
  WHERE id = p_manager_id;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.name AS user_name,
    u.email AS user_email,
    COUNT(DISTINCT n.id)::INTEGER AS total_nodes,
    COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.node_id END)::INTEGER AS completed_nodes,
    ROUND(
      (COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.node_id END)::NUMERIC /
       NULLIF(COUNT(DISTINCT n.id), 0) * 100),
      2
    ) AS progress_percentage,
    (
      SELECT n2.title
      FROM maity.user_node_progress p2
      JOIN maity.learning_path_nodes n2 ON n2.id = p2.node_id
      WHERE p2.user_id = u.id AND p2.status = 'in_progress'
      ORDER BY p2.updated_at DESC
      LIMIT 1
    ) AS current_node_title,
    MAX(p.updated_at) AS last_activity
  FROM maity.users u
  JOIN maity.user_learning_paths ulp ON ulp.user_id = u.id
  JOIN maity.learning_path_nodes n ON n.template_id = ulp.template_id AND n.is_active = true
  LEFT JOIN maity.user_node_progress p ON p.node_id = n.id AND p.user_id = u.id
  WHERE u.company_id = v_company_id
    AND u.id != p_manager_id  -- Exclude manager from their own report
  GROUP BY u.id, u.name, u.email;
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.get_team_learning_progress(p_manager_id UUID)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  total_nodes INTEGER,
  completed_nodes INTEGER,
  progress_percentage NUMERIC,
  current_node_title TEXT,
  last_activity TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_team_learning_progress(p_manager_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_team_learning_progress TO authenticated;

-- Function: Get learning path summary for a user
CREATE OR REPLACE FUNCTION maity.get_learning_path_summary(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_result JSON;
  v_template_id UUID;
  v_total INTEGER;
  v_completed INTEGER;
  v_in_progress INTEGER;
BEGIN
  -- Get user's template
  SELECT template_id INTO v_template_id
  FROM maity.user_learning_paths
  WHERE user_id = p_user_id;

  IF v_template_id IS NULL THEN
    RETURN json_build_object(
      'has_path', false,
      'total_nodes', 0,
      'completed_nodes', 0,
      'in_progress_nodes', 0,
      'progress_percentage', 0
    );
  END IF;

  -- Count nodes
  SELECT COUNT(*) INTO v_total
  FROM maity.learning_path_nodes
  WHERE template_id = v_template_id AND is_active = true;

  SELECT
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'in_progress')
  INTO v_completed, v_in_progress
  FROM maity.user_node_progress p
  JOIN maity.learning_path_nodes n ON n.id = p.node_id
  WHERE p.user_id = p_user_id AND n.template_id = v_template_id;

  RETURN json_build_object(
    'has_path', true,
    'total_nodes', v_total,
    'completed_nodes', v_completed,
    'in_progress_nodes', v_in_progress,
    'progress_percentage', CASE WHEN v_total > 0 THEN ROUND((v_completed::NUMERIC / v_total) * 100, 2) ELSE 0 END
  );
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.get_learning_path_summary(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN maity.get_learning_path_summary(p_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_learning_path_summary TO authenticated;

-- ============================================
-- SEED: Default Learning Path Template
-- ============================================

-- Create default template
INSERT INTO maity.learning_path_templates (id, name, description, is_default, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Ruta de Aprendizaje Principal',
  'Camino de desarrollo de habilidades de comunicación comercial',
  true,
  true
);

-- Insert sample nodes (resources + scenarios interleaved)
-- Pattern: Resource -> Scenario -> Resource -> Scenario...

-- Get existing resources and scenarios for reference
-- We'll use placeholder IDs that reference existing data

-- Node 1: Resource (Introduction)
INSERT INTO maity.learning_path_nodes (template_id, order_index, visual_position, node_type, resource_id, title, description, icon, color, estimated_duration)
SELECT
  'a0000000-0000-0000-0000-000000000001',
  1,
  'center',
  'resource',
  (SELECT id FROM maity.ai_resources WHERE is_active = true ORDER BY created_at LIMIT 1),
  'Introducción al Programa',
  'Conoce los fundamentos del programa de desarrollo',
  'book-open',
  'purple',
  300
WHERE EXISTS (SELECT 1 FROM maity.ai_resources WHERE is_active = true);

-- Node 2: Scenario 1 (First Visit)
INSERT INTO maity.learning_path_nodes (template_id, order_index, visual_position, node_type, scenario_id, title, description, icon, color, estimated_duration)
SELECT
  'a0000000-0000-0000-0000-000000000001',
  2,
  'right',
  'scenario',
  (SELECT id FROM maity.voice_scenarios WHERE code = 'first_visit' AND is_active = true LIMIT 1),
  'Primera Visita',
  'Practica tu primera visita a un cliente potencial',
  'mic',
  'blue',
  300
WHERE EXISTS (SELECT 1 FROM maity.voice_scenarios WHERE code = 'first_visit' AND is_active = true);

-- Node 3: Resource 2
INSERT INTO maity.learning_path_nodes (template_id, order_index, visual_position, node_type, resource_id, title, description, icon, color, estimated_duration)
SELECT
  'a0000000-0000-0000-0000-000000000001',
  3,
  'center',
  'resource',
  (SELECT id FROM maity.ai_resources WHERE is_active = true ORDER BY created_at OFFSET 1 LIMIT 1),
  'Técnicas de Presentación',
  'Aprende a presentar productos de manera efectiva',
  'sparkles',
  'pink',
  240
WHERE (SELECT COUNT(*) FROM maity.ai_resources WHERE is_active = true) > 1;

-- Node 4: Scenario 2 (Product Demo)
INSERT INTO maity.learning_path_nodes (template_id, order_index, visual_position, node_type, scenario_id, title, description, icon, color, estimated_duration)
SELECT
  'a0000000-0000-0000-0000-000000000001',
  4,
  'left',
  'scenario',
  (SELECT id FROM maity.voice_scenarios WHERE code = 'product_demo' AND is_active = true LIMIT 1),
  'Presentación de Producto',
  'Demuestra el valor de tu producto',
  'mic',
  'green',
  420
WHERE EXISTS (SELECT 1 FROM maity.voice_scenarios WHERE code = 'product_demo' AND is_active = true);

-- Node 5: Checkpoint
INSERT INTO maity.learning_path_nodes (template_id, order_index, visual_position, node_type, title, description, icon, color, estimated_duration)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  5,
  'center',
  'checkpoint',
  'Punto de Control 1',
  '¡Felicidades! Has completado la primera fase',
  'flag',
  'yellow',
  60
);

-- Node 6: Scenario 3 (Objections)
INSERT INTO maity.learning_path_nodes (template_id, order_index, visual_position, node_type, scenario_id, title, description, icon, color, estimated_duration)
SELECT
  'a0000000-0000-0000-0000-000000000001',
  6,
  'right',
  'scenario',
  (SELECT id FROM maity.voice_scenarios WHERE code = 'objection_handling' AND is_active = true LIMIT 1),
  'Manejo de Objeciones',
  'Aprende a manejar objeciones con confianza',
  'mic',
  'orange',
  360
WHERE EXISTS (SELECT 1 FROM maity.voice_scenarios WHERE code = 'objection_handling' AND is_active = true);

-- Node 7: Scenario 4 (Closing)
INSERT INTO maity.learning_path_nodes (template_id, order_index, visual_position, node_type, scenario_id, title, description, icon, color, estimated_duration)
SELECT
  'a0000000-0000-0000-0000-000000000001',
  7,
  'center',
  'scenario',
  (SELECT id FROM maity.voice_scenarios WHERE code = 'closing' AND is_active = true LIMIT 1),
  'Negociación y Cierre',
  'Domina el arte del cierre de ventas',
  'mic',
  'cyan',
  480
WHERE EXISTS (SELECT 1 FROM maity.voice_scenarios WHERE code = 'closing' AND is_active = true);

-- Node 8: Scenario 5 (Follow Up)
INSERT INTO maity.learning_path_nodes (template_id, order_index, visual_position, node_type, scenario_id, title, description, icon, color, estimated_duration)
SELECT
  'a0000000-0000-0000-0000-000000000001',
  8,
  'left',
  'scenario',
  (SELECT id FROM maity.voice_scenarios WHERE code = 'follow_up' AND is_active = true LIMIT 1),
  'Seguimiento Post-Demo',
  'Mantén el momentum después de la presentación',
  'mic',
  'slate',
  240
WHERE EXISTS (SELECT 1 FROM maity.voice_scenarios WHERE code = 'follow_up' AND is_active = true);

-- Final checkpoint
INSERT INTO maity.learning_path_nodes (template_id, order_index, visual_position, node_type, title, description, icon, color, estimated_duration)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  9,
  'center',
  'checkpoint',
  'Graduación',
  '¡Has completado todo el programa! Eres un experto.',
  'trophy',
  'gold',
  0
);
