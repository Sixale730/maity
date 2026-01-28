// Design System Colors
export const COLORS = {
  maityPink: '#ff0050',
  maityBlue: '#485df4',
  maityGreen: '#1bea9a',
  textMain: '#e7e7e9',
  textMuted: '#A1A1AA',
  bgDark: '#050505',
  bgCard: '#0F0F0F',
  bgElevated: '#1A1A1A',
} as const;

// Types
export type MarketingView = 'home' | 'business' | 'pricing' | 'success-stories';

export interface NavbarProps {
  activeView: MarketingView;
  setView: (view: MarketingView) => void;
}

export interface SectionProps {
  setView: (view: MarketingView) => void;
}

export interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

// FAQ Data
export const FAQ_DATA = [
  {
    q: "¿Tienen videos o contenido para empezar?",
    a: "Sí. Tenemos videos introductorios y contenido práctico para que empieces a usar Maity desde el día uno. Ahí explicamos cómo funciona, cómo integrarlo a tus reuniones y cómo sacarle valor real desde la primera semana. Maity no tiene curva de aprendizaje pesada: se aprende usándolo."
  },
  {
    q: "¿Qué tan segura está mi información?",
    a: "Tu información es tuya. Punto. Solo tú (o tu empresa, según el caso) puede acceder a tus conversaciones y análisis. Maity no vende datos, no los comparte con terceros y no los usa sin consentimiento. Toda la información se almacena en infraestructura segura y puedes pedir su eliminación en cualquier momento."
  },
  {
    q: "¿Cómo funciona el modelo de precios?",
    a: "Puedes empezar con un plan inicial y escalar según tus objetivos. Maity tiene opciones para uso individual, equipos, empresas y coaches. Si eres empresa o quieres una solución personalizada (white label o enterprise), puedes hablar directamente con nosotros para diseñar el modelo correcto."
  },
  {
    q: "¿Puedo usar Maity en mis llamadas diarias?",
    a: "Sí. Maity está pensada para usarse en tus llamadas reales, no en simulaciones. Funciona con plataformas como Zoom, Google Meet y Microsoft Teams. Maity puede operar en dos modos: Modo equipo (retroalimentación para todos) y Modo privado (solo te escucha a ti)."
  },
  {
    q: "¿Maity graba a todas las personas de la reunión?",
    a: "Depende del modo que elijas. En modo privado, solo tú eres analizado. En modo equipo, el uso es transparente y configurado a nivel organizacional. Maity está diseñada para acompañar, no para vigilar."
  },
  {
    q: "Soy coach de comunicación / liderazgo. ¿Cómo puedo usar Maity?",
    a: "Piensa en Maity como tu copiloto. Maity se encarga de analizar conversaciones, detectar patrones y generar métricas. Así tú puedes enfocarte en la intervención humana y el acompañamiento profundo. Te ayuda a ahorrar tiempo y escalar tu impacto."
  },
  {
    q: "¿Maity reemplaza al coach humano?",
    a: "No. Maity no sustituye, potencia. Hace el trabajo continuo y repetitivo que ningún humano puede hacer 24/7. Cuando el proceso lo amerita, Maity recomienda sesiones de coaching humano para profundizar."
  },
  {
    q: "¿Puedo conocer a otros usuarios o coaches que usan Maity?",
    a: "Sí. Estamos construyendo una comunidad de usuarios, coaches y líderes que creen en una nueva forma de aprender y desarrollarse: con seguimiento real y acompañamiento continuo."
  },
  {
    q: "¿Qué pasa si dejo de usar Maity?",
    a: "Nada forzado. Si dejas de interactuar, Maity entra en modo seguimiento suave y, después de un tiempo, puede invitarte a retomar cuando tenga sentido para ti. Maity acompaña. No presiona."
  },
  {
    q: "Tengo más dudas, ¿con quién hablo?",
    a: "Puedes contactarnos directamente desde la plataforma o por nuestros canales de soporte. Estamos aquí para ayudarte a entender si Maity es para ti y cómo usarla de la mejor manera, no para venderte algo que no necesitas."
  }
];

// Success Stories Data
export const SUCCESS_STORIES = [
  {
    company: "Uber",
    industry: "Tecnología / Movilidad",
    headline: "Cómo Uber redujo el tiempo de onboarding de ventas un 40% con Maity",
    impact: "-40% tiempo onboarding",
    desc: "El equipo de ventas corporativas utilizó Maity para analizar sus llamadas de prospección. En 3 meses, la tasa de conversión aumentó significativamente al mejorar la escucha activa.",
    author: "Gerente Regional de Ventas",
    color: '#485df4',
    tags: ["Ventas", "Onboarding"]
  },
  {
    company: "Walmart",
    industry: "Retail",
    headline: "Equipo de Customer Service mejoró satisfacción del cliente 25% en 3 meses",
    impact: "+25% satisfacción",
    desc: "Implementaron Maity en sus líderes de tienda para mejorar la comunicación y el feedback con sus equipos operativos. La satisfacción laboral subió drásticamente.",
    author: "Directora de Talento Humano",
    color: "#3b82f6",
    tags: ["Customer Service", "Liderazgo"]
  },
  {
    company: "TechFin",
    industry: "Fintech",
    headline: "Fintech líder acelera la curva de aprendizaje en soporte técnico",
    impact: "2x velocidad",
    desc: "Los nuevos ingresos en soporte técnico usaron Maity para practicar escenarios difíciles antes de hablar con clientes reales.",
    author: "VP de Operaciones",
    color: '#1bea9a',
    tags: ["Onboarding", "Soporte"]
  }
];

// Video Testimonials Data
export const VIDEO_TESTIMONIALS = [
  { id: 1, user: "Ana G.", role: "Gerente de Ventas", color: "bg-blue-500", text: "Maity me ayudó a cerrar un 20% más." },
  { id: 2, user: "David L.", role: "Freelancer", color: "bg-pink-500", text: "La IA es brutalmente honesta. Me encanta." },
  { id: 3, user: "Sofia M.", role: "Líder de Equipo", color: "bg-green-500", text: "Mis reuniones ahora duran la mitad." },
  { id: 4, user: "Jorge R.", role: "Consultor", color: "bg-purple-500", text: "Es como tener un coach 24/7." },
];
