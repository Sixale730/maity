import { BusinessHeroSection } from '../components/sections/BusinessHeroSection';
import { BusinessDeepDive } from '../components/sections/BusinessDeepDive';
import { ScenariosSection } from '../components/sections/ScenariosSection';
import { CorporateQuiz } from '../components/quiz/CorporateQuiz';
import { B2BTeaser } from '../components/sections/B2BTeaser';
import { ROICalculator } from '../components/sections/ROICalculator';
import { Pricing } from '../components/sections/Pricing';
import { TrustSection } from '../components/sections/TrustSection';
import { FAQSection } from '../components/sections/FAQSection';

export const BusinessView = () => (
  <>
    <BusinessHeroSection />
    <BusinessDeepDive />
    <ScenariosSection />
    <CorporateQuiz />
    <B2BTeaser />
    <ROICalculator />
    <Pricing initialTab="business" />
    <TrustSection variant="enterprise" />
    <FAQSection />
  </>
);
