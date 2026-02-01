import { TrendingDown, TrendingUp } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';
import { VideoCard } from '../shared/VideoCard';
import { LANDING_COLORS } from '../../constants/colors';
import { LANDING_VIDEOS } from '../../constants/videos';

export const ProblemSection = () => {
  const video = LANDING_VIDEOS.elProblema;

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div>
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: LANDING_COLORS.textMain }}>
                El <span style={{ color: LANDING_COLORS.maityPink }}>70%</span> de lo aprendido se pierde en 24 horas
              </h2>
            </FadeIn>

            <FadeIn delay={100}>
              <div className="border-l-2 pl-6 mb-8" style={{ borderColor: LANDING_COLORS.maityPink }}>
                <p className="text-lg italic" style={{ color: LANDING_COLORS.textMuted }}>
                  "La curva del olvido demuestra que sin refuerzo continuo, la capacitacion tradicional es dinero tirado."
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="space-y-6">
                {/* Traditional */}
                <div className="flex items-start gap-4 p-4 rounded-xl border border-white/5" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: LANDING_COLORS.textMain }}>
                      Cursos Tradicionales
                    </h3>
                    <p className="text-sm" style={{ color: LANDING_COLORS.textMuted }}>
                      Un evento, un PDF, cero seguimiento. El conocimiento se evapora en dias.
                    </p>
                  </div>
                </div>

                {/* Maity method */}
                <div className="flex items-start gap-4 p-4 rounded-xl border border-white/5" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: LANDING_COLORS.textMain }}>
                      Metodo Maity
                    </h3>
                    <p className="text-sm" style={{ color: LANDING_COLORS.textMuted }}>
                      Practica diaria, feedback en tiempo real, retos personalizados. El aprendizaje que se queda.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right chart + video */}
          <div className="space-y-8">
            <FadeIn delay={200}>
              <div className="p-6 rounded-2xl border border-white/5" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
                <svg viewBox="0 0 400 220" className="w-full" aria-label="Forgetting curve comparison chart">
                  <defs>
                    <linearGradient id="maity-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={LANDING_COLORS.maityGreen} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={LANDING_COLORS.maityGreen} stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={`grid-${i}`}
                      x1="40" y1={30 + i * 40} x2="380" y2={30 + i * 40}
                      stroke="rgba(255,255,255,0.05)" strokeWidth="1"
                    />
                  ))}

                  {/* Y-axis labels */}
                  <text x="30" y="35" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end">100%</text>
                  <text x="30" y="115" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end">50%</text>
                  <text x="30" y="195" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end">0%</text>

                  {/* X-axis labels */}
                  <text x="60" y="215" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle">1d</text>
                  <text x="150" y="215" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle">7d</text>
                  <text x="260" y="215" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle">30d</text>
                  <text x="370" y="215" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle">90d</text>

                  {/* Traditional decline curve (dashed gray) */}
                  <path
                    d="M 40 30 Q 100 60, 150 130 Q 200 170, 260 175 Q 320 180, 380 185"
                    fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="6,4"
                  />

                  {/* Maity growth curve with gradient fill */}
                  <path
                    d="M 40 30 Q 100 40, 150 55 Q 200 65, 260 60 Q 320 55, 380 45"
                    fill="url(#maity-gradient)" stroke="none"
                  />
                  <path
                    d="M 40 30 L 40 200 L 380 200 L 380 45 Q 320 55, 260 60 Q 200 65, 150 55 Q 100 40, 40 30"
                    fill="url(#maity-gradient)" stroke="none" opacity="0.3"
                  />
                  <path
                    d="M 40 30 Q 100 40, 150 55 Q 200 65, 260 60 Q 320 55, 380 45"
                    fill="none" stroke={LANDING_COLORS.maityGreen} strokeWidth="2.5"
                  />

                  {/* Pink dot markers on Maity curve */}
                  {[
                    { x: 40, y: 30 }, { x: 150, y: 55 }, { x: 260, y: 60 }, { x: 380, y: 45 },
                  ].map((p, i) => (
                    <circle key={`dot-${i}`} cx={p.x} cy={p.y} r="4" fill={LANDING_COLORS.maityPink} />
                  ))}

                  {/* Legend */}
                  <line x1="50" y1="205" x2="70" y2="205" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4,3" />
                  <text x="75" y="208" fill="rgba(255,255,255,0.4)" fontSize="9">Tradicional</text>
                  <line x1="160" y1="205" x2="180" y2="205" stroke={LANDING_COLORS.maityGreen} strokeWidth="2" />
                  <text x="185" y="208" fill="rgba(255,255,255,0.4)" fontSize="9">Maity</text>
                </svg>
              </div>
            </FadeIn>

            <FadeIn delay={300}>
              <VideoCard
                title={video.title}
                description={video.description}
                duration={video.duration}
                thumbnailUrl={video.thumbnailUrl}
                videoUrl={video.videoUrl}
              />
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
};
