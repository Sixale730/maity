import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, AuthService } from '@maity/shared';
import { type MarketingView } from './marketing.constants';
import { Navbar } from './Navbar';
import {
  HeroSection,
  BusinessHeroSection,
  ProblemSection,
  ProductInfoSection,
  VideoTestimonials,
  ROICalculator,
  SuccessStories,
  Pricing,
  BusinessPricing,
  BusinessDeepDive,
  FAQSection,
  Footer,
} from './sections';

export const MarketingLanding = () => {
  const [activeView, setActiveView] = useState<MarketingView>('home');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const checkAuthStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log('[guard] session?', !!session);

        if (!session) {
          return;
        }

        const data = await AuthService.getMyStatus();

        const raw =
          typeof data === 'string'
            ? data
            : (data as { status?: string })?.status ??
              (Array.isArray(data) ? (data[0] as { status?: string })?.status : undefined);

        const status = String(raw || '').toUpperCase();
        console.log('[guard] status =', status, 'data =', data);

        if (cancelled) return;

        if (status === 'ACTIVE') {
          if (location.pathname !== '/dashboard') {
            navigate('/dashboard', { replace: true });
          }
        } else {
          console.warn('[guard] status inesperado:', status);
        }
      } catch (err) {
        console.error('[guard] error general:', err);
      }
    };

    checkAuthStatus();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen font-sans bg-[#050505] text-[#e7e7e9]">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; background-color: #050505; }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #1a1a1a; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
        `}
      </style>

      <Navbar activeView={activeView} setView={setActiveView} />

      <main>
        {activeView === 'home' && (
          <>
            <HeroSection />
            <ProblemSection />
            <ProductInfoSection />
            <VideoTestimonials />
            <Pricing />
            <FAQSection />
          </>
        )}

        {activeView === 'business' && (
          <>
            <BusinessHeroSection setView={setActiveView} />
            <BusinessDeepDive />
            <ROICalculator />
            <BusinessPricing />
          </>
        )}

        {activeView === 'success-stories' && <SuccessStories setView={setActiveView} />}

        {activeView === 'pricing' && <Pricing />}
      </main>

      <Footer />
    </div>
  );
};

export default MarketingLanding;
