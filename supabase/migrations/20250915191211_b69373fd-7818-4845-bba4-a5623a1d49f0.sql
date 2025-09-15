-- Add onboarding_completed_at to maity.users
ALTER TABLE maity.users 
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

-- Create tally_submissions table
CREATE TABLE IF NOT EXISTS maity.tally_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES maity.users(auth_id) ON DELETE CASCADE,
  submission_data jsonb NOT NULL,
  tally_response_id text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tally_response_id)
);

-- Enable RLS on tally_submissions
ALTER TABLE maity.tally_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own submissions
CREATE POLICY "Users can view their own tally submissions"
ON maity.tally_submissions
FOR SELECT
USING (user_id = auth.uid());

-- Policy for platform admins to see all submissions
CREATE POLICY "Platform admins can view all tally submissions"
ON maity.tally_submissions
FOR SELECT
USING (public.has_role(auth.uid(), 'platform_admin'));

-- Create provision_user RPC function
CREATE OR REPLACE FUNCTION public.provision_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'maity','public'
AS $$
DECLARE
  user_auth_id uuid := auth.uid();
  user_email text;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = user_auth_id;
  
  -- Insert user into maity.users if not exists
  INSERT INTO maity.users (auth_id, email, name, status)
  VALUES (
    user_auth_id, 
    user_email,
    COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = user_auth_id), 
             SPLIT_PART(user_email, '@', 1)),
    'ACTIVE'
  )
  ON CONFLICT (auth_id) DO NOTHING;
  
  -- Assign default user role if not exists
  INSERT INTO maity.user_roles (user_id, role)
  VALUES (user_auth_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Create function to complete onboarding
CREATE OR REPLACE FUNCTION public.complete_onboarding(submission_data jsonb DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'maity','public'
AS $$
BEGIN
  -- Mark onboarding as completed
  UPDATE maity.users 
  SET onboarding_completed_at = now()
  WHERE auth_id = auth.uid()
    AND onboarding_completed_at IS NULL;
    
  -- Store submission data if provided
  IF submission_data IS NOT NULL THEN
    INSERT INTO maity.tally_submissions (user_id, submission_data)
    VALUES (auth.uid(), submission_data)
    ON CONFLICT (user_id, tally_response_id) DO NOTHING;
  END IF;
END;
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA maity TO authenticated;
GRANT SELECT ON maity.tally_submissions TO authenticated;
GRANT EXECUTE ON FUNCTION public.provision_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_onboarding(jsonb) TO authenticated;