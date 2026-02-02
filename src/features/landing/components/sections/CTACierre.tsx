import { LANDING_COLORS } from '../../constants/colors';
import { FadeIn } from '../shared/FadeIn';

interface CTACierreProps {
  setView: (view: string) => void;
}

export const CTACierre = ({ setView }: CTACierreProps) => (
  <section className="py-24 bg-gradient-to-b from-[#050505] to-black relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[150px]" style={{ backgroundColor: LANDING_COLORS.maityPink }}></div>
    </div>
    <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
      <FadeIn>
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          Empieza a evolucionar hoy.
        </h2>
        <p className="text-xl text-gray-400 mb-10 leading-relaxed">
          7 días gratis. Sin compromiso. Con resultados desde la primera semana.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setView('primeros-pasos')}
            className="px-10 py-5 rounded-full text-white font-bold text-lg shadow-2xl hover:scale-105 transition-all"
            style={{ backgroundColor: LANDING_COLORS.maityPink }}
          >
            Probar Maity Gratis
          </button>
          <button
            onClick={() => setView('demo-calendar')}
            className="px-10 py-5 rounded-full border border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-all"
          >
            Hablar con ventas
          </button>
        </div>
      </FadeIn>
    </div>
  </section>
);
