import { Building2, Check, Award, PieChart } from 'lucide-react';
import { COLORS, type SectionProps } from '../marketing.constants';
import { FadeIn } from '../FadeIn';

export const BusinessHeroSection = ({ setView }: SectionProps) => {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden min-h-screen flex items-center bg-[#050505]">
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div
          className="absolute top-[-20%] left-[-10%] w-[900px] h-[900px] rounded-full opacity-10 blur-[130px]"
          style={{ backgroundColor: COLORS.maityBlue }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-10 blur-[100px]"
          style={{ backgroundColor: COLORS.maityPink }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="z-10">
          <FadeIn delay={100}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 mb-6">
              <Building2 size={14} className="text-blue-400" />
              <span className="text-xs font-bold text-blue-200 tracking-wide uppercase">
                Solución Empresarial
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-8 tracking-tighter text-white">
              Transforma el desarrollo de tu equipo en <br />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(to right, ${COLORS.maityBlue}, ${COLORS.maityGreen})`,
                }}
              >
                sistema operativo diario.
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-lg">
              Escala el coaching de soft skills sin carga operativa. Métricas reales de evolución,
              privacidad Enterprise y ROI medible desde el primer mes.
            </p>

            <ul className="space-y-3 mb-10 text-gray-300">
              <li className="flex items-center gap-3">
                <div className="p-1 bg-green-500/20 rounded-full">
                  <Check size={14} className="text-green-400" />
                </div>
                <span>Acelera curvas de aprendizaje de meses a semanas</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-1 bg-green-500/20 rounded-full">
                  <Check size={14} className="text-green-400" />
                </div>
                <span>Dashboards de liderazgo y cultura en tiempo real</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-1 bg-green-500/20 rounded-full">
                  <Check size={14} className="text-green-400" />
                </div>
                <span>Seguridad SOC2 y control de privacidad total</span>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-5">
              <button
                className="px-8 py-4 rounded text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all transform hover:-translate-y-1 hover:shadow-blue-500/40"
                style={{ backgroundColor: COLORS.maityBlue }}
              >
                Solicitar Demo
              </button>
              <button
                onClick={() => setView('success-stories')}
                className="px-8 py-4 rounded border border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-colors"
              >
                Ver Casos de Éxito
              </button>
            </div>
          </FadeIn>
        </div>

        <div className="relative">
          <FadeIn delay={300}>
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-xl p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <div className="ml-4 px-3 py-1 bg-white/5 rounded text-[10px] text-gray-500 font-mono w-64">
                  maity.com/empresa/dashboard
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#141414] p-4 rounded-lg border border-white/5">
                  <div className="text-xs text-gray-500 mb-1">Evolución del Equipo</div>
                  <div className="text-2xl font-bold text-white mb-2">+24%</div>
                  <div className="h-10 flex items-end gap-1">
                    {[40, 60, 45, 70, 85, 90, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-blue-500/40 rounded-t-sm hover:bg-blue-500 transition-colors"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="bg-[#141414] p-4 rounded-lg border border-white/5">
                  <div className="text-xs text-gray-500 mb-1">Habilidad Top (Mes)</div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={20} className="text-pink-500" />
                    <span className="font-bold text-white">Negociación</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    El departamento de ventas aumentó su score promedio a 8.9/10
                  </div>
                </div>
              </div>

              <div className="bg-[#141414] p-4 rounded-lg border border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase">Actividad Reciente</span>
                  <PieChart size={14} className="text-gray-600" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-700" />
                        <span className="text-gray-300">
                          Equipo {i === 1 ? 'Ventas' : i === 2 ? 'Soporte' : 'Liderazgo'}
                        </span>
                      </div>
                      <span className="text-green-400 font-mono">
                        +{(Math.random() * 5).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default BusinessHeroSection;
