import { Play, Smartphone } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';

const testimonials = [
  { id: 1, user: "Ana G.", role: "Gerente de Ventas", color: "bg-blue-500", text: "Maity me ayudó a cerrar un 20% más." },
  { id: 2, user: "David L.", role: "Freelancer", color: "bg-pink-500", text: "La IA es brutalmente honesta. Me encanta." },
  { id: 3, user: "Sofia M.", role: "Líder de Equipo", color: "bg-green-500", text: "Mis reuniones ahora duran la mitad." },
  { id: 4, user: "Jorge R.", role: "Consultor", color: "bg-purple-500", text: "Es como tener un coach 24/7." },
];

export const VideoTestimonials = () => (
  <section className="py-24 bg-[#0F0F0F] border-t border-white/5 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 bg-pink-500/10 rounded-full mb-4">
          <Smartphone size={20} className="text-pink-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Historias Reales</h2>
        <p className="text-gray-400">Mira cómo Maity está transformando carreras.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {testimonials.map((t, idx) => (
          <FadeIn key={idx} delay={idx * 100}>
            <div className="aspect-[9/16] rounded-2xl bg-[#1A1A1A] relative group cursor-pointer overflow-hidden border border-white/10 hover:border-white/30 transition-all">
              <div className={`absolute inset-0 opacity-20 ${t.color}`}></div>
              <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black via-transparent to-transparent">
                <div className="mb-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                    <Play size={16} className="text-white ml-1" fill="currentColor" />
                  </div>
                </div>
                <p className="text-white text-sm font-bold leading-tight mb-1">"{t.text}"</p>
                <div className="text-xs text-gray-400">{t.user} &bull; {t.role}</div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);
