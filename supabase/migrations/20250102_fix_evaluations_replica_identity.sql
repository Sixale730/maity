-- Fix replica identity for evaluations table to enable proper Realtime updates
-- REPLICA IDENTITY FULL sends all column values in UPDATE events, not just the primary key
-- This is required for Realtime subscriptions to receive the full updated row data

ALTER TABLE maity.evaluations REPLICA IDENTITY FULL;

COMMENT ON TABLE maity.evaluations IS 'Voice practice evaluations with FULL replica identity for Realtime';
