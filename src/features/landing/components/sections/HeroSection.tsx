import { useNavigate } from 'react-router-dom';
import { Download, ArrowRight } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';
import { VideoCard } from '../shared/VideoCard';
import { LANDING_COLORS } from '../../constants/colors';
import { LANDING_VIDEOS } from '../../constants/videos';

const TRUST_LOGOS = ['UBER', 'SoftBank', 'ORACLE', 'Globant'];

export const HeroSection = () => {
  const navigate = useNavigate();
  const video = LANDING_VIDEOS.queEsMaity;

  const scrollToHowItWorks = () => {
    const el = document.getElementById('como-funciona');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16">
      {/* Background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[160px] opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${LANDING_COLORS.maityPink}, ${LANDING_COLORS.maityBlue}, transparent)` }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <FadeIn>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8">
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: LANDING_COLORS.maityPink }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: LANDING_COLORS.maityPink }}
                  />
                </span>
                <span className="text-sm font-medium" style={{ color: LANDING_COLORS.textMuted }}>
                  Para Personas
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span style={{ color: LANDING_COLORS.textMain }}>La evolución no ocurre en un curso. </span>
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${LANDING_COLORS.maityPink}, ${LANDING_COLORS.maityBlue}, ${LANDING_COLORS.maityGreen})`,
                  }}
                >
                  Ocurre en cada conversación.
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={200}>
              <p className="text-lg mb-8 max-w-lg" style={{ color: LANDING_COLORS.textMuted }}>
                Maity escucha tus conversaciones reales, detecta patrones y te entrena con IA para que cada interacción sea mejor que la anterior.
              </p>
            </FadeIn>

            <FadeIn delay={300}>
              <div className="flex flex-wrap gap-4 mb-12">
                <button
                  onClick={() => navigate('/primeros-pasos')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-transform hover:scale-105"
                  style={{ backgroundColor: LANDING_COLORS.maityPink }}
                >
                  <Download className="w-5 h-5" />
                  Empieza a entrenar gratis
                </button>
                <button
                  onClick={scrollToHowItWorks}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/20 text-white hover:bg-white/5 transition-colors"
                >
                  Ver como funciona
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </FadeIn>

            {/* Trust bar */}
            <FadeIn delay={400}>
              <div>
                <p className="text-xs uppercase tracking-wider mb-4" style={{ color: LANDING_COLORS.textMuted }}>
                  Equipos que ya confian en Maity
                </p>
                <div className="flex items-center gap-8 flex-wrap">
                  {TRUST_LOGOS.map((logo) => (
                    <span
                      key={logo}
                      className="text-lg font-bold opacity-40 hover:opacity-70 transition-opacity"
                      style={{ color: LANDING_COLORS.textMain }}
                    >
                      {logo}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right video */}
          <FadeIn delay={300} className="flex justify-center">
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
