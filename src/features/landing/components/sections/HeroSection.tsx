import { useState } from 'react';
import { Download, Play, Mic } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';
import { LANDING_VIDEOS } from '../../constants/videos';
import { FadeIn } from '../shared/FadeIn';
import { VideoCard } from '../shared/VideoCard';
import { getRecorderUrl } from '@/lib/subdomain';

interface HeroSectionProps {
  setView: (view: string) => void;
}

export const HeroSection = ({ setView }: HeroSectionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [analysis, setAnalysis] = useState<{ tone: string; speed: string; suggestion: string } | null>(null);

  const handleMicClick = () => {
    if (isRecording) return;
    setIsRecording(true);
    setAnalysis(null);
    setTimeout(() => {
      setIsRecording(false);
      setAnalysis({ tone: 'Seguro', speed: 'Óptima', suggestion: 'Buen uso de pausas.' });
    }, 3000);
  };

  return (
    <section className="relative pt-32 pb-24 overflow-hidden min-h-screen flex items-center">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[#050505]">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full opacity-20 blur-[120px]" style={{ backgroundColor: LANDING_COLORS.maityBlue }}></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full opacity-15 blur-[120px]" style={{ backgroundColor: LANDING_COLORS.maityPink }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="z-10">
          <FadeIn delay={100}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
              <span className="text-xs font-bold text-gray-300 tracking-wide uppercase">Para Personas</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[0.95] mb-8 tracking-tighter text-white font-geist">
              La evolución no ocurre en un curso. <br /> <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${LANDING_COLORS.maityPink}, ${LANDING_COLORS.maityBlue}, ${LANDING_COLORS.maityGreen})` }}>Ocurre en cada conversación.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-xl">
              Maity te acompaña en tus conversaciones reales, analiza tus habilidades de comunicación y te entrena con retos para vender, persuadir, conectar y liderar mejor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              <button
                onClick={() => setView('primeros-pasos')}
                className="px-8 py-4 rounded-full text-white font-bold text-lg shadow-2xl hover:scale-105 transition-all flex items-center gap-3 justify-center"
                style={{ backgroundColor: LANDING_COLORS.maityPink }}
              >
                <Download size={20} /> Empieza a entrenar gratis
              </button>
              <button
                onClick={() => {
                  document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 rounded-full border border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <Play size={20} fill="currentColor" /> Ver cómo funciona
              </button>
              <a
                href={getRecorderUrl()}
                className="px-8 py-4 rounded-full text-white font-bold text-lg hover:scale-105 transition-all flex items-center gap-3 justify-center"
                style={{ background: `linear-gradient(135deg, ${LANDING_COLORS.maityBlue}, ${LANDING_COLORS.maityGreen})` }}
              >
                <Mic size={20} /> Grabar en navegador
              </a>
            </div>
            <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
              <span>Sin tarjeta de crédito</span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span>7 días gratis</span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span>Control total de tus datos</span>
            </div>

            <div className="mt-16 pt-8 border-t border-white/5">
              <p className="text-[10px] uppercase font-bold text-gray-600 tracking-[0.2em] mb-4">Líderes de alto rendimiento en:</p>
              <div className="flex flex-wrap gap-8 opacity-30 grayscale contrast-125">
                <span className="text-xl font-bold tracking-tighter">UBER</span>
                <span className="text-xl font-bold font-serif italic">SoftBank</span>
                <span className="text-xl font-bold tracking-widest">ORACLE</span>
                <span className="text-xl font-bold">Globant</span>
              </div>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={300} className="relative">
          <VideoCard
            title={LANDING_VIDEOS.queEsMaity.title}
            description={LANDING_VIDEOS.queEsMaity.description}
            duration={LANDING_VIDEOS.queEsMaity.duration}
            thumbnailUrl={LANDING_VIDEOS.queEsMaity.thumbnailUrl}
            videoUrl={LANDING_VIDEOS.queEsMaity.videoUrl}
            variant="featured"
            accentColor={LANDING_COLORS.maityPink}
          />
        </FadeIn>
      </div>
    </section>
  );
};
