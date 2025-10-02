-- Create function to get companies with their invite tokens
CREATE OR REPLACE FUNCTION public.get_companies_with_invite_tokens()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  plan text,
  timezone text,
  is_active boolean,
  created_at timestamp with time zone,
  user_invite_token text,
  manager_invite_token text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.slug,
    c.plan,
    c.timezone,
    c.is_active,
    c.created_at,
    MAX(CASE WHEN il.audience = 'USER' THEN il.token END) as user_invite_token,
    MAX(CASE WHEN il.audience = 'MANAGER' THEN il.token END) as manager_invite_token
  FROM maity.companies c
  LEFT JOIN maity.invite_links il ON il.company_id = c.id
    AND il.audience IN ('USER', 'MANAGER')
    AND NOT il.is_revoked
    AND (il.expires_at IS NULL OR il.expires_at > now())
  WHERE get_user_role() = 'admin'
  GROUP BY c.id, c.name, c.slug, c.plan, c.timezone, c.is_active, c.created_at
  ORDER BY c.created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_companies_with_invite_tokens() TO authenticated;

COMMENT ON FUNCTION public.get_companies_with_invite_tokens IS 'Returns all companies with their active USER and MANAGER invite tokens for platform admins';
