import { DollarSign, Users, Target, Shield, Heart, Briefcase, Mic, Play } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';
import { FadeIn } from '../shared/FadeIn';
import { VideoCard } from '../shared/VideoCard';

interface ScenariosSectionProps {
  setView: (view: string) => void;
}

export const ScenariosSection = ({ setView }: ScenariosSectionProps) => {
  const scenarios = [
    {
      icon: <DollarSign size={22} />,
      skill: "Negociación",
      title: "Cierre de venta con objeciones de precio",
      desc: "El cliente dice que es muy caro. Practica cómo defender tu propuesta de valor sin ceder en precio.",
      color: "text-pink-500",
      bg: "bg-pink-500/10"
    },
    {
      icon: <Users size={22} />,
      skill: "Liderazgo",
      title: "Retroalimentación a un colaborador difícil",
      desc: "Tu mejor talento tiene actitud negativa. Practica cómo dar feedback directo sin perder al empleado.",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: <Target size={22} />,
      skill: "Presentación",
      title: "Pitch de producto ante directivos",
      desc: "Tienes 5 minutos frente al comité. Practica cómo presentar resultados y pedir presupuesto con confianza.",
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      icon: <Shield size={22} />,
      skill: "Manejo de objeciones",
      title: "Cliente que quiere cancelar el contrato",
      desc: "Tu cliente más importante amenaza con irse. Practica retención con empatía y soluciones concretas.",
      color: "text-yellow-500",
      bg: "bg-yellow-500/10"
    },
    {
      icon: <Heart size={22} />,
      skill: "Empatía",
      title: "Comunicar malas noticias al equipo",
      desc: "Hay recortes de presupuesto. Practica cómo comunicar con transparencia sin destruir la moral.",
      color: "text-red-500",
      bg: "bg-red-500/10"
    },
    {
      icon: <Briefcase size={22} />,
      skill: "Confianza",
      title: "Primera reunión con un prospecto enterprise",
      desc: "No te conocen y son escépticos. Practica cómo generar credibilidad y confianza en los primeros 3 minutos.",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
  ];

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[150px]"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <FadeIn>
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-xs font-bold text-blue-400 border border-blue-500/20 mb-6">
              <Mic size={14} /> Conversaciones simuladas con IA
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Escenarios que <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">transforman habilidades</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Tu equipo practica conversaciones reales con un agente de IA que responde, desafía y evalúa. Después de cada sesión, reciben feedback detallado sobre qué mejorar y cómo hacerlo.
            </p>
          </div>
        </FadeIn>

        <VideoCard
          title="Escenarios en Acción"
          description="Mira cómo funciona una sesión de práctica con IA"
          duration="2:00"
          videoUrl="https://youtu.be/gCfLZJHGfjU"
          variant="featured"
          accentColor={LANDING_COLORS.maityBlue}
        />

        <FadeIn delay={200}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-16 mb-16">
            {[
              { step: "1", label: "Elige un escenario", detail: "Selecciona la situación que quieres practicar" },
              { step: "2", label: "Conversa con la IA", detail: "El agente responde en tiempo real como lo haría un interlocutor real" },
              { step: "3", label: "Recibe feedback", detail: "Evaluación detallada de claridad, empatía, persuasión y estructura" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                {i > 0 && <div className="hidden md:block w-12 h-px bg-white/10"></div>}
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-white text-lg" style={{ background: `linear-gradient(135deg, ${LANDING_COLORS.maityBlue}, ${LANDING_COLORS.maityGreen})` }}>
                    {s.step}
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">{s.label}</h4>
                  <p className="text-xs text-gray-500 max-w-[180px]">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((sc, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div className="bg-[#0F0F0F] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all group h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center ${sc.color}`}>{sc.icon}</div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${sc.color}`}>{sc.skill}</span>
                </div>
                <h3 className="font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{sc.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-grow">{sc.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={500}>
          <div className="text-center mt-16">
            <p className="text-gray-400 text-sm mb-6">Cada escenario es personalizable. Crea los tuyos propios para tu industria y equipo.</p>
            <button
              onClick={() => setView('demo-calendar')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white hover:opacity-90 transition-all"
              style={{ background: `linear-gradient(90deg, ${LANDING_COLORS.maityBlue}, ${LANDING_COLORS.maityGreen})` }}
            >
              <Play size={18} /> Ver Demo de Escenarios
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
