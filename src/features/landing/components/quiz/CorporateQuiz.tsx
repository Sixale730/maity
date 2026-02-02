import { useState } from 'react';
import { Building2, ChevronRight, Check, TrendingUp, Share2 } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';
import { LANDING_COLORS } from '../../constants/colors';

type StepType = 'intro' | 'quiz' | 'result';
type ArchetypeKey = 'visionary' | 'negotiator' | 'architect';

interface CorporateQuizProps {
  setView: (view: string) => void;
}

interface Archetype {
  name: string;
  emoji: string;
  color: string;
  tagline: string;
  description: string;
  strengths: string[];
  growth: string[];
  maityPlan: string;
}

interface QuizOption {
  t: string;
  k: ArchetypeKey;
}

interface QuizQuestion {
  t: string;
  o: QuizOption[];
}

interface QuizResult {
  archetype: Archetype;
  percentages: Record<ArchetypeKey, number>;
  winnerKey: ArchetypeKey;
}

const archetypes: Record<ArchetypeKey, Archetype> = {
  visionary: {
    name: "L\u00EDder Visionario",
    emoji: "\uD83D\uDD2D",
    color: LANDING_COLORS.maityBlue,
    tagline: "Tu superpoder: transformar ideas en direcci\u00F3n estrat\u00E9gica",
    description: "Ves el panorama completo. Tu comunicaci\u00F3n inspira equipos a moverse hacia una visi\u00F3n compartida. Los stakeholders conf\u00EDan en tu capacidad para articular el futuro. Pero a veces la visi\u00F3n puede sentirse lejana para quienes necesitan instrucciones concretas.",
    strengths: ["Visi\u00F3n estrat\u00E9gica clara", "Comunicaci\u00F3n inspiradora", "Alineaci\u00F3n de equipos grandes"],
    growth: ["Bajar la estrategia a t\u00E1cticas concretas", "Escuchar las necesidades operativas", "Medir impacto en el corto plazo"],
    maityPlan: "Escalada Corporativa: Ejecuci\u00F3n Track \u2014 21 d\u00EDas para convertir tu visi\u00F3n en planes de acci\u00F3n concretos."
  },
  negotiator: {
    name: "Negociador Natural",
    emoji: "\uD83E\uDD1D",
    color: LANDING_COLORS.maityPink,
    tagline: "Tu superpoder: encontrar acuerdos donde otros ven conflicto",
    description: "Lees a las personas como nadie. Sabes cu\u00E1ndo presionar y cu\u00E1ndo ceder. Tu habilidad para persuadir y cerrar acuerdos es tu mayor activo. Pero a veces la orientaci\u00F3n al resultado puede hacer que otros sientan que solo te importa ganar.",
    strengths: ["Lectura de interlocutores", "Manejo de objeciones", "Cierre de acuerdos complejos"],
    growth: ["Construir relaciones a largo plazo", "Ceder estrat\u00E9gicamente", "Comunicar valor m\u00E1s all\u00E1 del precio"],
    maityPlan: "Escalada Corporativa: Relaciones Track \u2014 21 d\u00EDas para convertir negociaciones en alianzas duraderas."
  },
  architect: {
    name: "Arquitecto de Equipos",
    emoji: "\uD83C\uDFD7\uFE0F",
    color: LANDING_COLORS.maityGreen,
    tagline: "Tu superpoder: construir culturas donde la gente crece",
    description: "Tu fortaleza est\u00E1 en desarrollar personas. Sabes dar feedback que transforma, resolver conflictos internos y crear ambientes de alto rendimiento. Pero a veces la atenci\u00F3n al equipo puede hacerte perder velocidad en decisiones de negocio.",
    strengths: ["Feedback transformador", "Resoluci\u00F3n de conflictos internos", "Desarrollo de talento"],
    growth: ["Tomar decisiones impopulares", "Comunicar urgencia sin perder empat\u00EDa", "Delegar con confianza"],
    maityPlan: "Escalada Corporativa: Impacto Track \u2014 21 d\u00EDas para liderar con resultados sin perder tu humanidad."
  }
};

