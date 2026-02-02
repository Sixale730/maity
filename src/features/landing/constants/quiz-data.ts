import type { Archetype } from '../types/landing.types';

export const PRODUCT_ARCHETYPES: Record<string, Archetype> = {
  driver: {
    name: 'Comunicador Directo',
    emoji: '\u26A1',
    color: '#ff0050',
    tagline: 'Tu superpoder: ir al punto con claridad y seguridad',
    description: 'No te andas con rodeos. Cuando hablas, la gente sabe exactamente qué esperas. Tu franqueza genera respeto y tus ideas se entienden a la primera. Pero a veces la velocidad puede hacer que otros sientan que no hay espacio para su voz.',
    strengths: ['Claridad bajo presión', 'Mensajes directos y memorables', 'Decisiones rápidas y comunicadas'],
    growth: ['Dar espacio a la escucha activa', 'Suavizar el tono en temas sensibles', 'Pausar antes de responder'],
    maityPlan: 'Tu Escalada Maity: Empatía Track — 21 días de micro-retos para conectar sin perder tu fuerza.',
  },
  connector: {
    name: 'Comunicador Empático',
    emoji: '\uD83D\uDCAB',
    color: '#485df4',
    tagline: 'Tu superpoder: que la gente se sienta escuchada y segura contigo',
    description: 'Las personas confían en ti porque genuinamente escuchas. Creas ambientes donde todos se atreven a hablar. Tu calidez desarma conflictos y construye equipos fuertes. Pero a veces tu amabilidad puede diluir tu mensaje cuando necesitas ser firme.',
    strengths: ['Escucha activa y validación', 'Construcción de confianza rápida', 'Resolución natural de tensiones'],
    growth: ['Comunicar con firmeza cuando es necesario', 'Decir que no sin culpa', 'Estructurar ideas antes de compartirlas'],
    maityPlan: 'Tu Escalada Maity: Claridad Track — 21 días para comunicar con fuerza sin perder tu calidez.',
  },
  strategist: {
    name: 'Comunicador Analítico',
    emoji: '\uD83C\uDFAF',
    color: '#1bea9a',
    tagline: 'Tu superpoder: que nadie cuestione tu lógica ni tu preparación',
    description: 'Piensas antes de hablar y se nota. Tus argumentos son sólidos, tus presentaciones impecables. La gente respeta tu rigor y confía en tus conclusiones. Pero a veces el exceso de análisis puede frenar la conversación y alejar a quienes buscan conexión emocional.',
    strengths: ['Argumentación sólida y estructurada', 'Preparación meticulosa', 'Análisis objetivo de situaciones'],
    growth: ['Storytelling emocional', 'Improvisar con confianza', 'Conectar antes de convencer'],
    maityPlan: 'Tu Escalada Maity: Persuasión Track — 21 días para inspirar y mover a la acción.',
  },
};

