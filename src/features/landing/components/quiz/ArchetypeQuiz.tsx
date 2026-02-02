import { useState } from 'react';
import { Sparkles, ChevronRight, Check, TrendingUp, Share2 } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';
import { LANDING_COLORS } from '../../constants/colors';

type StepType = 'intro' | 'quiz' | 'result';
type ArchetypeKey = 'driver' | 'connector' | 'strategist';

interface ArchetypeQuizProps {
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
  driver: {
    name: "Estratega",
    emoji: "\u26A1",
    color: LANDING_COLORS.maityPink,
    tagline: "Tu superpoder: ir al punto con claridad y seguridad",
    description: "No te andas con rodeos. Cuando hablas, la gente sabe exactamente qu\u00E9 esperas. Tu franqueza genera respeto y tus ideas se entienden a la primera. Pero a veces la velocidad puede hacer que otros sientan que no hay espacio para su voz.",
    strengths: ["Claridad bajo presi\u00F3n", "Mensajes directos y memorables", "Decisiones r\u00E1pidas y comunicadas"],
    growth: ["Dar espacio a la escucha activa", "Suavizar el tono en temas sensibles", "Pausar antes de responder"],
    maityPlan: "Tu Escalada Maity: Monta\u00F1a de Empat\u00EDa \u2014 micro-retos para conectar sin perder tu fuerza."
  },
  connector: {
    name: "Conector",
    emoji: "\uD83D\uDCAB",
    color: LANDING_COLORS.maityBlue,
    tagline: "Tu superpoder: que la gente se sienta escuchada y segura contigo",
    description: "Las personas conf\u00EDan en ti porque genuinamente escuchas. Creas ambientes donde todos se atreven a hablar. Tu calidez desarma conflictos y construye equipos fuertes. Pero a veces tu amabilidad puede diluir tu mensaje cuando necesitas ser firme.",
    strengths: ["Escucha activa y validaci\u00F3n", "Construcci\u00F3n de confianza r\u00E1pida", "Resoluci\u00F3n natural de tensiones"],
    growth: ["Comunicar con firmeza cuando es necesario", "Decir que no sin culpa", "Estructurar ideas antes de compartirlas"],
    maityPlan: "Tu Escalada Maity: Monta\u00F1a de Claridad \u2014 entrena para comunicar con fuerza sin perder tu calidez."
  },
  strategist: {
    name: "Anal\u00EDtico",
    emoji: "\uD83C\uDFAF",
    color: LANDING_COLORS.maityGreen,
    tagline: "Tu superpoder: que nadie cuestione tu l\u00F3gica ni tu preparaci\u00F3n",
    description: "Piensas antes de hablar y se nota. Tus argumentos son s\u00F3lidos, tus presentaciones impecables. La gente respeta tu rigor y conf\u00EDa en tus conclusiones. Pero a veces el exceso de an\u00E1lisis puede frenar la conversaci\u00F3n y alejar a quienes buscan conexi\u00F3n emocional.",
    strengths: ["Argumentaci\u00F3n s\u00F3lida y estructurada", "Preparaci\u00F3n meticulosa", "An\u00E1lisis objetivo de situaciones"],
    growth: ["Storytelling emocional", "Improvisar con confianza", "Conectar antes de convencer"],
    maityPlan: "Tu Escalada Maity: Monta\u00F1a de Persuasi\u00F3n \u2014 inspira y mueve a la acci\u00F3n con narrativa."
  }
};

