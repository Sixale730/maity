export interface LandingVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  placement: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  priceAnnual?: string;
  priceSuffix?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  highlightLabel?: string;
  accentColor?: string;
}

export interface ComparisonRow {
  feature: string;
  [plan: string]: string | boolean;
}

export interface QuizOption {
  text: string;
  type: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

export interface Archetype {
  name: string;
  emoji: string;
  color: string;
  tagline: string;
  description: string;
  strengths: string[];
  growth: string[];
  maityPlan: string;
}

export interface Scenario {
  icon: string;
  skill: string;
  title: string;
  desc: string;
  color: string;
  bg: string;
}

export interface Resource {
  t: string;
  d: string;
  c: string;
  label: string;
  icon: string;
  color: string;
  ready: boolean;
  time: string;
}

export interface TeamMember {
  name: string;
  role: string;
  company: string;
  description: string;
  linkedin: string;
  initials: string;
  accentColor: string;
  tags: string[];
}

export interface JobOpening {
  role: string;
  area: string;
  type: string;
  tags: string[];
}

export interface CommunityTrack {
  icon: string;
  title: string;
  desc: string;
  benefits: string[];
  cta: string;
  color: string;
  accent: string;
}

export interface PrivacySection {
  title: string;
  content: string;
}

export type LandingView =
  | 'product'
  | 'business'
  | 'pricing'
  | 'demo-calendar'
  | 'resources'
  | 'primeros-pasos'
  | 'nosotros'
  | 'archetype-quiz'
  | 'corporate-quiz'
  | 'success-stories'
  | 'login'
  | 'climb'
  | 'roleplay'
  | 'seguridad'
  | 'privacidad'
  | 'terminos'
  | 'careers'
  | 'soporte'
  | 'comunidad';
