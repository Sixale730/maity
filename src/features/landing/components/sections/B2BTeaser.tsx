import { useNavigate } from 'react-router-dom';
import { Briefcase, Check } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';

export const B2BTeaser = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-gradient-to-b from-[#050505] to-[#0A0A0A] border-t border-white/5">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
            <Briefcase size={16} className="text-blue-500" />
            <span className="text-xs font-bold text-blue-400 uppercase">Soluciones para Empresas</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
            Transforma el desarrollo de tu equipo en sistema operativo diario.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12 text-left">
            {[
              "Acelera curvas de aprendizaje de meses a semanas",
              "Entrenamiento escalable sin carga operativa",
              "Métricas y paneles para decisiones basadas en datos",
              "Seguridad y privacidad de nivel enterprise",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <div className="p-1 bg-blue-500/20 rounded-full mt-0.5">
                  <Check size={14} className="text-blue-400" />
                </div>
                <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/empresas')}
              className="px-10 py-5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
            >
              Conocer solución empresarial
            </button>
            <button
              onClick={() => navigate('/contacto')}
              className="px-10 py-5 bg-white/5 text-white font-bold rounded-full border border-white/10 hover:bg-white/10 transition-all"
            >
              Solicitar demo
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
