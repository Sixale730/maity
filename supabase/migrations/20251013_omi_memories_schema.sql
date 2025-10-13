-- Omi Life-Logging Schema
-- Creates tables and functions for continuous audio capture, transcription, and semantic search

-- ======================================================================================
-- TABLE: omi_recording_sessions
-- ======================================================================================
-- Tracks active recording sessions when user activates Omi life-logging

CREATE TABLE IF NOT EXISTS public.omi_recording_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,

    -- Session status
    status TEXT NOT NULL DEFAULT 'active',

    -- Timestamps
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_audio_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,

    -- Statistics
    total_memories_created INTEGER DEFAULT 0,
    total_duration_seconds INTEGER DEFAULT 0,

    -- Device metadata
    battery_level INTEGER,
    firmware_version TEXT,

    -- App metadata
    app_version TEXT,
    metadata JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT omi_recording_sessions_status_check
        CHECK (status IN ('active', 'paused', 'stopped')),
    CONSTRAINT omi_recording_sessions_battery_check
        CHECK (battery_level IS NULL OR (battery_level >= 0 AND battery_level <= 100))
);

-- Indexes for omi_recording_sessions
CREATE INDEX IF NOT EXISTS omi_recording_sessions_user_idx
    ON public.omi_recording_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS omi_recording_sessions_status_idx
    ON public.omi_recording_sessions(status)
    WHERE status = 'active';

-- Comments
COMMENT ON TABLE public.omi_recording_sessions IS 'Tracks Omi device recording sessions';
COMMENT ON COLUMN public.omi_recording_sessions.status IS 'active, paused, or stopped';
COMMENT ON COLUMN public.omi_recording_sessions.battery_level IS 'Battery level of Omi device (0-100)';


-- ======================================================================================
-- TABLE: omi_memories
-- ======================================================================================
-- Stores transcribed conversations with vector embeddings for semantic search

CREATE TABLE IF NOT EXISTS public.omi_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.omi_recording_sessions(id) ON DELETE SET NULL,

    -- Content
    transcript TEXT NOT NULL,
    audio_url TEXT,

    -- Audio metadata
    duration_seconds INTEGER NOT NULL,
    word_count INTEGER,

    -- Vector embedding (3072 dimensions - OpenAI text-embedding-3-large)
    embedding VECTOR(3072),

    -- Timestamps
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Context metadata
    device_id TEXT,
    location JSONB,

    -- AI-generated categorization (post-processing)
    category TEXT,
    tags TEXT[],
    people_mentioned TEXT[],

    -- AI-generated analysis (optional)
    sentiment TEXT,
    summary TEXT,
    action_items TEXT[],
    key_topics TEXT[],

    -- Constraints
    CONSTRAINT omi_memories_duration_check
        CHECK (duration_seconds > 0),
    CONSTRAINT omi_memories_timestamps_check
        CHECK (ended_at > started_at),
    CONSTRAINT omi_memories_category_check
        CHECK (category IS NULL OR category IN ('meeting', 'conversation', 'personal', 'work', 'note')),
    CONSTRAINT omi_memories_sentiment_check
        CHECK (sentiment IS NULL OR sentiment IN ('positive', 'neutral', 'negative'))
);