export const PRODUCT_QUIZ_QUESTIONS = [
  {
    t: 'Un colega te da feedback que consideras injusto frente a otros. ¿Cómo reaccionas?',
    o: [
      { t: 'Le digo con firmeza que no estoy de acuerdo y explico mi perspectiva ahí mismo.', k: 'driver' },
      { t: 'Respiro, agradezco el comentario y le pido hablar en privado después.', k: 'connector' },
      { t: 'Anoto los puntos, verifico los hechos y luego respondo con datos concretos.', k: 'strategist' },
    ],
  },
  {
    t: 'En una reunión, dos compañeros no se ponen de acuerdo y la tensión sube. ¿Qué haces?',
    o: [
      { t: 'Corto la discusión y propongo una solución concreta para avanzar.', k: 'driver' },
      { t: 'Les doy espacio, valido ambas posturas y busco un punto en común.', k: 'connector' },
      { t: 'Pido a ambos que presenten sus argumentos con evidencia antes de decidir.', k: 'strategist' },
    ],
  },
  {
    t: 'Tienes que presentar una idea importante a personas que no conoces bien. ¿Cómo te preparas?',
    o: [
      { t: 'Preparo un mensaje corto, directo y con los beneficios claros desde el minuto uno.', k: 'driver' },
      { t: 'Investigo quiénes son, busco puntos en común y empiezo con una historia personal.', k: 'connector' },
      { t: 'Armo una presentación estructurada con datos, contexto y posibles objeciones resueltas.', k: 'strategist' },
    ],
  },
  {
    t: 'Debes dar malas noticias a tu equipo o grupo de trabajo. ¿Cómo lo manejas?',
    o: [
      { t: 'Directo y sin rodeos, con un plan de acción claro para lo que sigue.', k: 'driver' },
      { t: 'Con empatía, reconociendo cómo se sienten antes de hablar de soluciones.', k: 'connector' },
      { t: 'Con análisis de causa raíz, alternativas evaluadas y próximos pasos definidos.', k: 'strategist' },
    ],
  },
  {
    t: 'Alguien nuevo en tu entorno te pide ayuda. ¿Qué priorizas?',
    o: [
      { t: 'Le doy instrucciones claras, paso a paso, para que sea autónomo rápido.', k: 'driver' },
      { t: 'Lo invito a platicar, le pregunto cómo se siente y le ofrezco acompañamiento.', k: 'connector' },
      { t: 'Le comparto documentación organizada y recursos para que aprenda a su ritmo.', k: 'strategist' },
    ],
  },
  {
    t: 'Expresas una opinión y alguien te malinterpreta públicamente. ¿Qué haces?',
    o: [
      { t: 'Aclaro de inmediato lo que quise decir, sin dejar espacio a la ambigüedad.', k: 'driver' },
      { t: 'Le pregunto qué entendió, escucho con calma y reformulo con más contexto.', k: 'connector' },
      { t: 'Vuelvo al punto original con datos y ejemplos para eliminar la confusión.', k: 'strategist' },
    ],
  },
  {
    t: '¿Qué tipo de reconocimiento valoras más de quienes trabajan contigo?',
    o: [
      { t: "Resultados: 'Resolviste el problema más difícil del trimestre'.", k: 'driver' },
      { t: "Impacto humano: 'Tu equipo dice que contigo se sienten seguros'.", k: 'connector' },
      { t: "Proceso: 'Tu análisis fue clave para tomar la mejor decisión'.", k: 'strategist' },
    ],
  },
];

export const CORPORATE_ARCHETYPES: Record<string, Archetype> = {
  visionary: {
    name: 'Líder Visionario',
    emoji: '\uD83D\uDD2D',
    color: '#485df4',
    tagline: 'Tu superpoder: transformar ideas en dirección estratégica',
    description: 'Ves el panorama completo. Tu comunicación inspira equipos a moverse hacia una visión compartida. Los stakeholders confían en tu capacidad para articular el futuro. Pero a veces la visión puede sentirse lejana para quienes necesitan instrucciones concretas.',
    strengths: ['Visión estratégica clara', 'Comunicación inspiradora', 'Alineación de equipos grandes'],
    growth: ['Bajar la estrategia a tácticas concretas', 'Escuchar las necesidades operativas', 'Medir impacto en el corto plazo'],
    maityPlan: 'Escalada Corporativa: Ejecución Track — 21 días para convertir tu visión en planes de acción concretos.',
  },
  negotiator: {
    name: 'Negociador Natural',
    emoji: '\uD83E\uDD1D',
    color: '#ff0050',
    tagline: 'Tu superpoder: encontrar acuerdos donde otros ven conflicto',
    description: 'Lees a las personas como nadie. Sabes cuándo presionar y cuándo ceder. Tu habilidad para persuadir y cerrar acuerdos es tu mayor activo. Pero a veces la orientación al resultado puede hacer que otros sientan que solo te importa ganar.',
    strengths: ['Lectura de interlocutores', 'Manejo de objeciones', 'Cierre de acuerdos complejos'],
    growth: ['Construir relaciones a largo plazo', 'Ceder estratégicamente', 'Comunicar valor más allá del precio'],
    maityPlan: 'Escalada Corporativa: Relaciones Track — 21 días para convertir negociaciones en alianzas duraderas.',
  },
  architect: {
    name: 'Arquitecto de Equipos',
    emoji: '\uD83C\uDFD7\uFE0F',
    color: '#1bea9a',
    tagline: 'Tu superpoder: construir culturas donde la gente crece',
    description: 'Tu fortaleza está en desarrollar personas. Sabes dar feedback que transforma, resolver conflictos internos y crear ambientes de alto rendimiento. Pero a veces la atención al equipo puede hacerte perder velocidad en decisiones de negocio.',
    strengths: ['Feedback transformador', 'Resolución de conflictos internos', 'Desarrollo de talento'],
    growth: ['Tomar decisiones impopulares', 'Comunicar urgencia sin perder empatía', 'Delegar con confianza'],
    maityPlan: 'Escalada Corporativa: Impacto Track — 21 días para liderar con resultados sin perder tu humanidad.',
  },
};

