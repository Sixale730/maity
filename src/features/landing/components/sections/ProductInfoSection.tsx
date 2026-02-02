import { Mic, Activity, Zap, TrendingUp, BarChart2, Brain } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';
import { FadeIn } from '../shared/FadeIn';

export const ProductInfoSection = () => {
  const features = [
    {
      icon: <Mic className="text-white" size={24} />,
      title: "Escucha Real",
      desc: "Escucha conversaciones reales (con consentimiento explícito) para un análisis genuino."
    },
    {
      icon: <Activity className="text-white" size={24} />,
      title: "Detecta Patrones",
      desc: "Detecta patrones y mide la evolución de tus habilidades de comunicación."
    },
    {
      icon: <Zap className="text-white" size={24} />,
      title: "Retos Diarios",
      desc: "Entrena activamente mediante retos gamificados diarios personalizados."
    },
    {
      icon: <TrendingUp className="text-white" size={24} />,
      title: "Progreso Visible",
      desc: "Genera progreso visible y motivante para mantener el compromiso."
    },
    {
      icon: <BarChart2 className="text-white" size={24} />,
      title: "Dashboards",
      desc: "Ofrece dashboards detallados tanto para personas como para organizaciones completas."
    }
  ];

  return (
    <section className="py-24 bg-[#0A0A0A] border-t border-white/5 relative overflow-hidden">
      <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <span className="text-sm font-bold tracking-widest uppercase mb-4 block" style={{ color: LANDING_COLORS.maityPink }}>
                1.1 Definición
              </span>
              <h2 className="text-4xl font-bold text-white mb-6">¿Qué es Maity?</h2>
              <div className="prose prose-invert prose-lg text-gray-400">
                <p className="leading-relaxed">
                  Maity es un <span className="text-white font-medium">coach de soft skills impulsado por IA</span> que transforma conversaciones reales en entrenamiento medible y gamificado.
                </p>
                <p className="leading-relaxed mt-4">
                  A diferencia de herramientas que solo graban y resumen, Maity <span className="text-white font-medium">entrena activamente</span> habilidades de comunicación, venta, liderazgo y servicio, convirtiendo cada interacción en una oportunidad de crecimiento.
                </p>
              </div>

              <div className="mt-8 p-6 bg-[#0F0F0F] rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-full" style={{ backgroundColor: `${LANDING_COLORS.maityPink}20` }}>
                  <Brain size={32} style={{ color: LANDING_COLORS.maityPink }} />
                </div>
                <div>
                  <h4 className="font-bold text-white">IA Coach Personal</h4>
                  <p className="text-sm text-gray-500">Entrenamiento 24/7 adaptado a ti</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <span className="text-sm font-bold tracking-widest uppercase mb-4 block" style={{ color: LANDING_COLORS.maityPink }}>
              1.2 Propuesta de Valor Única
            </span>
            <h2 className="text-3xl font-bold text-white mb-10">Más allá de la transcripción</h2>

            <div className="grid gap-6">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="group flex items-start gap-6 p-6 rounded-2xl bg-[#0F0F0F] border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/10"
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: LANDING_COLORS.maityPink }}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 transition-colors group-hover:text-pink-500">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
