import { UserCheck, Mic, Brain, Trophy, BarChart2 } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';
import { LANDING_VIDEOS } from '../../constants/videos';
import { FadeIn } from '../shared/FadeIn';
import { VideoCard } from '../shared/VideoCard';

export const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24 bg-[#0A0A0A] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Tu Escalada en 5 Pasos</h2>
            <p className="text-gray-400">Cada conversación es una oportunidad de crecer. Sin fricción. Sin excusas. Sin pausa.</p>
          </FadeIn>
        </div>
        <div className="flex flex-wrap justify-center gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500/0 via-pink-500/30 to-pink-500/0 z-0"></div>

          {[
            {
              icon: <UserCheck size={24} className="text-pink-500" />,
              step: "01",
              title: "Configura tu perfil",
              desc: "Crea tu perfil, define tu rol y elige tu objetivo. Maity personaliza tu ruta de desarrollo."
            },
            {
              icon: <Mic size={24} className="text-blue-500" />,
              step: "02",
              title: "Captura conversaciones",
              desc: "Graba reuniones (Windows) o conversaciones del día a día (móvil + wearable). Solo cuando tú lo eliges."
            },
            {
              icon: <Brain size={24} className="text-purple-500" />,
              step: "03",
              title: "Maity analiza con IA",
              desc: "Dashboard con score general, métricas por habilidad y momentos destacados. Recomendaciones accionables."
            },
            {
              icon: <Trophy size={24} className="text-yellow-500" />,
              step: "04",
              title: "Retos personalizados",
              desc: "Retos diarios de 3-7 minutos. Progresa con XP, racha, insignias y niveles."
            },
            {
              icon: <BarChart2 size={24} className="text-green-500" />,
              step: "05",
              title: "Ve tu evolución",
              desc: "Métricas claras de tu crecimiento. Ve cómo evolucionan tus habilidades semana a semana."
            }
          ].map((item, idx) => (
            <FadeIn key={idx} delay={idx * 150} className="relative z-10 flex flex-col items-center text-center group w-full md:w-1/6">
              <div className="w-20 h-20 rounded-3xl bg-[#141414] border border-white/10 flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
                {item.icon}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-xs font-bold text-gray-500">
                  {item.step}
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 leading-tight">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed px-2">{item.desc}</p>
            </FadeIn>
          ))}
        </div>

        {/* Video: Cómo funciona Maity */}
        <FadeIn delay={400}>
          <div className="max-w-2xl mx-auto mt-16">
            <VideoCard
              title={LANDING_VIDEOS.comoFunciona.title}
              description={LANDING_VIDEOS.comoFunciona.description}
              duration={LANDING_VIDEOS.comoFunciona.duration}
              thumbnailUrl={LANDING_VIDEOS.comoFunciona.thumbnailUrl}
              videoUrl={LANDING_VIDEOS.comoFunciona.videoUrl}
              variant="featured"
              accentColor={LANDING_COLORS.maityBlue}
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
