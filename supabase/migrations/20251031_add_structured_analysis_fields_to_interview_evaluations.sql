-- Add structured analysis fields to interview_evaluations table
-- These fields support the new JSON-based analysis format from n8n

-- Add JSONB columns for structured analysis data
ALTER TABLE maity.interview_evaluations
ADD COLUMN IF NOT EXISTS recomendaciones_prioritarias JSONB,
ADD COLUMN IF NOT EXISTS patrones_observados JSONB,
ADD COLUMN IF NOT EXISTS conclusion_general TEXT,
ADD COLUMN IF NOT EXISTS siguiente_paso_sugerido TEXT;

-- Add comments for documentation
COMMENT ON COLUMN maity.interview_evaluations.recomendaciones_prioritarias IS 'Array of priority recommendations with Area, Situacion_Actual, Recomendacion_Especifica, Ejemplo_de_Mejora';
COMMENT ON COLUMN maity.interview_evaluations.patrones_observados IS 'JSON object with Positivos (array) and A_Trabajar (array) patterns';
COMMENT ON COLUMN maity.interview_evaluations.conclusion_general IS 'General conclusion from the interview analysis';
COMMENT ON COLUMN maity.interview_evaluations.siguiente_paso_sugerido IS 'Suggested next steps for the interviewee';

-- Create index for JSONB searches (optional, for future queries)
CREATE INDEX IF NOT EXISTS idx_interview_evaluations_recomendaciones
ON maity.interview_evaluations USING gin(recomendaciones_prioritarias);

CREATE INDEX IF NOT EXISTS idx_interview_evaluations_patrones
ON maity.interview_evaluations USING gin(patrones_observados);
