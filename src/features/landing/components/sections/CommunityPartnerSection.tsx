import { Mic, Users, Building2, Check, Rocket, UserPlus } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';
import { FadeIn } from '../shared/FadeIn';

interface CommunityPartnerSectionProps {
  setView: (view: string) => void;
}

export const CommunityPartnerSection = ({ setView }: CommunityPartnerSectionProps) => {
  const tracks = [
    {
      icon: <Mic size={28} />,
      title: "Coach Certificado",
      desc: "Usa Maity como tu herramienta principal de coaching. Ofrece entrenamiento de comunicación a tus clientes con tecnología de IA y gana el 30% recurrente por cada membresía activa.",
      benefits: ["30% comisión recurrente", "Panel de seguimiento de clientes", "Material de marca compartida", "Soporte prioritario"],
      cta: "Aplicar como Coach",
      color: LANDING_COLORS.maityPink,
      accent: "pink"
    },
    {
      icon: <Users size={28} />,
      title: "Referenciador",
      desc: "Recomienda Maity a empresas y profesionales. Recibe el 15% del primer año de suscripción por cada cliente que refieras. Sin inversión, sin riesgo.",
      benefits: ["15% del primer año", "Link de referido personalizado", "Dashboard de conversiones", "Sin mínimos ni exclusividad"],
      cta: "Unirme al Programa",
      color: LANDING_COLORS.maityBlue,
      accent: "blue"
    },
    {
      icon: <Building2 size={28} />,
      title: "Embajador Corporativo",
      desc: "Conecta a Maity con empresas de tu red. Gana el 10% de cada contrato empresarial que se cierre gracias a tu introducción.",
      benefits: ["10% de contratos empresariales", "Capacitación de producto", "Eventos exclusivos", "Red de embajadores"],
      cta: "Ser Embajador",
      color: LANDING_COLORS.maityGreen,
      accent: "green"
    },
  ];

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-pink-500/5 rounded-full blur-[150px]"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <FadeIn>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-xs font-bold text-gray-400 border border-white/10 mb-6">
              <Rocket size={14} className="text-pink-500" /> Oportunidad de crecimiento
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Crece con <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(90deg, ${LANDING_COLORS.maityPink}, ${LANDING_COLORS.maityBlue})` }}>Maity</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              No solo uses Maity. Sé parte de la revolución. Gana dinero ayudando a otros a comunicarse mejor.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tracks.map((track, i) => (
            <FadeIn key={i} delay={i * 120}>
              <div className="bg-[#0F0F0F] rounded-3xl border border-white/5 p-8 hover:border-white/10 transition-all flex flex-col h-full group">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-${track.accent}-500`}>
                  {track.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{track.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-grow">{track.desc}</p>
                <ul className="space-y-3 mb-8">
                  {track.benefits.map((b, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-400">
                      <Check size={14} className={`text-${track.accent}-500 shrink-0`} />
                      {b}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setView('demo-calendar')}
                  className="w-full py-4 rounded-xl font-bold text-white hover:opacity-90 transition-all"
                  style={{ backgroundColor: track.color }}
                >
                  {track.cta}
                </button>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={400}>
          <div className="bg-gradient-to-r from-[#0F0F0F] to-[#1A1A1A] rounded-3xl border border-white/5 p-10 text-center">
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              {[
                { value: "30%", label: "Coaches — recurrente" },
                { value: "15%", label: "Referenciadores — primer año" },
                { value: "10%", label: "Embajadores — contratos B2B" },
                { value: "$0", label: "Inversión para empezar" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-xl mx-auto">
              Ya sea como coach, asesor, capacitador, referenciador o inversionista — hay un lugar para ti en el ecosistema Maity.
            </p>
            <button
              onClick={() => setView('demo-calendar')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white hover:opacity-90 transition-all"
              style={{ background: `linear-gradient(90deg, ${LANDING_COLORS.maityPink}, ${LANDING_COLORS.maityBlue})` }}
            >
              <UserPlus size={18} /> Quiero ser parte
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
