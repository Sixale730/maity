-- Migration: Extend form_responses table for native registration form
-- Date: 2025-11-11
-- Purpose: Add columns for additional questions in the native diagnostic form
--
-- Form Structure (Total: 19 questions):
-- q1-q4: Personal info (Nombre, Apellido, Teléfono, Puesto)
-- q5-q16: Likert scale 1-5 (12 questions - 6 aristas x 2 preguntas cada una)
-- q17-q19: Open-ended questions

-- Add additional question columns
ALTER TABLE maity.form_responses
  ADD COLUMN IF NOT EXISTS q13 TEXT,
  ADD COLUMN IF NOT EXISTS q14 TEXT,
  ADD COLUMN IF NOT EXISTS q15 TEXT,
  ADD COLUMN IF NOT EXISTS q16 TEXT,
  ADD COLUMN IF NOT EXISTS q17 TEXT,
  ADD COLUMN IF NOT EXISTS q18 TEXT,
  ADD COLUMN IF NOT EXISTS q19 TEXT;

-- Add comments for documentation
COMMENT ON COLUMN maity.form_responses.q1 IS 'Nombre';
COMMENT ON COLUMN maity.form_responses.q2 IS 'Apellido';
COMMENT ON COLUMN maity.form_responses.q3 IS 'Teléfono';
COMMENT ON COLUMN maity.form_responses.q4 IS 'Puesto';

COMMENT ON COLUMN maity.form_responses.q5 IS 'CLARIDAD: Expreso mis ideas de manera simple y clara (1-5)';
COMMENT ON COLUMN maity.form_responses.q6 IS 'CLARIDAD: Evito rodeos y voy directo al punto (1-5)';
COMMENT ON COLUMN maity.form_responses.q7 IS 'ADAPTACIÓN: Adapto mi lenguaje con la persona (1-5)';
COMMENT ON COLUMN maity.form_responses.q8 IS 'ADAPTACIÓN: Identifico señales y ajusto comunicación (1-5)';
COMMENT ON COLUMN maity.form_responses.q9 IS 'PERSUASIÓN: Uso ejemplos, historias o datos (1-5)';
COMMENT ON COLUMN maity.form_responses.q10 IS 'PERSUASIÓN: Explico beneficio o impacto (1-5)';
COMMENT ON COLUMN maity.form_responses.q11 IS 'ESTRUCTURA: Organizo mensajes con inicio, desarrollo y cierre (1-5)';
COMMENT ON COLUMN maity.form_responses.q12 IS 'ESTRUCTURA: Pienso en el orden antes de hablar (1-5)';
COMMENT ON COLUMN maity.form_responses.q13 IS 'PROPÓSITO: Incluyo objetivo claro en mensajes (1-5)';
COMMENT ON COLUMN maity.form_responses.q14 IS 'PROPÓSITO: Dejo claro qué se espera después (1-5)';
COMMENT ON COLUMN maity.form_responses.q15 IS 'EMPATÍA: Escucho con atención y confirmo comprensión (1-5)';
COMMENT ON COLUMN maity.form_responses.q16 IS 'EMPATÍA: Hago preguntas en lugar de asumir (1-5)';

COMMENT ON COLUMN maity.form_responses.q17 IS 'Principales barreras de comunicación (abierta)';
COMMENT ON COLUMN maity.form_responses.q18 IS 'Explica tu trabajo en 1 minuto (abierta)';
COMMENT ON COLUMN maity.form_responses.q19 IS 'Respuesta a persona saturada (abierta)';

-- Ensure RLS policies exist for form_responses
-- Users can view own responses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'form_responses'
    AND policyname = 'Users can view own form responses'
  ) THEN
    CREATE POLICY "Users can view own form responses"
      ON maity.form_responses FOR SELECT
      USING (
        user_id IN (
          SELECT id FROM maity.users WHERE auth_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Users can insert own responses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'form_responses'
    AND policyname = 'Users can insert own form responses'
  ) THEN
    CREATE POLICY "Users can insert own form responses"
      ON maity.form_responses FOR INSERT
      WITH CHECK (
        user_id IN (
          SELECT id FROM maity.users WHERE auth_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Admins can view all form responses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'form_responses'
    AND policyname = 'Admins can view all form responses'
  ) THEN
    CREATE POLICY "Admins can view all form responses"
      ON maity.form_responses FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM maity.user_roles ur
          JOIN maity.users u ON ur.user_id = u.id
          WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
        )
      );
  END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT, INSERT ON maity.form_responses TO authenticated;

-- Add index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_form_responses_user_id ON maity.form_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted_at ON maity.form_responses(submitted_at);
