-- Migration: Create AI Resources Table
-- Description: Table for storing educational AI resources (admin-managed links)

-- Create the ai_resources table
CREATE TABLE IF NOT EXISTS maity.ai_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'brain',
  color TEXT DEFAULT 'purple',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES maity.users(id)
);

-- Create index for active resources
CREATE INDEX IF NOT EXISTS idx_ai_resources_active ON maity.ai_resources(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_resources_created_at ON maity.ai_resources(created_at DESC);

-- Enable RLS
ALTER TABLE maity.ai_resources ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read active resources
CREATE POLICY "authenticated_can_read_active_resources"
  ON maity.ai_resources
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Admins can do everything
CREATE POLICY "admins_can_manage_resources"
  ON maity.ai_resources
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

-- ============================================
-- RPC Functions
-- ============================================

-- Function to get all AI resources (for admins, includes inactive)
CREATE OR REPLACE FUNCTION maity.get_all_ai_resources()
RETURNS SETOF maity.ai_resources AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    -- Non-admins only see active resources
    RETURN QUERY SELECT * FROM maity.ai_resources WHERE is_active = true ORDER BY created_at DESC;
  ELSE
    -- Admins see all resources
    RETURN QUERY SELECT * FROM maity.ai_resources ORDER BY created_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.get_all_ai_resources()
RETURNS SETOF maity.ai_resources AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_all_ai_resources();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_all_ai_resources TO authenticated;

-- Function to create a new AI resource
CREATE OR REPLACE FUNCTION maity.create_ai_resource(
  p_title TEXT,
  p_description TEXT,
  p_url TEXT,
  p_icon TEXT DEFAULT 'brain',
  p_color TEXT DEFAULT 'purple'
)
RETURNS maity.ai_resources AS $$
DECLARE
  v_result maity.ai_resources;
BEGIN
  -- Verify user is admin
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can create resources';
  END IF;

  INSERT INTO maity.ai_resources (title, description, url, icon, color, created_by)
  VALUES (p_title, p_description, p_url, p_icon, p_color, auth.uid())
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.create_ai_resource(
  p_title TEXT,
  p_description TEXT,
  p_url TEXT,
  p_icon TEXT DEFAULT 'brain',
  p_color TEXT DEFAULT 'purple'
)
RETURNS maity.ai_resources AS $$
BEGIN
  RETURN maity.create_ai_resource(p_title, p_description, p_url, p_icon, p_color);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_ai_resource TO authenticated;

-- Function to toggle resource active status (soft delete)
CREATE OR REPLACE FUNCTION maity.toggle_ai_resource_active(p_id UUID)
RETURNS maity.ai_resources AS $$
DECLARE
  v_result maity.ai_resources;
BEGIN
  -- Verify user is admin
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can toggle resources';
  END IF;

  UPDATE maity.ai_resources
  SET is_active = NOT is_active, updated_at = now()
  WHERE id = p_id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.toggle_ai_resource_active(p_id UUID)
RETURNS maity.ai_resources AS $$
BEGIN
  RETURN maity.toggle_ai_resource_active(p_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.toggle_ai_resource_active TO authenticated;

-- ============================================
-- Seed initial data (the 3 original resources)
-- ============================================
INSERT INTO maity.ai_resources (title, description, url, icon, color) VALUES
  ('Poncho Robles', 'Recursos principales de IA', 'https://ponchorobles.my.canva.site/', 'brain', 'purple'),
  ('Puestazo Mutante', 'Contenido interactivo de IA', 'https://ponchorobles.my.canva.site/puestazo-mutante', 'sparkles', 'pink'),
  ('Black Stories', 'Historias y casos de estudio', 'https://asertio.my.canva.site/blackstories', 'book-open', 'slate');
