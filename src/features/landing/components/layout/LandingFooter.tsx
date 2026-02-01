import { Link } from 'react-router-dom';
import { Twitter, Linkedin } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';

interface FooterLinkItem {
  label: string;
  to: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLinkItem[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Producto',
    links: [
      { label: 'Como Funciona', to: '/#como-funciona' },
      { label: 'La Escalada', to: '/#la-escalada' },
      { label: 'Precios', to: '/precios' },
      { label: 'Quiz', to: '/quiz' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Nosotros', to: '/nosotros' },
      { label: 'Carreras', to: '/carreras' },
      { label: 'Soporte', to: '/soporte' },
      { label: 'Conocenos', to: '/contacto' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Blog', to: '/recursos' },
      { label: 'Primeros Pasos', to: '/primeros-pasos' },
      { label: 'Casos de Exito', to: '/casos-de-exito' },
      { label: 'Comunidad', to: '/nosotros' },
    ],
  },
];

interface SocialLink {
  label: string;
  href: string;
  icon: typeof Twitter;
}

const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Twitter', href: 'https://twitter.com/maityapp', icon: Twitter },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/maity', icon: Linkedin },
];

export const LandingFooter = () => {
  return (
    <footer
      className="border-t border-white/10"
      style={{ backgroundColor: LANDING_COLORS.bgDark }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="/assets/maity-logo-color.png"
                alt="Maity"
                className="h-8 w-auto"
              />
            </Link>
            <p
              className="text-sm leading-relaxed"
              style={{ color: LANDING_COLORS.textMuted }}
            >
              Tu coach de soft skills con IA
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map(col => (
            <div key={col.title}>
              <h4
                className="text-sm font-semibold mb-4"
                style={{ color: LANDING_COLORS.textMain }}
              >
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm transition-colors hover:text-white"
                        style={{ color: LANDING_COLORS.textMuted }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-sm transition-colors hover:text-white"
                        style={{ color: LANDING_COLORS.textMuted }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p
              className="text-xs"
              style={{ color: LANDING_COLORS.textMuted }}
            >
              &copy; 2026 Maity. Todos los derechos reservados.
            </p>

            <div className="flex items-center gap-6">
              <Link
                to="/privacidad"
                className="text-xs transition-colors hover:text-white"
                style={{ color: LANDING_COLORS.textMuted }}
              >
                Privacidad
              </Link>
              <Link
                to="/terminos"
                className="text-xs transition-colors hover:text-white"
                style={{ color: LANDING_COLORS.textMuted }}
              >
                Terminos
              </Link>

              {/* Social links */}
              {SOCIAL_LINKS.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                  style={{ color: LANDING_COLORS.textMuted }}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
