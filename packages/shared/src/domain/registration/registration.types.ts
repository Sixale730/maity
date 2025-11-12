/**
 * Types for native registration form
 * 19 questions total: 4 personal + 12 Likert + 3 open-ended
 */

/**
 * Likert scale value (1-5)
 */
export type LikertValue = 1 | 2 | 3 | 4 | 5;

/**
 * Competency areas with their associated colors
 */
export enum CompetencyArea {
  CLARIDAD = 'claridad',
  ADAPTACION = 'adaptacion',
  PERSUASION = 'persuasion',
  ESTRUCTURA = 'estructura',
  PROPOSITO = 'proposito',
  EMPATIA = 'empatia',
}

/**
 * Color mapping for each competency area
 */
export const CompetencyColors: Record<CompetencyArea, string> = {
  [CompetencyArea.CLARIDAD]: '#485df4', // Blue 🟦
  [CompetencyArea.ADAPTACION]: '#1bea9a', // Green 🟩
  [CompetencyArea.PERSUASION]: '#9b4dca', // Purple 🟪
  [CompetencyArea.ESTRUCTURA]: '#ff8c42', // Orange 🟧
  [CompetencyArea.PROPOSITO]: '#ffd93d', // Yellow 🟨
  [CompetencyArea.EMPATIA]: '#ef4444', // Red ❤️
};

/**
 * Likert question definition
 */
export interface LikertQuestion {
  id: string; // q5, q6, ... q16
  area: CompetencyArea;
  text: string;
  order: number;
}

/**
 * All 12 Likert questions
 */
export const LikertQuestions: LikertQuestion[] = [
  // CLARIDAD (🟦)
  {
    id: 'q5',
    area: CompetencyArea.CLARIDAD,
    text: 'Expreso mis ideas de manera simple y clara.',
    order: 1,
  },
  {
    id: 'q6',
    area: CompetencyArea.CLARIDAD,
    text: 'Evito rodeos y voy directo al punto cuando explico algo.',
    order: 2,
  },
  // ADAPTACIÓN (🟩)
  {
    id: 'q7',
    area: CompetencyArea.ADAPTACION,
    text: 'Adapto mi lenguaje con la persona con la que hablo.',
    order: 3,
  },
  {
    id: 'q8',
    area: CompetencyArea.ADAPTACION,
    text: 'Identifico señales (tono, palabras, estilo) y ajusto mi comunicación para crear conexión.',
    order: 4,
  },
  // PERSUASIÓN (🟪)
  {
    id: 'q9',
    area: CompetencyArea.PERSUASION,
    text: 'Uso ejemplos, historias o datos para reforzar mis ideas.',
    order: 5,
  },
  {
    id: 'q10',
    area: CompetencyArea.PERSUASION,
    text: 'Cuando presento una idea, explico el beneficio o impacto que tiene para la otra persona.',
    order: 6,
  },
  // ESTRUCTURA (🟧)
  {
    id: 'q11',
    area: CompetencyArea.ESTRUCTURA,
    text: 'Organizo mis mensajes con inicio, desarrollo y un cierre claro.',
    order: 7,
  },
  {
    id: 'q12',
    area: CompetencyArea.ESTRUCTURA,
    text: 'Antes de hablar o escribir, pienso en el orden de lo que voy a decir.',
    order: 8,
  },
  // PROPÓSITO (🟨)
  {
    id: 'q13',
    area: CompetencyArea.PROPOSITO,
    text: 'Incluyo un propósito u objetivo claro en mis mensajes.',
    order: 9,
  },
  {
    id: 'q14',
    area: CompetencyArea.PROPOSITO,
    text: 'Cuando comunico algo, dejo claro qué se espera después (acción, acuerdo o siguiente paso).',
    order: 10,
  },
  // EMPATÍA (❤️)
  {
    id: 'q15',
    area: CompetencyArea.EMPATIA,
    text: 'Escucho con atención y confirmo que entendí lo que me quisieron decir.',
    order: 11,
  },
  {
    id: 'q16',
    area: CompetencyArea.EMPATIA,
    text: 'Hago preguntas para entender mejor en lugar de asumir.',
    order: 12,
  },
];

/**
 * Open-ended question definition
 */
export interface OpenQuestion {
  id: string; // q17, q18, q19
  text: string;
  placeholder: string;
  order: number;
}

/**
 * All 3 open-ended questions
 */