export const CORPORATE_QUIZ_QUESTIONS = [
  {
    t: 'Tu equipo de ventas no está alcanzando la cuota trimestral. ¿Cuál es tu primer movimiento?',
    o: [
      { t: 'Convoco una sesión estratégica para redefinir el enfoque y la narrativa de venta.', k: 'visionary' },
      { t: 'Analizo los deals perdidos, identifico objeciones clave y armo un playbook de respuestas.', k: 'negotiator' },
      { t: 'Me reúno uno a uno con cada vendedor para entender sus bloqueos y dar coaching personalizado.', k: 'architect' },
    ],
  },
  {
    t: 'Un cliente importante amenaza con irse a la competencia. ¿Cómo manejas la conversación?',
    o: [
      { t: 'Le presento una visión de futuro: el roadmap de evolución y cómo encaja su negocio.', k: 'visionary' },
      { t: 'Escucho sus quejas, hago preguntas precisas y negocio condiciones que funcionen para ambos.', k: 'negotiator' },
      { t: 'Involucro a todo el equipo de cuenta para demostrar compromiso y resolvemos juntos.', k: 'architect' },
    ],
  },
  {
    t: 'Debes presentar resultados a la junta directiva y los números no son buenos. ¿Cómo lo abordas?',
    o: [
      { t: 'Presento los números con contexto, enfoco en las oportunidades y propongo un plan a 6 meses.', k: 'visionary' },
      { t: 'Anticipo las objeciones, preparo respuestas sólidas y negocio los próximos pasos con datos.', k: 'negotiator' },
      { t: 'Incluyo la perspectiva del equipo, reconozco el esfuerzo y propongo ajustes en la estructura.', k: 'architect' },
    ],
  },
  {
    t: 'Dos departamentos tienen un conflicto que está afectando un proyecto clave. ¿Qué haces?',
    o: [
      { t: 'Convoco a ambos líderes y reencuadro el conflicto como oportunidad de innovación conjunta.', k: 'visionary' },
      { t: 'Facilito una negociación donde cada parte define sus mínimos y encontramos un acuerdo operativo.', k: 'negotiator' },
      { t: 'Hablo con cada equipo por separado, entiendo las frustraciones y diseño un proceso de colaboración.', k: 'architect' },
    ],
  },
  {
    t: 'Necesitas que tu equipo adopte una herramienta nueva que genera resistencia. ¿Cómo lo comunicas?',
    o: [
      { t: 'Pinto la visión de cómo esta herramienta nos posiciona mejor para el futuro del mercado.', k: 'visionary' },
      { t: 'Demuestro el ROI concreto: horas ahorradas, errores reducidos, resultados proyectados.', k: 'negotiator' },
      { t: 'Identifico a los early adopters, los empodero como champions y creo un sistema de acompañamiento.', k: 'architect' },
    ],
  },
  {
    t: 'Un líder de tu organización tiene problemas de comunicación que afectan a su equipo. ¿Cómo intervienes?',
    o: [
      { t: 'Le muestro cómo su comunicación impacta en los objetivos estratégicos y le doy una meta clara.', k: 'visionary' },
      { t: 'Tengo una conversación directa: le presento evidencia y negociamos un plan de mejora medible.', k: 'negotiator' },
      { t: 'Le doy feedback honesto y constructivo, lo acompaño con sesiones de coaching uno a uno.', k: 'architect' },
    ],
  },
  {
    t: '¿Cómo defines el éxito de un programa de desarrollo de talento?',
    o: [
      { t: 'Que el equipo esté alineado con la visión y sea capaz de adaptarse a los cambios del mercado.', k: 'visionary' },
      { t: 'Métricas duras: incremento en ventas, retención de clientes, deals cerrados.', k: 'negotiator' },
      { t: 'Que las personas crezcan, el clima laboral mejore y la rotación baje.', k: 'architect' },
    ],
  },
];
