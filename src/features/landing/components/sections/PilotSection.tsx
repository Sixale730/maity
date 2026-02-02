import { Zap, Users, Activity, BarChart2, Shield, Check, Calendar } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';
import { FadeIn } from '../shared/FadeIn';
import type { ReactNode } from 'react';

interface PilotSectionProps {
  setView: (view: string) => void;
}

interface Step {
  step: string;
  title: string;
  desc: string;
  icon: ReactNode;
  color: string;
}

export const PilotSection = ({ setView }: PilotSectionProps) => {
  const steps: Step[] = [
    {
      step: '01',
      title: 'Configuracion',
      desc: 'Setup gratuito. Definimos objetivos y escenarios con tu equipo.',
      icon: <Zap size={20} />,
      color: LANDING_COLORS.maityBlue,
    },
    {
      step: '02',
      title: 'Seleccion',
      desc: 'Elige 5 a 20 usuarios piloto de tu organizacion.',
      icon: <Users size={20} />,
      color: LANDING_COLORS.maityGreen,
    },
    {
      step: '03',
      title: 'Entrenamiento',
      desc: '30 dias de practica con IA, feedback tactico y gamificacion.',
      icon: <Activity size={20} />,
      color: LANDING_COLORS.maityPink,
    },
    {
      step: '04',
      title: 'Reporte ROI',
      desc: 'Metricas de impacto, progreso por usuario y recomendaciones.',
      icon: <BarChart2 size={20} />,
      color: '#ff8c42',
    },
  ];

  return (
    <section className="py-24 bg-[#0A0A0A] border-y border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-900/20 border border-green-500/20 mb-6">
              <Shield size={14} className="text-green-500" />
              <span className="text-xs font-bold text-green-300 tracking-wide uppercase">
                Sin riesgo
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Piloto de <span style={{ color: LANDING_COLORS.maityGreen }}>30 dias</span> —
              gratis
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Prueba Maity con tu equipo antes de comprometerte. Sin tarjeta, sin contrato, con
              resultados medibles.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {steps.map((s, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="p-6 bg-[#0F0F0F] rounded-2xl border border-white/5 hover:border-white/15 transition-all text-center h-full">
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${s.color}20` }}
                >
                  <div style={{ color: s.color }}>{s.icon}</div>
                </div>
                <p className="text-xs font-bold text-gray-600 mb-2">PASO {s.step}</p>
                <h4 className="text-lg font-bold text-white mb-2">{s.title}</h4>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={500}>
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-gray-400">
            {[
              { v: 'Setup gratis', i: <Check size={14} className="text-green-500" /> },
              { v: '30 dias completos', i: <Calendar size={14} className="text-blue-500" /> },
              { v: '5-20 usuarios', i: <Users size={14} className="text-pink-500" /> },
              { v: 'ROI medible', i: <BarChart2 size={14} className="text-orange-500" /> },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5"
              >
                {item.i} {item.v}
              </div>
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={() => setView('demo-calendar')}
              className="px-10 py-4 rounded-full text-white font-bold text-lg shadow-xl hover:scale-105 transition-all"
              style={{
                background: `linear-gradient(90deg, ${LANDING_COLORS.maityBlue}, ${LANDING_COLORS.maityGreen})`,
              }}
            >
              Solicitar Piloto Gratuito
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
