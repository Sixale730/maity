import { useNavigate } from 'react-router-dom';
import { Play, Shield } from 'lucide-react';
import { COLORS } from '../marketing.constants';
import { FadeIn } from '../FadeIn';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-24 overflow-hidden min-h-screen flex items-center">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[#050505]">
        <div
          className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]"
          style={{ backgroundColor: COLORS.maityBlue }}
        />
        <div
          className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full opacity-15 blur-[120px]"
          style={{ backgroundColor: COLORS.maityPink }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="z-10">
          <FadeIn delay={100}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-300 tracking-wide uppercase">
                Para Individuos
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-8 tracking-tighter text-white">
              La evolución no ocurre en un curso. <br />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(to right, ${COLORS.maityPink}, ${COLORS.maityBlue})`,
                }}
              >
                Ocurre en cada conversación.
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-lg">
              Maity es tu coach de soft skills impulsado por IA. Analiza tus reuniones, mide tu
              progreso y te entrena diariamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <button
                onClick={() => navigate('/auth')}
                className="px-8 py-4 rounded text-white font-bold text-lg shadow-xl hover:shadow-pink-500/25 transition-all transform hover:-translate-y-1"
                style={{ backgroundColor: COLORS.maityPink }}
              >
                Empezar Gratis
              </button>
              <button
                className="px-8 py-4 rounded text-white font-bold text-lg hover:brightness-110 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                style={{ backgroundColor: COLORS.maityBlue }}
              >
                <Play size={20} fill="currentColor" /> Ver Demo
              </button>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
              <Shield size={16} style={{ color: COLORS.maityGreen }} />
              <span>Datos 100% privados y encriptados.</span>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={300} className="relative h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-2xl blur-2xl opacity-20 transform rotate-2" />
          <div className="relative bg-[#0F0F0F] rounded-2xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl aspect-video">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/Lx7884l7-z0?controls=0&rel=0"
              title="Maity Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full object-cover"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default HeroSection;
