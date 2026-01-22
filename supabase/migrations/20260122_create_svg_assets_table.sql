-- ============================================================================
-- SVG ASSETS TABLE MIGRATION
-- Purpose: Store converted SVG images as platform-wide assets
-- Created: 2026-01-22
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. CREATE svg_assets TABLE
-- ---------------------------------------------------------------------------

CREATE TABLE maity.svg_assets (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Asset metadata
  name TEXT NOT NULL,
  description TEXT,
  svg_content TEXT NOT NULL,

  -- Original file info
  original_filename TEXT,
  original_format TEXT CHECK (original_format IN ('jpg', 'jpeg', 'png', 'webp', 'svg')),

  -- Dimensions
  width INTEGER,
  height INTEGER,
  file_size INTEGER,

  -- Organization
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'icons', 'illustrations', 'logos', 'backgrounds', 'patterns')),

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES maity.users(id)
);

-- Create indexes for performance
CREATE INDEX idx_svg_assets_category ON maity.svg_assets(category);
CREATE INDEX idx_svg_assets_tags ON maity.svg_assets USING GIN(tags);
CREATE INDEX idx_svg_assets_is_active ON maity.svg_assets(is_active);
CREATE INDEX idx_svg_assets_created_at ON maity.svg_assets(created_at DESC);

-- Add table comment
COMMENT ON TABLE maity.svg_assets IS 'Platform-wide SVG assets created via the SVG Converter tool';

-- ---------------------------------------------------------------------------
-- 2. ENABLE RLS ON svg_assets
-- ---------------------------------------------------------------------------

ALTER TABLE maity.svg_assets ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. CREATE RLS POLICIES FOR svg_assets
-- ---------------------------------------------------------------------------

-- All authenticated users can view active SVG assets
CREATE POLICY "Authenticated users can view active svg_assets"
  ON maity.svg_assets FOR SELECT
  USING (
    is_active = true
    AND auth.uid() IS NOT NULL
  );

-- Admins can view all SVG assets (including inactive)
CREATE POLICY "Admins can view all svg_assets"
  ON maity.svg_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Admins can insert SVG assets
CREATE POLICY "Admins can insert svg_assets"
  ON maity.svg_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Admins can update SVG assets
CREATE POLICY "Admins can update svg_assets"
  ON maity.svg_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- 4. GRANT PERMISSIONS FOR svg_assets
-- ---------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE ON maity.svg_assets TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. CREATE RPC FUNCTION: get_all_svg_assets
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION maity.get_all_svg_assets(
  p_category TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_include_inactive BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  svg_content TEXT,
  original_filename TEXT,
  original_format TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  tags TEXT[],
  category TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM maity.user_roles ur
    JOIN maity.users u ON u.id = ur.user_id
    WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
  ) INTO v_is_admin;

  RETURN QUERY
  SELECT
    sa.id,
    sa.name,
    sa.description,
    sa.svg_content,
    sa.original_filename,
    sa.original_format,
    sa.width,
    sa.height,
    sa.file_size,
    sa.tags,
    sa.category,
    sa.is_active,
    sa.created_at,
    sa.updated_at,
    sa.created_by
  FROM maity.svg_assets sa
  WHERE
    -- Filter by active status (admins can see inactive if requested)
    (sa.is_active = true OR (v_is_admin AND p_include_inactive))
    -- Filter by category if provided
    AND (p_category IS NULL OR sa.category = p_category)
    -- Filter by search term if provided (searches name, description, tags)
    AND (
      p_search IS NULL
      OR sa.name ILIKE '%' || p_search || '%'
      OR sa.description ILIKE '%' || p_search || '%'
      OR EXISTS (SELECT 1 FROM unnest(sa.tags) t WHERE t ILIKE '%' || p_search || '%')
    )
  ORDER BY sa.created_at DESC;
END;
$$;

