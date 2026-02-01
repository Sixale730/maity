import { Zap, Heart, DollarSign, Scale, Headphones, Smile, Flag } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';
import { LANDING_COLORS } from '../../constants/colors';

const SKILLS = [
  {
    icon: Zap,
    title: 'Claridad y Estructura',
    description: 'Aprende a organizar tus ideas y comunicarlas con precision para que tu mensaje siempre llegue.',
    color: LANDING_COLORS.maityPink,
  },
  {
    icon: Heart,
    title: 'Empatia y Conexion',
    description: 'Desarrolla la habilidad de conectar emocionalmente y crear relaciones de confianza genuinas.',
    color: LANDING_COLORS.maityBlue,
  },
  {
    icon: Zap,
    title: 'Persuasion Etica',
    description: 'Influye con integridad. Aprende tecnicas de persuasion que generan resultados sin manipular.',
    color: '#ffd93d',
  },
  {
    icon: DollarSign,
    title: 'Venta Consultiva',
    description: 'Transforma tus conversaciones de ventas en sesiones de valor donde el cliente quiere comprarte.',
    color: LANDING_COLORS.maityGreen,
  },
  {
    icon: Scale,
    title: 'Negociacion',
    description: 'Domina el arte de encontrar acuerdos donde ambas partes ganan. Negocia con confianza y datos.',
    color: '#9b4dca',
  },
  {
    icon: Headphones,
    title: 'Servicio al Cliente',
    description: 'Convierte quejas en oportunidades. Aprende a manejar situaciones dificiles con elegancia.',
    color: '#ff8c42',
  },
  {
    icon: Smile,
    title: 'Manejo Emocional',
    description: 'Controla tus reacciones bajo presion. Responde en vez de reaccionar en momentos criticos.',
    color: '#f472b6',
  },
  {
    icon: Flag,
    title: 'Liderazgo Comunicativo',
    description: 'Inspira a tu equipo con mensajes claros, feedback constructivo y vision compartida.',
    color: '#4ade80',
  },
];

export const SkillsGridSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: LANDING_COLORS.textMain }}>
              8 habilidades que transforman carreras
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: LANDING_COLORS.textMuted }}>
              Maity entrena las soft skills que mas impactan en tu exito profesional
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SKILLS.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <FadeIn key={skill.title} delay={index * 75}>
                <div
                  className="p-8 rounded-2xl border border-white/5 hover:border-white/20 transition-colors text-center"
                  style={{ backgroundColor: LANDING_COLORS.bgCard }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${skill.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: skill.color }} />
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: LANDING_COLORS.textMain }}>
                    {skill.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: LANDING_COLORS.textMuted }}>
                    {skill.description}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};
