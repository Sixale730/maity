import { COLORS } from '../marketing.constants';

export const Footer = () => (
  <footer className="bg-black text-white pt-20 pb-10 border-t border-white/10">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div>
        <span className="text-2xl font-bold tracking-tighter block mb-6">
          maity<span style={{ color: COLORS.maityPink }}>.</span>
        </span>
        <p className="text-sm text-gray-500 leading-relaxed">
          Transformando el aprendizaje en evolución diaria a través de IA ética y humana.
        </p>
      </div>
      <div>
        <h4 className="font-bold mb-6 text-gray-200">Producto</h4>
        <ul className="space-y-3 text-sm text-gray-500">
          <li className="hover:text-pink-500 cursor-pointer transition-colors">Dashboard</li>
          <li className="hover:text-pink-500 cursor-pointer transition-colors">App Windows</li>
          <li className="hover:text-pink-500 cursor-pointer transition-colors">La Escalada</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6 text-gray-200">Empresa</h4>
        <ul className="space-y-3 text-sm text-gray-500">
          <li className="hover:text-blue-500 cursor-pointer transition-colors">Nosotros</li>
          <li className="hover:text-blue-500 cursor-pointer transition-colors">Seguridad</li>
          <li className="hover:text-blue-500 cursor-pointer transition-colors">Contacto</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6 text-gray-200">Legal</h4>
        <ul className="space-y-3 text-sm text-gray-500">
          <li className="hover:text-gray-300 cursor-pointer transition-colors">Privacidad</li>
          <li className="hover:text-gray-300 cursor-pointer transition-colors">Términos</li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/10 text-center flex justify-between items-center text-xs text-gray-600">
      <p>© 2025 Maity Inc.</p>
      <div className="flex gap-4">
        <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
        <span className="hover:text-white cursor-pointer transition-colors">LinkedIn</span>
      </div>
    </div>
  </footer>
);

export default Footer;
