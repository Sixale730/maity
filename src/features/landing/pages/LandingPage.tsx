import { HeroSection } from '../components/sections/HeroSection';
import { ProblemSection } from '../components/sections/ProblemSection';
import { HowItWorksSection } from '../components/sections/HowItWorksSection';
import { SkillsGridSection } from '../components/sections/SkillsGridSection';
import { ArchetypeQuiz } from '../components/quiz/ArchetypeQuiz';
import { TheClimb } from '../components/sections/TheClimb';
import { ProductInfoSection } from '../components/sections/ProductInfoSection';
import { TrustSection } from '../components/sections/TrustSection';
import { Pricing } from '../components/sections/Pricing';
import { VideoTestimonials } from '../components/sections/VideoTestimonials';
import { FAQSection } from '../components/sections/FAQSection';
import { CommunityPartnerSection } from '../components/sections/CommunityPartnerSection';
import { CTACierre } from '../components/sections/CTACierre';

export const LandingPage = () => (
  <>
    <HeroSection />
    <ProblemSection />
    <HowItWorksSection />
    <SkillsGridSection />
    <ArchetypeQuiz />
    <TheClimb />
    <ProductInfoSection />
    <TrustSection variant="product" />
    <Pricing initialTab="individual" />
    <VideoTestimonials />
    <FAQSection />
    <CommunityPartnerSection />
    <CTACierre />
  </>
);
