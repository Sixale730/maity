-- ============================================================================
-- Daily Evaluations System
-- ============================================================================
-- Aggregates daily communication metrics from Omi conversations.
-- SQL aggregation for fast scores + optional LLM narrative summary.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. daily_evaluations table
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maity.daily_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES maity.users(id) ON DELETE CASCADE,
  evaluation_date date NOT NULL,

  -- Counts
  conversations_count integer NOT NULL DEFAULT 0,
  total_duration_seconds integer NOT NULL DEFAULT 0,
  total_words_user integer NOT NULL DEFAULT 0,
  total_words_others integer NOT NULL DEFAULT 0,

  -- Average scores (0-10, from SQL aggregation)
  avg_overall_score numeric(4,2),
  avg_clarity numeric(4,2),
  avg_structure numeric(4,2),
  avg_empatia numeric(4,2),
  avg_vocabulario numeric(4,2),
  avg_objetivo numeric(4,2),

  -- Muletillas (filler words)
  muletillas_total integer NOT NULL DEFAULT 0,
  muletillas_by_word jsonb NOT NULL DEFAULT '{}',
  muletillas_rate numeric(6,2) NOT NULL DEFAULT 0, -- per 100 words

  -- Communication metrics
  avg_ratio_habla numeric(6,2),
  total_preguntas_usuario integer NOT NULL DEFAULT 0,
  total_preguntas_otros integer NOT NULL DEFAULT 0,
  temas_tratados jsonb NOT NULL DEFAULT '[]',
  acciones_count integer NOT NULL DEFAULT 0,
  temas_sin_cerrar_count integer NOT NULL DEFAULT 0,
  top_strengths jsonb NOT NULL DEFAULT '[]',
  top_areas_to_improve jsonb NOT NULL DEFAULT '[]',

  -- LLM daily summary
  daily_summary text,
  daily_insights jsonb, -- {patron_principal, recomendacion, tendencia, highlight, riesgo}

  -- Meta
  conversation_ids jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'complete', 'error')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(user_id, evaluation_date)
);

CREATE INDEX idx_daily_evaluations_user_date
  ON maity.daily_evaluations(user_id, evaluation_date DESC);

-- --------------------------------------------------------------------------
-- 2. RLS Policies
-- --------------------------------------------------------------------------
ALTER TABLE maity.daily_evaluations ENABLE ROW LEVEL SECURITY;

-- Users can SELECT their own evaluations
CREATE POLICY daily_evaluations_select_own ON maity.daily_evaluations
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM maity.users WHERE auth_id = auth.uid()));

-- Admins can SELECT all evaluations
CREATE POLICY daily_evaluations_admin_select ON maity.daily_evaluations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Managers can SELECT evaluations for users in their company
CREATE POLICY daily_evaluations_manager_select ON maity.daily_evaluations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM maity.user_roles ur
      JOIN maity.users u ON u.id = ur.user_id
      WHERE u.auth_id = auth.uid() AND ur.role = 'manager'
    )
    AND user_id IN (
      SELECT u2.id FROM maity.users u2
      WHERE u2.company_id = (
        SELECT u3.company_id FROM maity.users u3 WHERE u3.auth_id = auth.uid()
      )
    )
  );

-- Grant SELECT to authenticated (RLS handles filtering)
GRANT SELECT ON maity.daily_evaluations TO authenticated;

