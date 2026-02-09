export interface MeetingMeta {
  formato: string;
  tipo: string;
  hablantes: string[];
  palabras_totales: number;
  oraciones_totales: number;
  turnos_totales: number;
  duracion_minutos: number;
  palabras_por_hablante: Record<string, number>;
  fecha: string;
}

export interface MeetingResumen {
  puntuacion_global: number;
  nivel: string;
  descripcion: string;
}

export interface MuletillaDetalle {
  Poncho: number;
  Chris: number;
}

export interface MeetingRadiografia {
  muletillas_total: number;
  muletillas_detalle: Record<string, MuletillaDetalle>;
  muletillas_frecuencia: string;
  monologo_mas_largo: string;
  ratio_habla: number;
  preguntas: { Poncho: number; Chris: number; estrategicas_chris: number };
  respuestas_vacias_chris: number;
  temas_vs_agenda: { temas_cubiertos: number; agenda_original: number };
  acciones_concretas: number;
  temas_sin_cerrar: number;
}

export interface MeetingInsight {
  dato: string;
  por_que: string;
  sugerencia: string;
}

export interface MeetingPatron {
  actual: string;
  evolucion: string;
  senales: string[];
  que_cambiaria: string;
}

export interface TimelineSegmento {
  tipo: 'poncho' | 'chris' | 'dialogo';
  pct: number;
}

export interface MomentoClave {
  nombre: string;
  minuto: number;
}

export interface MeetingTimeline {
  segmentos: TimelineSegmento[];
  momentos_clave: MomentoClave[];
}

export interface SubPuntaje {
  puntaje_1_5: number;
  puntaje_0_100: number;
}

export interface DimensionBase {
  puntaje: number;
  nivel: string;
  que_mide: string;
  tu_resultado: string;
}

export interface DimensionObjetivo extends DimensionBase {
  sub_puntajes: {
    especificidad: SubPuntaje;
    accion: SubPuntaje;
    temporalidad: SubPuntaje;
    responsable: SubPuntaje;
    verificabilidad: SubPuntaje;
  };
}

export interface EmotionRadar {
  alegria: number;
  confianza: number;
  miedo: number;
  sorpresa: number;
  tristeza: number;
  disgusto: number;
  ira: number;
  anticipacion: number;
}

export interface SpeakerEmotion extends EmotionRadar {
  dominante: string;
}

export interface DimensionEmociones {
  tono_general: string;
  polaridad: number;
  subjetividad: number;
  intensidad: number;
  emocion_dominante: string;
  radar: EmotionRadar;
  por_hablante: {
    Poncho: SpeakerEmotion;
    Chris: SpeakerEmotion;
  };
}

export interface MeetingDimensiones {
  claridad: DimensionBase;
  objetivo: DimensionObjetivo;
  emociones: DimensionEmociones;
  estructura: DimensionBase;
  vocabulario: DimensionBase;
  formalidad: DimensionBase;
}

export interface SpeakerProfile {
  palabras: number;
  oraciones: number;
  resumen: string;
  claridad: { puntaje: number; nivel: string };
  vocabulario: { puntaje: number; nivel: string };
  formalidad: { puntaje: number; nivel: string };
  emociones: { dominante: string; polaridad: number };
}

export interface EmpatiaProfile {
  evaluable: boolean;
  puntaje: number;
  nivel: string;
  tu_resultado: string;
}

export interface CalidadGlobal {
  puntaje: number;
  nivel: string;
  formula_usada: string;
  componentes: { claridad_norm: number; estructura_norm: number; adaptacion: number };
}

export interface Dinamica {
  evaluable: boolean;
  turnos_total: number;
  turnos_por_hablante: Record<string, number>;
  longitud_media_turno: Record<string, number>;
  equilibrio: number;
  dominancia: { hablante: string; porcentaje: number };
  diagnostico: string;
}

export interface Recomendacion {
  prioridad: number;
  titulo: string;
  texto_mejorado: string;
}

export interface Fortaleza {
  area: string;
  evidencia: string;
}

export interface MeetingAnalysisData {
  meta: MeetingMeta;
  resumen: MeetingResumen;
  radiografia: MeetingRadiografia;
  insights: MeetingInsight[];
  patron: MeetingPatron;
  timeline: MeetingTimeline;
  dimensiones: MeetingDimensiones;
  por_hablante: Record<string, SpeakerProfile>;
  empatia: Record<string, EmpatiaProfile>;
  calidad_global: CalidadGlobal;
  dinamica: Dinamica;
  recomendaciones: Recomendacion[];
  fortalezas: Fortaleza[];
}
