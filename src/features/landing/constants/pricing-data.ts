import type { ComparisonRow } from '../types/landing.types';

export const INDIVIDUAL_PLANS = [
  {
    name: 'Explorador',
    priceMonthly: '$0',
    priceAnnual: '$0',
    priceSuffix: '',
    features: [
      '20 conversaciones/mes',
      '120 min audio/mes',
      'Acceso LLM básico',
      'Memoria 7 días',
      'Dashboard básico',
      '1 reto diario',
      'Retroalimentación IA básica',
      'Soporte comunidad',
    ],
    cta: 'Empezar Gratis',
    highlighted: false,
    accentColor: '',
  },
  {
    name: 'Escalador',
    priceMonthly: '$19',
    priceAnnual: '$15',
    priceSuffix: '/mes',
    features: [
      '30,000 conversaciones/mes',
      '1,200 min audio/mes',
      'Acceso LLM completo',
      'Memoria 90 días',
      'Recordatorios básicos',
      'Tips antes de reuniones',
      'Dashboard básico',
      'Historial 1 año',
      '3 retos diarios + misiones',
      '5 simulaciones IA/mes',
      'Retroalimentación detallada',
      'Soporte email (48h)',
    ],
    cta: 'Suscribirse ahora',
    highlighted: true,
    highlightLabel: 'Más Popular',
    accentColor: 'pink',
  },
  {
    name: 'Guía',
    priceMonthly: '$29',
    priceAnnual: '$23',
    priceSuffix: '/mes',
    features: [
      'Conversaciones ilimitadas',
      'Audio ilimitado',
      'Acceso LLM premium',
      'Memoria ilimitada',
      'Conexión calendario',
      'Recordatorios avanzados + IA',
      'Tips personalizados',
      'Dashboard avanzado',
      'Historial ilimitado',
      'Retos ilimitados + misiones',
      'Jefes de montaña',
      'XP + Badges exclusivos',
      'Simulaciones IA ilimitadas',
      'Retroalimentación premium + video',
      'Exportar datos',
      'Soporte prioritario + chat',
    ],
    cta: 'Comenzar Guía',
    highlighted: false,
    accentColor: 'blue',
  },
];

export const BUSINESS_PLANS = [
  {
    name: 'Equipo',
    priceMonthly: '$42',
    priceAnnual: '$35',
    priceSuffix: '/usuario/mes',
    features: [
      'Mínimo 5 usuarios',
      'Coach IA 24/7',
      'Planes personalizados IA básico',
      'Evaluaciones trimestrales',
      'Retroalimentación detallada',
      '10 simulaciones IA/mes',
      'Conversaciones ilimitadas',
      'Audio ilimitado',
      'Modelo GPT-4',
      'Memoria individual',
      'Dashboard individual y equipo',
      'Reportes mensuales',
      'Analítica básica',
      '5 cursos propios',
      'Acceso biblioteca básico',
      'Rutas predefinidas',
      '3 roles básicos',
      '2FA',
      'GDPR',
      'Retención 1 año',
      'Onboarding self-service',
      'Soporte email (12h)',
    ],
    cta: 'Iniciar Piloto',
    highlighted: false,
    accentColor: '',
  },
  {
    name: 'Organización',
    priceMonthly: 'Solo Anual',
    priceAnnual: '$45',
    priceSuffix: '/usuario/mes',
    features: [
      'Mínimo 25 usuarios',
      'Coach IA 24/7',
      'Planes personalizados avanzados',
      'Evaluaciones mensuales',
      'Retroalimentación avanzada + video',
      '30 simulaciones IA/mes',
      'Conversaciones ilimitadas',
      'Audio ilimitado',
      'Modelo GPT-4',
      'Memoria equipo',
      'Dashboard individual, equipo y RH/Talent',
      'Reportes semanales',
      'Analítica + benchmarks',
      '25 cursos propios',
      'Biblioteca completa',
      'Rutas personalizables',
      'Certificaciones estándar',
      '10+ roles avanzados',
      'SSO',
      'SOC2 + GDPR',
      'Retención 3 años',
      'Onboarding guiado (4 hrs)',
      'Soporte email (2h)',
      'CSM compartido',
      'Revisiones trimestrales',
      '10 hrs consultoría/año',
    ],
    cta: 'Hablar con Ventas',
    highlighted: true,
    highlightLabel: 'Mejor Valor',
    accentColor: 'blue',
  },
  {
    name: 'Enterprise',
    priceMonthly: 'Solo Anual',
    priceAnnual: '$59',
    priceSuffix: '/usuario/mes',
    features: [
      '100+ usuarios',
      'Coach IA 24/7',
      'Planes personalizados premium',
      'Evaluaciones on-demand + 360°',
      'Retroalimentación premium + análisis',
      'Simulaciones IA ilimitadas',
      'Conversaciones ilimitadas',
      'Audio ilimitado',
      'GPT-4 + Claude',
      'Memoria org + cross-teams',
      'Dashboard avanzado completo',
      'Reportes tiempo real',
      'Analítica predictiva + ROI',
      'Cursos ilimitados',
      'Biblioteca + contenido exclusivo',
      'Rutas custom + IA',
      'Certificaciones personalizadas',
      'Roles ilimitados custom',
      'SSO + Audit + DLP',
      'SOC2 + GDPR + HIPAA ready',
      'Retención ilimitada',
      'Onboarding dedicado (2 sem)',
      'Soporte chat + SLA 30min',
      'CSM dedicado',
      'Revisiones mensuales + QBR',
      '50+ hrs consultoría/año',
    ],
    cta: 'Pedir Cotización',
    highlighted: false,
    accentColor: '',
  },
];

