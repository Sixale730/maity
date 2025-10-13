-- Enable pgvector extension for vector similarity search
-- This extension allows us to store and query embedding vectors

CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extension is enabled
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        RAISE EXCEPTION 'pgvector extension failed to enable';
    END IF;
END $$;

-- Comment for documentation
COMMENT ON EXTENSION vector IS 'OpenAI embeddings storage and semantic search for Omi memories';
