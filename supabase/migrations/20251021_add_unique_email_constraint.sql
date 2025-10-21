-- Add unique constraint on email to prevent duplicate user creation
-- This ensures at the database level that the same email cannot be used twice
-- even if the frontend OAuth flow has a race condition

-- Note: This migration is optional but recommended for preventing duplicate users
-- If you have existing duplicate emails, you'll need to clean them up first

-- Check for existing duplicates before adding constraint
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Count duplicate emails
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT email, COUNT(*) as cnt
    FROM maity.users
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE WARNING 'Found % duplicate email(s) in maity.users. Please resolve duplicates before applying this constraint.', duplicate_count;
    RAISE WARNING 'Run this query to see duplicates: SELECT email, COUNT(*) FROM maity.users WHERE email IS NOT NULL GROUP BY email HAVING COUNT(*) > 1;';
    -- Optionally uncomment the line below to prevent migration if duplicates exist
    -- RAISE EXCEPTION 'Cannot add unique constraint with existing duplicates';
  END IF;
END $$;

-- Add unique constraint on email
-- This will prevent future duplicates at the database level
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_email_unique'
    AND conrelid = 'maity.users'::regclass
  ) THEN
    ALTER TABLE maity.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);

    RAISE NOTICE 'Successfully added unique constraint on maity.users.email';
  ELSE
    RAISE NOTICE 'Constraint users_email_unique already exists';
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON CONSTRAINT users_email_unique ON maity.users IS
  'Prevents duplicate users with the same email address. Added to fix OAuth race condition bug where multiple users could be created for the same person.';