// Comparison data organized by category for individual plans
export interface ComparisonCategory {
  name: string;
  emoji: string;
  rows: ComparisonRow[];
}

export const INDIVIDUAL_COMPARISON_CATEGORIES: ComparisonCategory[] = [
  {
    name: 'Conversación y Audio',
    emoji: '📱',
    rows: [
      { feature: 'Conversaciones/mes', explorador: '20', escalador: '30,000', guia: 'Ilimitadas' },
      { feature: 'Minutos audio/mes', explorador: '120 min', escalador: '1,200 min', guia: 'Ilimitados' },
      { feature: 'Acceso a LLM', explorador: 'Básico', escalador: 'Completo', guia: 'Premium' },
      { feature: 'Memoria de conversaciones', explorador: '7 días', escalador: '90 días', guia: 'Ilimitada' },
    ],
  },
  {
    name: 'Calendario e Integraciones',
    emoji: '📅',
    rows: [
      { feature: 'Conexión calendario', explorador: false, escalador: false, guia: true },
      { feature: 'Recordatorios inteligentes', explorador: false, escalador: 'Básicos', guia: 'Avanzados + IA' },
      { feature: 'Tips antes de reuniones', explorador: false, escalador: true, guia: '✓ + Personalizados' },
    ],
  },
  {
    name: 'Dashboards y Análisis',
    emoji: '📊',
    rows: [
      { feature: 'Dashboard básico', explorador: true, escalador: true, guia: true },
      { feature: 'Dashboard avanzado', explorador: false, escalador: false, guia: true },
      { feature: 'Historial de progreso', explorador: '30 días', escalador: '1 año', guia: 'Ilimitado' },
    ],
  },
  {
    name: 'Gamificación',
    emoji: '🎮',
    rows: [
      { feature: 'Retos diarios', explorador: '1/día', escalador: '3/día', guia: 'Ilimitados' },
      { feature: 'Misiones semanales', explorador: false, escalador: true, guia: true },
      { feature: 'Jefes de montaña', explorador: false, escalador: false, guia: true },
      { feature: 'XP y niveles', explorador: true, escalador: true, guia: '✓ + Badges exclusivos' },
    ],
  },
  {
    name: 'IA y Simulaciones',
    emoji: '🤖',
    rows: [
      { feature: 'Simulaciones IA', explorador: false, escalador: '5/mes', guia: 'Ilimitadas' },
      { feature: 'Retroalimentación IA', explorador: 'Básica', escalador: 'Detallada', guia: 'Premium + Video' },
    ],
  },
  {
    name: 'Soporte',
    emoji: '🔧',
    rows: [
      { feature: 'Exportar datos', explorador: false, escalador: false, guia: true },
      { feature: 'Soporte', explorador: 'Comunidad', escalador: 'Email (48h)', guia: 'Prioritario + Chat' },
    ],
  },
];

// Flat array for backwards compatibility
export const INDIVIDUAL_COMPARISON: ComparisonRow[] = INDIVIDUAL_COMPARISON_CATEGORIES.flatMap(
  (category) => category.rows
);

