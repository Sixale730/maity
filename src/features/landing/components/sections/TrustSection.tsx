import { useNavigate } from 'react-router-dom';
import { Lock, UserCheck, Shield, Check, ArrowRight } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';
import { VideoCard } from '../shared/VideoCard';
import { LANDING_COLORS } from '../../constants/colors';
import { LANDING_VIDEOS } from '../../constants/videos';

interface TrustSectionProps {
  variant: 'product' | 'enterprise';
}

const BASE_PILLARS = [
  { icon: Lock, title: 'Control Total', desc: 'Tu decides que se graba, que se analiza y que se elimina. Siempre.' },
  { icon: UserCheck, title: 'Consentimiento', desc: 'Nada sucede sin tu permiso explicito. Opt-in siempre.' },
  { icon: Shield, title: 'Cifrado', desc: 'Datos cifrados en transito y en reposo con estandares bancarios.' },
  { icon: Check, title: 'Sin Venta de Datos', desc: 'Tus datos son tuyos. No los vendemos ni compartimos. Punto.' },
];

const COMPLIANCE = ['SOC2 Type II', 'ISO 27001', 'GDPR', 'CCPA', 'LFPDPPP'];

const TECH_SECURITY = [
  'Cifrado AES-256 en reposo',
  'TLS 1.3 en transito',
  'Autenticacion multifactor',
  'Auditorias de seguridad trimestrales',
  'Pruebas de penetracion anuales',
];

const PRIVACY_DESIGN = [
  'Minimizacion de datos por defecto',
  'Anonimizacion automatica',
  'Derecho al olvido en 72 horas',
  'Retencion configurable',
  'Sin tracking de terceros',
];

const ORG_SECURITY = [
  'Equipo de seguridad dedicado',
  'Capacitacion continua en seguridad',
  'Politicas de acceso zero-trust',
  'Monitoreo 24/7 de infraestructura',
];

const TRANSPARENCY = [
  'Informe de transparencia anual',
  'Politica de privacidad clara',
  'Notificacion de brechas en 24h',
  'Canal de reporte de vulnerabilidades',
];

export const TrustSection = ({ variant }: TrustSectionProps) => {
  const navigate = useNavigate();
  const video = LANDING_VIDEOS.privacidad;

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: LANDING_COLORS.textMain }}>
              Tu privacidad es sagrada
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: LANDING_COLORS.textMuted }}>
              La confianza se construye con hechos, no con promesas
            </p>
          </div>
        </FadeIn>

        {/* Base pillars */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {BASE_PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <FadeIn key={pillar.title} delay={i * 75}>
                <div className="p-6 rounded-2xl border border-white/5 text-center" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-green-500/10">
                    <Icon className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: LANDING_COLORS.textMain }}>{pillar.title}</h3>
                  <p className="text-sm" style={{ color: LANDING_COLORS.textMuted }}>{pillar.desc}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Enterprise-only sections */}
        {variant === 'enterprise' && (
          <>
            {/* Compliance badges */}
            <FadeIn delay={200}>
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {COMPLIANCE.map((badge) => (
                  <span
                    key={badge}
                    className="px-4 py-2 rounded-full text-sm font-semibold border border-green-500/20 bg-green-500/10 text-green-400"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </FadeIn>

            {/* Technical security + Privacy by design */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <FadeIn delay={250}>
                <div className="p-6 rounded-2xl border border-white/5" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
                  <h3 className="font-semibold mb-4" style={{ color: LANDING_COLORS.textMain }}>
                    Seguridad Tecnica
                  </h3>
                  <ul className="space-y-3">
                    {TECH_SECURITY.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm" style={{ color: LANDING_COLORS.textMuted }}>
                        <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>

              <FadeIn delay={300}>
                <div className="p-6 rounded-2xl border border-white/5" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
                  <h3 className="font-semibold mb-4" style={{ color: LANDING_COLORS.textMain }}>
                    Privacy by Design
                  </h3>
                  <ul className="space-y-3">
                    {PRIVACY_DESIGN.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm" style={{ color: LANDING_COLORS.textMuted }}>
                        <Lock className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            </div>

            {/* Organizational security */}
            <FadeIn delay={350}>
              <div className="p-6 rounded-2xl border border-white/5 mb-12" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
                <h3 className="font-semibold mb-4" style={{ color: LANDING_COLORS.textMain }}>
                  Seguridad Organizacional
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {ORG_SECURITY.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm" style={{ color: LANDING_COLORS.textMuted }}>
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Transparency strip */}
            <FadeIn delay={400}>
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {TRANSPARENCY.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 bg-white/5"
                    style={{ color: LANDING_COLORS.textMuted }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </FadeIn>
          </>
        )}

        {/* Video + link */}
        <div className="flex flex-col items-center gap-6">
          <FadeIn delay={variant === 'enterprise' ? 450 : 200}>
            <VideoCard
              title={video.title}
              description={video.description}
              duration={video.duration}
              thumbnailUrl={video.thumbnailUrl}
              videoUrl={video.videoUrl}
            />
          </FadeIn>

          <FadeIn delay={variant === 'enterprise' ? 500 : 250}>
            <button
              onClick={() => navigate('/privacy')}
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: LANDING_COLORS.maityGreen }}
            >
              Ver politica de privacidad completa
              <ArrowRight className="w-4 h-4" />
            </button>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};
