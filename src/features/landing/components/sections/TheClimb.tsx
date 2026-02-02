import { Mountain, TrendingUp, Zap, Award, Target, Flame } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';
import { LANDING_VIDEOS } from '../../constants/videos';
import { FadeIn } from '../shared/FadeIn';
import { VideoCard } from '../shared/VideoCard';

interface TheClimbProps {
  setView: (view: string) => void;
}

export const TheClimb = ({ setView }: TheClimbProps) => {
  const mountains = [
    { name: "Claridad", emoji: "💎", color: LANDING_COLORS.maityBlue, pct: 72, desc: "Expresión clara y estructurada" },
    { name: "Empatía", emoji: "💚", color: LANDING_COLORS.maityGreen, pct: 45, desc: "Escucha activa y conexión" },
    { name: "Persuasión", emoji: "🔥", color: LANDING_COLORS.maityPink, pct: 58, desc: "Influencia y convicción" },
    { name: "Consultor", emoji: "🧠", color: "#9b4dca", pct: 40, desc: "Asesoría y diagnóstico" },
    { name: "Negociador", emoji: "🤝", color: "#ff8c42", pct: 33, desc: "Acuerdos y resolución" },
    { name: "Servicio", emoji: "⭐", color: "#06b6d4", pct: 25, desc: "Atención al cliente" },
  ];

  const camps = ["Base", "Medio", "Avanzado", "Cumbre", "Boss"];

  return (
    <section id="la-escalada" className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6">
              <Mountain size={14} className="text-pink-500" />
              <span className="text-xs font-bold text-pink-200 tracking-wide uppercase">La Escalada — 6 Montañas</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Conquista cada <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${LANDING_COLORS.maityPink}, ${LANDING_COLORS.maityBlue})` }}>montaña de comunicación</span></h2>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
              Cada habilidad es una montaña con 5 campamentos. Avanza con práctica real, supera boss fights y desbloquea equipamiento mientras dominas la comunicación.
            </p>
            <ul className="space-y-5 text-gray-300">
              {[
                { t: "6 montañas temáticas", d: "Claridad, Empatía, Persuasión, Consultor, Negociador y Servicio.", i: <Mountain size={18} className="text-pink-500" /> },
                { t: "5 campamentos por montaña", d: "Base → Medio → Avanzado → Cumbre → Boss Fight final.", i: <TrendingUp size={18} className="text-green-500" /> },
                { t: "Boss Fights", d: "Desafíos de roleplay intensivo al final de cada campamento.", i: <Zap size={18} className="text-orange-500" /> },
                { t: "Equipamiento y XP", d: "Gana experiencia, desbloquea insignias y herramientas por cada logro.", i: <Award size={18} className="text-blue-500" /> },
                { t: "Competencias certificables", d: "Cada montaña mide una competencia específica con progreso visible.", i: <Target size={18} className="text-purple-500" /> }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">{item.i}</div>
                  <div>
                    <h4 className="font-bold text-white">{item.t}</h4>
                    <p className="text-sm text-gray-500">{item.d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setView('primeros-pasos')}
              className="mt-10 px-8 py-4 rounded-full text-white font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2"
              style={{ backgroundColor: LANDING_COLORS.maityPink }}
            >
              <Mountain size={18} /> Empieza tu escalada
            </button>
          </FadeIn>

          <FadeIn delay={200} className="relative">
            <div className="bg-[#0F0F0F] rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Tu expedición</p>
                  <h3 className="text-2xl font-bold text-white">6 Montañas</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Progreso global</p>
                  <p className="text-sm font-bold text-pink-400">45% completado</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {mountains.map((m, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/15 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{m.emoji}</span>
                      <span className="text-sm font-bold text-white">{m.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mb-2">{m.desc}</p>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-1">
                      <div className="h-full rounded-full transition-all" style={{ width: `${m.pct}%`, backgroundColor: m.color }}></div>
                    </div>
                    <p className="text-[10px] text-gray-600 text-right">{m.pct}%</p>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Campamentos — Montaña de Claridad</p>
                <div className="flex items-center gap-1">
                  {camps.map((camp, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className={`w-full h-2 rounded-full transition-all ${i < 3 ? '' : 'bg-gray-800'}`} style={i < 3 ? { backgroundColor: LANDING_COLORS.maityBlue } : {}}></div>
                      <span className={`text-[9px] font-bold ${i < 3 ? 'text-gray-300' : 'text-gray-700'}`}>{camp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Flame size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Racha activa: 7 días</p>
                  <p className="text-xs text-gray-500">Tu mejor racha: 14 días</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="mt-12 max-w-xl mx-auto">
          <VideoCard
            title={LANDING_VIDEOS.laEscalada.title}
            description={LANDING_VIDEOS.laEscalada.description}
            duration={LANDING_VIDEOS.laEscalada.duration}
            thumbnailUrl={LANDING_VIDEOS.laEscalada.thumbnailUrl}
            videoUrl={LANDING_VIDEOS.laEscalada.videoUrl}
            variant="inline"
            accentColor={LANDING_COLORS.maityGreen}
          />
        </div>
      </div>
    </section>
  );
};
