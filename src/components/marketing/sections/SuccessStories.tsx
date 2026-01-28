import { Award, Tag, UserCheck } from 'lucide-react';
import { COLORS, SUCCESS_STORIES, type SectionProps } from '../marketing.constants';
import { FadeIn } from '../FadeIn';

export const SuccessStories = ({ setView }: SectionProps) => {
  return (
    <div className="bg-[#050505] min-h-screen text-[#e7e7e9] pt-24 pb-12">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-20">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/30 mb-6">
            <Award size={14} className="text-blue-400" />
            <span className="text-xs font-bold text-blue-200 tracking-wide uppercase">
              Resultados Comprobados
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter">
            Historias de <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(to right, ${COLORS.maityBlue}, ${COLORS.maityGreen})`,
              }}
            >
              Transformación Real
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Empresas líderes ya están escalando sus habilidades humanas con inteligencia artificial.
          </p>
        </FadeIn>
      </div>

      {/* Stats Banner */}
      <div className="border-y border-white/5 bg-[#0A0A0A] py-12 mb-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <FadeIn delay={100}>
            <div className="text-4xl font-bold text-white mb-2">+10k</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">Horas Entrenadas</div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="text-4xl font-bold text-white mb-2">94%</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">
              Aprobación de Usuarios
            </div>
          </FadeIn>
          <FadeIn delay={300}>
            <div className="text-4xl font-bold text-white mb-2">3.5x</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">ROI Promedio</div>
          </FadeIn>
          <FadeIn delay={400}>
            <div className="text-4xl font-bold text-white mb-2">15+</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">Países</div>
          </FadeIn>
        </div>
      </div>

      {/* Case Studies Grid */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {SUCCESS_STORIES.map((c, i) => (
          <FadeIn key={i} delay={i * 200} className="h-full">
            <div className="bg-[#0F0F0F] rounded-2xl border border-white/10 p-8 hover:border-blue-500/30 transition-all hover:-translate-y-2 group flex flex-col h-full">
              {/* Header: Logo & Industry */}
              <div className="flex justify-between items-start mb-6">
                <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center font-bold text-white text-xl">
                  {c.company[0]}
                </div>
                <span className="text-xs font-mono text-gray-500 border border-white/10 px-2 py-1 rounded">
                  {c.industry}
                </span>
              </div>

              {/* Headline & Tags */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white leading-snug mb-3 group-hover:text-blue-400 transition-colors">
                  {c.headline}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {c.tags.map((tag, t) => (
                    <span
                      key={t}
                      className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/5 flex items-center gap-1"
                    >
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Impact Metric */}
              <div className="mb-6">
                <div
                  className="text-3xl font-bold mb-2 transition-colors"
                  style={{ color: c.color }}
                >
                  {c.impact}
                </div>
                <div className="h-1 w-20 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full" style={{ backgroundColor: c.color, width: '66%' }} />
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-grow">"{c.desc}"</p>

              {/* Footer: Author */}
              <div className="flex items-center gap-3 border-t border-white/5 pt-6 mt-auto">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <UserCheck size={14} className="text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{c.author}</div>
                  <div className="text-xs text-gray-500">{c.company}</div>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Logo Strip */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-24">
        <p className="text-sm text-gray-500 mb-8 uppercase tracking-widest">Confían en nosotros</p>
        <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          <span className="text-2xl font-bold font-serif">UBER</span>
          <span className="text-2xl font-bold">
            Walmart <span className="text-blue-500">*</span>
          </span>
          <span className="text-2xl font-bold tracking-tighter">ORACLE</span>
          <span className="text-2xl font-bold italic">SoftBank</span>
          <span className="text-2xl font-bold font-mono">Globant</span>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-4 text-center bg-gradient-to-br from-blue-900/20 to-green-900/20 p-12 rounded-3xl border border-white/10">
        <h2 className="text-3xl font-bold text-white mb-4">
          ¿Listo para escribir tu caso de éxito?
        </h2>
        <p className="text-gray-400 mb-8">
          Únete a las empresas que están redefiniendo el desarrollo de talento.
        </p>
        <button
          onClick={() => setView('business')}
          className="px-8 py-3 rounded-full text-white font-bold transition-all transform hover:scale-105 shadow-lg"
          style={{ background: `linear-gradient(90deg, ${COLORS.maityBlue}, ${COLORS.maityGreen})` }}
        >
          Agendar Demo Personalizada
        </button>
      </div>
    </div>
  );
};

export default SuccessStories;
