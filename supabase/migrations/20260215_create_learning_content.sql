-- Migration: Create Learning Content Table
-- Description: Table for storing learning resources (podcasts, videos, PDFs, articles)

-- Create the learning_content table
CREATE TABLE IF NOT EXISTS maity.learning_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'podcast', 'pdf', 'article')),
  thumbnail_url TEXT,
  duration TEXT,
  icon TEXT DEFAULT 'book-open',
  color TEXT DEFAULT 'blue',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES maity.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_learning_content_active ON maity.learning_content(is_active);
CREATE INDEX IF NOT EXISTS idx_learning_content_created_at ON maity.learning_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_content_type ON maity.learning_content(content_type);

-- Enable RLS
ALTER TABLE maity.learning_content ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read active content
CREATE POLICY "authenticated_can_read_active_learning_content"
  ON maity.learning_content
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Admins can do everything
CREATE POLICY "admins_can_manage_learning_content"
  ON maity.learning_content
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

-- Grant table access
GRANT SELECT, INSERT, UPDATE, DELETE ON maity.learning_content TO authenticated;

-- ============================================
-- RPC Functions
-- ============================================

-- Function to get all learning content
CREATE OR REPLACE FUNCTION maity.get_all_learning_content()
RETURNS SETOF maity.learning_content AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN QUERY SELECT * FROM maity.learning_content WHERE is_active = true ORDER BY created_at DESC;
  ELSE
    RETURN QUERY SELECT * FROM maity.learning_content ORDER BY created_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.get_all_learning_content()
RETURNS SETOF maity.learning_content AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_all_learning_content();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_all_learning_content TO authenticated;

-- Function to create learning content (admin only)
CREATE OR REPLACE FUNCTION maity.create_learning_content(
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_content_type TEXT DEFAULT 'article',
  p_thumbnail_url TEXT DEFAULT NULL,
  p_duration TEXT DEFAULT NULL,
  p_icon TEXT DEFAULT 'book-open',
  p_color TEXT DEFAULT 'blue'
)
RETURNS maity.learning_content AS $$
DECLARE
  v_result maity.learning_content;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can create learning content';
  END IF;

  INSERT INTO maity.learning_content (title, description, url, content_type, thumbnail_url, duration, icon, color, created_by)
  VALUES (p_title, p_description, p_url, p_content_type, p_thumbnail_url, p_duration, p_icon, p_color, auth.uid())
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.create_learning_content(
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_content_type TEXT DEFAULT 'article',
  p_thumbnail_url TEXT DEFAULT NULL,
  p_duration TEXT DEFAULT NULL,
  p_icon TEXT DEFAULT 'book-open',
  p_color TEXT DEFAULT 'blue'
)
RETURNS maity.learning_content AS $$
BEGIN
  RETURN maity.create_learning_content(p_title, p_description, p_url, p_content_type, p_thumbnail_url, p_duration, p_icon, p_color);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_learning_content TO authenticated;

-- Function to delete learning content (soft delete, admin only)
CREATE OR REPLACE FUNCTION maity.delete_learning_content(p_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can delete learning content';
  END IF;

  UPDATE maity.learning_content
  SET is_active = false, updated_at = now()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.delete_learning_content(p_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM maity.delete_learning_content(p_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.delete_learning_content TO authenticated;

-- ============================================
-- Seed data: 4 Podcasts + 3 Videos
-- ============================================
INSERT INTO maity.learning_content (title, url, content_type, icon, color) VALUES
  ('Conéctate en LinkedIn', 'https://drive.google.com/file/d/1PywVVCjVR0gXfvl6c_PjHtc8SS230jzA/view?usp=sharing', 'podcast', '🎙️', '#9b4dca'),
  ('El Comprador Moderno', 'https://drive.google.com/file/d/1BoBJFcO9Z5avmLK8SxnyNPN92AKcjVY0/view?usp=sharing', 'podcast', '🎙️', '#9b4dca'),
  ('La imperfección como elemento diferenciador', 'https://drive.google.com/file/d/19j7pQa3hE9AQQVBgq-MKr9aPebgqmCoD/view?usp=sharing', 'podcast', '🎙️', '#9b4dca'),
  ('Por qué confiar en ti', 'https://drive.google.com/file/d/1hay1APlwS_glaGYYHW4-_yUAOx46Eqm3/view?usp=sharing', 'podcast', '🎙️', '#9b4dca'),
  ('Prospectar en LinkedIn', 'https://youtu.be/bRpyVglVz40', 'video', '🎬', '#f15bb5'),
  ('Prospección Moderna', 'https://youtu.be/1IiqNqUJHY4', 'video', '🎬', '#f15bb5'),
  ('Paradoja de la IA', 'https://youtu.be/nXb_Eg6MjE0', 'video', '🎬', '#f15bb5');
