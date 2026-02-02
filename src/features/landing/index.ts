// Main entry point
export { default as LandingApp } from './LandingApp';

// Pages
export { LandingPage } from './pages/LandingPage';
export { BusinessView } from './pages/BusinessView';
export { DemoCalendarPage } from './pages/DemoCalendarPage';
export { ResourcesPage } from './pages/ResourcesPage';
export { PrimerosPasosPage } from './pages/PrimerosPasosPage';
export { NosotrosPage } from './pages/NosotrosPage';
export { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
export { TermsOfServicePage } from './pages/TermsOfServicePage';
export { CareersPage } from './pages/CareersPage';
export { SoportePage } from './pages/SoportePage';
export { SuccessStoriesPage } from './pages/SuccessStoriesPage';

// Layout
export { LandingLayout } from './components/layout/LandingLayout';
export { LandingNavbar } from './components/layout/LandingNavbar';
export { LandingFooter } from './components/layout/LandingFooter';

// Sections
export { HeroSection } from './components/sections/HeroSection';
export { ProblemSection } from './components/sections/ProblemSection';
export { HowItWorksSection } from './components/sections/HowItWorksSection';
export { SkillsGridSection } from './components/sections/SkillsGridSection';
export { TheClimb } from './components/sections/TheClimb';
export { ProductInfoSection } from './components/sections/ProductInfoSection';
export { WearableSection } from './components/sections/WearableSection';
export { TrustSection } from './components/sections/TrustSection';
export { Pricing } from './components/sections/Pricing';
export { VideoTestimonials } from './components/sections/VideoTestimonials';
export { FAQSection } from './components/sections/FAQSection';
export { CommunityPartnerSection } from './components/sections/CommunityPartnerSection';
export { CTACierre } from './components/sections/CTACierre';
export { BusinessHeroSection } from './components/sections/BusinessHeroSection';
export { BusinessDeepDive } from './components/sections/BusinessDeepDive';
export { SolucionesGrid } from './components/sections/SolucionesGrid';
export { ScenariosSection } from './components/sections/ScenariosSection';
export { B2BTeaser } from './components/sections/B2BTeaser';
export { ROICalculator } from './components/sections/ROICalculator';
export { PilotSection } from './components/sections/PilotSection';

// Quiz
export { ArchetypeQuiz } from './components/quiz/ArchetypeQuiz';
export { CorporateQuiz } from './components/quiz/CorporateQuiz';

// Interactive
export { RoleplaySimulator } from './components/interactive/RoleplaySimulator';

// Shared
export { FadeIn } from './components/shared/FadeIn';
export { VideoCard } from './components/shared/VideoCard';
export { RadarChart } from './components/shared/RadarChart';

// Constants
export { LANDING_COLORS } from './constants/colors';
export { LANDING_VIDEOS } from './constants/videos';
export { LANDING_FAQS, SUPPORT_FAQS } from './constants/faq-data';
export { PRODUCT_ARCHETYPES, PRODUCT_QUIZ_QUESTIONS, CORPORATE_ARCHETYPES, CORPORATE_QUIZ_QUESTIONS } from './constants/quiz-data';
export { SCENARIOS } from './constants/scenarios-data';
export { COMPANY_VALUES, BENEFITS, JOB_OPENINGS } from './constants/careers-data';
export { RESOURCES, RESOURCE_CATEGORIES } from './constants/resources-data';

// Types
export type * from './types/landing.types';