const questions: QuizQuestion[] = [
  {
    t: "Un colega te da feedback que consideras injusto frente a otros. \u00BFC\u00F3mo reaccionas?",
    o: [
      { t: "Le digo con firmeza que no estoy de acuerdo y explico mi perspectiva ah\u00ED mismo.", k: "driver" },
      { t: "Respiro, agradezco el comentario y le pido hablar en privado despu\u00E9s.", k: "connector" },
      { t: "Anoto los puntos, verifico los hechos y luego respondo con datos concretos.", k: "strategist" }
    ]
  },
  {
    t: "En una reuni\u00F3n, dos compa\u00F1eros no se ponen de acuerdo y la tensi\u00F3n sube. \u00BFQu\u00E9 haces?",
    o: [
      { t: "Corto la discusi\u00F3n y propongo una soluci\u00F3n concreta para avanzar.", k: "driver" },
      { t: "Les doy espacio, valido ambas posturas y busco un punto en com\u00FAn.", k: "connector" },
      { t: "Pido a ambos que presenten sus argumentos con evidencia antes de decidir.", k: "strategist" }
    ]
  },
  {
    t: "Tienes que presentar una idea importante a personas que no conoces bien. \u00BFC\u00F3mo te preparas?",
    o: [
      { t: "Preparo un mensaje corto, directo y con los beneficios claros desde el minuto uno.", k: "driver" },
      { t: "Investigo qui\u00E9nes son, busco puntos en com\u00FAn y empiezo con una historia personal.", k: "connector" },
      { t: "Armo una presentaci\u00F3n estructurada con datos, contexto y posibles objeciones resueltas.", k: "strategist" }
    ]
  },
  {
    t: "Debes dar malas noticias a tu equipo o grupo de trabajo. \u00BFC\u00F3mo lo manejas?",
    o: [
      { t: "Directo y sin rodeos, con un plan de acci\u00F3n claro para lo que sigue.", k: "driver" },
      { t: "Con empat\u00EDa, reconociendo c\u00F3mo se sienten antes de hablar de soluciones.", k: "connector" },
      { t: "Con an\u00E1lisis de causa ra\u00EDz, alternativas evaluadas y pr\u00F3ximos pasos definidos.", k: "strategist" }
    ]
  },
  {
    t: "Alguien nuevo en tu entorno te pide ayuda. \u00BFQu\u00E9 priorizas?",
    o: [
      { t: "Le doy instrucciones claras, paso a paso, para que sea aut\u00F3nomo r\u00E1pido.", k: "driver" },
      { t: "Lo invito a platicar, le pregunto c\u00F3mo se siente y le ofrezco acompa\u00F1amiento.", k: "connector" },
      { t: "Le comparto documentaci\u00F3n organizada y recursos para que aprenda a su ritmo.", k: "strategist" }
    ]
  },
  {
    t: "Expresas una opini\u00F3n y alguien te malinterpreta p\u00FAblicamente. \u00BFQu\u00E9 haces?",
    o: [
      { t: "Aclaro de inmediato lo que quise decir, sin dejar espacio a la ambig\u00FCedad.", k: "driver" },
      { t: "Le pregunto qu\u00E9 entendi\u00F3, escucho con calma y reformulo con m\u00E1s contexto.", k: "connector" },
      { t: "Vuelvo al punto original con datos y ejemplos para eliminar la confusi\u00F3n.", k: "strategist" }
    ]
  },
  {
    t: "\u00BFQu\u00E9 tipo de reconocimiento valoras m\u00E1s de quienes trabajan contigo?",
    o: [
      { t: "Resultados: 'Resolviste el problema m\u00E1s dif\u00EDcil del trimestre'.", k: "driver" },
      { t: "Impacto humano: 'Tu equipo dice que contigo se sienten seguros'.", k: "connector" },
      { t: "Proceso: 'Tu an\u00E1lisis fue clave para tomar la mejor decisi\u00F3n'.", k: "strategist" }
    ]
  }
];

function getResult(allAnswers: ArchetypeKey[]): QuizResult {
  const counts: Record<ArchetypeKey, number> = { driver: 0, connector: 0, strategist: 0 };
  allAnswers.forEach(a => counts[a]++);
  const total = allAnswers.length;
  const sorted = (Object.entries(counts) as [ArchetypeKey, number][]).sort((a, b) => b[1] - a[1]);
  const winner = sorted[0][0];
  const percentages = {} as Record<ArchetypeKey, number>;
  sorted.forEach(([key, val]) => { percentages[key] = Math.round((val / total) * 100); });
  return { archetype: archetypes[winner], percentages, winnerKey: winner };
}

