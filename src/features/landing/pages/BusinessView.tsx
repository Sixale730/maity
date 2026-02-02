import { BusinessHeroSection } from '../components/sections/BusinessHeroSection';
import { BusinessDeepDive } from '../components/sections/BusinessDeepDive';
import { SolucionesGrid } from '../components/sections/SolucionesGrid';
import { ScenariosSection } from '../components/sections/ScenariosSection';
import { CorporateQuiz } from '../components/quiz/CorporateQuiz';
import { B2BTeaser } from '../components/sections/B2BTeaser';
import { ROICalculator } from '../components/sections/ROICalculator';
import { PilotSection } from '../components/sections/PilotSection';
import { Pricing } from '../components/sections/Pricing';
import { DemoCalendarPage } from './DemoCalendarPage';
import { TrustSection } from '../components/sections/TrustSection';
import { FAQSection } from '../components/sections/FAQSection';

interface BusinessViewProps {
  setView: (view: string) => void;
}

export const BusinessView = ({ setView }: BusinessViewProps) => {
  return (
    <>
      <BusinessHeroSection setView={setView} />
      <BusinessDeepDive />
      <SolucionesGrid />
      <ScenariosSection setView={setView} />
      <CorporateQuiz setView={setView} />
      <B2BTeaser setView={setView} />
      <ROICalculator />
      <PilotSection setView={setView} />
      <Pricing initialTab="business" setView={setView} />
      <DemoCalendarPage setView={setView} />
      <TrustSection variant="enterprise" setView={setView} />
      <FAQSection />
    </>
  );
};
