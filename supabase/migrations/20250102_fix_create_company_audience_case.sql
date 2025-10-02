-- Fix create_company function to use uppercase USER and MANAGER for audience
CREATE OR REPLACE FUNCTION public.create_company(company_name text)
RETURNS TABLE(id uuid, name text, slug text, plan text, timezone text, is_active boolean, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'maity', 'public'
AS $$
DECLARE
  new_company_id uuid;
  company_slug text;
  user_token text;
  manager_token text;
BEGIN
  -- Generate slug from company name
  company_slug := LOWER(REGEXP_REPLACE(REGEXP_REPLACE(company_name, '[^\w\s-]', '', 'g'), '\s+', '-', 'g'));

  -- Insert the company and get the ID
  INSERT INTO maity.companies (name, slug)
  VALUES (company_name, company_slug)
  RETURNING companies.id INTO new_company_id;

  -- Generate tokens for invitation links
  SELECT maity.make_invite_token() INTO user_token;
  SELECT maity.make_invite_token() INTO manager_token;

  -- Create invitation link for USER role (uppercase)
  INSERT INTO maity.invite_links (
    company_id,
    token,
    audience,
    is_reusable,
    max_uses,
    expires_at
  ) VALUES (
    new_company_id,
    user_token,
    'USER',
    true,
    1000,
    now() + interval '1 year'
  );

  -- Create invitation link for MANAGER role (uppercase)
  INSERT INTO maity.invite_links (
    company_id,
    token,
    audience,
    is_reusable,
    max_uses,
    expires_at
  ) VALUES (
    new_company_id,
    manager_token,
    'MANAGER',
    true,
    1000,
    now() + interval '1 year'
  );

  -- Return the company data
  RETURN QUERY
  SELECT
    companies.id,
    companies.name,
    companies.slug,
    companies.plan,
    companies.timezone,
    companies.is_active,
    companies.created_at
  FROM maity.companies
  WHERE companies.id = new_company_id;
END;
$$;