export const ArchetypeQuiz = ({ setView }: ArchetypeQuizProps) => {
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-900/10 border border-pink-500/20 mb-8">
              <Sparkles size={16} className="text-pink-500" />
              <span className="text-xs font-bold text-pink-400 tracking-wider uppercase">Test de 2 minutos</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {"Cual es tu "}<span className="text-pink-500">superpoder de comunicacion</span>?
            </h2>
            <p className="text-gray-400 mb-12 text-lg">7 situaciones reales. 2 minutos. Descubre tu arquetipo y recibe un plan de acci&oacute;n personalizado para tu escalada.</p>
            <button onClick={() => setStep('quiz')} className="px-10 py-5 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform text-xl">
              Empezar Test
            </button>
          </FadeIn>
        )}

        {(step === 'quiz' || revealing) && (
          <div>
            {/* Progress Bar */}
            <div className="w-full bg-white/5 rounded-full h-2 mb-8">
              <div
                className="h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${revealing ? 100 : progress}%`, background: `linear-gradient(90deg, ${LANDING_COLORS.maityPink}, ${LANDING_COLORS.maityBlue})` }}
              />
            </div>

            {revealing ? (
              <div className="py-20">
                <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-xl text-white font-bold">Analizando tu perfil...</p>
                <p className="text-gray-500 mt-2">Calculando tu arquetipo de comunicaci&oacute;n</p>
              </div>
            ) : (
              <div key={currentQ}>
                <div className="mb-8 text-pink-500 font-bold tracking-widest uppercase text-sm">Pregunta {currentQ + 1} de {questions.length}</div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-tight">{questions[currentQ].t}</h3>
                <div className="grid gap-4">
                  {questions[currentQ].o.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt.k)}
                      className="p-5 md:p-6 bg-[#0F0F0F] border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/5 rounded-2xl text-left text-base md:text-lg text-white transition-all group flex justify-between items-center"
                    >
                      <span>{opt.t}</span>
                      <ChevronRight className="text-gray-600 group-hover:text-pink-500 flex-shrink-0 ml-3" size={20} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'result' && result && (
          <FadeIn>
            {/* Archetype Badge */}
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-2 text-5xl"
              style={{ backgroundColor: `${result.archetype.color}20`, borderColor: result.archetype.color }}>
              {result.archetype.emoji}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Eres un <span style={{ color: result.archetype.color }}>{result.archetype.name}</span></h2>
            <p className="text-lg font-medium mb-6" style={{ color: result.archetype.color }}>{result.archetype.tagline}</p>

            {/* Score Breakdown */}
            <div className="flex justify-center gap-4 mb-8 text-sm">
              {(Object.entries(result.percentages) as [ArchetypeKey, number][]).map(([key, pct]) => (
                <div key={key} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <span className="font-bold" style={{ color: archetypes[key].color }}>{archetypes[key].emoji} {pct}%</span>
                </div>
              ))}
            </div>

            <p className="text-gray-400 mb-8 text-lg leading-relaxed max-w-lg mx-auto">{result.archetype.description}</p>

            {/* Strengths & Growth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
              <div className="p-5 bg-[#0F0F0F] rounded-xl border border-green-500/20">
                <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-3">Tus fortalezas</h4>
                {result.archetype.strengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2 text-gray-300">
                    <Check size={14} className="text-green-400 flex-shrink-0" /> <span className="text-sm">{s}</span>
                  </div>
                ))}
              </div>
              <div className="p-5 bg-[#0F0F0F] rounded-xl border border-yellow-500/20">
                <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">Tu oportunidad de crecimiento</h4>
                {result.archetype.growth.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2 text-gray-300">
                    <TrendingUp size={14} className="text-yellow-400 flex-shrink-0" /> <span className="text-sm">{g}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Maity Plan */}
            <div className="p-5 bg-gradient-to-r from-pink-900/10 to-blue-900/10 rounded-xl border border-pink-500/20 mb-4">
              <p className="text-white font-bold text-sm">{result.archetype.maityPlan}</p>
            </div>
            <p className="text-xs text-gray-500 mb-8 italic">Este es 1 de los 6 tipos de comunicador que Maity eval&uacute;a: Estratega, Conector, Persuasor, Mediador, Anal&iacute;tico e Inspirador. Descubre tu perfil completo al registrarte.</p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setView('primeros-pasos')}
                className="px-8 py-4 font-bold rounded-full text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg text-lg"
                style={{ background: `linear-gradient(90deg, ${LANDING_COLORS.maityPink}, ${LANDING_COLORS.maityBlue})` }}
              >
                Empieza Tu Escalada Gratis
              </button>
              <button
                onClick={() => { if (navigator.share) { navigator.share({ title: `Soy ${result.archetype.name} — Maity`, text: `${result.archetype.tagline}. Descubre tu tipo en maity.com` }); } }}
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