-- Indexes for omi_memories
CREATE INDEX IF NOT EXISTS omi_memories_user_started_idx
    ON public.omi_memories(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS omi_memories_user_category_idx
    ON public.omi_memories(user_id, category)
    WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS omi_memories_tags_idx
    ON public.omi_memories USING gin(tags);
CREATE INDEX IF NOT EXISTS omi_memories_created_idx
    ON public.omi_memories(created_at DESC);
CREATE INDEX IF NOT EXISTS omi_memories_session_idx
    ON public.omi_memories(session_id)
    WHERE session_id IS NOT NULL;

-- Vector similarity search index (IVFFlat)
CREATE INDEX IF NOT EXISTS omi_memories_embedding_idx
    ON public.omi_memories
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Comments
COMMENT ON TABLE public.omi_memories IS 'Stores transcribed conversations with vector embeddings';
COMMENT ON COLUMN public.omi_memories.embedding IS 'OpenAI text-embedding-3-large (3072 dimensions)';
COMMENT ON COLUMN public.omi_memories.location IS 'JSON: {lat: number, lng: number, address: string}';
COMMENT ON COLUMN public.omi_memories.category IS 'Auto-categorized by GPT-4';
COMMENT ON COLUMN public.omi_memories.tags IS 'Auto-extracted tags/keywords';
COMMENT ON COLUMN public.omi_memories.sentiment IS 'Sentiment analysis result';


-- ======================================================================================
-- RPC FUNCTION: create_omi_recording_session
-- ======================================================================================
-- Creates a new recording session when user starts Omi life-logging

CREATE OR REPLACE FUNCTION public.create_omi_recording_session(
    p_user_id UUID,
    p_device_id TEXT,
    p_app_version TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session_id UUID;
BEGIN
    -- Insert new session
    INSERT INTO public.omi_recording_sessions (
        user_id,
        device_id,
        app_version,
        status
    )
    VALUES (
        p_user_id,
        p_device_id,
        p_app_version,
        'active'
    )
    RETURNING id INTO v_session_id;

    RETURN v_session_id;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.create_omi_recording_session TO authenticated;

-- Comment
COMMENT ON FUNCTION public.create_omi_recording_session IS 'Creates a new Omi recording session';


-- ======================================================================================
-- RPC FUNCTION: update_omi_recording_session_status
-- ======================================================================================
-- Updates session status (active, paused, stopped)

CREATE OR REPLACE FUNCTION public.update_omi_recording_session_status(
    p_session_id UUID,
    p_status TEXT,
    p_battery_level INTEGER DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate status
    IF p_status NOT IN ('active', 'paused', 'stopped') THEN
        RAISE EXCEPTION 'Invalid status: %', p_status;
    END IF;

    -- Update session
    UPDATE public.omi_recording_sessions
    SET
        status = p_status,
        battery_level = COALESCE(p_battery_level, battery_level),
        ended_at = CASE
            WHEN p_status = 'stopped' THEN NOW()
            ELSE ended_at
        END
    WHERE id = p_session_id;

    RETURN FOUND;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.update_omi_recording_session_status TO authenticated;


-- ======================================================================================
-- RPC FUNCTION: create_omi_memory
-- ======================================================================================
-- Creates a new memory from transcribed audio segment

CREATE OR REPLACE FUNCTION public.create_omi_memory(
    p_user_id UUID,
    p_session_id UUID,
    p_transcript TEXT,
    p_embedding VECTOR(3072),
    p_started_at TIMESTAMPTZ,
    p_ended_at TIMESTAMPTZ,
    p_duration_seconds INTEGER,
    p_device_id TEXT,
    p_location JSONB DEFAULT NULL,
    p_audio_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_memory_id UUID;
    v_word_count INTEGER;
BEGIN
    -- Validate timestamps
    IF p_ended_at <= p_started_at THEN
        RAISE EXCEPTION 'ended_at must be after started_at';
    END IF;

    -- Calculate word count
    v_word_count := array_length(string_to_array(p_transcript, ' '), 1);

    -- Insert memory
    INSERT INTO public.omi_memories (
        user_id,
        session_id,
        transcript,
        embedding,
        started_at,
        ended_at,
        duration_seconds,
        device_id,
        word_count,
        location,
        audio_url
    )
    VALUES (
        p_user_id,
        p_session_id,
        p_transcript,
        p_embedding,
        p_started_at,
        p_ended_at,
        p_duration_seconds,
        p_device_id,
        v_word_count,
        p_location,
        p_audio_url
    )
    RETURNING id INTO v_memory_id;

    -- Update session statistics
    UPDATE public.omi_recording_sessions
    SET
        total_memories_created = total_memories_created + 1,
        total_duration_seconds = total_duration_seconds + p_duration_seconds,
        last_audio_at = NOW()
    WHERE id = p_session_id;

    RETURN v_memory_id;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.create_omi_memory TO authenticated;

-- Comment
COMMENT ON FUNCTION public.create_omi_memory IS 'Creates a new Omi memory with embedding and updates session stats';


-- ======================================================================================
-- RPC FUNCTION: search_omi_memories
-- ======================================================================================
-- Semantic search using vector similarity (cosine distance)

CREATE OR REPLACE FUNCTION public.search_omi_memories(
    p_user_id UUID,
    p_query_embedding VECTOR(3072),
    p_limit INTEGER DEFAULT 10,
    p_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    id UUID,
    transcript TEXT,
    summary TEXT,
    similarity FLOAT,
    started_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    category TEXT,
    tags TEXT[],
    people_mentioned TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.transcript,
        m.summary,
        1 - (m.embedding <=> p_query_embedding) as similarity,
        m.started_at,
        m.duration_seconds,
        m.category,
        m.tags,
        m.people_mentioned
    FROM public.omi_memories m
    WHERE m.user_id = p_user_id
        AND m.embedding IS NOT NULL
        AND 1 - (m.embedding <=> p_query_embedding) >= p_threshold
    ORDER BY m.embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.search_omi_memories TO authenticated;

-- Comment
COMMENT ON FUNCTION public.search_omi_memories IS 'Semantic search using vector similarity (cosine distance)';


-- ======================================================================================
-- RPC FUNCTION: get_omi_memories_by_date_range
-- ======================================================================================
-- Get memories within a date range

CREATE OR REPLACE FUNCTION public.get_omi_memories_by_date_range(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_category TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    transcript TEXT,
    summary TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    word_count INTEGER,
    category TEXT,
    tags TEXT[],
    sentiment TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.transcript,
        m.summary,
        m.started_at,
        m.ended_at,
        m.duration_seconds,
        m.word_count,
        m.category,
        m.tags,
        m.sentiment
    FROM public.omi_memories m
    WHERE m.user_id = p_user_id
        AND m.started_at >= p_start_date
        AND m.started_at <= p_end_date
        AND (p_category IS NULL OR m.category = p_category)
    ORDER BY m.started_at DESC
    LIMIT p_limit;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.get_omi_memories_by_date_range TO authenticated;


-- ======================================================================================
-- RPC FUNCTION: update_omi_memory_analysis
-- ======================================================================================
-- Updates AI-generated analysis fields (post-processing)

CREATE OR REPLACE FUNCTION public.update_omi_memory_analysis(
    p_memory_id UUID,
    p_category TEXT DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_people_mentioned TEXT[] DEFAULT NULL,
    p_sentiment TEXT DEFAULT NULL,
    p_summary TEXT DEFAULT NULL,
    p_action_items TEXT[] DEFAULT NULL,
    p_key_topics TEXT[] DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.omi_memories
    SET
        category = COALESCE(p_category, category),
        tags = COALESCE(p_tags, tags),
        people_mentioned = COALESCE(p_people_mentioned, people_mentioned),
        sentiment = COALESCE(p_sentiment, sentiment),
        summary = COALESCE(p_summary, summary),
        action_items = COALESCE(p_action_items, action_items),
        key_topics = COALESCE(p_key_topics, key_topics)
    WHERE id = p_memory_id;

    RETURN FOUND;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.update_omi_memory_analysis TO authenticated;


-- ======================================================================================
-- RPC FUNCTION: get_omi_daily_stats
-- ======================================================================================
-- Get daily statistics for analytics dashboard

CREATE OR REPLACE FUNCTION public.get_omi_daily_stats(
    p_user_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_memories INTEGER,
    total_duration_seconds INTEGER,
    total_words INTEGER,
    categories JSONB,
    sentiment_distribution JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start_time TIMESTAMPTZ;
    v_end_time TIMESTAMPTZ;
BEGIN
    -- Set time range for the day
    v_start_time := p_date::TIMESTAMPTZ;
    v_end_time := (p_date + INTERVAL '1 day')::TIMESTAMPTZ;

    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER as total_memories,
        SUM(m.duration_seconds)::INTEGER as total_duration_seconds,
        SUM(m.word_count)::INTEGER as total_words,
        jsonb_object_agg(
            COALESCE(m.category, 'uncategorized'),
            cat_count
        ) as categories,
        jsonb_object_agg(
            COALESCE(m.sentiment, 'unknown'),
            sent_count
        ) as sentiment_distribution
    FROM public.omi_memories m
    LEFT JOIN LATERAL (
        SELECT COUNT(*)::INTEGER as cat_count
        FROM public.omi_memories
        WHERE user_id = m.user_id
            AND started_at >= v_start_time
            AND started_at < v_end_time
            AND category = m.category
    ) cat_counts ON true
    LEFT JOIN LATERAL (
        SELECT COUNT(*)::INTEGER as sent_count
        FROM public.omi_memories
        WHERE user_id = m.user_id
            AND started_at >= v_start_time
            AND started_at < v_end_time
            AND sentiment = m.sentiment
    ) sent_counts ON true
    WHERE m.user_id = p_user_id
        AND m.started_at >= v_start_time
        AND m.started_at < v_end_time
    GROUP BY m.user_id;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.get_omi_daily_stats TO authenticated;


-- ======================================================================================
-- ROW LEVEL SECURITY (RLS)
-- ======================================================================================

-- Enable RLS
ALTER TABLE public.omi_recording_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.omi_memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for omi_recording_sessions
CREATE POLICY "Users can view own recording sessions"
    ON public.omi_recording_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recording sessions"
    ON public.omi_recording_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recording sessions"
    ON public.omi_recording_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recording sessions"
    ON public.omi_recording_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for omi_memories
CREATE POLICY "Users can view own memories"
    ON public.omi_memories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories"
    ON public.omi_memories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories"
    ON public.omi_memories FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
    ON public.omi_memories FOR DELETE
    USING (auth.uid() = user_id);


-- ======================================================================================
-- COMPLETION MESSAGE
-- ======================================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Omi memories schema created successfully';
    RAISE NOTICE '📊 Tables: omi_recording_sessions, omi_memories';
    RAISE NOTICE '🔧 RPC Functions: 8 functions created';
    RAISE NOTICE '🔒 RLS Policies: Enabled for all tables';
    RAISE NOTICE '🔍 Vector search: Enabled with IVFFlat index';
END $$;
