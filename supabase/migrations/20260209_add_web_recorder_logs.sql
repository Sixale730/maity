-- ======================================================================================
-- Migration: Add web_recorder_logs table for persisting debug logs
-- ======================================================================================
-- Allows admins to view debug logs from any user's web recorder sessions
-- for post-mortem debugging of problematic recordings.

-- ======================================================================================
-- TABLE: maity.web_recorder_logs
-- ======================================================================================

CREATE TABLE IF NOT EXISTS maity.web_recorder_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES maity.omi_conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES maity.users(id) ON DELETE CASCADE,
  timestamp_ms integer NOT NULL,        -- ms desde inicio de grabacion
  log_type text NOT NULL CHECK (log_type IN (
    'WS_OPEN', 'WS_CLOSE', 'WS_ERROR', 'DEEPGRAM',
    'SEGMENT', 'INTERIM', 'AUDIO', 'STATE', 'ERROR', 'SAVE'
  )),
  message text NOT NULL,
  details jsonb,                        -- is_final, speech_final, speaker, etc.
  created_at timestamptz DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_web_recorder_logs_conversation
  ON maity.web_recorder_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_web_recorder_logs_user
  ON maity.web_recorder_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_web_recorder_logs_created
  ON maity.web_recorder_logs(created_at DESC);

-- Comments
COMMENT ON TABLE maity.web_recorder_logs IS 'Debug logs from web recorder sessions for admin debugging';
COMMENT ON COLUMN maity.web_recorder_logs.timestamp_ms IS 'Milliseconds since recording start';
COMMENT ON COLUMN maity.web_recorder_logs.log_type IS 'Type of log entry: WS_OPEN, DEEPGRAM, SEGMENT, etc.';
COMMENT ON COLUMN maity.web_recorder_logs.details IS 'Additional details: is_final, speech_final, speaker, confidence, etc.';

-- ======================================================================================
-- ROW LEVEL SECURITY (RLS)
-- ======================================================================================

ALTER TABLE maity.web_recorder_logs ENABLE ROW LEVEL SECURITY;

-- Policy: users can insert their own logs
CREATE POLICY "Users can insert own logs"
  ON maity.web_recorder_logs FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM maity.users WHERE auth_id = auth.uid()
  ));

-- Policy: admins can view all logs
CREATE POLICY "Admins can view all logs"
  ON maity.web_recorder_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Grant permissions to authenticated users
GRANT SELECT, INSERT ON maity.web_recorder_logs TO authenticated;

-- ======================================================================================
-- RPC FUNCTION: list_recorder_sessions (Admin-only)
-- ======================================================================================
-- Lists recording sessions with log counts for admin debugging

CREATE OR REPLACE FUNCTION maity.list_recorder_sessions(
  p_limit integer DEFAULT 50,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  conversation_id uuid,
  user_id uuid,
  user_name text,
  user_email text,
  title text,
  created_at timestamptz,
  duration_seconds integer,
  log_count bigint
) AS $$
BEGIN
  -- Verify admin role
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles ur
    JOIN maity.users u ON u.id = ur.user_id
    WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can access recorder logs';
  END IF;

  RETURN QUERY
  SELECT
    oc.id as conversation_id,
    oc.user_id,
    u.full_name as user_name,
    u.email as user_email,
    oc.title,
    oc.created_at,
    oc.duration_seconds,
    COALESCE(wrl.log_count, 0) as log_count
  FROM maity.omi_conversations oc
  JOIN maity.users u ON u.id = oc.user_id
  LEFT JOIN (
    SELECT wrl2.conversation_id, COUNT(*) as log_count
    FROM maity.web_recorder_logs wrl2
    GROUP BY wrl2.conversation_id
  ) wrl ON wrl.conversation_id = oc.id
  WHERE oc.source = 'web_recorder'
    AND (p_user_id IS NULL OR oc.user_id = p_user_id)
  ORDER BY oc.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'maity', 'public';

