import { Outlet } from 'react-router-dom';
import { LandingNavbar } from './LandingNavbar';
import { LandingFooter } from './LandingFooter';

export const LandingLayout = () => (
  <div className="min-h-screen bg-[#050505] text-[#e7e7e9]">
    <LandingNavbar />
    <main>
      <Outlet />
    </main>
    <LandingFooter />
  </div>
);