const questions: QuizQuestion[] = [
  {
    t: "Tu equipo de ventas no est\u00E1 alcanzando la cuota trimestral. \u00BFCu\u00E1l es tu primer movimiento?",
    o: [
      { t: "Convoco una sesi\u00F3n estrat\u00E9gica para redefinir el enfoque y la narrativa de venta.", k: "visionary" },
      { t: "Analizo los deals perdidos, identifico objeciones clave y armo un playbook de respuestas.", k: "negotiator" },
      { t: "Me re\u00FAno uno a uno con cada vendedor para entender sus bloqueos y dar coaching personalizado.", k: "architect" }
    ]
  },
  {
    t: "Un cliente importante amenaza con irse a la competencia. \u00BFC\u00F3mo manejas la conversaci\u00F3n?",
    o: [
      { t: "Le presento una visi\u00F3n de futuro: el roadmap de evoluci\u00F3n y c\u00F3mo encaja su negocio.", k: "visionary" },
      { t: "Escucho sus quejas, hago preguntas precisas y negocio condiciones que funcionen para ambos.", k: "negotiator" },
      { t: "Involucro a todo el equipo de cuenta para demostrar compromiso y resolvemos juntos.", k: "architect" }
    ]
  },
  {
    t: "Debes presentar resultados a la junta directiva y los n\u00FAmeros no son buenos. \u00BFC\u00F3mo lo abordas?",
    o: [
      { t: "Presento los n\u00FAmeros con contexto, enfoco en las oportunidades y propongo un plan a 6 meses.", k: "visionary" },
      { t: "Anticipo las objeciones, preparo respuestas s\u00F3lidas y negocio los pr\u00F3ximos pasos con datos.", k: "negotiator" },
      { t: "Incluyo la perspectiva del equipo, reconozco el esfuerzo y propongo ajustes en la estructura.", k: "architect" }
    ]
  },
  {
    t: "Dos departamentos tienen un conflicto que est\u00E1 afectando un proyecto clave. \u00BFQu\u00E9 haces?",
    o: [
      { t: "Convoco a ambos l\u00EDderes y reencuadro el conflicto como oportunidad de innovaci\u00F3n conjunta.", k: "visionary" },
      { t: "Facilito una negociaci\u00F3n donde cada parte define sus m\u00EDnimos y encontramos un acuerdo operativo.", k: "negotiator" },
      { t: "Hablo con cada equipo por separado, entiendo las frustraciones y dise\u00F1o un proceso de colaboraci\u00F3n.", k: "architect" }
    ]
  },
  {
    t: "Necesitas que tu equipo adopte una herramienta nueva que genera resistencia. \u00BFC\u00F3mo lo comunicas?",
    o: [
      { t: "Pinto la visi\u00F3n de c\u00F3mo esta herramienta nos posiciona mejor para el futuro del mercado.", k: "visionary" },
      { t: "Demuestro el ROI concreto: horas ahorradas, errores reducidos, resultados proyectados.", k: "negotiator" },
      { t: "Identifico a los early adopters, los empodero como champions y creo un sistema de acompa\u00F1amiento.", k: "architect" }
    ]
  },
  {
    t: "Un l\u00EDder de tu organizaci\u00F3n tiene problemas de comunicaci\u00F3n que afectan a su equipo. \u00BFC\u00F3mo intervienes?",
    o: [
      { t: "Le muestro c\u00F3mo su comunicaci\u00F3n impacta en los objetivos estrat\u00E9gicos y le doy una meta clara.", k: "visionary" },
      { t: "Tengo una conversaci\u00F3n directa: le presento evidencia y negociamos un plan de mejora medible.", k: "negotiator" },
      { t: "Le doy feedback honesto y constructivo, lo acompa\u00F1o con sesiones de coaching uno a uno.", k: "architect" }
    ]
  },
  {
    t: "\u00BFC\u00F3mo defines el \u00E9xito de un programa de desarrollo de talento?",
    o: [
      { t: "Que el equipo est\u00E9 alineado con la visi\u00F3n y sea capaz de adaptarse a los cambios del mercado.", k: "visionary" },
      { t: "M\u00E9tricas duras: incremento en ventas, retenci\u00F3n de clientes, deals cerrados.", k: "negotiator" },
      { t: "Que las personas crezcan, el clima laboral mejore y la rotaci\u00F3n baje.", k: "architect" }
    ]
  }
];

function getResult(allAnswers: ArchetypeKey[]): QuizResult {
  const counts: Record<ArchetypeKey, number> = { visionary: 0, negotiator: 0, architect: 0 };
  allAnswers.forEach(a => counts[a]++);
  const total = allAnswers.length;
  const sorted = (Object.entries(counts) as [ArchetypeKey, number][]).sort((a, b) => b[1] - a[1]);
  const winner = sorted[0][0];
  const percentages = {} as Record<ArchetypeKey, number>;
  sorted.forEach(([key, val]) => { percentages[key] = Math.round((val / total) * 100); });
  return { archetype: archetypes[winner], percentages, winnerKey: winner };
}

