import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../api/client/supabase';

export interface FormResponse {
  // Personal info (q1-q4) - NOT used in charts
  q1: string | null;  // Nombre
  q2: string | null;  // Apellido
  q3: string | null;  // Teléfono
  q4: string | null;  // Puesto

  // Likert responses (q5-q16) - USED in charts (1-5 scale)
  q5: string | null;   // Claridad 1
  q6: string | null;   // Claridad 2
  q7: string | null;   // Adaptación 1
  q8: string | null;   // Adaptación 2
  q9: string | null;   // Persuasión 1
  q10: string | null;  // Persuasión 2
  q11: string | null;  // Estructura 1
  q12: string | null;  // Estructura 2
  q13: string | null;  // Propósito 1
  q14: string | null;  // Propósito 2
  q15: string | null;  // Empatía 1
  q16: string | null;  // Empatía 2

  // Open questions (q17-q19) - NOT used in charts
  q17: string | null;  // Fortalezas
  q18: string | null;  // Áreas de mejora
  q19: string | null;  // Objetivos

  user_id: string;
}

export interface RadarCompetency {
  competencia: string;
  usuario: number;
  coach: number;
  fullMark: number;
}

export const useFormResponses = () => {
  const [formData, setFormData] = useState<FormResponse | null>(null);
  const [radarData, setRadarData] = useState<RadarCompetency[]>([]);
  const [competencyBars, setCompetencyBars] = useState<any>({
    claridad: [],
    adaptacion: [],
    persuasion: [],
    estructura: [],
    proposito: [],
    empatia: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map form questions to individual bar charts (1-5 scale)
  // Uses q5-q16 (Likert responses), ignoring q1-q4 (personal info) and q17-q19 (open questions)
  const mapFormDataToBars = useCallback((response: FormResponse) => {
    const questions = [
      { id: 'q5', value: response.q5 ? parseInt(response.q5) : 0, competencia: 'Claridad', pregunta: 'Pregunta 1' },
      { id: 'q6', value: response.q6 ? parseInt(response.q6) : 0, competencia: 'Claridad', pregunta: 'Pregunta 2' },
      { id: 'q7', value: response.q7 ? parseInt(response.q7) : 0, competencia: 'Adaptación', pregunta: 'Pregunta 3' },
      { id: 'q8', value: response.q8 ? parseInt(response.q8) : 0, competencia: 'Adaptación', pregunta: 'Pregunta 4' },
      { id: 'q9', value: response.q9 ? parseInt(response.q9) : 0, competencia: 'Persuasión', pregunta: 'Pregunta 5' },
      { id: 'q10', value: response.q10 ? parseInt(response.q10) : 0, competencia: 'Persuasión', pregunta: 'Pregunta 6' },
      { id: 'q11', value: response.q11 ? parseInt(response.q11) : 0, competencia: 'Estructura', pregunta: 'Pregunta 7' },
      { id: 'q12', value: response.q12 ? parseInt(response.q12) : 0, competencia: 'Estructura', pregunta: 'Pregunta 8' },
      { id: 'q13', value: response.q13 ? parseInt(response.q13) : 0, competencia: 'Propósito', pregunta: 'Pregunta 9' },
      { id: 'q14', value: response.q14 ? parseInt(response.q14) : 0, competencia: 'Propósito', pregunta: 'Pregunta 10' },
      { id: 'q15', value: response.q15 ? parseInt(response.q15) : 0, competencia: 'Empatía', pregunta: 'Pregunta 11' },
      { id: 'q16', value: response.q16 ? parseInt(response.q16) : 0, competencia: 'Empatía', pregunta: 'Pregunta 12' },
    ];

    return {
      claridad: questions.filter(q => q.competencia === 'Claridad'),
      adaptacion: questions.filter(q => q.competencia === 'Adaptación'),
      persuasion: questions.filter(q => q.competencia === 'Persuasión'),
      estructura: questions.filter(q => q.competencia === 'Estructura'),
      proposito: questions.filter(q => q.competencia === 'Propósito'),
      empatia: questions.filter(q => q.competencia === 'Empatía'),
    };
  }, []);

  // Map form questions q5-q16 to 6 competency areas (2 questions per area)
  const mapFormDataToRadar = useCallback((response: FormResponse): RadarCompetency[] => {
    // Convert string responses to numbers, defaulting to 0 if null, scale 1-5 to 0-100
    const q5 = response.q5 ? parseInt(response.q5) * 20 : 0;
    const q6 = response.q6 ? parseInt(response.q6) * 20 : 0;
    const q7 = response.q7 ? parseInt(response.q7) * 20 : 0;
    const q8 = response.q8 ? parseInt(response.q8) * 20 : 0;
    const q9 = response.q9 ? parseInt(response.q9) * 20 : 0;
    const q10 = response.q10 ? parseInt(response.q10) * 20 : 0;
    const q11 = response.q11 ? parseInt(response.q11) * 20 : 0;
    const q12 = response.q12 ? parseInt(response.q12) * 20 : 0;
    const q13 = response.q13 ? parseInt(response.q13) * 20 : 0;
    const q14 = response.q14 ? parseInt(response.q14) * 20 : 0;
    const q15 = response.q15 ? parseInt(response.q15) * 20 : 0;
    const q16 = response.q16 ? parseInt(response.q16) * 20 : 0;

    // Calculate average for each competency area (2 questions per area)
    return [
      {
        competencia: 'Claridad',
        usuario: Math.round((q5 + q6) / 2),
        coach: Math.round((q5 + q6) / 2 * 0.95), // Simulate coach evaluation slightly different
        fullMark: 100,
      },
      {
        competencia: 'Adaptación',
        usuario: Math.round((q7 + q8) / 2),
        coach: Math.round((q7 + q8) / 2 * 1.05),
        fullMark: 100,
      },
      {
        competencia: 'Persuasión',
        usuario: Math.round((q9 + q10) / 2),
        coach: Math.round((q9 + q10) / 2 * 0.98),
        fullMark: 100,
      },
      {
        competencia: 'Estructura',
        usuario: Math.round((q11 + q12) / 2),
        coach: Math.round((q11 + q12) / 2 * 1.02),
        fullMark: 100,
      },
      {
        competencia: 'Propósito',
        usuario: Math.round((q13 + q14) / 2),
        coach: Math.round((q13 + q14) / 2 * 0.97),
        fullMark: 100,
      },
      {
        competencia: 'Empatía',
        usuario: Math.round((q15 + q16) / 2),
        coach: Math.round((q15 + q16) / 2 * 1.03),
        fullMark: 100,
      },
    ];
  }, []);

  const fetchFormResponses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log('User not authenticated, using sample data');
        setFormData(null);
        setError('Usuario no autenticado - mostrando datos de ejemplo');

        // Create sample form data to ensure consistency
        const sampleFormData = {
          q1: 'Juan', q2: 'Pérez', q3: '5555555555', q4: 'Manager',
          q5: '3', q6: '3', q7: '4', q8: '4', q9: '5', q10: '5',
          q11: '5', q12: '5', q13: '5', q14: '5', q15: '5', q16: '5',
          q17: null, q18: null, q19: null,
          user_id: 'sample-user'
        };

        setFormData(sampleFormData);
        const radarCompetencies = mapFormDataToRadar(sampleFormData);
        const barChartData = mapFormDataToBars(sampleFormData);
        setRadarData(radarCompetencies);
        setCompetencyBars(barChartData);
        console.log('Sample data set (unauthenticated):', { radar: radarCompetencies, bars: barChartData });
        return;
      }

      // Use RPC function to get form responses for the current user
      const { data: formResponses, error: formError } = await supabase
        .rpc('get_my_form_responses');

      console.log('Form responses from RPC:', formResponses, 'Error:', formError);

      const formResponse = formResponses && formResponses.length > 0 ? formResponses[0] : null;

      if (formError || !formResponse) {
        console.log('No form responses found, using sample data. Error:', formError);
        setFormData(null);
        setError(null); // No error for sample data

        // Create sample form data to ensure consistency
        const sampleFormData = {
          q1: 'Juan', q2: 'Pérez', q3: '5555555555', q4: 'Manager',
          q5: '3', q6: '3', q7: '4', q8: '4', q9: '5', q10: '5',
          q11: '5', q12: '5', q13: '5', q14: '5', q15: '5', q16: '5',
          q17: null, q18: null, q19: null,
          user_id: 'sample-user'
        };

        setFormData(sampleFormData);
        const radarCompetencies = mapFormDataToRadar(sampleFormData);
        const barChartData = mapFormDataToBars(sampleFormData);
        setRadarData(radarCompetencies);
        setCompetencyBars(barChartData);
        console.log('Sample data set:', { radar: radarCompetencies, bars: barChartData });
        return;
      }

      // Use real form data
      const realFormData: FormResponse = {
        q1: formResponse.q1,
        q2: formResponse.q2,
        q3: formResponse.q3,
        q4: formResponse.q4,
        q5: formResponse.q5,
        q6: formResponse.q6,
        q7: formResponse.q7,
        q8: formResponse.q8,
        q9: formResponse.q9,
        q10: formResponse.q10,
        q11: formResponse.q11,
        q12: formResponse.q12,
        q13: formResponse.q13,
        q14: formResponse.q14,
        q15: formResponse.q15,
        q16: formResponse.q16,
        q17: formResponse.q17,
        q18: formResponse.q18,
        q19: formResponse.q19,
        user_id: formResponse.user_id
      };

      setFormData(realFormData);
      const radarCompetencies = mapFormDataToRadar(realFormData);
      const barChartData = mapFormDataToBars(realFormData);
      setRadarData(radarCompetencies);
      setCompetencyBars(barChartData);
      console.log('Using real form data from maity.form_responses');

    } catch (err) {
      console.error('Error in fetchFormResponses:', err);
      setError('Error de conexión - mostrando datos de ejemplo');

      // Set sample radar data on error (6 competency areas)
      const sampleRadarData = [
        { competencia: 'Claridad', usuario: 60, coach: 57, fullMark: 100 },
        { competencia: 'Adaptación', usuario: 80, coach: 84, fullMark: 100 },
        { competencia: 'Persuasión', usuario: 100, coach: 98, fullMark: 100 },
        { competencia: 'Estructura', usuario: 100, coach: 102, fullMark: 100 },
        { competencia: 'Propósito', usuario: 100, coach: 97, fullMark: 100 },
        { competencia: 'Empatía', usuario: 100, coach: 103, fullMark: 100 },
      ];
      setRadarData(sampleRadarData);
    } finally {
      setLoading(false);
    }
  }, [mapFormDataToRadar]);

  useEffect(() => {
    fetchFormResponses();
  }, [fetchFormResponses]);

  const refetch = () => {
    fetchFormResponses();
  };

  return {
    formData,
    radarData,
    competencyBars,
    loading,
    error,
    refetch
  };
};