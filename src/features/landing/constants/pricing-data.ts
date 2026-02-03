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
    name: 'Starter',
    priceMonthly: '$22',
    priceAnnual: '$19',
    priceSuffix: '/user/mes',
    features: [
      'Equipos hasta 20 personas',
      'Dashboard de manager',
      'Soporte standard',
    ],
    cta: 'Iniciar Piloto',
    highlighted: false,
    accentColor: '',
  },
  {
    name: 'Growth',
    priceMonthly: '$45',
    priceAnnual: '$39',
    priceSuffix: '/user/mes',
    features: [
      'Hasta 100 personas',
      'Escenarios customizados',
      'Integración con CRM',
      'AI Insights avanzados',
    ],
    cta: 'Hablar con Ventas',
    highlighted: true,
    highlightLabel: 'Escalable',
    accentColor: 'blue',
  },
  {
    name: 'Enterprise',
    priceMonthly: 'Custom',
    priceAnnual: 'Custom',
    priceSuffix: '',
    features: [
      'Usuarios ilimitados',
      'On-premise / Private Cloud',
      'SLA garantizado',
      'Dedicated CSM',
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

export const BUSINESS_COMPARISON: ComparisonRow[] = [
  { feature: 'Usuarios', starter: 'Hasta 20', growth: 'Hasta 100', enterprise: 'Ilimitados' },
  { feature: 'Dashboard de manager', starter: true, growth: true, enterprise: true },
  { feature: 'Escenarios customizados', starter: false, growth: true, enterprise: true },
  { feature: 'Integración con CRM', starter: false, growth: true, enterprise: true },
  { feature: 'AI Insights avanzados', starter: false, growth: true, enterprise: true },
  { feature: 'ROI Dashboard', starter: false, growth: true, enterprise: true },
  { feature: 'On-premise / Private Cloud', starter: false, growth: false, enterprise: true },
  { feature: 'SLA garantizado', starter: false, growth: false, enterprise: true },
  { feature: 'CSM dedicado', starter: false, growth: false, enterprise: true },
  { feature: 'Soporte', starter: 'Standard', growth: 'Prioritario', enterprise: '24/7 dedicado' },
];