export const CorporateQuiz = ({ setView }: CorporateQuizProps) => {
  const [step, setStep] = useState<StepType>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<ArchetypeKey[]>([]);
  const [revealing, setRevealing] = useState(false);

  const handleAnswer = (key: ArchetypeKey) => {
    const newAnswers = [...answers, key];
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setRevealing(true);
      setTimeout(() => {
        setRevealing(false);
        setStep('result');
      }, 2000);
    }
  };

  const result = answers.length === questions.length ? getResult(answers) : null;
  const progress = ((currentQ + (step === 'result' || revealing ? 1 : 0)) / questions.length) * 100;

  return (
    <section className="py-24 bg-[#050505] flex items-center justify-center">
      <div className="max-w-2xl w-full px-4 text-center">
        {step === 'intro' && (
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/10 border border-blue-500/20 mb-8">
              <Building2 size={16} className="text-blue-500" />
              <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">Evaluaci&oacute;n Corporativa</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {"Cual es tu "}<span className="text-blue-500">estilo de liderazgo comunicativo</span>?
            </h2>
            <p className="text-gray-400 mb-12 text-lg">7 escenarios reales de negocio. 2 minutos. Descubre tu perfil de liderazgo y recibe un plan de acci&oacute;n para tu organizaci&oacute;n.</p>
            <button onClick={() => setStep('quiz')} className="px-10 py-5 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform text-xl">
              Empezar Evaluaci&oacute;n
            </button>
          </FadeIn>
        )}

        {(step === 'quiz' || revealing) && (
          <div>
            <div className="w-full bg-white/5 rounded-full h-2 mb-8">
              <div
                className="h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${revealing ? 100 : progress}%`, background: `linear-gradient(90deg, ${LANDING_COLORS.maityBlue}, ${LANDING_COLORS.maityGreen})` }}
              />
            </div>

            {revealing ? (
              <div className="py-20">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-xl text-white font-bold">Analizando tu perfil de liderazgo...</p>
                <p className="text-gray-500 mt-2">Calculando tu estilo comunicativo corporativo</p>
              </div>
            ) : (
              <div key={currentQ}>
                <div className="mb-8 text-blue-500 font-bold tracking-widest uppercase text-sm">Pregunta {currentQ + 1} de {questions.length}</div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-tight">{questions[currentQ].t}</h3>
                <div className="grid gap-4">
                  {questions[currentQ].o.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt.k)}
                      className="p-5 md:p-6 bg-[#0F0F0F] border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-2xl text-left text-base md:text-lg text-white transition-all group flex justify-between items-center"
                    >
                      <span>{opt.t}</span>
                      <ChevronRight className="text-gray-600 group-hover:text-blue-500 flex-shrink-0 ml-3" size={20} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'result' && result && (
          <FadeIn>
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-2 text-5xl"
              style={{ backgroundColor: `${result.archetype.color}20`, borderColor: result.archetype.color }}>
              {result.archetype.emoji}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Tu estilo: <span style={{ color: result.archetype.color }}>{result.archetype.name}</span></h2>
            <p className="text-lg font-medium mb-6" style={{ color: result.archetype.color }}>{result.archetype.tagline}</p>

            <div className="flex justify-center gap-4 mb-8 text-sm">
              {(Object.entries(result.percentages) as [ArchetypeKey, number][]).map(([key, pct]) => (
                <div key={key} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <span className="font-bold" style={{ color: archetypes[key].color }}>{archetypes[key].emoji} {pct}%</span>
                </div>
              ))}
            </div>

            <p className="text-gray-400 mb-8 text-lg leading-relaxed max-w-lg mx-auto">{result.archetype.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
              <div className="p-5 bg-[#0F0F0F] rounded-xl border border-green-500/20">
                <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-3">Fortalezas de liderazgo</h4>
                {result.archetype.strengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2 text-gray-300">
                    <Check size={14} className="text-green-400 flex-shrink-0" /> <span className="text-sm">{s}</span>
                  </div>
                ))}
              </div>
              <div className="p-5 bg-[#0F0F0F] rounded-xl border border-yellow-500/20">
                <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">Oportunidad de crecimiento</h4>
                {result.archetype.growth.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2 text-gray-300">
                    <TrendingUp size={14} className="text-yellow-400 flex-shrink-0" /> <span className="text-sm">{g}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-gradient-to-r from-blue-900/10 to-green-900/10 rounded-xl border border-blue-500/20 mb-8">
              <p className="text-white font-bold text-sm">{result.archetype.maityPlan}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setView('demo-calendar')}
                className="px-8 py-4 font-bold rounded-full text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg text-lg"
                style={{ background: `linear-gradient(90deg, ${LANDING_COLORS.maityBlue}, ${LANDING_COLORS.maityGreen})` }}
              >
                Solicitar Demo Corporativa
              </button>
              <button
                onClick={() => { if (navigator.share) { navigator.share({ title: `Mi estilo de liderazgo Maity: ${result.archetype.name}`, text: `${result.archetype.tagline}. Descubre el tuyo en maity.com` }); } }}
                className="px-6 py-4 font-bold rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 size={18} /> Compartir Resultado
              </button>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
};
