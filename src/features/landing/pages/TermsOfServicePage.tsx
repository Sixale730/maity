import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ArrowLeft, ChevronDown, ChevronUp, Mail, Shield, FileText } from 'lucide-react';
import { FadeIn } from '../components/shared/FadeIn';
import { LANDING_COLORS } from '../constants/colors';

const sections = [
  {
    title: '1. Definiciones',
    content: '"Maity" se refiere a la plataforma de desarrollo de comunicación profesional operada por Maity Inteligencia Artificial S.A.P.I. de C.V. "Usuario" es toda persona que crea una cuenta y utiliza los servicios. "Contenido" incluye textos, audio, transcripciones y cualquier material generado dentro de la plataforma. "Servicio" abarca todas las funcionalidades disponibles en la plataforma web, aplicaciones móviles y APIs.',
  },
  {
    title: '2. Aceptación',
    content: 'Al crear una cuenta en Maity, aceptas estos Términos de Servicio en su totalidad. Si no estás de acuerdo con alguna cláusula, no debes utilizar la plataforma. El uso continuado de Maity después de modificaciones a estos términos constituye aceptación de los cambios.',
  },
  {
    title: '3. Registro',
    content: 'Para usar Maity debes crear una cuenta proporcionando información veraz y actualizada. Eres responsable de mantener la confidencialidad de tus credenciales de acceso. Debes notificarnos inmediatamente cualquier uso no autorizado de tu cuenta. Maity se reserva el derecho de rechazar o cancelar cuentas que incumplan estos términos.',
  },
  {
    title: '4. Descripción del servicio',
    content: 'Maity proporciona: análisis de comunicación con inteligencia artificial, sesiones de práctica con escenarios simulados, feedback personalizado y métricas de progreso, dashboard de evolución y gamificación, y herramientas de gestión para equipos (planes Business). Las funcionalidades específicas varían según el plan contratado.',
  },
  {
    title: '5. Planes y pagos',
    content: 'Maity ofrece planes gratuitos y de pago. Los precios están publicados en la página de precios y pueden actualizarse con 30 días de aviso previo. Los pagos se procesan mensual o anualmente según la opción elegida. Las suscripciones se renuevan automáticamente salvo cancelación previa. Los reembolsos se evalúan caso por caso dentro de los primeros 14 días.',
  },
  {
    title: '6. Propiedad intelectual',
    content: 'Todo el contenido de la plataforma (software, diseño, textos, algoritmos, modelos de IA) es propiedad exclusiva de Maity o sus licenciantes. El contenido generado por el usuario (transcripciones, grabaciones, resultados) pertenece al usuario, otorgando a Maity una licencia limitada para procesar y mejorar el servicio. Maity puede utilizar datos anonimizados y agregados para mejorar sus algoritmos.',
  },
  {
    title: '7. Uso aceptable',
    content: 'Te comprometes a: usar la plataforma solo para fines legítimos de desarrollo profesional, no intentar acceder a cuentas de otros usuarios, no realizar ingeniería inversa del software o algoritmos, no usar la plataforma para actividades ilegales o dañinas, no automatizar el acceso sin autorización escrita, y respetar los derechos de propiedad intelectual de Maity y terceros.',
  },
  {
    title: '8. Privacidad',
    content: 'El tratamiento de tus datos personales se rige por nuestra Política de Privacidad, disponible en /privacidad. Al aceptar estos términos, también aceptas nuestra política de privacidad. Para detalles sobre recopilación, uso y protección de datos, consulta la Política de Privacidad completa.',
  },
  {
    title: '9. Limitación de responsabilidad',
    content: 'Maity se proporciona "tal cual" y "según disponibilidad". No garantizamos que el servicio sea ininterrumpido, libre de errores o que cumpla todas tus expectativas. En ningún caso Maity será responsable por daños indirectos, incidentales, especiales o consecuentes. Nuestra responsabilidad máxima se limita al monto pagado por el usuario en los últimos 12 meses.',
  },
  {
    title: '10. Disponibilidad',
    content: 'Nos esforzamos por mantener una disponibilidad del 99.9% del servicio. Pueden existir interrupciones planificadas para mantenimiento (notificadas con al menos 24 horas de anticipación). No somos responsables por interrupciones causadas por fuerza mayor, fallas de terceros proveedores o problemas de conectividad del usuario.',
  },
  {
    title: '11. Terminación',
    content: 'Puedes cancelar tu cuenta en cualquier momento desde la configuración de tu perfil. Maity puede suspender o cancelar cuentas que violen estos términos, previo aviso de 15 días hábiles (excepto en casos de violación grave). Al cancelar: tus datos se eliminan según nuestra política de retención, las suscripciones activas no generan reembolso proporcional salvo acuerdo expreso, y mantienes acceso hasta el final del periodo pagado.',
  },
  {
    title: '12. Disputas',
    content: 'Cualquier disputa derivada de estos términos se resolverá preferentemente mediante negociación directa. Si la negociación no prospera en 30 días, las partes podrán recurrir a mediación ante la PROFECO o al arbitraje comercial según las reglas del Centro de Arbitraje de México (CAM). Ambas partes renuncian al derecho de iniciar acciones colectivas.',
  },
  {
    title: '13. Legislación aplicable',
    content: 'Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para la interpretación y cumplimiento de estos términos, las partes se someten a la jurisdicción de los tribunales competentes de Guadalajara, Jalisco, México, renunciando a cualquier otro fuero que pudiera corresponderles.',
  },
  {
    title: '14. Contacto',
    content: 'Para consultas legales, dudas sobre estos términos o notificaciones formales: Email: legal@maity.com.mx. Domicilio: Guadalajara, Jalisco, México. Horario de atención: lunes a viernes, 9:00 a 18:00 CST. Tiempo de respuesta: máximo 10 días hábiles.',
  },
];

