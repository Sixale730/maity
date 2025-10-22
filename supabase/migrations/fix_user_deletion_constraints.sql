-- Fix user deletion constraints
-- Change sessions.session_id FK from NO ACTION to CASCADE
-- This allows users with sessions to be deleted

-- Drop existing foreign key constraint
ALTER TABLE maity.sessions
DROP CONSTRAINT IF EXISTS sessions_session_id_fkey;

-- Recreate with CASCADE delete
ALTER TABLE maity.sessions
ADD CONSTRAINT sessions_session_id_fkey
  FOREIGN KEY (session_id)
  REFERENCES maity.users(id)
  ON DELETE CASCADE;

-- Add comment for documentation
COMMENT ON CONSTRAINT sessions_session_id_fkey ON maity.sessions IS
  'Cascades user deletion to sessions. When a user is deleted, all their sessions are also deleted.';
