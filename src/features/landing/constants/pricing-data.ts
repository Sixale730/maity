import type { ComparisonRow } from '../types/landing.types';

export const INDIVIDUAL_PLANS = [
  {
    name: 'Explorador',
    priceMonthly: '$0',
    priceAnnual: '$0',
    priceSuffix: '',
    features: [
      '5 conversaciones/mes',
      '1200 min audio/mes',
      'Dashboard básico',
      '1 reto diario',
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
      '50 conversaciones/mes',
      'Acceso a ChatGPT ilimitado',
      'Conexión a calendario',
      'Dashboard avanzado',
      '3 retos diarios + misiones',
      '5 simulaciones IA/mes',
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
      'Recordatorios con IA',
      'Tips personalizados',
      'Simulaciones IA ilimitadas',
      'Jefes de montaña',
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
    priceMonthly: '$35',
    priceAnnual: '$29',
    priceSuffix: '/usuario/mes',
    features: [
      'Mínimo 5 usuarios',
      'Coach IA 24/7',
      'Conversaciones ilimitadas',
      '30 simulaciones IA/usuario/mes',
      'Dashboard equipo',
      'Integraciones básicas',
    ],
    cta: 'Iniciar Piloto',
    highlighted: false,
    accentColor: '',
  },
  {
    name: 'Organización',
    priceMonthly: 'Solo Anual',
    priceAnnual: '$39',
    priceSuffix: '/usuario/mes',
    features: [
      'Mínimo 25 usuarios',
      '2 sesiones coach real/trimestre',
      'Dashboard RH/Talent',
      'Simulaciones ilimitadas',
      'SSO + Integraciones avanzadas',
      'CSM compartido',
    ],
    cta: 'Hablar con Ventas',
    highlighted: true,
    highlightLabel: 'Mejor Valor',
    accentColor: 'blue',
  },
  {
    name: 'Enterprise',
    priceMonthly: 'Solo Anual',
    priceAnnual: '$49+',
    priceSuffix: '/usuario/mes',
    features: [
      '100+ usuarios',
      'Coach dedicado + sesiones ilimitadas',
      'Analítica predictiva + ROI',
      'SOC 2, GDPR, HIPAA',
      'CSM dedicado + 50hrs consultoría',
      'SLA 30min + onboarding dedicado',
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
    name: 'Conversación y audio',
    emoji: '📱',
    rows: [
      { feature: 'Conversaciones/mes', explorador: '5', escalador: '50', guia: 'Ilimitadas' },
      { feature: 'Minutos audio/mes', explorador: '1200 min', escalador: 'Ilimitados', guia: 'Ilimitados' },
      { feature: 'Acceso a ChatGPT', explorador: false, escalador: 'Ilimitado', guia: 'Ilimitado' },
      { feature: 'Conversar con tus recuerdos', explorador: '5/mes', escalador: true, guia: 'Ilimitado' },
    ],
  },
  {
    name: 'Calendario e integraciones',
    emoji: '📅',
    rows: [
      { feature: 'Conexión a calendario', explorador: false, escalador: true, guia: true },
      { feature: 'Recordatorios inteligentes', explorador: false, escalador: 'Básicos', guia: 'Avanzados + IA' },
      { feature: 'Tips antes de reuniones', explorador: false, escalador: true, guia: '✓ + Personalizados' },
    ],
  },
  {
    name: 'Dashboards y análisis',
    emoji: '📊',
    rows: [
      { feature: 'Dashboard básico', explorador: true, escalador: true, guia: true },
      { feature: 'Dashboard avanzado', explorador: false, escalador: true, guia: true },
    ],
  },
  {
    name: 'Gamificación',
    emoji: '🎮',
    rows: [
      { feature: 'Retos diarios', explorador: '1/día', escalador: '3/día', guia: 'Ilimitados' },
      { feature: 'Misiones semanales', explorador: false, escalador: true, guia: true },
      { feature: 'Jefes de montaña', explorador: false, escalador: false, guia: true },
    ],
  },
  {
    name: 'IA y simulaciones',
    emoji: '🤖',
    rows: [
      { feature: 'Simulaciones IA', explorador: false, escalador: '5/mes', guia: 'Ilimitadas' },
    ],
  },
  {
    name: 'Datos y soporte',
    emoji: '🔧',
    rows: [
      { feature: 'Exportar datos', explorador: false, escalador: false, guia: true },
      { feature: 'Soporte', explorador: 'Comunidad', escalador: 'Email', guia: 'Prioritario + Chat' },
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
      { feature: 'Precio anual', equipo: '$29/usuario/mes', organizacion: '$39/usuario/mes', enterprise: '$49+/usuario/mes' },
      { feature: 'Precio mensual', equipo: '$35/usuario/mes', organizacion: 'Solo Anual', enterprise: 'Solo Anual' },
      { feature: 'Ahorro vs coaching tradicional', equipo: '90%', organizacion: '92%', enterprise: '95%' },
      { feature: 'Mínimo usuarios', equipo: '5', organizacion: '25', enterprise: '100+' },
      { feature: 'Compromiso', equipo: 'Mensual o Anual', organizacion: 'Anual', enterprise: 'Anual (1-3 años)' },
    ],
  },
  {
    name: 'Coaching profesional',
    emoji: '👨‍💼',
    rows: [
      { feature: 'Coach IA 24/7', equipo: true, organizacion: true, enterprise: true },
      { feature: 'Sesiones con coaches reales', equipo: false, organizacion: '2/trimestre', enterprise: 'Ilimitadas' },
      { feature: 'Planes de desarrollo', equipo: 'IA automático', organizacion: 'IA + Revisión coach', enterprise: 'Coach dedicado' },
      { feature: 'Evaluaciones de competencias', equipo: 'Trimestrales', organizacion: 'Mensuales', enterprise: 'On-demand + 360°' },
      { feature: 'Mentoría de liderazgo', equipo: false, organizacion: 'Managers', enterprise: 'Todos los niveles' },
    ],
  },
  {
    name: 'Conversación',
    emoji: '💬',
    rows: [
      { feature: 'Conversaciones', equipo: 'Ilimitadas', organizacion: 'Ilimitadas', enterprise: 'Ilimitadas' },
      { feature: 'Audio', equipo: 'Ilimitado', organizacion: 'Ilimitado', enterprise: 'Ilimitado' },
      { feature: 'ChatGPT Enterprise', equipo: true, organizacion: true, enterprise: '✓ Premium' },
      { feature: 'Memoria organizacional', equipo: 'Individual', organizacion: 'Equipo', enterprise: 'Org + Cross-teams' },
    ],
  },
  {
    name: 'Calendario',
    emoji: '📅',
    rows: [
      { feature: 'Conexión a calendario', equipo: true, organizacion: true, enterprise: true },
      { feature: 'Tips antes de reuniones', equipo: true, organizacion: '✓ + Análisis', enterprise: '✓ + Estrategias' },
      { feature: 'Preparación automática', equipo: 'Básica', organizacion: 'Avanzada', enterprise: 'Completa + Simulaciones' },
      { feature: 'Integraciones', equipo: 'Google/Outlook/Slack', organizacion: '+Teams +Zoom', enterprise: 'API completa + SSO' },
    ],
  },
  {
    name: 'Dashboards RH',
    emoji: '📊',
    rows: [
      { feature: 'Dashboard individual', equipo: true, organizacion: true, enterprise: true },
      { feature: 'Dashboard equipo', equipo: true, organizacion: true, enterprise: true },
      { feature: 'Dashboard RH/Talent', equipo: false, organizacion: true, enterprise: '✓ Avanzado' },
      { feature: 'Reportes de desarrollo', equipo: 'Mensuales', organizacion: 'Semanales', enterprise: 'Tiempo real' },
      { feature: 'Analítica de productividad', equipo: 'Básica', organizacion: 'Avanzada + Benchmarks', enterprise: 'Predictiva + ROI' },
      { feature: 'Métricas de engagement', equipo: 'Básicas', organizacion: 'Completas', enterprise: '+Predictores' },
    ],
  },
  {
    name: 'Seguridad',
    emoji: '🔒',
    rows: [
      { feature: 'Roles y permisos', equipo: 'Básicos (3)', organizacion: 'Avanzados (10+)', enterprise: 'Ilimitados custom' },
      { feature: 'Seguridad', equipo: 'Básica + 2FA', organizacion: 'SSO', enterprise: 'SSO + Audit + DLP' },
      { feature: 'Cumplimiento', equipo: 'GDPR', organizacion: 'SOC 2, GDPR', enterprise: 'SOC 2, GDPR, HIPAA' },
      { feature: 'Retención de datos', equipo: '1 año', organizacion: '3 años', enterprise: 'Ilimitado' },
    ],
  },
  {
    name: 'Gamificación',
    emoji: '🎮',
    rows: [
      { feature: 'Simulaciones IA', equipo: '30/usuario/mes', organizacion: 'Ilimitadas', enterprise: 'Ilimitadas' },
      { feature: 'Certificaciones', equipo: false, organizacion: '✓ Estándar', enterprise: '✓ Personalizadas' },
      { feature: 'Planes de carrera', equipo: false, organizacion: true, enterprise: '✓ Avanzados' },
    ],
  },
  {
    name: 'Soporte',
    emoji: '🚀',
    rows: [
      { feature: 'Onboarding', equipo: 'Self-service', organizacion: 'Guiado (4hrs)', enterprise: 'Dedicado (2 semanas)' },
      { feature: 'Soporte', equipo: 'Email (12hrs)', organizacion: 'Email (2hrs)', enterprise: 'Chat + SLA 30min' },
      { feature: 'CSM Dedicado', equipo: false, organizacion: 'Compartido', enterprise: '✓ Dedicado' },
      { feature: 'Revisiones de cuenta', equipo: false, organizacion: 'Trimestrales', enterprise: 'Mensuales + QBR' },
      { feature: 'Consultoría incluida', equipo: false, organizacion: '10hrs', enterprise: '50+ hrs' },
    ],
  },
];

// Flat array for backwards compatibility
export const BUSINESS_COMPARISON: ComparisonRow[] = BUSINESS_COMPARISON_CATEGORIES.flatMap(
  (category) => category.rows
);