export const TermsOfServicePage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section className="min-h-screen pt-32 pb-24 bg-[#050505]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <FadeIn>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 mb-8 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Volver
          </button>
        </FadeIn>

        {/* Header */}
        <FadeIn>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/15 flex items-center justify-center">
              <Scale size={24} className="text-pink-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Términos de Servicio</h1>
              <p className="text-sm text-gray-500 mt-1">Última actualización: enero 2026</p>
            </div>
          </div>
          <p className="text-gray-400 mb-6 max-w-2xl">
            Al usar Maity, aceptas estos términos. Léelos con atención.
          </p>
          <div className="flex gap-4 mb-12">
            <button
              onClick={() => navigate('/privacidad')}
              className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Shield size={14} /> Política de Privacidad
            </button>
            <a
              href="mailto:security@maity.com.mx"
              className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FileText size={14} /> Reportar problema de seguridad
            </a>
          </div>
        </FadeIn>

        {/* Sections */}
        <div className="space-y-3 mb-16">
          {sections.map((section, i) => (
            <FadeIn key={section.title} delay={i * 30}>
              <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0F0F0F]">
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium text-white text-sm">{section.title}</span>
                  {openIndex === i ? (
                    <ChevronUp size={16} className="text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openIndex === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-gray-400 leading-relaxed">{section.content}</p>
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Footer */}
        <FadeIn>
          <div className="p-8 bg-[#0F0F0F] border border-white/10 rounded-2xl text-center">
            <Mail size={24} className="text-pink-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">¿Dudas legales?</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Nuestro equipo legal está disponible para resolver cualquier consulta.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:legal@maity.com.mx"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: LANDING_COLORS.maityPink }}
              >
                <Mail size={16} /> legal@maity.com.mx
              </a>
              <button
                onClick={() => navigate('/privacidad')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/20 text-white hover:bg-white/5 transition-colors"
              >
                <Shield size={16} /> Política de Privacidad
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
