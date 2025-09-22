-- Drop the accept_invite function as it's redundant
-- We'll use /api/finalize-invite instead
DROP FUNCTION IF EXISTS maity.accept_invite(TEXT);