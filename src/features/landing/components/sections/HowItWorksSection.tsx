import { User, Mic, Brain, Target, TrendingUp } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';
import { VideoCard } from '../shared/VideoCard';
import { LANDING_COLORS } from '../../constants/colors';
import { LANDING_VIDEOS } from '../../constants/videos';

const STEPS = [
  {
    icon: User,
    title: 'Configura tu perfil',
    description: 'Define tu rol, industria y objetivos de comunicacion. Maity personaliza todo desde el primer momento.',
  },
  {
    icon: Mic,
    title: 'Captura tus conversaciones',
    description: 'Conecta tus llamadas de Zoom, Meet o Teams. Maity escucha (con tu permiso) y analiza en tiempo real.',
  },
  {
    icon: Brain,
    title: 'La IA analiza',
    description: 'Recibe feedback tactico inmediato: que hiciste bien, que puedes mejorar y como hacerlo.',
  },
  {
    icon: Target,
    title: 'Retos personalizados',
    description: 'Cada dia, micro-retos basados en tus patrones reales. Practica con escenarios de IA que simulan situaciones reales.',
  },
  {
    icon: TrendingUp,
    title: 'Ve tu evolucion',
    description: 'Dashboards claros, niveles desbloqueables y metricas que demuestran tu progreso semana a semana.',
  },
];

export const HowItWorksSection = () => {
  const video = LANDING_VIDEOS.comoFunciona;

  return (
    <section id="como-funciona" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: LANDING_COLORS.textMain }}>
              Como funciona
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: LANDING_COLORS.textMuted }}>
              5 pasos simples para transformar tu comunicacion
            </p>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Steps */}
          <div className="relative">
            {/* Vertical connecting line */}
            <div
              className="absolute left-6 top-8 bottom-8 w-px"
              style={{ background: `linear-gradient(to bottom, ${LANDING_COLORS.maityPink}, ${LANDING_COLORS.maityBlue}, ${LANDING_COLORS.maityGreen})` }}
            />

            <div className="space-y-8">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <FadeIn key={step.title} delay={index * 100}>
                    <div className="flex items-start gap-6 relative">
                      {/* Step number + icon */}
                      <div className="relative z-10 flex-shrink-0">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10"
                          style={{ backgroundColor: LANDING_COLORS.bgCard }}
                        >
                          <Icon className="w-5 h-5" style={{ color: LANDING_COLORS.maityPink }} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pt-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${LANDING_COLORS.maityPink}20`, color: LANDING_COLORS.maityPink }}
                          >
                            {index + 1}
                          </span>
                          <h3 className="font-semibold text-lg" style={{ color: LANDING_COLORS.textMain }}>
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: LANDING_COLORS.textMuted }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>

          {/* Video */}
          <FadeIn delay={300} className="flex justify-center lg:sticky lg:top-24">
            <VideoCard
              title={video.title}
              description={video.description}
              duration={video.duration}
              thumbnailUrl={video.thumbnailUrl}
              videoUrl={video.videoUrl}
              variant="featured"
            />
          </FadeIn>
        </div>
      </div>
    </section>
  );
};
