-- Fix provision_user function to correctly reference maity.users.id instead of auth.uid() for user_roles
CREATE OR REPLACE FUNCTION public.provision_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'maity','public'
AS $$
DECLARE
  user_auth_id uuid := auth.uid();
  user_email text;
  maity_user_id uuid;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = user_auth_id;
  
  -- Insert user into maity.users if not exists, get the user ID
  INSERT INTO maity.users (auth_id, email, name, status)
  VALUES (
    user_auth_id, 
    user_email,
    COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = user_auth_id), 
             SPLIT_PART(user_email, '@', 1)),
    'ACTIVE'
  )
  ON CONFLICT (auth_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, maity.users.name)
  RETURNING id INTO maity_user_id;

  -- If user already existed, get their ID
  IF maity_user_id IS NULL THEN
    SELECT id INTO maity_user_id FROM maity.users WHERE auth_id = user_auth_id;
  END IF;
  
  -- Assign default user role using the maity.users.id
  INSERT INTO maity.user_roles (user_id, role)
  VALUES (maity_user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;