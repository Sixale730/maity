-- Create user company history table for auditing
CREATE TABLE maity.user_company_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES maity.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES maity.companies(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('assigned', 'transferred', 'invited', 'confirmed')),
  previous_company_id uuid REFERENCES maity.companies(id) ON DELETE SET NULL,
  invitation_source text, -- URL or source of invitation
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on history table
ALTER TABLE maity.user_company_history ENABLE ROW LEVEL SECURITY;

-- Policy to let users view their own history
CREATE POLICY "Users can view their own company history"
ON maity.user_company_history FOR SELECT
USING (user_id IN (SELECT id FROM maity.users WHERE auth_id = auth.uid()));

-- Policy for platform admins to view all history
CREATE POLICY "Platform admins can view all company history"
ON maity.user_company_history FOR SELECT
USING (get_user_role() = 'platform_admin'::app_role);

-- Create smart invitation handling function
CREATE OR REPLACE FUNCTION public.handle_company_invitation(
  user_auth_id uuid,
  company_slug text,
  invitation_source text DEFAULT NULL,
  force_assign boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $function$
DECLARE
  target_company_id uuid;
  target_company_name text;
  current_user_id uuid;
  current_company_id uuid;
  current_company_name text;
  result jsonb;
BEGIN
  -- Get company ID by slug
  SELECT id, name INTO target_company_id, target_company_name
  FROM maity.companies
  WHERE slug = company_slug AND is_active = true
  LIMIT 1;
  
  IF target_company_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'COMPANY_NOT_FOUND',
      'message', 'Company not found or inactive'
    );
  END IF;
  
  -- Get current user info
  SELECT id, company_id INTO current_user_id, current_company_id
  FROM maity.users
  WHERE auth_id = user_auth_id
  LIMIT 1;
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'USER_NOT_FOUND',
      'message', 'User not found'
    );
  END IF;
  
  -- Get current company name if exists
  IF current_company_id IS NOT NULL THEN
    SELECT name INTO current_company_name
    FROM maity.companies
    WHERE id = current_company_id;
  END IF;
  
  -- Check if user already has this company
  IF current_company_id = target_company_id THEN
    RETURN jsonb_build_object(
      'success', true,
      'action', 'NO_CHANGE',
      'message', 'User already assigned to this company',
      'company_name', target_company_name
    );
  END IF;
  
  -- If user has no company or force_assign is true, assign directly
  IF current_company_id IS NULL OR force_assign THEN
    -- Update user's company
    UPDATE maity.users
    SET company_id = target_company_id
    WHERE id = current_user_id;
    
    -- Record the assignment in history
    INSERT INTO maity.user_company_history (
      user_id, 
      company_id, 
      action, 
      previous_company_id,
      invitation_source
    ) VALUES (
      current_user_id, 
      target_company_id, 
      CASE WHEN current_company_id IS NULL THEN 'assigned' ELSE 'transferred' END,
      current_company_id,
      invitation_source
    );
    
    RETURN jsonb_build_object(
      'success', true,
      'action', CASE WHEN current_company_id IS NULL THEN 'ASSIGNED' ELSE 'TRANSFERRED' END,
      'message', 'User assigned to company successfully',
      'company_name', target_company_name,
      'previous_company_name', current_company_name
    );
  END IF;
  
  -- User has a different company - requires confirmation
  RETURN jsonb_build_object(
    'success', false,
    'action', 'CONFIRMATION_REQUIRED',
    'message', 'User already has a company assigned',
    'current_company', jsonb_build_object(
      'id', current_company_id,
      'name', current_company_name
    ),
    'target_company', jsonb_build_object(
      'id', target_company_id,
      'name', target_company_name,
      'slug', company_slug
    ),
    'invitation_source', invitation_source
  );
END;
$function$;