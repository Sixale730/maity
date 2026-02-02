import { useNavigate } from 'react-router-dom';
import { Heart, Brain, Target, Zap, Users, Flame, Eye, ArrowRight } from 'lucide-react';
import { FadeIn } from '../components/shared/FadeIn';
import { LANDING_COLORS } from '../constants/colors';

const values = [
  {
    icon: Heart,
    title: 'Humanidad Aumentada',
    description: 'La IA amplifica lo humano, no lo reemplaza. Cada herramienta que construimos existe para potenciar las capacidades naturales de las personas.',
    color: LANDING_COLORS.maityPink,
  },
  {
    icon: Brain,
    title: 'Empatía Algorítmica',
    description: 'Cada línea de código tiene un propósito humano. No optimizamos métricas vacías; optimizamos conexión, comprensión y crecimiento.',
    color: LANDING_COLORS.maityBlue,
  },
  {
    icon: Target,
    title: 'Resultados Sin Excusas',
    description: 'Medimos impacto real, no vanity metrics. Si no mejora la vida de las personas, no lo enviamos.',
    color: LANDING_COLORS.maityGreen,
  },
  {
    icon: Zap,
    title: 'Disrupción Con Propósito',
    description: 'Innovar para resolver, no solo para impresionar. Cada innovación debe responder a un problema real.',
    color: LANDING_COLORS.maityPink,
  },
  {
    icon: Users,
    title: 'Sociedad Con Talento',
    description: 'Creemos que el talento humano es el activo más valioso. Trabajamos para que cada persona pueda desarrollar su potencial comunicativo.',
    color: LANDING_COLORS.maityBlue,
  },
];

const personality = [
  { trait: 'Directos', description: 'Hablamos claro. Sin jerga corporativa ni promesas vacías.', icon: Flame },
  { trait: 'Científicos', description: 'Cada decisión se basa en datos, investigación y evidencia.', icon: Brain },
  { trait: 'Retadores', description: 'Cuestionamos el status quo. Si algo puede ser mejor, lo hacemos mejor.', icon: Zap },
  { trait: 'Humanos', description: 'Detrás de cada algoritmo hay empatía, humor y vulnerabilidad.', icon: Eye },
];

export const NosotrosPage = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen pt-32 pb-24 bg-[#050505]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Mission Hero */}
        <FadeIn>
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-900/10 border border-pink-500/20 mb-6">
              <Heart size={16} className="text-pink-500" />
              <span className="text-xs font-bold text-pink-400 tracking-wider uppercase">Nuestra Misión</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
              Transformar la comunicación humana{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${LANDING_COLORS.maityPink}, ${LANDING_COLORS.maityBlue})` }}
              >
                con inteligencia artificial
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Creemos que la comunicación es la habilidad más poderosa del ser humano. Maity existe para que cada persona pueda desarrollarla al máximo.
            </p>
          </div>
        </FadeIn>

        {/* Voice Section */}
        <FadeIn delay={100}>
          <div className="border-l-4 border-pink-500 p-8 rounded-r-2xl bg-[#0F0F0F] mb-20">
            <p className="text-lg md:text-xl italic text-white leading-relaxed mb-3">
              "No construimos tecnología para reemplazar conversaciones. Construimos tecnología para que cada conversación cuente."
            </p>
            <p className="text-sm text-gray-500">-- El equipo de Maity</p>
          </div>
        </FadeIn>

        {/* Values Grid */}
        <FadeIn delay={150}>
          <h2 className="text-3xl font-bold text-white mb-10 text-center">Nuestros valores</h2>
        </FadeIn>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {values.map((val, i) => {
            const Icon = val.icon;
            return (
              <FadeIn key={val.title} delay={200 + i * 80}>
                <div className="p-6 bg-[#0F0F0F] border border-white/10 rounded-2xl h-full hover:border-white/20 transition-all">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${val.color}15` }}
                  >
                    <Icon size={22} style={{ color: val.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{val.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{val.description}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Personality Strip */}
        <FadeIn delay={400}>
          <div className="p-8 bg-[#0F0F0F] border border-white/10 rounded-2xl mb-20">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Nuestra personalidad</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {personality.map((p, i) => {
                const Icon = p.icon;
                const colors = [LANDING_COLORS.maityPink, LANDING_COLORS.maityBlue, LANDING_COLORS.maityGreen, '#e7e7e9'];
                return (
                  <div key={p.trait} className="text-center p-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ backgroundColor: `${colors[i]}15` }}
                    >
                      <Icon size={18} style={{ color: colors[i] }} />
                    </div>
                    <p className="text-lg font-bold mb-1" style={{ color: colors[i] }}>{p.trait}</p>
                    <p className="text-xs text-gray-500">{p.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* CTA Section */}
        <FadeIn delay={500}>
          <div className="text-center">
            <p className="text-3xl font-bold text-white mb-8">
              La comunicación evoluciona. Tú también.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('/primeros-pasos')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg shadow-2xl hover:scale-105 transition-all"
                style={{ backgroundColor: LANDING_COLORS.maityPink }}
              >
                Empieza tu evolución <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate('/empresas')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg border border-white/20 text-white hover:bg-white/5 transition-all"
              >
                Solución empresarial
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
