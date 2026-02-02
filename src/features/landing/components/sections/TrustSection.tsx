import { Lock, UserCheck, Shield, Check, Eye, AlertTriangle, Globe, FileText, Key, Download, Users, Brain, HardDrive, ChevronRight } from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';
import { LANDING_VIDEOS } from '../../constants/videos';
import { FadeIn } from '../shared/FadeIn';
import { VideoCard } from '../shared/VideoCard';

interface TrustSectionProps {
  variant?: 'product' | 'enterprise';
  setView?: (view: string) => void;
}

export const TrustSection = ({ variant = 'product', setView }: TrustSectionProps) => {
  const basePillars = [
    { t: "Control Total", d: "Tú decides qué se graba, analiza y elimina.", i: <Lock className="text-pink-500" /> },
    { t: "Consentimiento", d: "Maity exige notificar a participantes.", i: <UserCheck className="text-blue-500" /> },
    { t: "Cifrado", d: "Datos protegidos en tránsito y reposo.", i: <Shield className="text-green-500" /> },
    { t: "Sin Venta de Datos", d: "Tu información nunca se comparte con terceros.", i: <Check className="text-yellow-500" /> }
  ];

  const complianceBadges = [
    { name: "SOC 2 Type II", status: "En proceso", color: "#ffd93d" },
    { name: "ISO 27001", status: "Diseñado conforme", color: LANDING_COLORS.maityBlue },
    { name: "GDPR", status: "Cumplimiento total", color: LANDING_COLORS.maityGreen },
    { name: "CCPA", status: "Cumplimiento total", color: LANDING_COLORS.maityGreen },
    { name: "LFPDPPP", status: "Cumplimiento total", color: LANDING_COLORS.maityGreen }
  ];

  const technicalSecurity = [
    { t: "Cifrado AES-256", d: "Datos protegidos en reposo con cifrado de grado militar.", i: <Lock size={18} /> },
    { t: "TLS 1.3 en tránsito", d: "Toda la comunicación encriptada con el estándar más reciente.", i: <Shield size={18} /> },
    { t: "Arquitectura Zero-Knowledge", d: "Tus datos de voz se procesan y se eliminan. No almacenamos grabaciones.", i: <Eye size={18} /> },
    { t: "Pruebas de penetración", d: "Auditorías de seguridad regulares por terceros certificados.", i: <AlertTriangle size={18} /> },
    { t: "Residencia de datos", d: "Elige dónde se almacenan tus datos: NA, EU o LATAM.", i: <Globe size={18} /> }
  ];

  const privacyByDesign = [
    { t: "Minimización de datos", d: "Solo recopilamos lo estrictamente necesario para el servicio.", i: <FileText size={18} /> },
    { t: "Consentimiento granular", d: "Cada participante debe dar consentimiento explícito.", i: <UserCheck size={18} /> },
    { t: "Derecho al olvido", d: "Elimina todos tus datos en cualquier momento con un click.", i: <Key size={18} /> },
    { t: "Portabilidad", d: "Exporta todos tus datos en formato estándar cuando quieras.", i: <Download size={18} /> },
    { t: "Sin venta de datos", d: "Tu información nunca se comparte ni se vende. Punto.", i: <Check size={18} /> }
  ];

  const orgSecurity = [
    { t: "Verificación de equipo", d: "Background checks para todo el personal con acceso a datos.", i: <Users size={18} /> },
    { t: "Capacitación continua", d: "Entrenamiento obligatorio de seguridad para todo el equipo.", i: <Brain size={18} /> },
    { t: "Plan de respuesta", d: "Protocolo de respuesta a incidentes con notificación en 72h.", i: <AlertTriangle size={18} /> },
    { t: "Continuidad", d: "Plan de continuidad de negocio con backup geo-redundante.", i: <HardDrive size={18} /> }
  ];

  return (
    <section className="py-24 bg-[#0A0A0A] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {variant === 'enterprise' ? 'Seguridad y privacidad Enterprise' : 'Tu información, tu control'}
            </h2>
            <p className="text-gray-400">
              {variant === 'enterprise'
                ? 'Cumplimiento normativo, cifrado de grado militar y privacidad por diseño. Tus datos están seguros.'
                : 'Maity está diseñado con privacidad desde el día uno.'}
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {basePillars.map((item, i) => (
            <FadeIn key={i} delay={i * 100} className="p-8 rounded-2xl bg-white/2 hover:bg-white/5 transition-colors border border-white/5">
              <div className="mb-4">{item.i}</div>
              <h4 className="font-bold text-white mb-2">{item.t}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{item.d}</p>
            </FadeIn>
          ))}
        </div>

        {variant === 'enterprise' && (
          <>
            <FadeIn delay={200}>
              <div className="mt-16 mb-12">
                <h3 className="text-xl font-bold text-white mb-6 text-center">Cumplimiento Normativo</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {complianceBadges.map((badge, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 bg-[#0F0F0F] rounded-xl border border-white/10">
                      <Shield size={16} style={{ color: badge.color }} />
                      <div>
                        <div className="text-sm font-bold text-white">{badge.name}</div>
                        <div className="text-xs" style={{ color: badge.color }}>{badge.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={300}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className="p-8 bg-[#0F0F0F] rounded-2xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Shield size={20} style={{ color: LANDING_COLORS.maityBlue }} /> Seguridad Técnica
                  </h3>
                  <div className="space-y-5">
                    {technicalSecurity.map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="mt-0.5 text-blue-400 flex-shrink-0">{item.i}</div>
                        <div>
                          <div className="text-sm font-bold text-white mb-1">{item.t}</div>
                          <div className="text-xs text-gray-500 leading-relaxed">{item.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-[#0F0F0F] rounded-2xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Lock size={20} style={{ color: LANDING_COLORS.maityGreen }} /> Privacidad por Diseño
                  </h3>
                  <div className="space-y-5">
                    {privacyByDesign.map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="mt-0.5 text-green-400 flex-shrink-0">{item.i}</div>
                        <div>
                          <div className="text-sm font-bold text-white mb-1">{item.t}</div>
                          <div className="text-xs text-gray-500 leading-relaxed">{item.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="p-8 bg-[#0F0F0F] rounded-2xl border border-white/5 mb-12">
                <h3 className="text-lg font-bold text-white mb-6 text-center">Seguridad Organizacional</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {orgSecurity.map((item, i) => (
                    <div key={i} className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-gray-400">
                        {item.i}
                      </div>
                      <div className="text-sm font-bold text-white mb-1">{item.t}</div>
                      <div className="text-xs text-gray-500 leading-relaxed">{item.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={500}>
              <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500 mb-8">
                {["Auditorías de seguridad regulares", "Programa de divulgación responsable", "Acuerdos de procesamiento de datos (DPA)", "Lista de sub-procesadores publicada"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
                    <Check size={12} className="text-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </>
        )}

        <FadeIn delay={variant === 'enterprise' ? 600 : 400}>
          <div className="text-center mt-10">
            <button onClick={() => setView && setView('seguridad')} className="text-sm text-gray-400 hover:text-pink-400 transition-colors flex items-center gap-2 mx-auto">
              <Shield size={14} /> Ver política de privacidad completa <ChevronRight size={14} />
            </button>
          </div>

          <div className="max-w-xl mx-auto mt-12">
            <VideoCard
              title={LANDING_VIDEOS.privacidad.title}
              description={LANDING_VIDEOS.privacidad.description}
              duration={LANDING_VIDEOS.privacidad.duration}
              thumbnailUrl={LANDING_VIDEOS.privacidad.thumbnailUrl}
              videoUrl={LANDING_VIDEOS.privacidad.videoUrl}
              variant="inline"
              accentColor={LANDING_COLORS.maityGreen}
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
