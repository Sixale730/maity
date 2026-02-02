import { useState } from 'react';
import { Headphones, Mail, Calendar, MessageSquare, HelpCircle, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, BookOpen, Shield, FileText, Clock } from 'lucide-react';
import { FadeIn } from '../components/shared/FadeIn';
import { LANDING_COLORS } from '../constants/colors';

interface SoportePageProps {
  setView: (view: string) => void;
}

const channels = [
  {
    icon: Mail,
    title: 'Email',
    description: 'hola@maity.com.mx',
    detail: 'Respuesta en menos de 24 horas',
    href: 'mailto:hola@maity.com.mx',
    color: LANDING_COLORS.maityPink,
  },
  {
    icon: Calendar,
    title: 'Videollamada',
    description: 'Agenda con nuestro equipo',
    detail: 'Sesión de 30 minutos',
    viewTarget: 'demo-calendar',
    color: LANDING_COLORS.maityBlue,
  },
  {
    icon: MessageSquare,
    title: 'Chat en vivo',
    description: 'Disponible en horario de oficina',
    detail: 'Lun-Vie 9:00-18:00 CST',
    href: '#',
    color: LANDING_COLORS.maityGreen,
  },
];

const quickLinks = [
  { icon: BookOpen, label: 'Primeros Pasos', view: 'primeros-pasos' },
  { icon: HelpCircle, label: 'Preguntas Frecuentes', anchor: 'faq' },
  { icon: Shield, label: 'Política de Privacidad', view: 'privacidad' },
  { icon: FileText, label: 'Términos de Servicio', view: 'terminos' },
];

const faqs = [
  {
    q: '¿Cómo empiezo a usar Maity?',
    a: 'Descarga la app, crea tu cuenta con Google o Microsoft, y completa tu perfil. En menos de 2 minutos estarás listo para tu primera práctica.',
  },
  {
    q: '¿Maity graba y guarda mis conversaciones de voz?',
    a: 'Solo con tu permiso explícito. Las grabaciones se procesan para generar feedback y se eliminan después del análisis. Nunca se comparten con terceros.',
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí. Sin penalizaciones, sin preguntas. Tu suscripción se mantiene activa hasta el final del periodo pagado.',
  },
  {
    q: '¿Cómo funciona la evaluación con IA?',
    a: 'Nuestra IA analiza tu comunicación en 6 competencias clave: claridad, empatía, persuasión, estructura, propósito y adaptación. Recibes un score y recomendaciones específicas.',
  },
  {
    q: '¿Puedo usar Maity con mi equipo?',
    a: 'Sí. Los planes Business incluyen dashboards de manager, métricas de equipo y escenarios personalizados. Contacta ventas para un piloto.',
  },
  {
    q: '¿En qué idiomas está disponible?',
    a: 'Actualmente Maity opera en español e inglés. Estamos trabajando en más idiomas para 2026.',
  },
  {
    q: '¿Puedo eliminar todos mis datos?',
    a: 'Sí. Desde tu perfil puedes solicitar la eliminación completa de tus datos. El proceso tarda máximo 72 horas.',
  },
  {
    q: '¿Maity reemplaza a un coach humano?',
    a: 'No. Maity es tu entrenador diario que complementa al coach humano. La IA detecta patrones y da práctica constante; el coach humano profundiza y personaliza.',
  },
];

export const SoportePage = ({ setView }: SoportePageProps) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (i: number) => {
    setOpenFaq((prev) => (prev === i ? null : i));
  };

  const handleQuickLinkClick = (link: typeof quickLinks[0]) => {
    if (link.anchor) {
      const el = document.getElementById(link.anchor);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (link.view) {
      setView(link.view);
    }
  };

  return (
    <section className="min-h-screen pt-32 pb-24 bg-[#050505]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <FadeIn>
          <button
            onClick={() => setView('product')}
            className="inline-flex items-center gap-2 mb-8 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Volver
          </button>
        </FadeIn>

        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${LANDING_COLORS.maityPink}15` }}>
              <Headphones size={28} style={{ color: LANDING_COLORS.maityPink }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Centro de Soporte</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Estamos aquí para ayudarte. Elige el canal que prefieras.
            </p>
          </div>
        </FadeIn>

        {/* Contact Channels */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {channels.map((ch, i) => {
            const Icon = ch.icon;
            const card = (
              <div className="p-6 bg-[#0F0F0F] border border-white/10 rounded-2xl h-full hover:border-white/20 transition-all group cursor-pointer">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${ch.color}15` }}>
                  <Icon size={22} style={{ color: ch.color }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{ch.title}</h3>
                <p className="text-sm font-medium mb-2" style={{ color: ch.color }}>{ch.description}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Clock size={12} /> {ch.detail}
                </p>
              </div>
            );
            return (
              <FadeIn key={ch.title} delay={i * 80}>
                {ch.viewTarget ? (
                  <div onClick={() => setView(ch.viewTarget!)}>{card}</div>
                ) : (
                  <a href={ch.href} target={ch.href?.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer">{card}</a>
                )}
              </FadeIn>
            );
          })}
        </div>

        {/* Quick Links */}
        <FadeIn delay={200}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-20">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.label}
                  onClick={() => handleQuickLinkClick(link)}
                  className="flex items-center gap-3 p-4 bg-[#0F0F0F] border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <Icon size={16} className="text-pink-400 flex-shrink-0" />
                  <span className="text-sm text-white">{link.label}</span>
                </button>
              );
            })}
          </div>
        </FadeIn>

        {/* FAQ */}
        <div id="faq">
          <FadeIn delay={250}>
            <h2 className="text-2xl font-bold text-white mb-8">Preguntas frecuentes</h2>
          </FadeIn>
          <div className="space-y-3 mb-20">
            {faqs.map((faq, i) => (
              <FadeIn key={faq.q} delay={300 + i * 40}>
                <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0F0F0F]">
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-medium text-white text-sm pr-4">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp size={16} className="text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5">
                      <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Still Need Help CTA */}
        <FadeIn delay={600}>
          <div className="p-10 bg-[#0F0F0F] border border-white/10 rounded-2xl text-center">
            <Headphones size={32} className="text-pink-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">¿Aún necesitas ayuda?</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Nuestro equipo de soporte está listo para ayudarte personalmente.
            </p>
            <a
              href="mailto:hola@maity.com.mx"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg shadow-2xl hover:scale-105 transition-all"
              style={{ backgroundColor: LANDING_COLORS.maityPink }}
            >
              Contactar soporte <ArrowRight size={20} />
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
