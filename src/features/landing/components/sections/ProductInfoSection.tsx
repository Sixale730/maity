import { Brain, Mic, Activity, Zap, TrendingUp, BarChart2 } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';
import { LANDING_COLORS } from '../../constants/colors';

const FEATURES = [
  {
    icon: Mic,
    title: 'Escucha Real',
    description: 'Se conecta a tus llamadas reales en Zoom, Meet y Teams para analizar tu comunicacion en contexto.',
  },
  {
    icon: Activity,
    title: 'Detecta Patrones',
    description: 'Identifica tus fortalezas y areas de mejora analizando multiples conversaciones a lo largo del tiempo.',
  },
  {
    icon: Zap,
    title: 'Retos Diarios',
    description: 'Micro-retos personalizados basados en tus patrones reales. Mejora sin esfuerzo extra cada dia.',
  },
  {
    icon: TrendingUp,
    title: 'Progreso Visible',
    description: 'Metricas claras que demuestran tu evolucion semana a semana con datos concretos.',
  },
  {
    icon: BarChart2,
    title: 'Dashboards',
    description: 'Visualiza tu progreso con graficos intuitivos, niveles y competencias certificables.',
  },
];

export const ProductInfoSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left sticky sidebar */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: LANDING_COLORS.textMain }}>
                Que es Maity?
              </h2>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: LANDING_COLORS.textMuted }}>
                Maity es tu entrenador de comunicacion con IA. Escucha tus conversaciones reales, detecta
                patrones y te da feedback tactico para que cada interaccion sea mejor que la anterior.
              </p>

              <div
                className="p-6 rounded-2xl border border-white/10"
                style={{ backgroundColor: LANDING_COLORS.bgCard }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${LANDING_COLORS.maityPink}15` }}
                >
                  <Brain className="w-7 h-7" style={{ color: LANDING_COLORS.maityPink }} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: LANDING_COLORS.textMuted }}>
                  No es otro chatbot. Maity analiza tus conversaciones reales y genera feedback accionable
                  basado en 6 competencias de comunicacion respaldadas por investigacion.
                </p>
              </div>
            </FadeIn>
          </div>

          {/* Right feature cards */}
          <div className="lg:col-span-7 space-y-4">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <FadeIn key={feature.title} delay={index * 100}>
                  <div
                    className="p-6 rounded-2xl border border-white/5 hover:border-white/15 transition-all group"
                    style={{ backgroundColor: LANDING_COLORS.bgCard }}
                  >
                    <div className="flex items-start gap-5">
                      <div
                        className="p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${LANDING_COLORS.maityPink}15` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: LANDING_COLORS.maityPink }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1" style={{ color: LANDING_COLORS.textMain }}>
                          {feature.title}
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: LANDING_COLORS.textMuted }}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
