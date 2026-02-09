-- Streak calculation function for Omi conversations
-- Counts consecutive days with conversations, with special rules for weekdays vs weekends
--
-- Business Rules:
-- - Weekdays (Mon-Fri): MANDATORY - If no conversation, streak is LOST
-- - Weekends (Sat-Sun): BONUS - If conversation exists +1, if not does NOT break streak
--
-- Returns:
-- - streak_days: Total consecutive days (including bonus weekend days)
-- - bonus_days: How many of those days were weekend bonus days
-- - last_conversation_date: Date of most recent conversation
-- - streak_started_at: Date when the current streak began

-- Main function in maity schema
CREATE OR REPLACE FUNCTION maity.calculate_user_streak(p_user_id uuid)
RETURNS TABLE(
  streak_days integer,
  bonus_days integer,
  last_conversation_date date,
  streak_started_at date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = maity, public
AS $$
DECLARE
  v_timezone text;
  v_today date;
  v_check_date date;
  v_day_of_week integer;
  v_streak integer := 0;
  v_bonus integer := 0;
  v_has_conversation boolean;
  v_streak_broken boolean := false;
  v_last_conv_date date;
  v_streak_start date;
BEGIN
  -- Get timezone from user's company (default to Mexico City)
  SELECT COALESCE(c.timezone, 'America/Mexico_City')
  INTO v_timezone
  FROM maity.users u
  LEFT JOIN maity.companies c ON u.company_id = c.id
  WHERE u.id = p_user_id;

  v_timezone := COALESCE(v_timezone, 'America/Mexico_City');
  v_today := (NOW() AT TIME ZONE v_timezone)::date;
  v_check_date := v_today;

  -- Get the date of the most recent conversation
  SELECT (created_at AT TIME ZONE v_timezone)::date
  INTO v_last_conv_date
  FROM maity.omi_conversations
  WHERE user_id = p_user_id AND deleted = false AND discarded = false
  ORDER BY created_at DESC LIMIT 1;

  -- If no conversations at all, return zeros
  IF v_last_conv_date IS NULL THEN
    RETURN QUERY SELECT 0, 0, NULL::date, NULL::date;
    RETURN;
  END IF;

  -- Iterate backwards from today
  WHILE NOT v_streak_broken LOOP
    -- DOW: 0=Sunday, 1=Monday, ..., 6=Saturday
    v_day_of_week := EXTRACT(DOW FROM v_check_date);

    -- Check if there's a conversation on this date
    SELECT EXISTS(
      SELECT 1 FROM maity.omi_conversations
      WHERE user_id = p_user_id
        AND deleted = false
        AND discarded = false
        AND (created_at AT TIME ZONE v_timezone)::date = v_check_date
    ) INTO v_has_conversation;

    IF v_day_of_week IN (0, 6) THEN
      -- WEEKEND (Saturday=6, Sunday=0): bonus day, optional
      IF v_has_conversation THEN
        v_streak := v_streak + 1;
        v_bonus := v_bonus + 1;
        v_streak_start := v_check_date;
      END IF;
      -- If no conversation on weekend, just continue (don't break streak)
    ELSE
      -- WEEKDAY (Mon-Fri): mandatory
      IF v_has_conversation THEN
        v_streak := v_streak + 1;
        v_streak_start := v_check_date;
      ELSE
        -- No conversation on weekday = streak broken
        v_streak_broken := true;
      END IF;
    END IF;

    -- Move to previous day
    v_check_date := v_check_date - INTERVAL '1 day';

    -- Safety limit: don't go back more than 365 days
    IF v_today - v_check_date > 365 THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_streak, v_bonus, v_last_conv_date, v_streak_start;
END;
$$;

-- Public wrapper function
CREATE OR REPLACE FUNCTION public.calculate_user_streak(p_user_id uuid)
RETURNS TABLE(
  streak_days integer,
  bonus_days integer,
  last_conversation_date date,
  streak_started_at date
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM maity.calculate_user_streak(p_user_id);
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.calculate_user_streak(uuid) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION maity.calculate_user_streak IS 'Calculates user streak based on Omi conversations. Weekdays are mandatory, weekends are bonus days.';
COMMENT ON FUNCTION public.calculate_user_streak IS 'Public wrapper for maity.calculate_user_streak function';
