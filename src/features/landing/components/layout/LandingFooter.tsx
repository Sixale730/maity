interface LandingFooterProps {
  setView: (view: string) => void;
}

export const LandingFooter = ({ setView }: LandingFooterProps) => {
  const handleScrollTo = (viewId: string, sectionId: string) => {
    setView(viewId);
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  return (
    <footer className="bg-black text-white pt-20 pb-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <img
            onClick={() => setView('product')}
            src="/assets/maity-logo-white.png"
            alt="Maity"
            className="h-7 mb-6 cursor-pointer"
          />
          <p className="text-sm text-gray-500 leading-relaxed">
            Transformando el aprendizaje en evolución diaria a través de IA ética y humana.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-gray-200">Producto</h4>
          <ul className="space-y-3 text-sm text-gray-500">
            <li
              onClick={() => setView('primeros-pasos')}
              className="hover:text-pink-500 cursor-pointer transition-colors"
            >
              Dashboard
            </li>
            <li
              onClick={() => setView('primeros-pasos')}
              className="hover:text-pink-500 cursor-pointer transition-colors"
            >
              App Windows
            </li>
            <li
              onClick={() => setView('primeros-pasos')}
              className="hover:text-pink-500 cursor-pointer transition-colors"
            >
              App Móvil
            </li>
            <li
              onClick={() => handleScrollTo('product', 'la-escalada')}
              className="hover:text-pink-500 cursor-pointer transition-colors"
            >
              La Escalada
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-gray-200">Empresa</h4>
          <ul className="space-y-3 text-sm text-gray-500">
            <li
              onClick={() => setView('nosotros')}
              className="hover:text-blue-500 cursor-pointer transition-colors"
            >
              Nosotros
            </li>
            <li
              onClick={() => setView('seguridad')}
              className="hover:text-blue-500 cursor-pointer transition-colors"
            >
              Seguridad
            </li>
            <li
              onClick={() => setView('demo-calendar')}
              className="hover:text-blue-500 cursor-pointer transition-colors"
            >
              Contacto
            </li>
            <li className="hover:text-blue-500 cursor-pointer transition-colors">
              <span
                onClick={() => setView('careers')}
                className="cursor-pointer"
              >
                Trabaja con nosotros
              </span>
            </li>
            <li
              onClick={() => setView('comunidad')}
              className="hover:text-blue-500 cursor-pointer transition-colors"
            >
              Sé Partner
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-gray-200">Recursos</h4>
          <ul className="space-y-3 text-sm text-gray-500">
            <li
              onClick={() => setView('resources')}
              className="hover:text-gray-300 cursor-pointer transition-colors"
            >
              Blog
            </li>
            <li
              onClick={() => setView('resources')}
              className="hover:text-gray-300 cursor-pointer transition-colors"
            >
              Guías
            </li>
            <li
              onClick={() => setView('corporate-quiz')}
              className="hover:text-gray-300 cursor-pointer transition-colors"
            >
              Quiz Corporativo
            </li>
            <li
              onClick={() => handleScrollTo('product', 'faq-section')}
              className="hover:text-gray-300 cursor-pointer transition-colors"
            >
              FAQs
            </li>
            <li
              onClick={() => setView('soporte')}
              className="hover:text-gray-300 cursor-pointer transition-colors"
            >
              Soporte
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-600">
        <p>&copy; 2026 Maity SAPI de CV — Ciudad de México, México</p>
        <div className="flex gap-4">
          <span
            onClick={() => setView('privacidad')}
            className="hover:text-gray-400 cursor-pointer transition-colors"
          >
            Privacidad
          </span>
          <span
            onClick={() => setView('terminos')}
            className="hover:text-gray-400 cursor-pointer transition-colors"
          >
            Términos
          </span>
        </div>
        <div className="flex gap-4">
          <a
            href="https://twitter.com/maityai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 cursor-pointer transition-colors"
          >
            Twitter
          </a>
          <a
            href="https://www.linkedin.com/company/maity-inteligencia-artificial/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 cursor-pointer transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
};
