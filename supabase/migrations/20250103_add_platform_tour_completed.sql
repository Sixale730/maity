-- Add platform_tour_completed field to users table
ALTER TABLE maity.users
ADD COLUMN IF NOT EXISTS platform_tour_completed BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN maity.users.platform_tour_completed IS 'Indica si el usuario ha completado el tour guiado de la plataforma';
