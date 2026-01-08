-- Migration: Add items column to avatar_configurations
-- This allows users to equip shared items (sword, shield, cape, etc.) on any character

-- Add items column with default empty array for backwards compatibility
ALTER TABLE maity.avatar_configurations
ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::JSONB;

-- Create index for faster lookups by items
CREATE INDEX IF NOT EXISTS idx_avatar_configurations_items
ON maity.avatar_configurations USING GIN (items);

-- Add comment explaining the column
COMMENT ON COLUMN maity.avatar_configurations.items IS 'Array of equipped item codes: sword, shield, wand, spatula, hammer, axe, book, cape';

-- Drop existing functions to recreate with new signature
DROP FUNCTION IF EXISTS public.get_user_avatar(UUID);
DROP FUNCTION IF EXISTS maity.get_user_avatar(UUID);
DROP FUNCTION IF EXISTS public.upsert_avatar_configuration(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB);
DROP FUNCTION IF EXISTS maity.upsert_avatar_configuration(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB);

-- Update RPC function to include items
CREATE FUNCTION maity.get_user_avatar(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  character_preset TEXT,
  outfit_preset TEXT,
  head_type TEXT,
  body_type TEXT,
  skin_color TEXT,
  hair_color TEXT,
  shirt_color TEXT,
  pants_color TEXT,
  accessories JSONB,
  items JSONB,
  full_config JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ac.id,
    ac.user_id,
    ac.character_preset,
    ac.outfit_preset,
    ac.head_type,
    ac.body_type,
    ac.skin_color,
    ac.hair_color,
    ac.shirt_color,
    ac.pants_color,
    ac.accessories,
    ac.items,
    ac.full_config,
    ac.created_at,
    ac.updated_at
  FROM maity.avatar_configurations ac
  WHERE ac.user_id = p_user_id;
END;
$$;

-- Update upsert function to handle items
CREATE FUNCTION maity.upsert_avatar_configuration(
  p_user_id UUID,
  p_character_preset TEXT DEFAULT 'human',
  p_outfit_preset TEXT DEFAULT 'casual',
  p_head_type TEXT DEFAULT 'default',
  p_body_type TEXT DEFAULT 'default',
  p_skin_color TEXT DEFAULT '#FFD7C4',
  p_hair_color TEXT DEFAULT '#3D2314',
  p_shirt_color TEXT DEFAULT '#4A90D9',
  p_pants_color TEXT DEFAULT '#3D3D3D',
  p_accessories JSONB DEFAULT '[]'::JSONB,
  p_items JSONB DEFAULT '[]'::JSONB,
  p_full_config JSONB DEFAULT '{}'::JSONB
)
RETURNS maity.avatar_configurations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result maity.avatar_configurations;
BEGIN
  INSERT INTO maity.avatar_configurations (
    user_id,
    character_preset,
    outfit_preset,
    head_type,
    body_type,
    skin_color,
    hair_color,
    shirt_color,
    pants_color,
    accessories,
    items,
    full_config
  )
  VALUES (
    p_user_id,
    p_character_preset,
    p_outfit_preset,
    p_head_type,
    p_body_type,
    p_skin_color,
    p_hair_color,
    p_shirt_color,
    p_pants_color,
    p_accessories,
    p_items,
    p_full_config
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    character_preset = EXCLUDED.character_preset,
    outfit_preset = EXCLUDED.outfit_preset,
    head_type = EXCLUDED.head_type,
    body_type = EXCLUDED.body_type,
    skin_color = EXCLUDED.skin_color,
    hair_color = EXCLUDED.hair_color,
    shirt_color = EXCLUDED.shirt_color,
    pants_color = EXCLUDED.pants_color,
    accessories = EXCLUDED.accessories,
    items = EXCLUDED.items,
    full_config = EXCLUDED.full_config,
    updated_at = NOW()
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- Public wrapper for get_user_avatar
CREATE FUNCTION public.get_user_avatar(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  character_preset TEXT,
  outfit_preset TEXT,
  head_type TEXT,
  body_type TEXT,
  skin_color TEXT,
  hair_color TEXT,
  shirt_color TEXT,
  pants_color TEXT,
  accessories JSONB,
  items JSONB,
  full_config JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_user_avatar(p_user_id);
END;
$$;

-- Public wrapper for upsert_avatar_configuration
CREATE FUNCTION public.upsert_avatar_configuration(
  p_user_id UUID,
  p_character_preset TEXT DEFAULT 'human',
  p_outfit_preset TEXT DEFAULT 'casual',
  p_head_type TEXT DEFAULT 'default',
  p_body_type TEXT DEFAULT 'default',
  p_skin_color TEXT DEFAULT '#FFD7C4',
  p_hair_color TEXT DEFAULT '#3D2314',
  p_shirt_color TEXT DEFAULT '#4A90D9',
  p_pants_color TEXT DEFAULT '#3D3D3D',
  p_accessories JSONB DEFAULT '[]'::JSONB,
  p_items JSONB DEFAULT '[]'::JSONB,
  p_full_config JSONB DEFAULT '{}'::JSONB
)
RETURNS maity.avatar_configurations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN maity.upsert_avatar_configuration(
    p_user_id,
    p_character_preset,
    p_outfit_preset,
    p_head_type,
    p_body_type,
    p_skin_color,
    p_hair_color,
    p_shirt_color,
    p_pants_color,
    p_accessories,
    p_items,
    p_full_config
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_avatar(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_avatar_configuration(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB) TO authenticated;
