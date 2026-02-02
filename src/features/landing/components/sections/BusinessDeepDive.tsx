import {
  AlertTriangle,
  Laptop,
  Video,
  FileText,
  RefreshCcw,
  BarChart2,
  Users,
  Lightbulb,
  Shield,
  Lock,
  UserCheck,
  Check,
  Eye,
} from 'lucide-react';
import { LANDING_COLORS } from '../../constants/colors';
import { FadeIn } from '../shared/FadeIn';

export const BusinessDeepDive = () => {
  return (
    <div className="bg-[#050505] text-[#e7e7e9]">
      {/* La Realidad Incomoda */}
      <section className="py-24 border-t border-white/5 bg-gradient-to-b from-[#050505] to-[#0A0A0A]">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-900/10 border border-red-500/20 mb-8">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="text-xs font-bold text-red-400 tracking-wider uppercase">
                La Realidad Incomoda
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
              La capacitacion tradicional se ha vuelto un <br />
              <span className="text-gray-600">placebo corporativo.</span>
            </h2>
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Cursos aislados, sin seguimiento, sin mentoria real. Mientras tanto, las
              habilidades mas humanas &mdash;comunicacion, liderazgo y toma de decisiones&mdash;
              estan en declive.
              <br />
              <br />
              <span className="text-white">
                Si no lo resolvemos, terminamos con equipos poco efectivos y lideres que no
                inspiran.
              </span>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Que es Maity */}
      <section className="py-20 bg-[#0F0F0F] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn delay={100}>
            <span
              className="text-sm font-bold tracking-widest uppercase mb-4 block"
              style={{ color: LANDING_COLORS.maityBlue }}
            >
              Que es Maity
            </span>
            <h2 className="text-4xl font-bold text-white mb-6">Maity Desktop</h2>
            <div className="prose prose-invert prose-lg text-gray-400">
              <p className="leading-relaxed mb-6">
                Maity no es un curso mas. Es un mentor de IA que acompana, desafia y mide el
                crecimiento real de cada colaborador &mdash; todos los dias.
              </p>
              <div className="p-6 bg-[#141414] rounded-xl border border-white/10 flex gap-4 items-start">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Laptop size={24} className="text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Integracion Nativa</h4>
                  <p className="text-sm">
                    Presente en Teams, Google Meet o Zoom, escuchando (con permiso) y
                    entregando retroalimentacion practica.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
          <div className="relative">
            <FadeIn delay={300}>
              <div className="absolute inset-0 bg-blue-500/10 blur-3xl"></div>
              <div className="relative bg-black border border-white/10 rounded-2xl p-8">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-4 bg-[#141414] rounded-lg border border-white/5 opacity-50">
                    <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                    <div className="h-4 bg-gray-700 w-32 rounded"></div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[#1A1A1A] rounded-lg border border-blue-500/30 shadow-[0_0_20px_rgba(72,93,244,0.1)]">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="font-bold text-white">M</span>
                    </div>
                    <div>
                      <div className="h-4 bg-white w-48 rounded mb-2"></div>
                      <div className="text-xs text-blue-400">
                        Grabando y analizando con permiso...
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[#141414] rounded-lg border border-white/5 opacity-50">
                    <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                    <div className="h-4 bg-gray-700 w-32 rounded"></div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <FadeIn>
              <h2 className="text-3xl font-bold text-white mb-4">Como funciona</h2>
              <p className="text-gray-500">Simple, transparente y seguro.</p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Laptop size={32} className="text-white" />,
                title: '1. Instalacion',
                desc: 'Se instala Maity Desktop en el equipo del colaborador. Silencioso y ligero.',
              },
              {
                icon: <Video size={32} className="text-white" />,
                title: '2. Deteccion',
                desc: 'Detecta reuniones y solicita permiso para grabar. El usuario siempre tiene el control.',
              },
              {
                icon: <FileText size={32} className="text-white" />,
                title: '3. Analisis',
                desc: 'Al terminar, entrega insights y recomendaciones accionables al instante.',
              },
              {
                icon: <RefreshCcw size={32} className="text-white" />,
                title: '4. Seguimiento',
                desc: 'Maity refuerza habitos con retos y practicas continuas, no solo teoria.',
              },
              {
                icon: <BarChart2 size={32} className="text-white" />,
                title: '5. Dashboard Lider',
                desc: 'Vision de equipo para detectar patrones y tomar decisiones de desarrollo.',
              },
              {
                icon: <Users size={32} className="text-white" />,
                title: '6. Hibrido',
                desc: 'Opcion de consultoria y coaching humano para potenciar la implementacion.',
              },
            ].map((step, idx) => (
              <FadeIn key={idx} delay={idx * 100}>
                <div className="p-8 rounded-2xl bg-[#0F0F0F] border border-white/10 hover:border-blue-500/30 transition-all hover:-translate-y-1 h-full">
                  <div className="w-16 h-16 rounded-xl bg-blue-900/20 flex items-center justify-center mb-6 border border-blue-500/10">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Skills + Security */}
      <section className="py-24 bg-[#0A0A0A] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20">
          <FadeIn className="h-full">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Lightbulb className="text-yellow-400" /> Que mejora Maity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Comunicacion y claridad',
                'Liderazgo',
                'Toma de decisiones',
                'Empatia y servicio',
                'Negociacion',
                'Ventas',
              ].map((skill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 bg-[#141414] rounded-lg border border-white/5"
                >
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-gray-300 font-medium">{skill}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-blue-900/10 rounded-xl border border-blue-500/20">
              <h4 className="font-bold text-blue-200 mb-2">Aprendizaje Aplicado</h4>
              <ul className="space-y-2 text-sm text-blue-100/70">
                <li>&bull; Base de conocimiento especializada.</li>
                <li>&bull; Role playing y ejercicios practicos.</li>
                <li>&bull; Practicas cortas "en el momento".</li>
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={200} className="h-full">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Shield className="text-green-400" /> Seguridad y Confianza
            </h3>
            <p className="text-gray-400 mb-8">
              Sabemos que la informacion es de lo mas valioso. Por eso, la seguridad es nuestra
              prioridad #1.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-green-900/20 rounded-lg text-green-400 mt-1">
                  <Lock size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Proteccion Enterprise</h4>
                  <p className="text-sm text-gray-500">
                    Datos manejados bajo estrictas politicas y encriptacion de punta a punta.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-green-900/20 rounded-lg text-green-400 mt-1">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Permiso Explicito</h4>
                  <p className="text-sm text-gray-500">
                    La grabacion solo ocurre con permiso del usuario y enfoque laboral.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-[#050505]">
        <div className="max-w-4xl mx-auto px-4">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-12 text-center">
              Beneficios para la Empresa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                'Capacitacion con seguimiento real y evolutivo.',
                'Equipos mas efectivos y menor friccion.',
                'Mejor liderazgo que inspira y alinea.',
                'Conversaciones de ventas mas solidas.',
                'Visibilidad accionable para directores.',
                'Democratizacion del mentor para todos.',
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5">
                  <Check className="text-blue-500" size={20} />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Vision */}
      <section className="py-24 bg-gradient-to-t from-blue-900/20 to-[#050505] text-center border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="mb-6 mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <Eye size={32} className="text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">Nuestra Vision</h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Queremos democratizar el acceso a mentores capaces de llevar a cualquier
              profesional a su maximo potencial. Maity sera el coach digital mas cercano,
              convirtiendo aprendizaje en resultados.
            </p>
            <p className="text-sm text-gray-500 font-mono uppercase tracking-widest">
              El nuevo estandar global de desarrollo humano
            </p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
};
