import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { COLORS, type NavbarProps, type MarketingView } from './marketing.constants';

const navLinks: { id: MarketingView; label: string }[] = [
  { id: 'home', label: 'Individual' },
  { id: 'business', label: 'Empresas' },
  { id: 'pricing', label: 'Precios' },
];

export const Navbar = ({ activeView, setView }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAuthClick = () => {
    navigate('/auth');
  };

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/10 bg-black/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div
            className="flex items-center cursor-pointer gap-2"
            onClick={() => setView('home')}
          >
            <span className="text-3xl font-bold tracking-tighter text-white">
              maity<span style={{ color: COLORS.maityPink }}>.</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setView(link.id)}
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
              onClick={handleAuthClick}
            >
              Entrar
            </button>

            <button
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(255,0,80,0.3)] hover:shadow-[0_0_25px_rgba(255,0,80,0.5)]"
              style={{ background: `linear-gradient(90deg, ${COLORS.maityPink}, ${COLORS.maityBlue})` }}
              onClick={handleAuthClick}
            >
              Prueba Gratis
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
                  setView(link.id);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={handleAuthClick}
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

export default Navbar;
