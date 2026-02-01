import { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';

interface NavLink {
  label: string;
  to: string;
  scrollTo?: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Producto', to: '/' },
  { label: 'Como Funciona', to: '/', scrollTo: 'como-funciona' },
  { label: 'La Escalada', to: '/', scrollTo: 'la-escalada' },
  { label: 'Empresas', to: '/empresas' },
  { label: 'Precios', to: '/precios' },
  { label: 'Conocenos', to: '/contacto' },
];

export const LandingNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = useCallback(
    (link: NavLink) => {
      setMobileOpen(false);

      if (link.scrollTo) {
        if (location.pathname === '/' || location.pathname === '') {
          const el = document.getElementById(link.scrollTo);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            return;
          }
        }
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(link.scrollTo!);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        if (location.pathname === link.to) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          navigate(link.to);
        }
      }
    },
    [location.pathname, navigate]
  );

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/assets/maity-logo-color.png"
              alt="Maity"
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavClick(link)}
                className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: LANDING_COLORS.textMuted }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/auth"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:text-white"
              style={{ color: LANDING_COLORS.textMuted }}
            >
              Entrar
            </Link>
            <Link
              to="/primeros-pasos"
              className="text-sm font-semibold px-5 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${LANDING_COLORS.maityPink}, ${LANDING_COLORS.maityBlue})`,
              }}
            >
              Probar Maity Gratis
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-white"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label={mobileOpen ? 'Cerrar menu' : 'Abrir menu'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-white/10 backdrop-blur-md"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
        >
          <div className="px-4 py-4 space-y-2">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavClick(link)}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                style={{ color: LANDING_COLORS.textMuted }}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium"
                style={{ color: LANDING_COLORS.textMuted }}
              >
                Entrar
              </Link>
              <Link
                to="/primeros-pasos"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{
                  background: `linear-gradient(135deg, ${LANDING_COLORS.maityPink}, ${LANDING_COLORS.maityBlue})`,
                }}
              >
                Probar Maity Gratis
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