// Comparison data organized by category for business plans
export const BUSINESS_COMPARISON_CATEGORIES: ComparisonCategory[] = [
  {
    name: 'Precios',
    emoji: '💰',
    rows: [
      { feature: 'Precio anual', equipo: '$35/usuario/mes', organizacion: '$45/usuario/mes', enterprise: '$59/usuario/mes' },
      { feature: 'Precio mensual', equipo: '$42/usuario/mes', organizacion: 'Solo Anual', enterprise: 'Solo Anual' },
      { feature: 'Mínimo usuarios', equipo: '5', organizacion: '25', enterprise: '100+' },
      { feature: 'Compromiso', equipo: 'Mensual o Anual', organizacion: 'Anual', enterprise: 'Anual (1-3 años)' },
      { feature: 'Ahorro vs coaching tradicional', equipo: '93%', organizacion: '94%', enterprise: '95%' },
    ],
  },
  {
    name: 'Coaching IA (Incluido)',
    emoji: '👨‍💼',
    rows: [
      { feature: 'Coach IA 24/7', equipo: true, organizacion: true, enterprise: true },
      { feature: 'Planes personalizados IA', equipo: 'Básico', organizacion: 'Avanzado', enterprise: 'Premium' },
      { feature: 'Evaluaciones competencias IA', equipo: 'Trimestrales', organizacion: 'Mensuales', enterprise: 'On-demand + 360°' },
      { feature: 'Retroalimentación IA', equipo: 'Detallada', organizacion: 'Avanzada + Video', enterprise: 'Premium + Análisis' },
      { feature: 'Simulaciones IA', equipo: '10/mes', organizacion: '30/mes', enterprise: 'Ilimitadas' },
    ],
  },
  {
    name: 'Conversación',
    emoji: '💬',
    rows: [
      { feature: 'Conversaciones', equipo: 'Ilimitadas', organizacion: 'Ilimitadas', enterprise: 'Ilimitadas' },
      { feature: 'Audio', equipo: 'Ilimitado', organizacion: 'Ilimitado', enterprise: 'Ilimitado' },
      { feature: 'Modelo LLM', equipo: 'GPT-4', organizacion: 'GPT-4', enterprise: 'GPT-4 + Claude' },
      { feature: 'Memoria organizacional', equipo: 'Individual', organizacion: 'Equipo', enterprise: 'Org + Cross-teams' },
    ],
  },
  {
    name: 'Calendario',
    emoji: '📅',
    rows: [
      { feature: 'Conexión calendario', equipo: true, organizacion: true, enterprise: true },
      { feature: 'Tips pre-reunión', equipo: true, organizacion: '+ Análisis', enterprise: '+ Estrategias' },
      { feature: 'Preparación automática', equipo: 'Básica', organizacion: 'Avanzada', enterprise: 'Completa + Sims' },
      { feature: 'Integraciones', equipo: 'Google/Outlook/Slack', organizacion: '+ Teams/Zoom', enterprise: 'API + SSO' },
    ],
  },
  {
    name: 'Dashboards RH',
    emoji: '📊',
    rows: [
      { feature: 'Dashboard individual', equipo: true, organizacion: true, enterprise: true },
      { feature: 'Dashboard equipo', equipo: true, organizacion: true, enterprise: true },
      { feature: 'Dashboard RH/Talent', equipo: false, organizacion: true, enterprise: '✓ Avanzado' },
      { feature: 'Reportes desarrollo', equipo: 'Mensuales', organizacion: 'Semanales', enterprise: 'Tiempo real' },
      { feature: 'Analítica productividad', equipo: 'Básica', organizacion: '+ Benchmarks', enterprise: 'Predictiva + ROI' },
    ],
  },
  {
    name: 'Contenido Empresarial',
    emoji: '📚',
    rows: [
      { feature: 'Subir contenido propio', equipo: '5 cursos', organizacion: '25 cursos', enterprise: 'Ilimitado' },
      { feature: 'Maity acompaña tu contenido', equipo: true, organizacion: true, enterprise: '✓ + Personalización' },
      { feature: 'Biblioteca Maity', equipo: 'Acceso básico', organizacion: 'Acceso completo', enterprise: '+ Contenido exclusivo' },
      { feature: 'Rutas de aprendizaje', equipo: 'Predefinidas', organizacion: 'Personalizables', enterprise: 'Custom + IA' },
      { feature: 'Crear certificaciones', equipo: false, organizacion: '✓ Estándar', enterprise: '✓ Personalizadas' },
    ],
  },
  {
    name: 'Seguridad',
    emoji: '🔒',
    rows: [
      { feature: 'Roles y permisos', equipo: '3 básicos', organizacion: '10+ avanzados', enterprise: 'Ilimitados custom' },
      { feature: 'Autenticación', equipo: '2FA', organizacion: 'SSO', enterprise: 'SSO + Audit + DLP' },
      { feature: 'Cumplimiento', equipo: 'GDPR', organizacion: 'SOC2 + GDPR', enterprise: '+ HIPAA ready' },
      { feature: 'Retención datos', equipo: '1 año', organizacion: '3 años', enterprise: 'Ilimitado' },
    ],
  },
  {
    name: 'Soporte',
    emoji: '🚀',
    rows: [
      { feature: 'Onboarding', equipo: 'Self-service', organizacion: 'Guiado (4 hrs)', enterprise: 'Dedicado (2 sem)' },
      { feature: 'Soporte', equipo: 'Email (12h)', organizacion: 'Email (2h)', enterprise: 'Chat + SLA 30min' },
      { feature: 'CSM dedicado', equipo: false, organizacion: 'Compartido', enterprise: '✓ Dedicado' },
      { feature: 'Revisiones negocio', equipo: false, organizacion: 'Trimestrales', enterprise: 'Mensuales + QBR' },
      { feature: 'Consultoría incluida', equipo: false, organizacion: '10 hrs/año', enterprise: '50+ hrs/año' },
    ],
  },
];

// Flat array for backwards compatibility
export const BUSINESS_COMPARISON: ComparisonRow[] = BUSINESS_COMPARISON_CATEGORIES.flatMap(
  (category) => category.rows
);