export const OpenQuestions: OpenQuestion[] = [
  {
    id: 'q17',
    text: '¿Cuáles consideras que son las principales barreras que enfrentas al comunicarte de manera efectiva con los demás?',
    placeholder: 'Describe las barreras que identificas en tu comunicación...',
    order: 13,
  },
  {
    id: 'q18',
    text: 'Imagina que tienes 1 minuto para explicarle a una persona que no sabe en qué consiste tu trabajo. Escríbelo en un párrafo.',
    placeholder: 'Explica tu trabajo en un párrafo conciso...',
    order: 14,
  },
  {
    id: 'q19',
    text: 'Imagina que una persona te dice: "Estoy saturado y no puedo atender más tareas". Escribe en un párrafo que contestarías.',
    placeholder: 'Escribe tu respuesta...',
    order: 15,
  },
];

/**
 * Personal info questions
 */
export interface PersonalInfoQuestion {
  id: string; // q1, q2, q3, q4
  label: string;
  placeholder: string;
  type: 'text' | 'tel';
  order: number;
}

/**
 * All 4 personal info questions
 */
export const PersonalInfoQuestions: PersonalInfoQuestion[] = [
  {
    id: 'q1',
    label: 'Nombre',
    placeholder: 'Ingresa tu nombre',
    type: 'text',
    order: 1,
  },
  {
    id: 'q2',
    label: 'Apellido',
    placeholder: 'Ingresa tu apellido',
    type: 'text',
    order: 2,
  },
  {
    id: 'q3',
    label: 'Teléfono',
    placeholder: '+52 123 456 7890',
    type: 'tel',
    order: 3,
  },
  {
    id: 'q4',
    label: 'Puesto',
    placeholder: 'Gerente de Ventas, CEO, etc.',
    type: 'text',
    order: 4,
  },
];

/**
 * Complete registration form data
 */
export interface RegistrationFormData {
  // Personal info (q1-q4)
  q1: string; // Nombre
  q2: string; // Apellido
  q3: string; // Teléfono
  q4: string; // Puesto

  // Likert questions (q5-q16)
  q5: LikertValue; // CLARIDAD
  q6: LikertValue; // CLARIDAD
  q7: LikertValue; // ADAPTACIÓN
  q8: LikertValue; // ADAPTACIÓN
  q9: LikertValue; // PERSUASIÓN
  q10: LikertValue; // PERSUASIÓN
  q11: LikertValue; // ESTRUCTURA
  q12: LikertValue; // ESTRUCTURA
  q13: LikertValue; // PROPÓSITO
  q14: LikertValue; // PROPÓSITO
  q15: LikertValue; // EMPATÍA
  q16: LikertValue; // EMPATÍA

  // Open-ended questions (q17-q19)
  q17: string; // Barreras de comunicación
  q18: string; // Explica tu trabajo
  q19: string; // Respuesta a persona saturada
}

/**
 * Form response from database
 */
export interface FormResponse extends RegistrationFormData {
  id: string;
  user_id: string;
  submitted_at: string;
  raw?: Record<string, any>;
}

/**
 * Form submission payload
 */
export interface RegistrationFormSubmission {
  formData: RegistrationFormData;
  userId: string;
}

/**
 * Form step type
 */
export type FormStepType = 'personal' | 'likert' | 'open';

/**
 * Form step definition
 */
export interface FormStep {
  index: number; // 0-18
  type: FormStepType;
  questionId: string;
  title?: string;
  subtitle?: string;
}

/**
 * Generate all form steps (19 total)
 */
export const getAllFormSteps = (): FormStep[] => {
  const steps: FormStep[] = [];

  // Personal info steps (0-3)
  PersonalInfoQuestions.forEach((q, index) => {
    steps.push({
      index,
      type: 'personal',
      questionId: q.id,
      title: 'Información Personal',
      subtitle: `Pregunta ${index + 1} de 19`,
    });
  });

  // Likert steps (4-15)
  LikertQuestions.forEach((q, index) => {
    steps.push({
      index: index + 4,
      type: 'likert',
      questionId: q.id,
      title: `Evaluación: ${q.area.toUpperCase()}`,
      subtitle: `Pregunta ${index + 5} de 19`,
    });
  });

  // Open-ended steps (16-18)
  OpenQuestions.forEach((q, index) => {
    steps.push({
      index: index + 16,
      type: 'open',
      questionId: q.id,
      title: 'Pregunta Abierta',
      subtitle: `Pregunta ${index + 17} de 19`,
    });
  });

  return steps;
};

/**
 * Form progress state
 */
export interface FormProgress {
  currentStep: number; // 0-18
  answers: Partial<RegistrationFormData>;
  isComplete: boolean;
}
