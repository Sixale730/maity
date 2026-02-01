import { useNavigate } from 'react-router-dom';
import { Mountain, TrendingUp, Activity, Award, Target, Trophy, ArrowRight, Flame } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';
import { VideoCard } from '../shared/VideoCard';
import { LANDING_COLORS } from '../../constants/colors';
import { LANDING_VIDEOS } from '../../constants/videos';

const FEATURES = [
  { icon: TrendingUp, text: 'Niveles desbloqueables que miden tu progreso real' },
  { icon: Activity, text: 'Metricas basadas en conversaciones reales, no tests' },
  { icon: Award, text: 'Insignias y logros que celebran tu evolucion' },
  { icon: Target, text: 'Retos diarios personalizados a tu nivel' },
  { icon: Trophy, text: 'Competencias certificables para tu CV' },
];

const LEVELS = [
  { name: 'Aprendiz', pct: 20, color: '#6b7280' },
  { name: 'Explorador', pct: 40, color: LANDING_COLORS.maityBlue },
  { name: 'Estratega', pct: 60, color: LANDING_COLORS.maityGreen },
  { name: 'Maestro', pct: 80, color: '#ffd93d' },
  { name: 'Leyenda', pct: 100, color: LANDING_COLORS.maityPink },
];

const COMPETENCIES = [
  { name: 'Claridad', pct: 72, color: LANDING_COLORS.maityBlue },
  { name: 'Empatia', pct: 45, color: LANDING_COLORS.maityGreen },
  { name: 'Persuasion', pct: 58, color: '#9b4dca' },
  { name: 'Negociacion', pct: 33, color: '#ff8c42' },
];

export const TheClimb = () => {
  const navigate = useNavigate();
  const video = LANDING_VIDEOS.laEscalada;

  return (
    <section id="la-escalada" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left content */}
          <div>
            <FadeIn>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 mb-6"
                style={{ backgroundColor: `${LANDING_COLORS.maityGreen}10` }}
              >
                <Mountain className="w-4 h-4" style={{ color: LANDING_COLORS.maityGreen }} />
                <span className="text-sm font-medium" style={{ color: LANDING_COLORS.maityGreen }}>
                  Tu Ruta de Crecimiento
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span style={{ color: LANDING_COLORS.textMain }}>Aprender no tiene que ser aburrido. </span>
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${LANDING_COLORS.maityGreen}, ${LANDING_COLORS.maityBlue})`,
                  }}
                >
                  La Escalada lo hace adictivo.
                </span>
              </h2>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="space-y-4 mb-8">
                {FEATURES.map((feat, i) => {
                  const Icon = feat.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <Icon className="w-5 h-5 flex-shrink-0" style={{ color: LANDING_COLORS.maityGreen }} />
                      <span className="text-sm" style={{ color: LANDING_COLORS.textMuted }}>{feat.text}</span>
                    </div>
                  );
                })}
              </div>
            </FadeIn>

            <FadeIn delay={300}>
              <button
                onClick={() => navigate('/primeros-pasos')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-transform hover:scale-105"
                style={{ backgroundColor: LANDING_COLORS.maityGreen }}
              >
                Empieza tu escalada
                <ArrowRight className="w-5 h-5" />
              </button>
            </FadeIn>
          </div>

          {/* Right mockup card */}
          <FadeIn delay={200}>
            <div className="p-6 rounded-2xl border border-white/10" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold" style={{ color: LANDING_COLORS.textMain }}>Tu Progreso</h3>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/10">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-orange-500">7 dias</span>
                </div>
              </div>

              {/* Level bars */}
              <div className="mb-8">
                <p className="text-xs uppercase tracking-wider mb-3" style={{ color: LANDING_COLORS.textMuted }}>Niveles</p>
                <div className="space-y-3">
                  {LEVELS.map((level) => (
                    <div key={level.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium" style={{ color: LANDING_COLORS.textMuted }}>{level.name}</span>
                        <span className="text-xs" style={{ color: level.color }}>{level.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${level.pct}%`, backgroundColor: level.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill competency bars */}
              <div>
                <p className="text-xs uppercase tracking-wider mb-3" style={{ color: LANDING_COLORS.textMuted }}>Competencias</p>
                <div className="space-y-3">
                  {COMPETENCIES.map((comp) => (
                    <div key={comp.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium" style={{ color: LANDING_COLORS.textMuted }}>{comp.name}</span>
                        <span className="text-xs font-bold" style={{ color: comp.color }}>{comp.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${comp.pct}%`, backgroundColor: comp.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Video below */}
        <FadeIn delay={400} className="mt-12 flex justify-center">
          <VideoCard
            title={video.title}
            description={video.description}
            duration={video.duration}
            thumbnailUrl={video.thumbnailUrl}
            videoUrl={video.videoUrl}
          />
        </FadeIn>
      </div>
    </section>
  );
};
