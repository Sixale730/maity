-- Add autojoin functionality to companies table
-- Allow organizations to automatically accept users with matching email domains

-- Add new columns for autojoin feature
ALTER TABLE maity.companies
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS auto_join_enabled BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN maity.companies.domain IS 'Email domain for auto-join (e.g., acme.com). Users with matching email domains can join automatically.';
COMMENT ON COLUMN maity.companies.auto_join_enabled IS 'Enable automatic user registration for users with matching email domain';

-- Create index for fast lookups when checking autojoin eligibility
CREATE INDEX IF NOT EXISTS idx_companies_domain_autojoin
  ON maity.companies(domain)
  WHERE auto_join_enabled = true AND is_active = true;

-- Create unique constraint: only one company can claim a domain for autojoin
-- This prevents conflicts where multiple companies try to autojoin the same domain
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_domain_unique_when_enabled
  ON maity.companies(domain)
  WHERE auto_join_enabled = true AND domain IS NOT NULL;

-- Add check constraint: domain should be lowercase and not include @
ALTER TABLE maity.companies
  ADD CONSTRAINT domain_format_check
  CHECK (domain IS NULL OR (domain = lower(domain) AND domain NOT LIKE '%@%'));
