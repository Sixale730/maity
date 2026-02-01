import { useNavigate } from 'react-router-dom';
import { Building2, Check, ArrowRight, TrendingUp, Award, Users } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';
import { VideoCard } from '../shared/VideoCard';
import { LANDING_COLORS } from '../../constants/colors';
import { LANDING_VIDEOS } from '../../constants/videos';

const CHECKS = [
  'Acelera curvas de aprendizaje de tu equipo',
  'Dashboards en tiempo real para lideres',
  'Seguridad SOC2 y cumplimiento normativo',
];

const RECENT_ACTIVITY = [
  { name: 'Maria L.', action: 'Completo roleplay de negociacion', time: 'Hace 2h' },
  { name: 'Carlos R.', action: 'Subio a nivel Estratega', time: 'Hace 4h' },
  { name: 'Ana G.', action: 'Nuevo record: 8 dias de racha', time: 'Hace 6h' },
];

export const BusinessHeroSection = () => {
  const navigate = useNavigate();
  const video = LANDING_VIDEOS.empresa;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16">
      {/* Background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[160px] opacity-15 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${LANDING_COLORS.maityBlue}, ${LANDING_COLORS.maityGreen}, transparent)` }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <FadeIn>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 mb-8"
                style={{ backgroundColor: `${LANDING_COLORS.maityBlue}10` }}
              >
                <Building2 className="w-4 h-4" style={{ color: LANDING_COLORS.maityBlue }} />
                <span className="text-sm font-medium" style={{ color: LANDING_COLORS.maityBlue }}>
                  Para Empresas
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span style={{ color: LANDING_COLORS.textMain }}>Transforma la comunicacion de </span>
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${LANDING_COLORS.maityBlue}, ${LANDING_COLORS.maityGreen})`,
                  }}
                >
                  todo tu equipo.
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="space-y-3 mb-8">
                {CHECKS.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: LANDING_COLORS.maityGreen }} />
                    <span style={{ color: LANDING_COLORS.textMuted }}>{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={300}>
              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  onClick={() => navigate('/contacto')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-transform hover:scale-105"
                  style={{ backgroundColor: LANDING_COLORS.maityBlue }}
                >
                  Solicitar Demo
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('casos-exito');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/20 text-white hover:bg-white/5 transition-colors"
                >
                  Ver Casos de Exito
                </button>
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <VideoCard
                title={video.title}
                description={video.description}
                duration={video.duration}
                thumbnailUrl={video.thumbnailUrl}
                videoUrl={video.videoUrl}
              />
            </FadeIn>
          </div>

          {/* Right mock dashboard */}
          <FadeIn delay={300}>
            <div className="p-6 rounded-2xl border border-white/10" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold" style={{ color: LANDING_COLORS.textMain }}>Dashboard de Equipo</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">En vivo</span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4" style={{ color: LANDING_COLORS.maityGreen }} />
                    <span className="text-xs" style={{ color: LANDING_COLORS.textMuted }}>Evolucion de equipo</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: LANDING_COLORS.maityGreen }}>+24%</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4" style={{ color: LANDING_COLORS.maityBlue }} />
                    <span className="text-xs" style={{ color: LANDING_COLORS.textMuted }}>Skill del mes</span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: LANDING_COLORS.textMain }}>Negociacion</p>
                </div>
              </div>

              {/* Recent activity */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" style={{ color: LANDING_COLORS.textMuted }} />
                  <span className="text-xs uppercase tracking-wider" style={{ color: LANDING_COLORS.textMuted }}>
                    Actividad reciente
                  </span>
                </div>
                <div className="space-y-3">
                  {RECENT_ACTIVITY.map((item) => (
                    <div key={item.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm font-medium" style={{ color: LANDING_COLORS.textMain }}>{item.name}</p>
                        <p className="text-xs" style={{ color: LANDING_COLORS.textMuted }}>{item.action}</p>
                      </div>
                      <span className="text-xs" style={{ color: LANDING_COLORS.textMuted }}>{item.time}</span>
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
