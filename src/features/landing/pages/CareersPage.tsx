import { useNavigate } from 'react-router-dom';
import { Briefcase, Rocket, Brain, Users, TrendingUp, ArrowRight, MapPin, Check, Send, ArrowLeft } from 'lucide-react';
import { FadeIn } from '../components/shared/FadeIn';
import { LANDING_COLORS } from '../constants/colors';

const values = [
  {
    icon: Rocket,
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
    icon: TrendingUp,
    title: 'Resultados Sin Excusas',
    description: 'Medimos impacto real, no vanity metrics. Si no mejora la vida de las personas, no lo enviamos.',
    color: LANDING_COLORS.maityGreen,
  },
  {
    icon: Users,
    title: 'Disrupción Con Propósito',
    description: 'Innovar para resolver, no solo para impresionar. Cada innovación debe responder a un problema real.',
    color: LANDING_COLORS.maityPink,
  },
];

const benefits = [
  'Trabajo 100% remoto',
  'Horarios flexibles',
  'Equipo de última generación',
  'Acceso ilimitado a Maity Pro',
  'Presupuesto de aprendizaje',
  'Días personales sin preguntas',
  'Stock options para early joiners',
  'Cultura de feedback constante',
];

const positions = [
  { role: 'Senior Frontend Engineer', area: 'Engineering', type: 'Full-time · Remoto', tags: ['React', 'TypeScript', 'Three.js'] },
  { role: 'AI/ML Engineer', area: 'Engineering', type: 'Full-time · Remoto', tags: ['Python', 'NLP', 'LLMs'] },
  { role: 'Product Designer', area: 'Design', type: 'Full-time · Remoto', tags: ['Figma', 'UX Research', 'Design Systems'] },
  { role: 'Content Strategist', area: 'Marketing', type: 'Full-time · Remoto', tags: ['Copywriting', 'SEO', 'Brand Voice'] },
  { role: 'Customer Success Manager', area: 'Operations', type: 'Full-time · Remoto', tags: ['B2B', 'Onboarding', 'Retention'] },
];

export const CareersPage = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen pt-32 pb-24 bg-[#050505]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <FadeIn>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 mb-8 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Volver
          </button>
        </FadeIn>

        {/* Hero */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${LANDING_COLORS.maityPink}15` }}>
              <Briefcase size={28} style={{ color: LANDING_COLORS.maityPink }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Construye el futuro de la comunicación
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Únete a un equipo que cree que la IA puede hacer mejores comunicadores, no reemplazarlos.
            </p>
          </div>
        </FadeIn>

        {/* Values */}
        <FadeIn delay={100}>
          <h2 className="text-2xl font-bold text-white mb-8">Nuestros valores</h2>
        </FadeIn>
        <div className="grid sm:grid-cols-2 gap-6 mb-20">
          {values.map((val, i) => {
            const Icon = val.icon;
            return (
              <FadeIn key={val.title} delay={150 + i * 80}>
                <div className="p-6 bg-[#0F0F0F] border border-white/10 rounded-2xl h-full hover:border-white/20 transition-all">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${val.color}15` }}>
                    <Icon size={20} style={{ color: val.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{val.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{val.description}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Benefits */}
        <FadeIn delay={300}>
          <h2 className="text-2xl font-bold text-white mb-8">Beneficios</h2>
        </FadeIn>
        <FadeIn delay={350}>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mb-20">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 p-4 bg-[#0F0F0F] border border-white/5 rounded-xl">
                <Check size={16} className="text-green-400 flex-shrink-0" />
                <span className="text-sm text-white">{benefit}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Open Positions */}
        <FadeIn delay={400}>
          <h2 className="text-2xl font-bold text-white mb-8">Posiciones abiertas</h2>
        </FadeIn>
        <div className="space-y-4 mb-20">
          {positions.map((job, i) => (
            <FadeIn key={job.role} delay={450 + i * 60}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#0F0F0F] border border-white/10 rounded-2xl hover:border-white/20 transition-all">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{job.role}</h3>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                      <Briefcase size={12} /> {job.area}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin size={12} /> {job.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <a
                  href={`mailto:careers@maity.com.mx?subject=Aplicación: ${job.role}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/10 hover:bg-white/5 transition-colors flex-shrink-0"
                >
                  Aplicar <ArrowRight size={16} />
                </a>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Open Application CTA */}
        <FadeIn delay={600}>
          <div className="p-10 bg-[#0F0F0F] border border-white/10 rounded-2xl text-center">
            <Send size={28} className="text-pink-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">¿No ves tu rol?</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Siempre estamos buscando talento excepcional. Envíanos tu CV y cuéntanos por qué quieres ser parte de Maity.
            </p>
            <a
              href="mailto:careers@maity.com.mx?subject=Aplicación abierta"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg shadow-2xl hover:scale-105 transition-all"
              style={{ backgroundColor: LANDING_COLORS.maityPink }}
            >
              Enviar aplicación abierta <ArrowRight size={20} />
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
