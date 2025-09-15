-- Fix the handle_new_user_role function to use correct user_id
CREATE OR REPLACE FUNCTION maity.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'maity', 'public'
AS $$
DECLARE
  maity_user_id uuid;
BEGIN
  -- Get the maity.users.id for the newly created user
  SELECT id INTO maity_user_id 
  FROM maity.users 
  WHERE auth_id = NEW.id;
  
  -- Only proceed if we found the user
  IF maity_user_id IS NOT NULL THEN
    -- Insert the default role using the maity.users.id
    INSERT INTO maity.user_roles (user_id, role)
    VALUES (maity_user_id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the default "Privada" company
INSERT INTO maity.companies (name, slug, plan, timezone, is_active)
VALUES ('Privada', 'privada', 'free', 'America/Mexico_City', true)
ON CONFLICT (slug) DO NOTHING;

-- Clean up any existing user_roles entries with null user_id
DELETE FROM maity.user_roles WHERE user_id IS NULL;