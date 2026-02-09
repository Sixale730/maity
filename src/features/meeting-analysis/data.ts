import type { MeetingAnalysisData } from './types';

export const meetingData: MeetingAnalysisData = {
  meta: {
    formato: "B",
    tipo: "Reunión de negocio / partnership",
    hablantes: ["Poncho", "Chris"],
    palabras_totales: 6100,
    oraciones_totales: 380,
    turnos_totales: 180,
    duracion_minutos: 39,
    palabras_por_hablante: { Poncho: 3600, Chris: 2500 },
    fecha: "2026-02-05",
  },
  resumen: {
    puntuacion_global: 42,
    nivel: "en_desarrollo",
    descripcion:
      "Reunión con mucha energía y visión pero estructuralmente caótica. 20+ temas en 39 minutos sin cerrar ninguno con acciones concretas. La química es excelente — lo que falta es estructura.",
  },
  radiografia: {
    muletillas_total: 142,
    muletillas_detalle: {
      este: { Poncho: 32, Chris: 5 },
      "o sea": { Poncho: 15, Chris: 10 },
      güey: { Poncho: 10, Chris: 10 },
      pues: { Poncho: 10, Chris: 8 },
      entonces: { Poncho: 8, Chris: 5 },
      bueno: { Poncho: 5, Chris: 3 },
      "no?": { Poncho: 4, Chris: 8 },
      "a ver": { Poncho: 5, Chris: 1 },
    },
    muletillas_frecuencia: "1 cada 43 palabras (~17 segundos)",
    monologo_mas_largo: "2:43",
    ratio_habla: 1.4,
    preguntas: { Poncho: 8, Chris: 12, estrategicas_chris: 8 },
    respuestas_vacias_chris: 32,
    temas_vs_agenda: { temas_cubiertos: 20, agenda_original: 2 },
    acciones_concretas: 6,
    temas_sin_cerrar: 14,
  },
  insights: [
    {
      dato: "Se tocaron 20+ temas en 39 minutos — menos de 2 minutos por tema",
      por_que:
        "Ningún tema tuvo suficiente profundidad. Es como un buffet donde pruebas todo pero no comes nada completo.",
      sugerencia:
        "Máximo 3-5 temas por reunión con cierre explícito en cada uno.",
    },
    {
      dato: "De 20+ temas, solo 6 salieron con algo parecido a una acción",
      por_que:
        "14+ temas quedaron en 'hay que hacer' sin quién ni cuándo.",
      sugerencia: "Cerrar cada tema con: quién hace qué, para cuándo.",
    },
    {
      dato: "Poncho interrumpió para contestar un mensaje de Kari",
      por_que:
        "Una interrupción en una reunión de equity dice: esto es más importante que tú.",
      sugerencia:
        "Silenciar notificaciones durante reuniones de negocio.",
    },
    {
      dato: "La palabra 'lana' aparece 6 veces, 'dinero' 0 veces",
      por_que:
        "El lenguaje informal puede generar ambigüedad cuando se habla de inversión y equity.",
      sugerencia:
        "Para temas de inversión: cifras exactas en vez de 'meterle lana'.",
    },
    {
      dato: "Chris dice 'güey' 10 veces — acomodación lingüística natural",
      por_que:
        "Adopta el registro de Poncho para generar rapport. Es exactamente lo que Maity mide.",
      sugerencia:
        "Buen rapport. Desarrollar un 'modo inversor' más formal para pitches.",
    },
  ],
  patron: {
    actual: "Emprendedor Desbordado → Asesor Entusiasta",
    evolucion: "Co-fundadores Estructurados → Ejecución con Foco",
    senales: [
      "Poncho abre 20+ temas sin cerrar ninguno. Cada nueva idea interrumpe la anterior.",
      "Chris responde con estrategia pero también se deja llevar en vez de decir 'cerremos este punto'.",
      "La reunión termina sin resumen de acuerdos. Las 6 acciones están esparcidas en 39 minutos.",
    ],
    que_cambiaria:
      "Reuniones con agenda de 3-5 temas máximo. Cada tema se cierra con quién, qué, cuándo. Resumen de 2 minutos al final. La energía es la misma pero produce resultados medibles.",
  },
  timeline: {
    segmentos: [
      { tipo: "poncho", pct: 10 },
      { tipo: "dialogo", pct: 4 },
      { tipo: "poncho", pct: 8 },
      { tipo: "chris", pct: 3 },
      { tipo: "poncho", pct: 7 },
      { tipo: "chris", pct: 10 },
      { tipo: "dialogo", pct: 5 },
      { tipo: "chris", pct: 7 },
      { tipo: "dialogo", pct: 8 },
      { tipo: "poncho", pct: 6 },
      { tipo: "chris", pct: 8 },
      { tipo: "dialogo", pct: 6 },
      { tipo: "poncho", pct: 5 },
      { tipo: "dialogo", pct: 4 },
      { tipo: "chris", pct: 5 },
      { tipo: "dialogo", pct: 4 },
    ],
    momentos_clave: [
      { nombre: "Modelo de negocio", minuto: 3 },
      { nombre: "Phantom shares", minuto: 8 },
      { nombre: "Propuesta Chris", minuto: 10 },
      { nombre: "Competidores", minuto: 21 },
      { nombre: "Feature memorias", minuto: 26 },
      { nombre: "Xcaret", minuto: 30 },
      { nombre: "Family & friends", minuto: 32 },
    ],
  },
  dimensiones: {
    claridad: {
      puntaje: 35,
      nivel: "dificil",
      que_mide:
        "Qué tan fácil es seguir lo que se dice a la primera escucha.",
      tu_resultado:
        "Contenido valioso pero formato oral extremadamente desorganizado. Muletillas cada 17 segundos, oraciones que se cortan y reinician.",
    },
    objetivo: {
      puntaje: 32,
      nivel: "vago",
      que_mide:
        "Si la reunión deja claro qué quiere, de quién, para cuándo y cómo saber si se logró.",
      tu_resultado:
        "20+ temas sin cierre. Solo 6 acciones, la mayoría sin fecha.",
      sub_puntajes: {
        especificidad: { puntaje_1_5: 3, puntaje_0_100: 60 },
        accion: { puntaje_1_5: 2, puntaje_0_100: 35 },
        temporalidad: { puntaje_1_5: 1, puntaje_0_100: 20 },
        responsable: { puntaje_1_5: 2, puntaje_0_100: 40 },
        verificabilidad: { puntaje_1_5: 1, puntaje_0_100: 15 },
      },
    },
    emociones: {
      tono_general: "positivo",
      polaridad: 0.62,
      subjetividad: 0.78,
      intensidad: 0.71,
      emocion_dominante: "anticipación",
      radar: {
        alegria: 0.56,
        confianza: 0.71,
        miedo: 0.1,
        sorpresa: 0.18,
        tristeza: 0.03,
        disgusto: 0.04,
        ira: 0.05,
        anticipacion: 0.82,
      },
      por_hablante: {
        Poncho: {
          dominante: "anticipación",
          alegria: 0.65,
          confianza: 0.72,
          miedo: 0.12,
          sorpresa: 0.15,
          tristeza: 0.03,
          disgusto: 0.05,
          ira: 0.04,
          anticipacion: 0.88,
        },
        Chris: {
          dominante: "anticipación",
          alegria: 0.45,
          confianza: 0.7,
          miedo: 0.08,
          sorpresa: 0.22,
          tristeza: 0.02,
          disgusto: 0.03,
          ira: 0.05,
          anticipacion: 0.75,
        },
      },
    },
    estructura: {
      puntaje: 28,
      nivel: "muy_debil",
      que_mide: "Si las ideas fluyen en orden lógico con estructura clara.",
      tu_resultado:
        "Sin agenda, sin cierre, 20+ temas sin orden. La reunión es una conversación libre sin estructura.",
    },
    vocabulario: {
      puntaje: 65,
      nivel: "normal",
      que_mide:
        "Si usas palabras variadas o repites las mismas una y otra vez.",
      tu_resultado:
        "Buen vocabulario de negocio y startups. Muy coloquial pero rico en terminología técnica.",
    },
    formalidad: {
      puntaje: 22,
      nivel: "muy_informal",
      que_mide:
        "Si tu lenguaje es formal, informal o neutro y si es apropiado.",
      tu_resultado:
        "Extremadamente informal con groserías frecuentes. Apropiado entre socios, inapropiado para inversionistas.",
    },
  },
  por_hablante: {
    Poncho: {
      palabras: 3600,
      oraciones: 218,
      resumen:
        "Fundador apasionado que domina la primera mitad presentando avances. Muy informal, muchas muletillas. Oportunidad: más estructura y un 'modo pitch' limpio.",
      claridad: { puntaje: 30, nivel: "dificil" },
      vocabulario: { puntaje: 62, nivel: "normal" },
      formalidad: { puntaje: 20, nivel: "muy_informal" },
      emociones: { dominante: "anticipación", polaridad: 0.58 },
    },
    Chris: {
      palabras: 2500,
      oraciones: 162,
      resumen:
        "Asesor estratégico que aporta visión de marketing, inversión y posicionamiento. Más estructurado que Poncho pero también se deja llevar por el entusiasmo.",
      claridad: { puntaje: 42, nivel: "algo_dificil" },
      vocabulario: { puntaje: 70, nivel: "bueno" },
      formalidad: { puntaje: 25, nivel: "muy_informal" },
      emociones: { dominante: "anticipación", polaridad: 0.65 },
    },
  },
  empatia: {
    Poncho: {
      evaluable: true,
      puntaje: 45,
      nivel: "neutral",
      tu_resultado:
        "Enfocado en presentar sus avances. Transparente y vulnerable, pero dedica poco tiempo a escuchar qué necesita Chris.",
    },
    Chris: {
      evaluable: true,
      puntaje: 58,
      nivel: "neutral",
      tu_resultado:
        "Valida antes de sugerir, ofrece recursos reales. Oportunidad: más preguntas antes de dar soluciones.",
    },
  },
  calidad_global: {
    puntaje: 42,
    nivel: "en_desarrollo",
    formula_usada: "conversacion",
    componentes: { claridad_norm: 35, estructura_norm: 28, adaptacion: 75 },
  },
  dinamica: {
    evaluable: true,
    turnos_total: 180,
    turnos_por_hablante: { Poncho: 90, Chris: 90 },
    longitud_media_turno: { Poncho: 40.0, Chris: 27.8 },
    equilibrio: 0.59,
    dominancia: { hablante: "Poncho", porcentaje: 59.0 },
    diagnostico:
      "Emprendedor apasionado + asesor estratégico. Buena complementariedad, falta estructura.",
  },
  recomendaciones: [
    {
      prioridad: 1,
      titulo: "Agenda escrita + cierre con compromisos",
      texto_mejorado:
        "Agenda del martes: 1) Status roadmap, 2) Presupuesto marketing Q1, 3) Preparación pitch Lee.",
    },
    {
      prioridad: 2,
      titulo: "Convertir 'hay que' en quién-qué-cuándo",
      texto_mejorado:
        "Chris: benchmark 3 competidores para el martes. Poncho: tabla de costos para el viernes.",
    },
    {
      prioridad: 3,
      titulo: "Modo pitch sin muletillas ni groserías",
      texto_mejorado:
        "Grabar pitch de 5 min limpio. Usar Maity para medirlo — dogfooding total.",
    },
  ],
  fortalezas: [
    {
      area: "Producto en vivo",
      evidencia: "En tiempo real se está transcribiendo",
    },
    {
      area: "Complementariedad",
      evidencia: "Poncho = tech/producto, Chris = marketing/negocio",
    },
    {
      area: "Inteligencia competitiva",
      evidencia: "Jotley serie B $40M, Wong $150/persona",
    },
    {
      area: "Skin in the game",
      evidencia: "Chris ofrece mente + capital",
    },
    {
      area: "Procesamiento local",
      evidencia: "Utilidad 60-70% por usuario",
    },
  ],
};
