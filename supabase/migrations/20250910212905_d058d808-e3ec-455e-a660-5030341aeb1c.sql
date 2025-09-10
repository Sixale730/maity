-- Add form completion tracking to users table
ALTER TABLE maity.users 
ADD COLUMN IF NOT EXISTS registration_form_completed BOOLEAN DEFAULT FALSE;

-- Add company_slug to companies table for URL tracking
ALTER TABLE maity.companies 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Update existing companies with slugs
UPDATE maity.companies 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^\w\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Make slug unique
ALTER TABLE maity.companies 
ADD CONSTRAINT companies_slug_unique UNIQUE (slug);

-- Function to get company by slug
CREATE OR REPLACE FUNCTION public.get_company_by_slug(company_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  plan text,
  timezone text,
  is_active boolean,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = maity, public
AS $$
  SELECT id, name, slug, plan, timezone, is_active, created_at
  FROM maity.companies
  WHERE companies.slug = company_slug AND companies.is_active = true
  LIMIT 1;
$$;

-- Function to mark user registration as completed
CREATE OR REPLACE FUNCTION public.complete_user_registration()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = maity, public
AS $$
  UPDATE maity.users 
  SET registration_form_completed = true
  WHERE auth_id = auth.uid();
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_company_by_slug(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_user_registration() TO authenticated;