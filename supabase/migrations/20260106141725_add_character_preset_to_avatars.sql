-- Migration: Add character_preset column to avatar_configurations
-- This allows users to select preset characters (human, chicken, dog, etc.)

-- Add character_preset column with default 'human' for backwards compatibility
ALTER TABLE maity.avatar_configurations
ADD COLUMN IF NOT EXISTS character_preset TEXT NOT NULL DEFAULT 'human';

-- Add check constraint for valid preset values (drop first if exists)
ALTER TABLE maity.avatar_configurations
DROP CONSTRAINT IF EXISTS avatar_character_preset_check;

ALTER TABLE maity.avatar_configurations
ADD CONSTRAINT avatar_character_preset_check
CHECK (character_preset IN ('human', 'chicken', 'dog'));

-- Create index for faster lookups by preset
CREATE INDEX IF NOT EXISTS idx_avatar_configurations_character_preset
ON maity.avatar_configurations(character_preset);

-- Drop existing functions to recreate with new signature
DROP FUNCTION IF EXISTS public.get_user_avatar(UUID);
DROP FUNCTION IF EXISTS maity.get_user_avatar(UUID);
DROP FUNCTION IF EXISTS public.upsert_avatar_configuration(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB);
DROP FUNCTION IF EXISTS maity.upsert_avatar_configuration(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB);

-- Update RPC function to include character_preset
CREATE FUNCTION maity.get_user_avatar(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  character_preset TEXT,
  head_type TEXT,
  body_type TEXT,
  skin_color TEXT,
  hair_color TEXT,
  shirt_color TEXT,
  pants_color TEXT,
  accessories JSONB,
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
    ac.head_type,
    ac.body_type,
    ac.skin_color,
    ac.hair_color,
    ac.shirt_color,
    ac.pants_color,
    ac.accessories,
    ac.full_config,
    ac.created_at,
    ac.updated_at
  FROM maity.avatar_configurations ac
  WHERE ac.user_id = p_user_id;
END;
$$;

-- Update upsert function to handle character_preset
CREATE FUNCTION maity.upsert_avatar_configuration(
  p_user_id UUID,
  p_character_preset TEXT DEFAULT 'human',
  p_head_type TEXT DEFAULT 'default',
  p_body_type TEXT DEFAULT 'default',
  p_skin_color TEXT DEFAULT '#FFD7C4',
  p_hair_color TEXT DEFAULT '#3D2314',
  p_shirt_color TEXT DEFAULT '#485df4',
  p_pants_color TEXT DEFAULT '#1A1A2E',
  p_accessories JSONB DEFAULT '[]'::JSONB,
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
    head_type,
    body_type,
    skin_color,
    hair_color,
    shirt_color,
    pants_color,
    accessories,
    full_config
  )
  VALUES (
    p_user_id,
    p_character_preset,
    p_head_type,
    p_body_type,
    p_skin_color,
    p_hair_color,
    p_shirt_color,
    p_pants_color,
    p_accessories,
    p_full_config
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    character_preset = EXCLUDED.character_preset,
    head_type = EXCLUDED.head_type,
    body_type = EXCLUDED.body_type,
    skin_color = EXCLUDED.skin_color,
    hair_color = EXCLUDED.hair_color,
    shirt_color = EXCLUDED.shirt_color,
    pants_color = EXCLUDED.pants_color,
    accessories = EXCLUDED.accessories,
    full_config = EXCLUDED.full_config,
    updated_at = NOW()
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- Public wrappers
CREATE FUNCTION public.get_user_avatar(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  character_preset TEXT,
  head_type TEXT,
  body_type TEXT,
  skin_color TEXT,
  hair_color TEXT,
  shirt_color TEXT,
  pants_color TEXT,
  accessories JSONB,
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

CREATE FUNCTION public.upsert_avatar_configuration(
  p_user_id UUID,
  p_character_preset TEXT DEFAULT 'human',
  p_head_type TEXT DEFAULT 'default',
  p_body_type TEXT DEFAULT 'default',
  p_skin_color TEXT DEFAULT '#FFD7C4',
  p_hair_color TEXT DEFAULT '#3D2314',
  p_shirt_color TEXT DEFAULT '#485df4',
  p_pants_color TEXT DEFAULT '#1A1A2E',
  p_accessories JSONB DEFAULT '[]'::JSONB,
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
    p_head_type,
    p_body_type,
    p_skin_color,
    p_hair_color,
    p_shirt_color,
    p_pants_color,
    p_accessories,
    p_full_config
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_avatar(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_avatar_configuration(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB) TO authenticated;

COMMENT ON COLUMN maity.avatar_configurations.character_preset IS 'Selected character preset: human (customizable), chicken, dog, etc.';
