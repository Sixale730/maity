import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, ChevronDown, ChevronUp, Mail, Lock } from 'lucide-react';
import { FadeIn } from '../components/shared/FadeIn';
import { LANDING_COLORS } from '../constants/colors';

const sections = [
  {
    title: '1. Quién es Maity',
    content: 'Maity es una plataforma de desarrollo de comunicación profesional operada por Maity Inteligencia Artificial S.A.P.I. de C.V., con domicilio en Guadalajara, Jalisco, México. Somos responsables del tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).',
  },
  {
    title: '2. Datos que recopilamos',
    content: 'Recopilamos tres categorías de datos: (a) Datos personales de identificación: nombre, email, empresa, puesto, foto de perfil. (b) Datos de uso: interacciones con la plataforma, sesiones de práctica, resultados de evaluaciones, progreso y métricas de comunicación. (c) Datos de voz y audio: grabaciones de sesiones de práctica con IA, transcripciones generadas automáticamente. Solo recopilamos datos de voz durante sesiones explícitamente iniciadas por el usuario.',
  },
  {
    title: '3. Cómo procesamos tus datos',
    content: 'Procesamos tus datos con base en: (a) Consentimiento explícito al crear tu cuenta. (b) Ejecución del contrato de servicio. (c) Interés legítimo para mejorar la plataforma. Tus datos se utilizan exclusivamente para: generar feedback personalizado, medir tu progreso, personalizar tu experiencia de aprendizaje y mejorar nuestros algoritmos de IA de forma anonimizada.',
  },
  {
    title: '4. Datos de voz y audio',
    content: 'Las grabaciones de voz se procesan en tiempo real para generar feedback. Las transcripciones se almacenan asociadas a tu cuenta para que puedas revisar tu historial. Las grabaciones de audio originales se eliminan automáticamente después del procesamiento (máximo 72 horas). Nunca compartimos grabaciones de voz con terceros. Puedes solicitar la eliminación de todas tus transcripciones en cualquier momento.',
  },
  {
    title: '5. Transferencias internacionales',
    content: 'Tus datos pueden ser procesados en servidores ubicados en Estados Unidos (AWS/Supabase) y otros países donde operan nuestros proveedores de infraestructura. Todas las transferencias internacionales cumplen con los estándares de protección adecuados, incluyendo cláusulas contractuales tipo y certificaciones de seguridad.',
  },
  {
    title: '6. Derechos ARCO',
    content: 'Tienes derecho a: (A) Acceder a tus datos personales. (R) Rectificar datos inexactos o incompletos. (C) Cancelar el tratamiento de tus datos. (O) Oponerte al tratamiento para fines específicos. Para ejercer tus derechos ARCO, envía un correo a dpo@maity.com.mx con tu solicitud. Responderemos en un plazo máximo de 20 días hábiles.',
  },
  {
    title: '7. Medidas de seguridad',
    content: 'Implementamos medidas de seguridad técnicas, administrativas y físicas: cifrado AES-256 en reposo y TLS 1.3 en tránsito, control de acceso basado en roles (RBAC), autenticación multifactor para acceso a sistemas internos, monitoreo continuo de seguridad, auditorías periódicas de vulnerabilidades, y respaldo automático con retención geográficamente distribuida.',
  },
  {
    title: '8. Cookies y tecnologías similares',
    content: 'Utilizamos cookies estrictamente necesarias para el funcionamiento de la plataforma (autenticación, preferencias de sesión). Utilizamos cookies analíticas (Google Analytics) para entender el uso de la plataforma. No utilizamos cookies de publicidad ni de rastreo de terceros. Puedes gestionar tus preferencias de cookies desde la configuración de tu navegador.',
  },
  {
    title: '9. Retención de datos',
    content: 'Datos de cuenta: se conservan mientras tu cuenta esté activa. Transcripciones: 12 meses desde su generación, salvo solicitud de eliminación. Datos de uso y métricas: 24 meses en formato asociado a tu cuenta, indefinidamente en formato anonimizado. Datos de facturación: según requerimientos fiscales (5 años). Al eliminar tu cuenta, todos los datos personales se eliminan en un plazo máximo de 30 días.',
  },
  {
    title: '10. Legislación aplicable',
    content: 'Esta política se rige por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su reglamento, así como por los Lineamientos del Aviso de Privacidad emitidos por el INAI. Para usuarios fuera de México, también cumplimos con los principios del RGPD europeo y el CCPA de California cuando sea aplicable.',
  },
  {
    title: '11. Cambios a esta política',
    content: 'Nos reservamos el derecho de modificar esta política de privacidad. Cualquier cambio sustancial será notificado a través de la plataforma y/o por correo electrónico con al menos 30 días de anticipación. El uso continuado de la plataforma después de la notificación constituye aceptación de los cambios. Última actualización: enero 2026.',
  },
  {
    title: '12. Contacto',
    content: 'Para cualquier duda, solicitud o queja relacionada con el tratamiento de tus datos personales, contacta a nuestro Oficial de Protección de Datos: Email: dpo@maity.com.mx. Domicilio: Guadalajara, Jalisco, México. Tiempo de respuesta: máximo 20 días hábiles. También puedes presentar una queja ante el INAI (www.inai.org.mx) si consideras que tus derechos no han sido respetados.',
  },
];

export const PrivacyPolicyPage = () => {
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
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Shield size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Política de Privacidad</h1>
              <p className="text-sm text-gray-500 mt-1">Última actualización: enero 2026</p>
            </div>
          </div>
          <p className="text-gray-400 mb-12 max-w-2xl">
            Tu privacidad es nuestra prioridad. Este documento explica cómo recopilamos, usamos y protegemos tu información.
          </p>
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
            <Lock size={24} className="text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">¿Preguntas sobre privacidad?</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Contacta a nuestro Oficial de Protección de Datos para cualquier duda o solicitud.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:dpo@maity.com.mx"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: LANDING_COLORS.maityBlue }}
              >
                <Mail size={16} /> dpo@maity.com.mx
              </a>
              <a
                href="mailto:security@maity.com.mx"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/20 text-white hover:bg-white/5 transition-colors"
              >
                <Shield size={16} /> Reportar vulnerabilidad
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
