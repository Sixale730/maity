import { ReactNode } from 'react';

interface LandingLayoutProps {
  children: ReactNode;
}

export const LandingLayout = ({ children }: LandingLayoutProps) => {
  return (
    <div className="min-h-screen font-sans bg-[#050505] text-[#e7e7e9]">
      {children}
    </div>
  );
};
