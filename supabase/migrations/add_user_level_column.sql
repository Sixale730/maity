-- Add level column to users table
-- All users start at level 1 (Aprendiz)

ALTER TABLE maity.users
ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1;

-- Add check constraint to ensure level is between 1 and 5
ALTER TABLE maity.users
ADD CONSTRAINT users_level_check CHECK (level >= 1 AND level <= 5);

-- Add comment explaining the levels
COMMENT ON COLUMN maity.users.level IS 'User level: 1=Aprendiz, 2=Promesa, 3=Guerrero, 4=Maestro, 5=Leyenda';

-- Add index for level queries
CREATE INDEX IF NOT EXISTS idx_users_level ON maity.users(level);
