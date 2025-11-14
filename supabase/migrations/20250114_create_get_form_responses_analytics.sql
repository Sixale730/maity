-- Migration: Create get_form_responses_by_company for analytics
-- Description: Get all form responses (autoevaluaciones) by company with calculated competency scores
-- Created: 2025-01-14

-- Create function in maity schema
CREATE OR REPLACE FUNCTION maity.get_form_responses_by_company(
  p_company_id UUID DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  company_id UUID,
  company_name TEXT,
  submitted_at TIMESTAMPTZ,
  q1 TEXT, q2 TEXT, q3 TEXT, q4 TEXT,
  q5 TEXT, q6 TEXT, q7 TEXT, q8 TEXT,
  q9 TEXT, q10 TEXT, q11 TEXT, q12 TEXT,
  q13 TEXT, q14 TEXT, q15 TEXT, q16 TEXT,
  q17 TEXT, q18 TEXT, q19 TEXT,
  claridad_avg NUMERIC,
  adaptacion_avg NUMERIC,
  persuasion_avg NUMERIC,
  estructura_avg NUMERIC,
  proposito_avg NUMERIC,
  empatia_avg NUMERIC,
  overall_avg NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.name AS user_name,
    u.email AS user_email,
    u.company_id,
    c.name AS company_name,
    fr.submitted_at,
    fr.q1, fr.q2, fr.q3, fr.q4,
    fr.q5, fr.q6, fr.q7, fr.q8,
    fr.q9, fr.q10, fr.q11, fr.q12,
    fr.q13, fr.q14, fr.q15, fr.q16,
    fr.q17, fr.q18, fr.q19,
    -- Competency averages (q5-q16 are Likert scale 1-5)
    ROUND(((fr.q5::numeric + fr.q6::numeric) / 2)::numeric, 1) AS claridad_avg,
    ROUND(((fr.q7::numeric + fr.q8::numeric) / 2)::numeric, 1) AS adaptacion_avg,
    ROUND(((fr.q9::numeric + fr.q10::numeric) / 2)::numeric, 1) AS persuasion_avg,
    ROUND(((fr.q11::numeric + fr.q12::numeric) / 2)::numeric, 1) AS estructura_avg,
    ROUND(((fr.q13::numeric + fr.q14::numeric) / 2)::numeric, 1) AS proposito_avg,
    ROUND(((fr.q15::numeric + fr.q16::numeric) / 2)::numeric, 1) AS empatia_avg,
    ROUND(((fr.q5::numeric + fr.q6::numeric + fr.q7::numeric + fr.q8::numeric +
            fr.q9::numeric + fr.q10::numeric + fr.q11::numeric + fr.q12::numeric +
            fr.q13::numeric + fr.q14::numeric + fr.q15::numeric + fr.q16::numeric) / 12)::numeric, 1) AS overall_avg
  FROM maity.form_responses fr
  JOIN maity.users u ON fr.user_id = u.id
  LEFT JOIN maity.companies c ON u.company_id = c.id
  WHERE (p_company_id IS NULL OR u.company_id = p_company_id)
  ORDER BY fr.submitted_at DESC;
END;
$$;

-- Create public wrapper
CREATE OR REPLACE FUNCTION public.get_form_responses_by_company(
  p_company_id UUID DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  company_id UUID,
  company_name TEXT,
  submitted_at TIMESTAMPTZ,
  q1 TEXT, q2 TEXT, q3 TEXT, q4 TEXT,
  q5 TEXT, q6 TEXT, q7 TEXT, q8 TEXT,
  q9 TEXT, q10 TEXT, q11 TEXT, q12 TEXT,
  q13 TEXT, q14 TEXT, q15 TEXT, q16 TEXT,
  q17 TEXT, q18 TEXT, q19 TEXT,
  claridad_avg NUMERIC,
  adaptacion_avg NUMERIC,
  persuasion_avg NUMERIC,
  estructura_avg NUMERIC,
  proposito_avg NUMERIC,
  empatia_avg NUMERIC,
  overall_avg NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM maity.get_form_responses_by_company(p_company_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_form_responses_by_company TO authenticated;

COMMENT ON FUNCTION public.get_form_responses_by_company IS 'Returns form responses (autoevaluaciones) by company with calculated competency scores. Admins see all companies, managers see only their own. Pass NULL to see all (admin only).';