-- Public wrapper
CREATE OR REPLACE FUNCTION public.list_recorder_sessions(
  p_limit integer DEFAULT 50,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  conversation_id uuid,
  user_id uuid,
  user_name text,
  user_email text,
  title text,
  created_at timestamptz,
  duration_seconds integer,
  log_count bigint
) AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.list_recorder_sessions(p_limit, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'maity', 'public';

GRANT EXECUTE ON FUNCTION public.list_recorder_sessions(integer, uuid) TO authenticated;

COMMENT ON FUNCTION public.list_recorder_sessions IS 'Admin-only: Lists web recorder sessions with log counts';

-- ======================================================================================
-- RPC FUNCTION: get_recorder_logs (Admin-only)
-- ======================================================================================
-- Gets all logs for a specific conversation

CREATE OR REPLACE FUNCTION maity.get_recorder_logs(p_conversation_id uuid)
RETURNS TABLE (
  id uuid,
  timestamp_ms integer,
  log_type text,
  message text,
  details jsonb,
  created_at timestamptz
) AS $$
BEGIN
  -- Verify admin role
  IF NOT EXISTS (
    SELECT 1 FROM maity.user_roles ur
    JOIN maity.users u ON u.id = ur.user_id
    WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can access recorder logs';
  END IF;

  RETURN QUERY
  SELECT wrl.id, wrl.timestamp_ms, wrl.log_type, wrl.message, wrl.details, wrl.created_at
  FROM maity.web_recorder_logs wrl
  WHERE wrl.conversation_id = p_conversation_id
  ORDER BY wrl.timestamp_ms ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'maity', 'public';

-- Public wrapper
CREATE OR REPLACE FUNCTION public.get_recorder_logs(p_conversation_id uuid)
RETURNS TABLE (
  id uuid,
  timestamp_ms integer,
  log_type text,
  message text,
  details jsonb,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_recorder_logs(p_conversation_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'maity', 'public';

GRANT EXECUTE ON FUNCTION public.get_recorder_logs(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_recorder_logs IS 'Admin-only: Gets all debug logs for a recorder session';

-- ======================================================================================
-- RPC FUNCTION: save_recorder_logs (Batch insert)
-- ======================================================================================
-- Saves multiple logs in a single batch insert for efficiency

CREATE OR REPLACE FUNCTION maity.save_recorder_logs(
  p_conversation_id uuid,
  p_logs jsonb
)
RETURNS integer AS $$
DECLARE
  v_user_id uuid;
  v_count integer := 0;
BEGIN
  -- Get current user's maity.users.id
  SELECT id INTO v_user_id
  FROM maity.users
  WHERE auth_id = auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Insert all logs in a single batch
  INSERT INTO maity.web_recorder_logs (
    conversation_id,
    user_id,
    timestamp_ms,
    log_type,
    message,
    details
  )
  SELECT
    p_conversation_id,
    v_user_id,
    (log_entry->>'timestamp_ms')::integer,
    log_entry->>'log_type',
    log_entry->>'message',
    log_entry->'details'
  FROM jsonb_array_elements(p_logs) AS log_entry;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'maity', 'public';

-- Public wrapper
CREATE OR REPLACE FUNCTION public.save_recorder_logs(
  p_conversation_id uuid,
  p_logs jsonb
)
RETURNS integer AS $$
BEGIN
  RETURN maity.save_recorder_logs(p_conversation_id, p_logs);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'maity', 'public';

GRANT EXECUTE ON FUNCTION public.save_recorder_logs(uuid, jsonb) TO authenticated;

COMMENT ON FUNCTION public.save_recorder_logs IS 'Batch insert debug logs for a recorder session';

-- ======================================================================================
-- COMPLETION MESSAGE
-- ======================================================================================

DO $$
BEGIN
  RAISE NOTICE 'Web recorder logs migration completed successfully';
  RAISE NOTICE 'Table: maity.web_recorder_logs';
  RAISE NOTICE 'RPC Functions: list_recorder_sessions, get_recorder_logs, save_recorder_logs';
  RAISE NOTICE 'RLS Policies: Users insert own, Admins view all';
END $$;
