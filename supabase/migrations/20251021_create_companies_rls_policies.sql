-- Row Level Security Policies for maity.companies table
-- Ensures users can only see their own company data and admins can manage all companies

-- Enable RLS on companies table (if not already enabled)
ALTER TABLE maity.companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DROP POLICY IF EXISTS "Users can view own company" ON maity.companies;
DROP POLICY IF EXISTS "Admins can view all companies" ON maity.companies;
DROP POLICY IF EXISTS "Admins can insert companies" ON maity.companies;
DROP POLICY IF EXISTS "Admins can update companies" ON maity.companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON maity.companies;

-- Policy 1: Users can view their own company
-- Regular users can only see the company they belong to
CREATE POLICY "Users can view own company"
  ON maity.companies
  FOR SELECT
  USING (
    id IN (
      SELECT company_id
      FROM maity.users
      WHERE auth_id = auth.uid()
      AND company_id IS NOT NULL
    )
  );

-- Policy 2: Admins can view all companies
-- Users with 'admin' role can see all companies
CREATE POLICY "Admins can view all companies"
  ON maity.companies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- Policy 3: Only admins can insert companies
CREATE POLICY "Admins can insert companies"
  ON maity.companies
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- Policy 4: Only admins can update companies
-- This includes updating autojoin settings (domain, auto_join_enabled)
CREATE POLICY "Admins can update companies"
  ON maity.companies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- Policy 5: Only admins can delete companies
CREATE POLICY "Admins can delete companies"
  ON maity.companies
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- Add comment explaining RLS policies
COMMENT ON TABLE maity.companies IS 'Organization/company table with RLS policies: Users can view own company, admins can manage all companies';
