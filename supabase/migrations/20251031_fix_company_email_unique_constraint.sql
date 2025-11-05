-- Fix duplicate key constraint violation for users with NULL emails
--
-- Problem: The constraint uq_maity_users_company_email_not_null was preventing
-- users with NULL emails from being updated via Tally webhook because PostgreSQL
-- treats (company_id, NULL) as a unique combination in composite constraints.
--
-- Solution: Replace with a partial unique index that only enforces uniqueness
-- for non-NULL emails. This allows multiple users with NULL emails in the same
-- company while still preventing duplicate real email addresses.

-- Drop the existing constraint if it exists
ALTER TABLE maity.users
DROP CONSTRAINT IF EXISTS uq_maity_users_company_email_not_null;

-- Create partial unique index that excludes NULL emails
-- Note: Cannot use CONCURRENTLY in a transaction, so this will briefly lock the table
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_company_email_unique
ON maity.users (company_id, LOWER(email))
WHERE email IS NOT NULL;

-- Add comment for documentation
COMMENT ON INDEX maity.idx_users_company_email_unique IS
'Ensures unique emails within a company, but allows multiple NULL emails.
This prevents duplicate email addresses while supporting OAuth users who may not provide an email initially.';
