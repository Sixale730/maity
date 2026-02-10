import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, AuthService } from '@maity/shared';
import { LandingLayout } from './components/layout/LandingLayout';
import { LandingNavbar } from './components/layout/LandingNavbar';
import { LandingFooter } from './components/layout/LandingFooter';
import { LandingPage } from './pages/LandingPage';
import { BusinessView } from './pages/BusinessView';
import { DemoCalendarPage } from './pages/DemoCalendarPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { PrimerosPasosPage } from './pages/PrimerosPasosPage';
import { NosotrosPage } from './pages/NosotrosPage';
import { CareersPage } from './pages/CareersPage';
import { SoportePage } from './pages/SoportePage';
import { SuccessStoriesPage } from './pages/SuccessStoriesPage';
import { ArchetypeQuiz } from './components/quiz/ArchetypeQuiz';
import { CorporateQuiz } from './components/quiz/CorporateQuiz';
import { TheClimb } from './components/sections/TheClimb';
import { Pricing } from './components/sections/Pricing';
import { TrustSection } from './components/sections/TrustSection';
import { CommunityPartnerSection } from './components/sections/CommunityPartnerSection';
import { RoleplaySimulator } from './components/interactive/RoleplaySimulator';

export default function LandingApp() {
  const [activeView, setActiveView] = useState('product');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const data = await AuthService.getMyStatus();
        const raw =
          typeof data === "string"
            ? data
            : (data as any)?.status ??
              (Array.isArray(data) ? (data[0] as any)?.status : undefined);
        const status = String(raw || "").toUpperCase();

        if (cancelled) return;

        if (status === "ACTIVE") {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("[landing] auth check error:", err);
      }
    };

    checkAuthStatus();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <LandingLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #050505; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1a1a1a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
      `}</style>

      <LandingNavbar activeView={activeView} setView={setActiveView} />

      <main>
        {activeView === 'product' && (
          <LandingPage setView={setActiveView} />
        )}

        {activeView === 'business' && (
          <BusinessView setView={setActiveView} />
        )}

        {activeView === 'demo-calendar' && (
          <DemoCalendarPage setView={setActiveView} />
        )}

        {activeView === 'resources' && (
          <ResourcesPage setView={setActiveView} />
        )}

        {activeView === 'primeros-pasos' && (
          <PrimerosPasosPage setView={setActiveView} />
        )}

        {activeView === 'archetype-quiz' && (
          <ArchetypeQuiz setView={setActiveView} />
        )}

        {activeView === 'success-stories' && (
          <SuccessStoriesPage setView={setActiveView} />
        )}

        {activeView === 'climb' && (
          <TheClimb setView={setActiveView} />
        )}

        {activeView === 'roleplay' && (
          <RoleplaySimulator onExit={() => setActiveView('product')} />
        )}

        {activeView === 'pricing' && (
          <Pricing setView={setActiveView} />
        )}

        {activeView === 'nosotros' && (
          <NosotrosPage setView={setActiveView} />
        )}

        {activeView === 'seguridad' && (
          <div className="pt-24">
            <TrustSection variant="enterprise" setView={setActiveView} />
          </div>
        )}

        {activeView === 'corporate-quiz' && (
          <CorporateQuiz setView={setActiveView} />
        )}

        {activeView === 'careers' && (
          <CareersPage setView={setActiveView} />
        )}

        {activeView === 'soporte' && (
          <SoportePage setView={setActiveView} />
        )}

        {activeView === 'comunidad' && (
          <div className="pt-24">
            <CommunityPartnerSection setView={setActiveView} />
          </div>
        )}
      </main>

      <LandingFooter setView={setActiveView} />
    </LandingLayout>
  );
}
