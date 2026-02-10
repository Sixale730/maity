-- ============================================================================
-- Game Sessions & XP System
-- ============================================================================
-- Unified game session tracking with JSONB for flexible game data.
-- XP transaction ledger and user total_xp accumulator.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. game_sessions table
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maity.game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES maity.users(id) ON DELETE CASCADE,
  game_type text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  game_data jsonb NOT NULL DEFAULT '{}',
  results jsonb,
  score numeric,
  xp_earned integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_game_sessions_user_game
  ON maity.game_sessions(user_id, game_type);

-- --------------------------------------------------------------------------
-- 2. xp_transactions table
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maity.xp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES maity.users(id) ON DELETE CASCADE,
  source_type text NOT NULL
    CHECK (source_type IN ('game', 'conversation', 'streak', 'badge', 'bonus')),
  source_id uuid,
  amount integer NOT NULL CHECK (amount > 0),
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_transactions_user
  ON maity.xp_transactions(user_id);

-- --------------------------------------------------------------------------
-- 3. Add total_xp column to users
-- --------------------------------------------------------------------------
ALTER TABLE maity.users ADD COLUMN IF NOT EXISTS total_xp integer NOT NULL DEFAULT 0;

-- --------------------------------------------------------------------------
-- 4. RLS Policies
-- --------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE maity.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maity.xp_transactions ENABLE ROW LEVEL SECURITY;

-- game_sessions: users can SELECT their own
CREATE POLICY game_sessions_select_own ON maity.game_sessions
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM maity.users WHERE auth_id = auth.uid()));

-- game_sessions: users can INSERT their own
CREATE POLICY game_sessions_insert_own ON maity.game_sessions
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM maity.users WHERE auth_id = auth.uid()));

-- game_sessions: users can UPDATE their own
CREATE POLICY game_sessions_update_own ON maity.game_sessions
  FOR UPDATE TO authenticated
  USING (user_id IN (SELECT id FROM maity.users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM maity.users WHERE auth_id = auth.uid()));

-- xp_transactions: users can SELECT their own
CREATE POLICY xp_transactions_select_own ON maity.xp_transactions
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM maity.users WHERE auth_id = auth.uid()));

-- Admin policies: admins can SELECT all
CREATE POLICY game_sessions_admin_select ON maity.game_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY xp_transactions_admin_select ON maity.xp_transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Grant access to authenticated role
GRANT SELECT, INSERT, UPDATE ON maity.game_sessions TO authenticated;
GRANT SELECT ON maity.xp_transactions TO authenticated;

