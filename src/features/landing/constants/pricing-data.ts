import type { ComparisonRow } from '../types/landing.types';

export const INDIVIDUAL_PLANS = [
  {
    name: 'Maity Free',
    priceMonthly: '$0',
    priceAnnual: '$0',
    priceSuffix: '',
    features: [
      '5 prácticas mensuales',
      'Análisis básico',
      'Web App access',
    ],
    cta: 'Empezar Gratis',
    highlighted: false,
    accentColor: '',
  },
  {
    name: 'Maity Pro',
    priceMonthly: '$12.99',
    priceAnnual: '$9.99',
    priceSuffix: '/mes',
    features: [
      'Llamadas reales ilimitadas',
      'Feedback táctico IA',
      'Todos los escenarios',
      'Dashboard de evolución',
    ],
    cta: 'Suscribirse ahora',
    highlighted: true,
    highlightLabel: 'Más Popular',
    accentColor: 'pink',
  },
  {
    name: 'Maity Pendant',
    priceMonthly: '$99',
    priceAnnual: '$99',
    priceSuffix: ' (Pago único)',
    features: [
      'Hardware Maity Original',
      'Feedback háptico',
      'Privacidad offline',
    ],
    cta: 'Reservar Unidad',
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

export const INDIVIDUAL_COMPARISON: ComparisonRow[] = [
  { feature: 'Conversaciones analizadas', free: '5/mes', pro: 'Ilimitadas', pendant: 'Ilimitadas' },
  { feature: 'Feedback de IA', free: 'Básico', pro: 'Táctico avanzado', pendant: 'Táctico avanzado' },
  { feature: 'Escenarios de práctica', free: '2', pro: 'Todos', pendant: 'Todos' },
  { feature: 'Dashboard de evolución', free: false, pro: true, pendant: true },
  { feature: 'La Escalada (gamificación)', free: 'Básica', pro: 'Completa', pendant: 'Completa' },
  { feature: 'Competencias certificables', free: false, pro: true, pendant: true },
  { feature: 'Feedback háptico', free: false, pro: false, pendant: true },
  { feature: 'Hardware Maity', free: false, pro: false, pendant: true },
  { feature: 'Modo offline', free: false, pro: false, pendant: true },
  { feature: 'Soporte', free: 'Comunidad', pro: 'Email prioritario', pendant: 'Prioritario' },
];

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
