import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';

interface NavLink {
  id: string;
  label: string;
  scroll?: boolean;
}

interface LandingNavbarProps {
  activeView: string;
  setView: (view: string) => void;
}

export const LandingNavbar = ({ activeView, setView }: LandingNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks: NavLink[] = [
    { id: 'product', label: 'Producto' },
    { id: 'como-funciona', label: 'Cómo Funciona', scroll: true },
    { id: 'la-escalada', label: 'La Escalada', scroll: true },
    { id: 'business', label: 'Empresas' },
    { id: 'pricing', label: 'Precios' },
    { id: 'demo-calendar', label: 'Conócenos' },
  ];

  const handleNavClick = (link: NavLink) => {
    if (link.scroll) {
      if (activeView !== 'product') setView('product');
      setTimeout(
        () => {
          document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
        },
        activeView !== 'product' ? 200 : 50
      );
    } else {
      setView(link.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/10 bg-black/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setView('product')}
          >
            <img src="/assets/maity-logo-color.png" alt="Maity" className="h-8" />
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link)}
                className={`text-sm font-medium transition-all hover:text-white ${
                  activeView === link.id
                    ? 'text-white border-b-2 border-pink-500'
                    : 'text-gray-400'
                }`}
              >
                {link.label}
              </button>
            ))}

            <button
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors ml-4"
              onClick={() => setView('login')}
            >
              Entrar
            </button>

            <button
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(255,0,80,0.3)] hover:shadow-[0_0_25px_rgba(255,0,80,0.5)]"
              style={{
                background: `linear-gradient(90deg, ${LANDING_COLORS.maityPink}, ${LANDING_COLORS.maityBlue})`,
              }}
              onClick={() => setView('primeros-pasos')}
            >
              Probar Maity Gratis
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#0F0F0F] border-b border-white/10">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  handleNavClick(link);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setView('login');
                setIsOpen(false);
              }}
              className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-white bg-white/10 hover:bg-white/20 mt-4"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