-- --------------------------------------------------------------------------
-- 5. RPC: complete_game_session
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION maity.complete_game_session(
  p_session_id uuid,
  p_results jsonb,
  p_score numeric,
  p_xp_amount integer,
  p_description text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public
AS $$
DECLARE
  v_auth_id uuid;
  v_user_id uuid;
  v_session_user_id uuid;
  v_session_game_type text;
  v_is_first boolean;
  v_new_total integer;
BEGIN
  -- Get auth user
  v_auth_id := auth.uid();
  IF v_auth_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED');
  END IF;

  -- Resolve internal user id
  SELECT u.id INTO v_user_id
  FROM maity.users u
  WHERE u.auth_id = v_auth_id;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'USER_NOT_FOUND');
  END IF;

  -- Verify session ownership
  SELECT gs.user_id, gs.game_type INTO v_session_user_id, v_session_game_type
  FROM maity.game_sessions gs
  WHERE gs.id = p_session_id AND gs.status = 'in_progress';

  IF v_session_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'SESSION_NOT_FOUND');
  END IF;

  IF v_session_user_id <> v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_OWNER');
  END IF;

  -- Check if first completed session of this game type
  SELECT NOT EXISTS (
    SELECT 1 FROM maity.game_sessions gs2
    WHERE gs2.user_id = v_user_id
      AND gs2.game_type = v_session_game_type
      AND gs2.status = 'completed'
      AND gs2.id <> p_session_id
  ) INTO v_is_first;

  -- 1. Update game session
  UPDATE maity.game_sessions gs
  SET
    status = 'completed',
    results = p_results,
    score = p_score,
    xp_earned = p_xp_amount,
    completed_at = now(),
    updated_at = now()
  WHERE gs.id = p_session_id;

  -- 2. Insert XP transaction
  INSERT INTO maity.xp_transactions (user_id, source_type, source_id, amount, description, metadata)
  VALUES (
    v_user_id,
    'game',
    p_session_id,
    p_xp_amount,
    COALESCE(p_description, 'Completed ' || v_session_game_type),
    jsonb_build_object('game_type', v_session_game_type, 'is_first_attempt', v_is_first)
  );

  -- 3. Increment user total_xp
  UPDATE maity.users u
  SET total_xp = total_xp + p_xp_amount
  WHERE u.id = v_user_id
  RETURNING u.total_xp INTO v_new_total;

  RETURN jsonb_build_object(
    'success', true,
    'xp_earned', p_xp_amount,
    'is_first_attempt', v_is_first,
    'total_xp', v_new_total
  );
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.complete_game_session(
  p_session_id uuid,
  p_results jsonb,
  p_score numeric,
  p_xp_amount integer,
  p_description text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT maity.complete_game_session(p_session_id, p_results, p_score, p_xp_amount, p_description);
$$;

GRANT EXECUTE ON FUNCTION public.complete_game_session(uuid, jsonb, numeric, integer, text) TO authenticated;

-- --------------------------------------------------------------------------
-- 6. RPC: get_my_game_sessions
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION maity.get_my_game_sessions(
  p_game_type text DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS SETOF maity.game_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public
AS $$
DECLARE
  v_auth_id uuid;
  v_user_id uuid;
BEGIN
  v_auth_id := auth.uid();
  IF v_auth_id IS NULL THEN
    RETURN;
  END IF;

  SELECT u.id INTO v_user_id
  FROM maity.users u
  WHERE u.auth_id = v_auth_id;

  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT gs.*
  FROM maity.game_sessions gs
  WHERE gs.user_id = v_user_id
    AND (p_game_type IS NULL OR gs.game_type = p_game_type)
  ORDER BY gs.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.get_my_game_sessions(
  p_game_type text DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS SETOF maity.game_sessions
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM maity.get_my_game_sessions(p_game_type, p_limit);
$$;

GRANT EXECUTE ON FUNCTION public.get_my_game_sessions(text, integer) TO authenticated;

-- --------------------------------------------------------------------------
-- 7. RPC: get_my_xp_summary
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION maity.get_my_xp_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public
AS $$
DECLARE
  v_auth_id uuid;
  v_user_id uuid;
  v_total_xp integer;
  v_breakdown jsonb;
  v_recent jsonb;
BEGIN
  v_auth_id := auth.uid();
  IF v_auth_id IS NULL THEN
    RETURN jsonb_build_object('total_xp', 0, 'breakdown', '[]'::jsonb, 'recent', '[]'::jsonb);
  END IF;

  SELECT u.id, u.total_xp INTO v_user_id, v_total_xp
  FROM maity.users u
  WHERE u.auth_id = v_auth_id;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('total_xp', 0, 'breakdown', '[]'::jsonb, 'recent', '[]'::jsonb);
  END IF;

  -- Breakdown by source_type
  SELECT COALESCE(jsonb_agg(row_to_json(b)), '[]'::jsonb) INTO v_breakdown
  FROM (
    SELECT xt.source_type, SUM(xt.amount) as total, COUNT(*) as count
    FROM maity.xp_transactions xt
    WHERE xt.user_id = v_user_id
    GROUP BY xt.source_type
    ORDER BY total DESC
  ) b;

  -- Recent transactions (last 10)
  SELECT COALESCE(jsonb_agg(row_to_json(r)), '[]'::jsonb) INTO v_recent
  FROM (
    SELECT xt.id, xt.source_type, xt.amount, xt.description, xt.created_at
    FROM maity.xp_transactions xt
    WHERE xt.user_id = v_user_id
    ORDER BY xt.created_at DESC
    LIMIT 10
  ) r;

  RETURN jsonb_build_object(
    'total_xp', COALESCE(v_total_xp, 0),
    'breakdown', v_breakdown,
    'recent', v_recent
  );
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.get_my_xp_summary()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT maity.get_my_xp_summary();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_xp_summary() TO authenticated;

-- --------------------------------------------------------------------------
-- 8. Comments
-- --------------------------------------------------------------------------
COMMENT ON TABLE maity.game_sessions IS 'Unified game session tracking with JSONB game_data/results per game_type';
COMMENT ON TABLE maity.xp_transactions IS 'XP transaction ledger for all XP sources';
COMMENT ON FUNCTION maity.complete_game_session IS 'Atomically completes a game session, records XP transaction, and updates user total_xp';
COMMENT ON FUNCTION maity.get_my_game_sessions IS 'Returns current users game sessions, optionally filtered by game_type';
COMMENT ON FUNCTION maity.get_my_xp_summary IS 'Returns current users XP summary with breakdown by source and recent transactions';