-- Create PUBLIC wrapper for get_all_svg_assets
CREATE OR REPLACE FUNCTION public.get_all_svg_assets(
  p_category TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_include_inactive BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  svg_content TEXT,
  original_filename TEXT,
  original_format TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  tags TEXT[],
  category TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_all_svg_assets(p_category, p_search, p_include_inactive);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_all_svg_assets(TEXT, TEXT, BOOLEAN) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_all_svg_assets IS 'Get all SVG assets with optional filtering by category and search term';

-- ---------------------------------------------------------------------------
-- 6. CREATE RPC FUNCTION: create_svg_asset
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION maity.create_svg_asset(
  p_name TEXT,
  p_svg_content TEXT,
  p_description TEXT DEFAULT NULL,
  p_original_filename TEXT DEFAULT NULL,
  p_original_format TEXT DEFAULT NULL,
  p_width INTEGER DEFAULT NULL,
  p_height INTEGER DEFAULT NULL,
  p_file_size INTEGER DEFAULT NULL,
  p_tags TEXT[] DEFAULT '{}',
  p_category TEXT DEFAULT 'general'
)
RETURNS maity.svg_assets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_result maity.svg_assets;
BEGIN
  -- Verify user is admin
  SELECT u.id INTO v_user_id
  FROM maity.users u
  JOIN maity.user_roles ur ON u.id = ur.user_id
  WHERE u.auth_id = auth.uid() AND ur.role = 'admin';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Permission denied: only admins can create SVG assets';
  END IF;

  -- Insert the new asset
  INSERT INTO maity.svg_assets (
    name,
    description,
    svg_content,
    original_filename,
    original_format,
    width,
    height,
    file_size,
    tags,
    category,
    created_by
  )
  VALUES (
    p_name,
    p_description,
    p_svg_content,
    p_original_filename,
    p_original_format,
    p_width,
    p_height,
    p_file_size,
    p_tags,
    p_category,
    v_user_id
  )
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- Create PUBLIC wrapper for create_svg_asset
CREATE OR REPLACE FUNCTION public.create_svg_asset(
  p_name TEXT,
  p_svg_content TEXT,
  p_description TEXT DEFAULT NULL,
  p_original_filename TEXT DEFAULT NULL,
  p_original_format TEXT DEFAULT NULL,
  p_width INTEGER DEFAULT NULL,
  p_height INTEGER DEFAULT NULL,
  p_file_size INTEGER DEFAULT NULL,
  p_tags TEXT[] DEFAULT '{}',
  p_category TEXT DEFAULT 'general'
)
RETURNS maity.svg_assets
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.create_svg_asset(
    p_name,
    p_svg_content,
    p_description,
    p_original_filename,
    p_original_format,
    p_width,
    p_height,
    p_file_size,
    p_tags,
    p_category
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_svg_asset(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER, TEXT[], TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.create_svg_asset IS 'Create a new SVG asset (admin only)';

-- ---------------------------------------------------------------------------
-- 7. CREATE RPC FUNCTION: update_svg_asset
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION maity.update_svg_asset(
  p_id UUID,
  p_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS maity.svg_assets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $$
DECLARE
  v_result maity.svg_assets;
BEGIN
  -- Verify user is admin
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles ur
    JOIN maity.users u ON u.id = ur.user_id
    WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Permission denied: only admins can update SVG assets';
  END IF;

  -- Update the asset
  UPDATE maity.svg_assets
  SET
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    tags = COALESCE(p_tags, tags),
    category = COALESCE(p_category, category),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_result;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'SVG asset not found: %', p_id;
  END IF;

  RETURN v_result;
END;
$$;

-- Create PUBLIC wrapper for update_svg_asset
CREATE OR REPLACE FUNCTION public.update_svg_asset(
  p_id UUID,
  p_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS maity.svg_assets
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.update_svg_asset(p_id, p_name, p_description, p_tags, p_category, p_is_active);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_svg_asset(UUID, TEXT, TEXT, TEXT[], TEXT, BOOLEAN) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.update_svg_asset IS 'Update an SVG asset metadata (admin only)';

-- ---------------------------------------------------------------------------
-- 8. CREATE RPC FUNCTION: delete_svg_asset (soft delete)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION maity.delete_svg_asset(
  p_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $$
BEGIN
  -- Verify user is admin
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles ur
    JOIN maity.users u ON u.id = ur.user_id
    WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Permission denied: only admins can delete SVG assets';
  END IF;

  -- Soft delete the asset
  UPDATE maity.svg_assets
  SET
    is_active = false,
    updated_at = NOW()
  WHERE id = p_id;

  RETURN FOUND;
END;
$$;

-- Create PUBLIC wrapper for delete_svg_asset
CREATE OR REPLACE FUNCTION public.delete_svg_asset(
  p_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.delete_svg_asset(p_id);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.delete_svg_asset(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.delete_svg_asset IS 'Soft delete an SVG asset by setting is_active to false (admin only)';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
