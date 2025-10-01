-- Create roleplay_progress table for tracking user progress through different profiles
CREATE TABLE IF NOT EXISTS public.roleplay_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Current active profile
  current_profile TEXT CHECK (current_profile IN ('cto', 'cfo', 'ceo')) DEFAULT 'cto',

  -- CTO Progress
  cto_current_level INTEGER DEFAULT 1,
  cto_progress INTEGER DEFAULT 0 CHECK (cto_progress >= 0 AND cto_progress <= 100),
  cto_completed BOOLEAN DEFAULT FALSE,
  cto_sessions_completed INTEGER DEFAULT 0,
  cto_total_score INTEGER DEFAULT 0,

  -- CFO Progress
  cfo_current_level INTEGER DEFAULT 0,
  cfo_progress INTEGER DEFAULT 0 CHECK (cfo_progress >= 0 AND cfo_progress <= 100),
  cfo_completed BOOLEAN DEFAULT FALSE,
  cfo_sessions_completed INTEGER DEFAULT 0,
  cfo_total_score INTEGER DEFAULT 0,

  -- CEO Progress
  ceo_current_level INTEGER DEFAULT 0,
  ceo_progress INTEGER DEFAULT 0 CHECK (ceo_progress >= 0 AND ceo_progress <= 100),
  ceo_completed BOOLEAN DEFAULT FALSE,
  ceo_sessions_completed INTEGER DEFAULT 0,
  ceo_total_score INTEGER DEFAULT 0,

  -- Overall stats
  total_sessions_completed INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in minutes
  best_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_session_date TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE public.roleplay_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see their own progress
CREATE POLICY "Users can view own progress" ON public.roleplay_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress" ON public.roleplay_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress" ON public.roleplay_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update progress after completing a session
CREATE OR REPLACE FUNCTION public.update_roleplay_progress(
  p_user_id UUID,
  p_profile TEXT,
  p_session_score INTEGER,
  p_session_duration INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_current_level INTEGER;
  v_sessions_completed INTEGER;
  v_new_progress INTEGER;
  v_profile_completed BOOLEAN := FALSE;
BEGIN
  -- Get current progress for the profile
  IF p_profile = 'cto' THEN
    SELECT cto_current_level, cto_sessions_completed
    INTO v_current_level, v_sessions_completed
    FROM public.roleplay_progress
    WHERE user_id = p_user_id;
  ELSIF p_profile = 'cfo' THEN
    SELECT cfo_current_level, cfo_sessions_completed
    INTO v_current_level, v_sessions_completed
    FROM public.roleplay_progress
    WHERE user_id = p_user_id;
  ELSIF p_profile = 'ceo' THEN
    SELECT ceo_current_level, ceo_sessions_completed
    INTO v_current_level, v_sessions_completed
    FROM public.roleplay_progress
    WHERE user_id = p_user_id;
  END IF;

  -- Calculate new progress (20% per session per level)
  v_sessions_completed := COALESCE(v_sessions_completed, 0) + 1;
  v_new_progress := LEAST(100, ((v_sessions_completed - 1) % 5 + 1) * 20);

  -- Check if level is completed (5 sessions per level)
  IF v_sessions_completed % 5 = 0 AND v_sessions_completed > 0 THEN
    -- Check if all levels completed (5 levels total)
    IF v_current_level >= 5 THEN
      v_profile_completed := TRUE;
      v_new_progress := 100;
    ELSE
      v_current_level := v_current_level + 1;
      v_new_progress := 0;
    END IF;
  END IF;

  -- Update the progress
  IF p_profile = 'cto' THEN
    UPDATE public.roleplay_progress
    SET
      cto_current_level = v_current_level,
      cto_progress = v_new_progress,
      cto_sessions_completed = v_sessions_completed,
      cto_total_score = cto_total_score + p_session_score,
      cto_completed = v_profile_completed,
      total_sessions_completed = total_sessions_completed + 1,
      total_time_spent = total_time_spent + p_session_duration,
      best_score = GREATEST(best_score, p_session_score),
      last_session_date = NOW(),
      updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF p_profile = 'cfo' THEN
    UPDATE public.roleplay_progress
    SET
      cfo_current_level = v_current_level,
      cfo_progress = v_new_progress,
      cfo_sessions_completed = v_sessions_completed,
      cfo_total_score = cfo_total_score + p_session_score,
      cfo_completed = v_profile_completed,
      total_sessions_completed = total_sessions_completed + 1,
      total_time_spent = total_time_spent + p_session_duration,
      best_score = GREATEST(best_score, p_session_score),
      last_session_date = NOW(),
      updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF p_profile = 'ceo' THEN
    UPDATE public.roleplay_progress
    SET
      ceo_current_level = v_current_level,
      ceo_progress = v_new_progress,
      ceo_sessions_completed = v_sessions_completed,
      ceo_total_score = ceo_total_score + p_session_score,
      ceo_completed = v_profile_completed,
      total_sessions_completed = total_sessions_completed + 1,
      total_time_spent = total_time_spent + p_session_duration,
      best_score = GREATEST(best_score, p_session_score),
      last_session_date = NOW(),
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  -- When a profile is completed, the user can manually choose the next profile
  -- No automatic switching to a specific profile
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_roleplay_progress TO authenticated;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_roleplay_progress_user_id ON public.roleplay_progress(user_id);