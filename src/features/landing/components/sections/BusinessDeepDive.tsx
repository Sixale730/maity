import {
  AlertTriangle, Monitor, Download, Eye, Brain, MessageSquare, BarChart2, RefreshCw,
  Zap, Heart, DollarSign, Scale, Headphones, Flag, Shield, Lock, Check,
  TrendingUp, Users, Award, Clock, Target, Briefcase,
} from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';
import { LANDING_COLORS } from '../../constants/colors';

const HOW_STEPS = [
  { icon: Download, title: 'Instalacion', desc: 'Plugin ligero para Zoom, Meet o Teams. 2 minutos.' },
  { icon: Eye, title: 'Deteccion', desc: 'Escucha conversaciones reales con consentimiento del equipo.' },
  { icon: Brain, title: 'Analisis', desc: 'IA evalua 6 competencias de comunicacion en tiempo real.' },
  { icon: MessageSquare, title: 'Seguimiento', desc: 'Feedback tactico automatico despues de cada llamada.' },
  { icon: BarChart2, title: 'Dashboard Lider', desc: 'Metricas de equipo, tendencias y areas de enfoque.' },
  { icon: RefreshCw, title: 'Hibrido', desc: 'Combina IA con coaching humano para maximo impacto.' },
];

const ENTERPRISE_SKILLS = [
  { icon: Zap, title: 'Presentaciones', color: LANDING_COLORS.maityPink },
  { icon: Heart, title: 'Servicio', color: LANDING_COLORS.maityBlue },
  { icon: DollarSign, title: 'Ventas', color: LANDING_COLORS.maityGreen },
  { icon: Scale, title: 'Negociacion', color: '#9b4dca' },
  { icon: Headphones, title: 'Soporte', color: '#ff8c42' },
  { icon: Flag, title: 'Liderazgo', color: '#4ade80' },
];

const BENEFITS = [
  { icon: TrendingUp, title: 'ROI Medible', desc: 'Metricas claras de mejora por persona y equipo.' },
  { icon: Clock, title: 'Ahorro de Tiempo', desc: 'Reduce horas de capacitacion presencial hasta 60%.' },
  { icon: Users, title: 'Escalabilidad', desc: 'De 10 a 10,000 usuarios sin perder personalizacion.' },
  { icon: Target, title: 'Personalizacion', desc: 'Escenarios custom para tu industria y cultura.' },
  { icon: Award, title: 'Certificaciones', desc: 'Competencias certificables para desarrollo de talento.' },
  { icon: Briefcase, title: 'Integraciones', desc: 'CRM, LMS, HRIS y mas via API o integraciones nativas.' },
];

export const BusinessDeepDive = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Problem statement */}
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6 bg-red-500/10">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: LANDING_COLORS.textMain }}>
              La Realidad Incomoda
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: LANDING_COLORS.textMuted }}>
              Tu equipo invierte miles de horas en reuniones, llamadas y presentaciones. Pero nadie mide
              si esas conversaciones estan funcionando. La capacitacion tradicional no escala, no mide
              y no genera habitos. Maity si.
            </p>
          </div>
        </FadeIn>

        {/* Desktop explanation with mockup */}
        <div>
          <FadeIn>
            <div className="text-center mb-12">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 bg-blue-500/10">
                <Monitor className="w-7 h-7" style={{ color: LANDING_COLORS.maityBlue }} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: LANDING_COLORS.textMain }}>
                Maity Desktop
              </h3>
              <p style={{ color: LANDING_COLORS.textMuted }}>
                Se integra a tus reuniones sin friccion. Tu equipo mejora mientras trabaja.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="p-6 rounded-2xl border border-white/10 max-w-2xl mx-auto" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs" style={{ color: LANDING_COLORS.textMuted }}>Meeting - Q4 Review</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['Clarity: 8.2', 'Engagement: 7.5', 'Structure: 9.1'].map((stat) => (
                  <div key={stat} className="p-3 rounded-lg bg-white/5 text-center">
                    <span className="text-xs font-medium" style={{ color: LANDING_COLORS.maityGreen }}>{stat}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* 6-step how it works */}
        <div>
          <FadeIn>
            <h3 className="text-2xl font-bold text-center mb-10" style={{ color: LANDING_COLORS.textMain }}>
              Como funciona para empresas
            </h3>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <FadeIn key={step.title} delay={i * 75}>
                  <div className="p-6 rounded-2xl border border-white/5" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${LANDING_COLORS.maityBlue}20`, color: LANDING_COLORS.maityBlue }}>
                        {i + 1}
                      </span>
                      <Icon className="w-5 h-5" style={{ color: LANDING_COLORS.maityBlue }} />
                    </div>
                    <h4 className="font-semibold mb-1" style={{ color: LANDING_COLORS.textMain }}>{step.title}</h4>
                    <p className="text-sm" style={{ color: LANDING_COLORS.textMuted }}>{step.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>

        {/* Enterprise skills */}
        <div>
          <FadeIn>
            <h3 className="text-2xl font-bold text-center mb-10" style={{ color: LANDING_COLORS.textMain }}>
              Habilidades que entrenamos
            </h3>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ENTERPRISE_SKILLS.map((skill, i) => {
              const Icon = skill.icon;
              return (
                <FadeIn key={skill.title} delay={i * 50}>
                  <div className="p-4 rounded-xl border border-white/5 text-center" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
                    <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: skill.color }} />
                    <span className="text-sm font-medium" style={{ color: LANDING_COLORS.textMain }}>{skill.title}</span>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>

        {/* Security mini */}
        <FadeIn>
          <div className="p-8 rounded-2xl border border-green-500/20 bg-green-500/5 text-center">
            <Shield className="w-8 h-8 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-bold mb-2" style={{ color: LANDING_COLORS.textMain }}>
              Seguridad Enterprise-Grade
            </h3>
            <p className="text-sm max-w-xl mx-auto mb-4" style={{ color: LANDING_COLORS.textMuted }}>
              SOC2 Type II, ISO 27001, GDPR, cifrado AES-256, zero-trust architecture.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['SOC2', 'ISO27001', 'GDPR', 'CCPA'].map((badge) => (
                <span key={badge} className="px-3 py-1 rounded-full text-xs font-semibold border border-green-500/20 text-green-400">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Benefits */}
        <div>
          <FadeIn>
            <h3 className="text-2xl font-bold text-center mb-10" style={{ color: LANDING_COLORS.textMain }}>
              Beneficios para tu organizacion
            </h3>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <FadeIn key={b.title} delay={i * 75}>
                  <div className="p-6 rounded-2xl border border-white/5" style={{ backgroundColor: LANDING_COLORS.bgCard }}>
                    <Icon className="w-6 h-6 mb-3" style={{ color: LANDING_COLORS.maityBlue }} />
                    <h4 className="font-semibold mb-1" style={{ color: LANDING_COLORS.textMain }}>{b.title}</h4>
                    <p className="text-sm" style={{ color: LANDING_COLORS.textMuted }}>{b.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>

        {/* Vision */}
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: LANDING_COLORS.textMain }}>
              La comunicacion es la habilidad #1 del siglo XXI
            </h3>
            <p className="text-lg" style={{ color: LANDING_COLORS.textMuted }}>
              Las empresas que invierten en las soft skills de su equipo ven resultados medibles:
              mejores cierres, menos rotacion, equipos mas alineados. Maity hace que esa inversion escale.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
