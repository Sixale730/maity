import { DollarSign, Award, Headphones, Globe, Layout } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';
import { FadeIn } from '../shared/FadeIn';
import type { ReactNode } from 'react';

interface Solucion {
  icon: ReactNode;
  title: string;
  desc: string;
  color: string;
  tags: string[];
}

export const SolucionesGrid = () => {
  const soluciones: Solucion[] = [
    {
      icon: <DollarSign size={24} />,
      title: 'Ventas',
      desc: 'Cierra mas tratos con comunicacion persuasiva. Entrena objeciones, negociacion y pitch con IA.',
      color: LANDING_COLORS.maityPink,
      tags: ['Pitch', 'Objeciones', 'Cierre'],
    },
    {
      icon: <Award size={24} />,
      title: 'Liderazgo',
      desc: 'Desarrolla lideres que inspiran y retienen talento. Feedback, delegacion y resolucion de conflictos.',
      color: LANDING_COLORS.maityBlue,
      tags: ['Feedback', 'Delegacion', 'Conflictos'],
    },
    {
      icon: <Headphones size={24} />,
      title: 'Servicio al Cliente',
      desc: 'Transforma la experiencia del cliente. Escucha activa, manejo de quejas y resolucion empatica.',
      color: LANDING_COLORS.maityGreen,
      tags: ['Escucha', 'Quejas', 'Resolucion'],
    },
    {
      icon: <Globe size={24} />,
      title: 'Equipos Remotos',
      desc: 'Conecta equipos distribuidos. Comunicacion asincrona efectiva, reuniones productivas y cohesion.',
      color: '#9b4dca',
      tags: ['Async', 'Reuniones', 'Cohesion'],
    },
  ];

  return (
    <section className="py-24 bg-[#050505]">
      <div className="max-w-6xl mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/10 border border-blue-500/20 mb-6">
              <Layout size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">
                Soluciones por Area
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Un coach IA para cada{' '}
              <span style={{ color: LANDING_COLORS.maityBlue }}>necesidad</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Maity se adapta al contexto de tu equipo con escenarios especificos por area de
              negocio.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {soluciones.map((sol, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="p-8 bg-[#0F0F0F] rounded-2xl border border-white/5 hover:border-white/15 transition-all group h-full">
                <div className="flex items-start gap-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${sol.color}20` }}
                  >
                    <div style={{ color: sol.color }}>{sol.icon}</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {sol.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">{sol.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {sol.tags.map((tag, j) => (
                        <span
                          key={j}
                          className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-white/5 text-gray-500 border border-white/5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