-- --------------------------------------------------------------------------
-- 3. RPC: compute_daily_evaluation
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION maity.compute_daily_evaluation(
  p_user_id uuid,
  p_date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public
AS $$
DECLARE
  v_conv_count integer;
  v_total_duration integer;
  v_total_words_user integer;
  v_total_words_others integer;
  v_avg_overall numeric(4,2);
  v_avg_clarity numeric(4,2);
  v_avg_structure numeric(4,2);
  v_avg_empatia numeric(4,2);
  v_avg_vocabulario numeric(4,2);
  v_avg_objetivo numeric(4,2);
  v_muletillas_total integer;
  v_muletillas_by_word jsonb;
  v_muletillas_rate numeric(6,2);
  v_avg_ratio_habla numeric(6,2);
  v_total_preguntas_usuario integer;
  v_total_preguntas_otros integer;
  v_temas_tratados jsonb;
  v_acciones_count integer;
  v_temas_sin_cerrar_count integer;
  v_top_strengths jsonb;
  v_top_areas jsonb;
  v_conversation_ids jsonb;
  v_rec RECORD;
BEGIN
  -- Aggregate basic counts and scores from conversations of that day
  SELECT
    COUNT(*)::integer,
    COALESCE(SUM(oc.duration_seconds), 0)::integer,
    COALESCE(SUM(COALESCE((oc.communication_feedback->'radiografia'->>'palabras_usuario')::integer, 0)), 0)::integer,
    COALESCE(SUM(COALESCE((oc.communication_feedback->'radiografia'->>'palabras_otros')::integer, 0)), 0)::integer,
    LEAST(ROUND(AVG((oc.communication_feedback->>'overall_score')::numeric), 2), 10),
    LEAST(ROUND(AVG((oc.communication_feedback->>'clarity')::numeric), 2), 10),
    LEAST(ROUND(AVG((oc.communication_feedback->>'structure')::numeric), 2), 10),
    LEAST(ROUND(AVG((oc.communication_feedback->>'empatia')::numeric), 2), 10),
    LEAST(ROUND(AVG((oc.communication_feedback->>'vocabulario')::numeric), 2), 10),
    LEAST(ROUND(AVG((oc.communication_feedback->>'objetivo')::numeric), 2), 10),
    ROUND(AVG(NULLIF((oc.communication_feedback->'radiografia'->>'ratio_habla')::numeric, 0)), 2),
    COALESCE(SUM((oc.communication_feedback->'preguntas'->>'total_usuario')::integer), 0)::integer,
    COALESCE(SUM((oc.communication_feedback->'preguntas'->>'total_otros')::integer), 0)::integer,
    COALESCE(SUM(jsonb_array_length(COALESCE(oc.communication_feedback->'temas'->'acciones_usuario', '[]'::jsonb))), 0)::integer,
    COALESCE(SUM(jsonb_array_length(COALESCE(oc.communication_feedback->'temas'->'temas_sin_cerrar', '[]'::jsonb))), 0)::integer,
    COALESCE(jsonb_agg(oc.id), '[]'::jsonb)
  INTO
    v_conv_count, v_total_duration, v_total_words_user, v_total_words_others,
    v_avg_overall, v_avg_clarity, v_avg_structure, v_avg_empatia, v_avg_vocabulario, v_avg_objetivo,
    v_avg_ratio_habla, v_total_preguntas_usuario, v_total_preguntas_otros,
    v_acciones_count, v_temas_sin_cerrar_count, v_conversation_ids
  FROM maity.omi_conversations oc
  WHERE oc.user_id = p_user_id
    AND oc.deleted = false
    AND oc.discarded = false
    AND oc.communication_feedback IS NOT NULL
    AND (oc.created_at AT TIME ZONE 'America/Mexico_City')::date = p_date;

  IF v_conv_count = 0 THEN
    RETURN jsonb_build_object('success', true, 'conversations_count', 0, 'skipped', true);
  END IF;

  -- Merge muletillas from all conversations
  SELECT COALESCE(jsonb_object_agg(k, v_sum), '{}'::jsonb)
  INTO v_muletillas_by_word
  FROM (
    SELECT key AS k, SUM(value::text::integer) AS v_sum
    FROM maity.omi_conversations oc,
         jsonb_each(COALESCE(oc.communication_feedback->'radiografia'->'muletillas_detectadas', '{}'::jsonb))
    WHERE oc.user_id = p_user_id
      AND oc.deleted = false
      AND oc.discarded = false
      AND oc.communication_feedback IS NOT NULL
      AND (oc.created_at AT TIME ZONE 'America/Mexico_City')::date = p_date
    GROUP BY key
  ) sub;

  -- Calculate total muletillas
  SELECT COALESCE(SUM(v::text::integer), 0)::integer
  INTO v_muletillas_total
  FROM jsonb_each(v_muletillas_by_word) AS j(k, v);

  -- Calculate muletillas rate (per 100 words)
  IF v_total_words_user > 0 THEN
    v_muletillas_rate := ROUND((v_muletillas_total::numeric / v_total_words_user) * 100, 2);
  ELSE
    v_muletillas_rate := 0;
  END IF;

  -- Deduplicate temas_tratados
  SELECT COALESCE(jsonb_agg(DISTINCT tema), '[]'::jsonb)
  INTO v_temas_tratados
  FROM (
    SELECT jsonb_array_elements_text(
      COALESCE(oc.communication_feedback->'temas'->'temas_tratados', '[]'::jsonb)
    ) AS tema
    FROM maity.omi_conversations oc
    WHERE oc.user_id = p_user_id
      AND oc.deleted = false
      AND oc.discarded = false
      AND oc.communication_feedback IS NOT NULL
      AND (oc.created_at AT TIME ZONE 'America/Mexico_City')::date = p_date
  ) sub;

  -- Top strengths by frequency (top 5)
  SELECT COALESCE(jsonb_agg(s ORDER BY cnt DESC), '[]'::jsonb)
  INTO v_top_strengths
  FROM (
    SELECT s, COUNT(*) AS cnt
    FROM (
      SELECT jsonb_array_elements_text(
        COALESCE(oc.communication_feedback->'strengths', '[]'::jsonb)
      ) AS s
      FROM maity.omi_conversations oc
      WHERE oc.user_id = p_user_id
        AND oc.deleted = false
        AND oc.discarded = false
        AND oc.communication_feedback IS NOT NULL
        AND (oc.created_at AT TIME ZONE 'America/Mexico_City')::date = p_date
    ) raw
    GROUP BY s
    ORDER BY cnt DESC
    LIMIT 5
  ) ranked;

  -- Top areas to improve by frequency (top 5)
  SELECT COALESCE(jsonb_agg(a ORDER BY cnt DESC), '[]'::jsonb)
  INTO v_top_areas
  FROM (
    SELECT a, COUNT(*) AS cnt
    FROM (
      SELECT jsonb_array_elements_text(
        COALESCE(oc.communication_feedback->'areas_to_improve', '[]'::jsonb)
      ) AS a
      FROM maity.omi_conversations oc
      WHERE oc.user_id = p_user_id
        AND oc.deleted = false
        AND oc.discarded = false
        AND oc.communication_feedback IS NOT NULL
        AND (oc.created_at AT TIME ZONE 'America/Mexico_City')::date = p_date
    ) raw
    GROUP BY a
    ORDER BY cnt DESC
    LIMIT 5
  ) ranked;

  -- UPSERT into daily_evaluations
  INSERT INTO maity.daily_evaluations (
    user_id, evaluation_date, conversations_count, total_duration_seconds,
    total_words_user, total_words_others,
    avg_overall_score, avg_clarity, avg_structure, avg_empatia, avg_vocabulario, avg_objetivo,
    muletillas_total, muletillas_by_word, muletillas_rate,
    avg_ratio_habla, total_preguntas_usuario, total_preguntas_otros,
    temas_tratados, acciones_count, temas_sin_cerrar_count,
    top_strengths, top_areas_to_improve,
    conversation_ids, status, updated_at
  ) VALUES (
    p_user_id, p_date, v_conv_count, v_total_duration,
    v_total_words_user, v_total_words_others,
    v_avg_overall, v_avg_clarity, v_avg_structure, v_avg_empatia, v_avg_vocabulario, v_avg_objetivo,
    v_muletillas_total, v_muletillas_by_word, v_muletillas_rate,
    v_avg_ratio_habla, v_total_preguntas_usuario, v_total_preguntas_otros,
    v_temas_tratados, v_acciones_count, v_temas_sin_cerrar_count,
    v_top_strengths, v_top_areas,
    v_conversation_ids, 'pending', now()
  )
  ON CONFLICT (user_id, evaluation_date)
  DO UPDATE SET
    conversations_count = EXCLUDED.conversations_count,
    total_duration_seconds = EXCLUDED.total_duration_seconds,
    total_words_user = EXCLUDED.total_words_user,
    total_words_others = EXCLUDED.total_words_others,
    avg_overall_score = EXCLUDED.avg_overall_score,
    avg_clarity = EXCLUDED.avg_clarity,
    avg_structure = EXCLUDED.avg_structure,
    avg_empatia = EXCLUDED.avg_empatia,
    avg_vocabulario = EXCLUDED.avg_vocabulario,
    avg_objetivo = EXCLUDED.avg_objetivo,
    muletillas_total = EXCLUDED.muletillas_total,
    muletillas_by_word = EXCLUDED.muletillas_by_word,
    muletillas_rate = EXCLUDED.muletillas_rate,
    avg_ratio_habla = EXCLUDED.avg_ratio_habla,
    total_preguntas_usuario = EXCLUDED.total_preguntas_usuario,
    total_preguntas_otros = EXCLUDED.total_preguntas_otros,
    temas_tratados = EXCLUDED.temas_tratados,
    acciones_count = EXCLUDED.acciones_count,
    temas_sin_cerrar_count = EXCLUDED.temas_sin_cerrar_count,
    top_strengths = EXCLUDED.top_strengths,
    top_areas_to_improve = EXCLUDED.top_areas_to_improve,
    conversation_ids = EXCLUDED.conversation_ids,
    -- Keep status as-is if already 'complete' with LLM data, otherwise 'pending'
    status = CASE
      WHEN maity.daily_evaluations.daily_summary IS NOT NULL THEN 'complete'
      ELSE 'pending'
    END,
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'conversations_count', v_conv_count,
    'avg_overall_score', v_avg_overall,
    'muletillas_total', v_muletillas_total
  );
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.compute_daily_evaluation(
  p_user_id uuid,
  p_date date
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT maity.compute_daily_evaluation(p_user_id, p_date);
$$;

GRANT EXECUTE ON FUNCTION public.compute_daily_evaluation(uuid, date) TO authenticated;

-- --------------------------------------------------------------------------
-- 4. RPC: get_my_daily_evaluations
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION maity.get_my_daily_evaluations(
  p_days integer DEFAULT 30
)
RETURNS SETOF maity.daily_evaluations
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
  SELECT de.*
  FROM maity.daily_evaluations de
  WHERE de.user_id = v_user_id
    AND de.evaluation_date >= (CURRENT_DATE - p_days)
  ORDER BY de.evaluation_date DESC;
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.get_my_daily_evaluations(
  p_days integer DEFAULT 30
)
RETURNS SETOF maity.daily_evaluations
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM maity.get_my_daily_evaluations(p_days);
$$;

GRANT EXECUTE ON FUNCTION public.get_my_daily_evaluations(integer) TO authenticated;

-- --------------------------------------------------------------------------
-- 5. RPC: get_my_today_evaluation
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION maity.get_my_today_evaluation()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public
AS $$
DECLARE
  v_auth_id uuid;
  v_user_id uuid;
  v_today jsonb;
  v_yesterday jsonb;
BEGIN
  v_auth_id := auth.uid();
  IF v_auth_id IS NULL THEN
    RETURN jsonb_build_object('today', NULL, 'yesterday', NULL);
  END IF;

  SELECT u.id INTO v_user_id
  FROM maity.users u
  WHERE u.auth_id = v_auth_id;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('today', NULL, 'yesterday', NULL);
  END IF;

  -- Today's evaluation
  SELECT row_to_json(de)::jsonb INTO v_today
  FROM maity.daily_evaluations de
  WHERE de.user_id = v_user_id
    AND de.evaluation_date = CURRENT_DATE;

  -- Yesterday's evaluation
  SELECT row_to_json(de)::jsonb INTO v_yesterday
  FROM maity.daily_evaluations de
  WHERE de.user_id = v_user_id
    AND de.evaluation_date = CURRENT_DATE - 1;

  RETURN jsonb_build_object('today', v_today, 'yesterday', v_yesterday);
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.get_my_today_evaluation()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT maity.get_my_today_evaluation();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_today_evaluation() TO authenticated;

-- --------------------------------------------------------------------------
-- 6. RPC: get_xp_leaderboard
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION maity.get_xp_leaderboard(
  p_limit integer DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public
AS $$
DECLARE
  v_auth_id uuid;
  v_user_id uuid;
  v_company_id uuid;
  v_result jsonb;
  v_user_in_top boolean;
  v_user_entry jsonb;
BEGIN
  v_auth_id := auth.uid();
  IF v_auth_id IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  SELECT u.id, u.company_id INTO v_user_id, v_company_id
  FROM maity.users u
  WHERE u.auth_id = v_auth_id;

  IF v_user_id IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  -- Get top N users by XP from the same company
  SELECT COALESCE(jsonb_agg(row_to_json(ranked)), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT
      ROW_NUMBER() OVER (ORDER BY u.total_xp DESC, u.full_name ASC)::integer AS position,
      u.id AS user_id,
      COALESCE(
        SPLIT_PART(u.full_name, ' ', 1) || ' ' || LEFT(SPLIT_PART(u.full_name, ' ', 2), 1) || '.',
        'Usuario'
      ) AS user_name,
      u.total_xp,
      (u.id = v_user_id) AS is_current_user
    FROM maity.users u
    WHERE (v_company_id IS NULL OR u.company_id = v_company_id)
      AND u.total_xp > 0
    ORDER BY u.total_xp DESC, u.full_name ASC
    LIMIT p_limit
  ) ranked;

  -- Check if current user is in the top N
  SELECT EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_result) elem
    WHERE (elem->>'is_current_user')::boolean = true
  ) INTO v_user_in_top;

  -- If not in top N, append current user
  IF NOT v_user_in_top THEN
    SELECT row_to_json(sub)::jsonb INTO v_user_entry
    FROM (
      SELECT
        (SELECT COUNT(*) + 1 FROM maity.users u2
         WHERE (v_company_id IS NULL OR u2.company_id = v_company_id)
           AND u2.total_xp > u.total_xp)::integer AS position,
        u.id AS user_id,
        COALESCE(
          SPLIT_PART(u.full_name, ' ', 1) || ' ' || LEFT(SPLIT_PART(u.full_name, ' ', 2), 1) || '.',
          'Usuario'
        ) AS user_name,
        u.total_xp,
        true AS is_current_user
      FROM maity.users u
      WHERE u.id = v_user_id
    ) sub;

    IF v_user_entry IS NOT NULL THEN
      v_result := v_result || jsonb_build_array(v_user_entry);
    END IF;
  END IF;

  RETURN v_result;
END;
$$;

-- Public wrapper
CREATE OR REPLACE FUNCTION public.get_xp_leaderboard(
  p_limit integer DEFAULT 10
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT maity.get_xp_leaderboard(p_limit);
$$;

GRANT EXECUTE ON FUNCTION public.get_xp_leaderboard(integer) TO authenticated;

-- --------------------------------------------------------------------------
-- 7. Comments
-- --------------------------------------------------------------------------
COMMENT ON TABLE maity.daily_evaluations IS 'Daily aggregation of communication metrics from Omi conversations with optional LLM narrative summary';
COMMENT ON FUNCTION maity.compute_daily_evaluation IS 'Aggregates all conversations for a user+date into daily_evaluations via SQL (scores, muletillas, temas, etc.)';
COMMENT ON FUNCTION maity.get_my_daily_evaluations IS 'Returns authenticated users daily evaluations for the last N days';
COMMENT ON FUNCTION maity.get_my_today_evaluation IS 'Returns today and yesterday evaluations for the authenticated user';
COMMENT ON FUNCTION maity.get_xp_leaderboard IS 'Returns XP leaderboard for users in the same company, always includes current user';
