import { HeroSection } from '../components/sections/HeroSection';
import { ProblemSection } from '../components/sections/ProblemSection';
import { HowItWorksSection } from '../components/sections/HowItWorksSection';
import { SkillsGridSection } from '../components/sections/SkillsGridSection';
import { ArchetypeQuiz } from '../components/quiz/ArchetypeQuiz';
import { TheClimb } from '../components/sections/TheClimb';
import { ProductInfoSection } from '../components/sections/ProductInfoSection';
import { WearableSection } from '../components/sections/WearableSection';
import { TrustSection } from '../components/sections/TrustSection';
import { Pricing } from '../components/sections/Pricing';
import { VideoTestimonials } from '../components/sections/VideoTestimonials';
import { FAQSection } from '../components/sections/FAQSection';
import { CommunityPartnerSection } from '../components/sections/CommunityPartnerSection';
import { CTACierre } from '../components/sections/CTACierre';

interface LandingPageProps {
  setView: (view: string) => void;
}

export const LandingPage = ({ setView }: LandingPageProps) => {
  return (
    <>
      <HeroSection setView={setView} />
      <ProblemSection />
      <HowItWorksSection />
      <SkillsGridSection />
      <ArchetypeQuiz setView={setView} />
      <TheClimb setView={setView} />
      <ProductInfoSection />
      <WearableSection setView={setView} />
      <TrustSection setView={setView} />
      <Pricing setView={setView} />
      <VideoTestimonials />
      <FAQSection />
      <CommunityPartnerSection setView={setView} />
      <CTACierre setView={setView} />
    </>
  );
};
