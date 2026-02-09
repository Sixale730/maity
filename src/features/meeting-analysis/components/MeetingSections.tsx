import { useState } from "react";
import { Card } from "@/ui/components/ui/card";
import { Badge } from "@/ui/components/ui/badge";
import { Button } from "@/ui/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/ui/components/ui/collapsible";
import type { MeetingAnalysisData } from "../types";
import { GaugeChart, MiniRadar } from "./MeetingCharts";

// ─── Section Label ───────────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-8 mb-2 pl-1">
      {children}
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────
export function HeaderSection({ data }: { data: MeetingAnalysisData }) {
  return (
    <div className="text-center pt-6 pb-2">
      <h1 className="text-3xl font-bold">Análisis de Tu Comunicación</h1>
      <div className="text-muted-foreground text-sm mt-2 space-x-2">
        <span>Reunión de negocio &bull; {data.meta.duracion_minutos} minutos</span>{" "}
        &bull;{" "}
        <span>
          Participantes: {data.meta.hablantes.join(", ")}
        </span>{" "}
        &bull;{" "}
        <span>~{data.meta.palabras_totales.toLocaleString()} palabras analizadas</span>
      </div>
    </div>
  );
}

// ─── Resumen Hero ────────────────────────────────────────────────────
export function ResumenHero({ data }: { data: MeetingAnalysisData }) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-8 text-white shadow-lg flex gap-8 items-center flex-wrap">
      <div className="flex-none w-[200px] text-center">
        <GaugeChart score={data.resumen.puntuacion_global} />
        <div className="text-5xl font-extrabold leading-none text-red-400">
          {data.resumen.puntuacion_global}
        </div>
        <div className="text-lg font-semibold mt-1">En Desarrollo</div>
        <div className="text-sm opacity-70">de 100 puntos</div>
      </div>
      <div className="flex-1 min-w-[280px]">
        <p className="text-base leading-relaxed opacity-95">
          Esta es una reunión de negocio con muchísima energía, visión y
          potencial real. Poncho demuestra pasión desbordante por Maity y Chris
          aporta experiencia estratégica valiosa en marketing, inversión y
          posicionamiento.{" "}
          <strong>
            El problema central: se tocaron 20+ temas en 39 minutos sin cerrar
            ninguno con acciones concretas.
          </strong>{" "}
          Es como abrir 20 pestañas en el navegador y no terminar de leer
          ninguna. La química entre ambos es excelente — lo que falta es
          estructura para convertir toda esa energía en ejecución.
        </p>
      </div>
    </div>
  );
}

// ─── KPI Grid ────────────────────────────────────────────────────────
interface KPI {
  icon: string;
  number: string;
  label: string;
  detail: string;
  accent: string;
}

const kpiItems: KPI[] = [
  {
    icon: "🗣️",
    number: "142",
    label: "Muletillas detectadas",
    detail:
      '"este" x37, "o sea" x25, "güey" x20, "pues" x18 — una cada 43 palabras (~17 seg)',
    accent: "red",
  },
  {
    icon: "⏱️",
    number: "2:43",
    label: "Monólogo más largo",
    detail:
      "Chris sobre estrategia de marketing. Sin verificar si Poncho estaba de acuerdo con el plan.",
    accent: "yellow",
  },
  {
    icon: "⚖️",
    number: "1.4x",
    label: "Ratio de habla",
    detail:
      "Poncho habla 1.4 veces más que Chris. Bastante equilibrado para una presentación de avances.",
    accent: "green",
  },
  {
    icon: "❓",
    number: "P:8 / C:12",
    label: "Preguntas hechas",
    detail:
      "Chris hace más preguntas estratégicas. Poncho hace pocas — mayormente retóricas.",
    accent: "blue",
  },
  {
    icon: "💬",
    number: "32",
    label: 'Respuestas "vacías" de Chris',
    detail:
      'Veces que solo dijo "sí", "ok", "claro", "exacto", "va". ¿Procesando o esperando turno?',
    accent: "purple",
  },
  {
    icon: "📋",
    number: "20+ vs 2",
    label: "Temas vs Agenda",
    detail:
      "Se desbordó 10x. Pricing, equity, apps, servidores, legal, marketing, Xcaret, Claude...",
    accent: "red",
  },
  {
    icon: "✅",
    number: "6",
    label: "Acciones definidas",
    detail:
      "De 20+ temas, solo 6 con acción. La mayoría sin fecha concreta ni responsable claro.",
    accent: "yellow",
  },
  {
    icon: "🚪",
    number: "14+",
    label: "Temas sin cerrar",
    detail:
      "Servidores, legal, iPhone, API/CRM, call centers, memorias, redes sociales, blog...",
    accent: "orange",
  },
];

const ACCENT_BORDER: Record<string, string> = {
  red: "border-t-red-500",
  yellow: "border-t-yellow-500",
  green: "border-t-green-500",
  blue: "border-t-blue-500",
  purple: "border-t-purple-500",
  orange: "border-t-orange-500",
};

const ACCENT_TEXT: Record<string, string> = {
  red: "text-red-500",
  yellow: "text-yellow-500",
  green: "text-green-500",
  blue: "text-blue-500",
  purple: "text-purple-500",
  orange: "text-orange-500",
};

export function KPIGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {kpiItems.map((kpi) => (
        <Card
          key={kpi.label}
          className={`bg-[#0F0F0F] border border-white/10 border-t-[3px] ${ACCENT_BORDER[kpi.accent]} p-4 text-center hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg transition-all`}
        >
          <div className="text-xl mb-1">{kpi.icon}</div>
          <div className={`text-3xl font-extrabold leading-tight ${ACCENT_TEXT[kpi.accent]}`}>
            {kpi.number}
          </div>
          <div className="text-sm font-semibold mt-0.5">{kpi.label}</div>
          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {kpi.detail}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Emotion Profiles ────────────────────────────────────────────────
export function EmotionProfiles({
  data,
}: {
  data: MeetingAnalysisData;
}) {
  const poncho = data.dimensiones.emociones.por_hablante.Poncho;
  const chris = data.dimensiones.emociones.por_hablante.Chris;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-[#0F0F0F] border border-white/10 border-l-[5px] border-l-blue-500 p-6 text-center">
        <div className="text-5xl leading-none">🚀</div>
        <div className="text-lg font-bold text-blue-500 mt-1">Poncho</div>
        <div className="text-xl font-extrabold text-blue-500 uppercase tracking-wide mt-1">
          ENTUSIASMO (88%)
        </div>
        <p className="text-sm text-muted-foreground italic mt-2">
          "Irradia pasión por su proyecto. Su tono dice: esto va a ser enorme y
          quiero que te subas al barco."
        </p>
        <MiniRadar speakerData={poncho} color="#3b82f6" />
      </Card>

      <Card className="bg-[#0F0F0F] border border-white/10 border-l-[5px] border-l-purple-500 p-6 text-center">
        <div className="text-5xl leading-none">🎯</div>
        <div className="text-lg font-bold text-purple-500 mt-1">Chris</div>
        <div className="text-xl font-extrabold text-purple-500 uppercase tracking-wide mt-1">
          ANTICIPACIÓN (75%)
        </div>
        <p className="text-sm text-muted-foreground italic mt-2">
          "Está calculando, planeando, viendo el potencial. Su tono dice: esto
          puede funcionar si lo hacemos bien."
        </p>
        <MiniRadar speakerData={chris} color="#8b5cf6" />
      </Card>
    </div>
  );
}

// ─── Score Bars ──────────────────────────────────────────────────────
interface ScoreBarItem {
  emoji: string;
  name: string;
  level: string;
  score: number;
  color: "red" | "yellow" | "green";
}

const scoreItems: ScoreBarItem[] = [
  {
    emoji: "🔴",
    name: "Claridad",
    level: "Difícil — muletillas extremas, oraciones incompletas, formato muy oral",
    score: 35,
    color: "red",
  },
  {
    emoji: "⚠️",
    name: "Vocabulario",
    level: "Normal — buen vocabulario de negocio, pero muy coloquial",
    score: 65,
    color: "yellow",
  },
  {
    emoji: "🔴",
    name: "Estructura",
    level: "Muy débil — sin agenda, 20+ temas, sin cierre ni resumen",
    score: 28,
    color: "red",
  },
  {
    emoji: "⚠️",
    name: "Empatía (Poncho)",
    level: "Mejorable — enfocado en presentar, poco en escuchar feedback",
    score: 45,
    color: "yellow",
  },
  {
    emoji: "⚠️",
    name: "Empatía (Chris)",
    level: "Mejorable — escucha bien pero también entra en monólogos propios",
    score: 58,
    color: "yellow",
  },
  {
    emoji: "🔴",
    name: "Objetivo",
    level: "Débil — muchos temas, pocas acciones con fecha y responsable",
    score: 32,
    color: "red",
  },
  {
    emoji: "✅",
    name: "Adaptación",
    level: "Buena — mismo registro, buena sintonía, acomodación lingüística",
    score: 75,
    color: "green",
  },
];

const BAR_COLOR: Record<string, string> = {
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
};

const SCORE_TEXT_COLOR: Record<string, string> = {
  red: "text-red-500",
  yellow: "text-yellow-500",
  green: "text-green-500",
};

export function ScoreBars() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
      {scoreItems.map((item) => (
        <Card key={item.name} className="bg-[#0F0F0F] border border-white/10 p-4 flex items-center gap-3.5">
          <div className="text-xl shrink-0">{item.emoji}</div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{item.name}</div>
            <div className="text-xs text-muted-foreground">{item.level}</div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full rounded-full ${BAR_COLOR[item.color]} transition-all duration-700`}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
          <div className={`text-2xl font-bold shrink-0 ${SCORE_TEXT_COLOR[item.color]}`}>
            {item.score}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Insights Grid ───────────────────────────────────────────────────
const INSIGHT_BORDERS = [
  "border-l-orange-500",
  "border-l-purple-500",
  "border-l-red-500",
  "border-l-yellow-500",
  "border-l-blue-500",
];

export function InsightsGrid({
  data,
}: {
  data: MeetingAnalysisData;
}) {
  return (
    <div className="space-y-3">
      {data.insights.map((ins, i) => (
        <Card
          key={i}
          className={`bg-[#0F0F0F] border border-white/10 border-l-[5px] ${INSIGHT_BORDERS[i % INSIGHT_BORDERS.length]} p-5 hover:translate-x-1 hover:border-white/20 transition-all`}
        >
          <div className="font-bold leading-snug">{ins.dato}</div>
          <div className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {ins.por_que}
          </div>
          <div className="text-sm text-blue-500 font-semibold mt-2">
            {ins.sugerencia}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Patrón Detectado ────────────────────────────────────────────────
export function PatronCard({ data }: { data: MeetingAnalysisData }) {
  const senalIcons = ["📊", "🔀", "💡"];
  return (
    <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 rounded-xl p-8 text-white shadow-lg">
      <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1.5">
        Tu patrón de comunicación
      </h3>
      <div className="text-xl font-extrabold leading-snug">
        {data.patron.actual}
      </div>
      <div className="text-base opacity-70 my-2.5">Podría evolucionar a:</div>
      <div className="text-lg font-semibold text-cyan-300">
        {data.patron.evolucion}
      </div>

      <div className="mt-4.5 space-y-0">
        {data.patron.senales.map((s, i) => (
          <div
            key={i}
            className="flex gap-2.5 items-start py-2.5 border-b border-white/10 last:border-b-0 text-sm leading-relaxed"
          >
            <span className="text-base shrink-0 mt-0.5">{senalIcons[i]}</span>
            <span className="opacity-90">
              <strong>Señal {i + 1}:</strong> {s}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4.5 p-4 bg-white/[0.08] rounded-lg text-sm leading-relaxed opacity-90">
        <strong className="text-cyan-300">Qué cambiaría si evoluciona:</strong>{" "}
        {data.patron.que_cambiaria}
      </div>
    </div>
  );
}

// ─── Hallazgos Detallados ────────────────────────────────────────────
function Finding({
  type,
  title,
  cita,
  alternativa,
  porQue,
}: {
  type: "ok" | "warn" | "bad";
  title: string;
  cita?: string;
  alternativa?: string;
  porQue?: string;
}) {
  const bgClass =
    type === "ok"
      ? "bg-green-500/10"
      : type === "warn"
        ? "bg-yellow-500/10"
        : "bg-red-500/10";
  const borderClass =
    type === "ok"
      ? "border-l-green-500"
      : type === "warn"
        ? "border-l-yellow-500"
        : "border-l-red-500";
  return (
    <div className={`${bgClass} border-l-2 ${borderClass} rounded-lg p-3 mt-2.5 text-sm leading-relaxed`}>
      <div className="font-bold">{title}</div>
      {cita && (
        <div className="italic text-muted-foreground mt-1">«{cita}»</div>
      )}
      {alternativa && <div className="mt-1">{alternativa}</div>}
      {porQue && (
        <div className="text-xs text-muted-foreground mt-1">
          ¿Por qué importa? {porQue}
        </div>
      )}
    </div>
  );
}

function ScoreBadge({
  score,
  color,
}: {
  score: string;
  color: "green" | "yellow" | "red";
}) {
  const variants: Record<string, string> = {
    green: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200",
    red: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200",
  };
  return (
    <Badge className={`ml-2 ${variants[color]}`}>{score}</Badge>
  );
}

export function HallazgosSection({
  data,
}: {
  data: MeetingAnalysisData;
}) {
  return (
    <div className="space-y-4">
      {/* Claridad */}
      <Card className="bg-[#0F0F0F] border border-white/10 border-l-4 border-l-red-500 p-6">
        <h3 className="text-base font-bold">
          ¿Qué tan fácil es entenderte?
          <ScoreBadge score="35/100" color="red" />
        </h3>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          La reunión tiene contenido valioso pero el formato oral es
          extremadamente desorganizado. Oraciones que se cortan a la mitad,
          frases que se repiten, muletillas cada 17 segundos. Es como una
          conversación de WhatsApp de audio de 39 minutos: mucha información,
          poca estructura.
        </p>
        <Finding
          type="ok"
          title="✅ Demo en vivo que muestra el producto funcionando"
          cita="Lo que estoy diciendo se está transcribiendo... en tiempo real lo que tú dices se está transcribiendo"
          porQue="Mostrar el producto funcionando es más poderoso que 100 slides. Chris puede ver con sus propios ojos que la tecnología funciona."
        />
        <Finding
          type="ok"
          title="✅ Vocabulario de negocio accesible"
          cita='B2C, B2B, y B2Coach", "phantom shares", "early adopters", "family and friends'
          porQue="Ambos manejan terminología de startups con naturalidad, lo que indica que están en el mismo nivel de conversación empresarial."
        />
        <Finding
          type="bad"
          title="🔴 Muletillas extremas: 142 en 39 minutos"
          cita='Este, espérame nomás dejar contesto Kari" y "este, ah, la biblioteca de contenido. Entonces, bueno, a ver, el resumen'
          alternativa="Alternativa: Sustituir cada muletilla por 1 segundo de silencio. El silencio transmite que estás pensando; la muletilla transmite que estás perdido."
          porQue="Si esta reunión fuera con un inversionista, 142 muletillas en 39 minutos destruirían la credibilidad. Hay que limpiarlo ANTES de hacer el pitch a inversores."
        />
        <Finding
          type="bad"
          title="🔴 Oraciones que se cortan, repiten y reinician constantemente"
          cita="Qué qué es el gran qué es el qué es el qué es el gran reto ahorita que tenemos para levantar el capital?"
          alternativa='Alternativa: Pausar, pensar la oración completa, y decirla una vez: "El gran reto para levantar capital es que necesitamos comprobar que el modelo funcione."'
          porQue="Cada reinicio de oración es un momento donde el oyente pierde el hilo. En 39 minutos, se acumulan docenas de estos momentos."
        />
      </Card>

      {/* Narrativa Emociones */}
      <Card className="bg-[#0F0F0F] border border-white/10 p-6">
        <h3 className="text-base font-bold mb-3">
          ¿Qué emociones transmite cada participante?
        </h3>
        <div className="border-l-2 border-l-blue-500 pl-3 mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-blue-500">Poncho</span>
            <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full font-medium">
              Entusiasmo desbordante
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Tu tono es de{" "}
            <span className="bg-blue-500/10 px-1 rounded">
              entusiasmo desbordante
            </span>{" "}
            por el proyecto. Transmites una urgencia contagiosa{" "}
            <span className="bg-blue-500/10 px-1 rounded">
              «avanzamos muchísimo»
            </span>
            ,{" "}
            <span className="bg-blue-500/10 px-1 rounded">
              «las posibilidades son bastante altas»
            </span>{" "}
            y orgullo legítimo por lo construido{" "}
            <span className="bg-blue-500/10 px-1 rounded">
              «ya tenemos la aplicación de Android, la web, la de escritorio»
            </span>
            . Hay momentos de vulnerabilidad honesta{" "}
            <span className="bg-blue-500/10 px-1 rounded">
              «me ha costado un huevo porque ha sido complejo»
            </span>{" "}
            que humanizan tu pitch. También transmites un deseo profundo de que
            Chris se sume: no estás vendiendo, estás invitando.
          </p>
        </div>
        <div className="border-l-2 border-l-purple-500 pl-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-purple-500">Chris</span>
            <span className="text-xs bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full font-medium">
              Pragmatismo estratégico
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Tu tono transmite{" "}
            <span className="bg-purple-500/10 px-1 rounded">
              pragmatismo estratégico
            </span>{" "}
            con entusiasmo contenido. Aportas experiencia real:{" "}
            <span className="bg-purple-500/10 px-1 rounded">
              «si no tienes huella digital, valió madre»
            </span>
            ,{" "}
            <span className="bg-purple-500/10 px-1 rounded">
              «yo agarré un contrato muy grande para Bonus en Arisa»
            </span>
            . Hay una combinación de confianza en tu capacidad{" "}
            <span className="bg-purple-500/10 px-1 rounded">
              «yo puedo aportar muchísimo»
            </span>{" "}
            y una evaluación constante del proyecto. No estás diciendo sí a
            ciegas — estás calculando dónde aportar primero.
          </p>
        </div>
      </Card>

      {/* Narrativa Formalidad */}
      <Card className="bg-[#0F0F0F] border border-white/10 p-6">
        <h3 className="text-base font-bold mb-3">
          ¿Qué nivel de formalidad usa cada participante?
        </h3>
        <div className="border-l-2 border-l-blue-500 pl-3 mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-blue-500">Poncho</span>
            <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full font-medium">
              Informal-coloquial extremo
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Registro extremadamente informal-coloquial mexicano. Groserías
            frecuentes{" "}
            <span className="bg-blue-500/10 px-1 rounded">
              «un putero de cosas», «un chingo de mamadas», «ya valió madre»
            </span>
            , tuteo total y jerga de startup. Funciona entre socios que se
            conocen, pero necesita un "modo inversor" completamente diferente
            para reuniones con fondos. El contraste entre{" "}
            <span className="bg-blue-500/10 px-1 rounded">
              «phantom shares»
            </span>{" "}
            y{" "}
            <span className="bg-blue-500/10 px-1 rounded">
              «un chingo de mamadas»
            </span>{" "}
            en la misma oración es notable.
          </p>
        </div>
        <div className="border-l-2 border-l-purple-500 pl-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-purple-500">Chris</span>
            <span className="text-xs bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full font-medium">
              Informal estructurado
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Registro informal pero ligeramente más estructurado que Poncho. Usa
            lenguaje de negocio con más soltura{" "}
            <span className="bg-purple-500/10 px-1 rounded">
              «posicionamiento orgánico», «ronda de family and friends»,
              «dilución»
            </span>{" "}
            y groserías moderadas. Su acomodación es evidente: adopta el "güey"
            de Poncho (10 veces) para generar sintonía. Esto es rapport natural —
            exactamente lo que Maity mide.
          </p>
        </div>
      </Card>

      {/* Empatía Poncho */}
      <Card className="bg-[#0F0F0F] border border-white/10 border-l-4 border-l-yellow-500 p-6">
        <h3 className="text-base font-bold">
          ¿Cómo conecta Poncho emocionalmente con Chris?
          <ScoreBadge score="45/100" color="yellow" />
        </h3>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Poncho está tan enfocado en mostrar sus avances que dedica poco tiempo
          a escuchar lo que Chris piensa o necesita. Es una presentación más que
          una conversación. La empatía mejora cuando habla de la sociedad
          directamente.
        </p>
        <Finding
          type="ok"
          title="✅ Transparencia total sobre la situación del proyecto"
          cita='Ahorita estamos pagando mucho por infraestructura", "todavía no tengo un desarrollador en iPhone'
          porQue="No oculta los problemas. Esta honestidad construye confianza — Chris sabe exactamente en qué se está metiendo."
        />
        <Finding
          type="ok"
          title="✅ Invita la retroalimentación abiertamente"
          cita="Si dices no, pues, güey, estás loca, no creo que esto funcione... pues también bienvenida la retroalimentación"
          porQue='Dar permiso explícito para decir "no" demuestra seguridad y respeto por la opinión del otro.'
        />
        <Finding
          type="warn"
          title="⚠️ Interrumpe la reunión para contestar un mensaje"
          cita="Espérame nomás dejar contesto Kari. Dame un segundo. ¿Sí o no? — [02:37]"
          alternativa='Alternativa: Silenciar el teléfono antes de la reunión. Si es urgente, decir: "Disculpa, necesito 10 segundos, es urgente."'
          porQue="En una reunión donde le pides a alguien que invierta tiempo y dinero, cada interrupción resta importancia al momento."
        />
        <Finding
          type="warn"
          title="⚠️ No pregunta a Chris qué necesita para tomar la decisión"
          cita='Poncho presenta todo lo que tiene y lo que quiere, pero nunca pregunta: "¿Qué necesitas tú ver para sentirte cómodo?"'
          alternativa='Podría preguntar: "Chris, ¿qué información te falta para decidir? ¿Qué te preocupa más?"'
          porQue="Vender es entender qué necesita el otro. Poncho vende mostrando todo — pero Chris puede necesitar solo 3 datos para decidir."
        />
      </Card>

      {/* Empatía Chris */}
      <Card className="bg-[#0F0F0F] border border-white/10 border-l-4 border-l-yellow-500 p-6">
        <h3 className="text-base font-bold">
          ¿Cómo conecta Chris emocionalmente con Poncho?
          <ScoreBadge score="58/100" color="yellow" />
        </h3>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Chris escucha con interés real y aporta valor estratégico concreto. Su
          empatía se manifiesta en ofrecer no solo opiniones sino recursos:
          contactos, dinero, experiencia. La oportunidad está en hacer más
          preguntas antes de dar soluciones.
        </p>
        <Finding
          type="ok"
          title="✅ Valida el trabajo de Poncho antes de sugerir mejoras"
          cita="Creo que es, o sea, te estás haciéndolo bien, o sea, estás haciéndolo bien pensado. Los dos modelos funcionan."
          porQue="Primero validar, luego mejorar. Si Chris empezara por las críticas, Poncho se cerraría."
        />
        <Finding
          type="ok"
          title="✅ Ofrece skin in the game: mente + capital"
          cita="Yo le entro inicialmente con esta parte de trabajo... y voy aportando algo de capital"
          porQue="No solo dice 'me interesa' — ofrece compromiso real."
        />
        <Finding
          type="warn"
          title="⚠️ Entra en monólogos de estrategia sin verificar si Poncho está de acuerdo"
          cita="Chris habla durante 2:43 sobre marketing, SEO, redes sociales, página web, pauta, posicionamiento sin pausar para preguntar a Poncho si esa es la prioridad."
          alternativa='Podría pausar después de cada bloque: "¿Esto está alineado con lo que tú priorizas? ¿O hay algo más urgente?"'
          porQue='Dar soluciones sin confirmar el problema es arriesgado. Poncho puede estar pensando "necesito un developer" mientras Chris habla de Google Ads.'
        />
      </Card>

      {/* Objetivo */}
      <Card className="bg-[#0F0F0F] border border-white/10 border-l-4 border-l-red-500 p-6">
        <h3 className="text-base font-bold">
          ¿Se entiende qué quiere lograr esta reunión?
          <ScoreBadge score="32/100" color="red" />
        </h3>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          La reunión tenía un propósito implícito (mostrar avances + proponer
          sociedad) pero se desbordó completamente. De 20+ temas, solo 6 tienen
          alguna acción. Es como ir al supermercado sin lista: entras por leche y
          sales con 20 cosas, pero sin la leche.
        </p>
        <Finding
          type="ok"
          title="✅ La propuesta de partnership es clara"
          cita="La propuesta específicamente es colaborar en este proyecto en conjunto, en crear esta comunidad"
          porQue="Poncho tiene claro lo que quiere: un socio que aporte mente y capital."
        />
        <Finding
          type="ok"
          title="✅ Se define una reunión recurrente"
          cita="Martes está perfecto. Martes en este horario, seis... a las seis"
          porQue="Un compromiso de reunión semanal es la acción más concreta de toda la sesión."
        />
        <Finding
          type="bad"
          title="🔴 Sin agenda al inicio ni resumen de acuerdos al final"
          cita='La reunión empieza con "a ver, cuéntame" y termina con "vámonos, güey". No hay agenda previa, ni resumen de compromisos, ni minutas.'
          alternativa='Alternativa: "Hoy cubrimos 3 cosas: 1) Update de avances, 2) Propuesta de partnership, 3) Próximos pasos. Empecemos."'
          porQue='Sin agenda, cada participante improvisa. Sin resumen, los acuerdos se pierden entre 39 minutos de conversación. La próxima reunión empezará con "¿de qué quedamos?"'
        />
        <Finding
          type="bad"
          title='🔴 Acciones sin fecha: "hay que" aparece más que "yo hago X para el viernes"'
          cita='"Hay que hacer un muy buen estudio de mercado", "hay que hacer una muy buena campaña", "las redes sociales" — sin quién, sin cuándo, sin cómo.'
          alternativa={'Alternativa: "Chris hace el benchmark de 3 competidores para el martes. Poncho prepara la tabla de costos para el viernes."'}
          porQue='"Hay que" es la tumba de la ejecución. Lo que no tiene dueño y fecha, no se hace.'
        />
      </Card>

      {/* Dinámica */}
      <Card className="bg-[#0F0F0F] border border-white/10 p-6">
        <h3 className="text-base font-bold mb-3">
          ¿Cómo es la dinámica entre los participantes?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white/5 p-3.5 rounded-lg">
            <div className="text-xs uppercase font-bold text-muted-foreground tracking-wide">
              Equilibrio
            </div>
            <div className="text-sm mt-1 leading-relaxed">
              Poncho con <strong>~59%</strong> de las palabras (~3,600) vs Chris
              ~41% (~2,500). Ratio 1.4x — bastante equilibrado.
            </div>
          </div>
          <div className="bg-white/5 p-3.5 rounded-lg">
            <div className="text-xs uppercase font-bold text-muted-foreground tracking-wide">
              Adaptación — 75/100
            </div>
            <div className="text-sm mt-1 leading-relaxed">
              Excelente sintonía cultural. Ambos usan el mismo registro informal.
              Chris adopta el "güey" de Poncho. Acomodación bidireccional.
            </div>
          </div>
          <div className="bg-white/5 p-3.5 rounded-lg">
            <div className="text-xs uppercase font-bold text-muted-foreground tracking-wide">
              Ritmo
            </div>
            <div className="text-sm mt-1 leading-relaxed">
              Poncho avanza rápido mostrando muchas cosas. Chris frena para dar
              estructura. Los mejores momentos son cuando co-crean ideas.
            </div>
          </div>
          <div className="bg-white/5 p-3.5 rounded-lg">
            <div className="text-xs uppercase font-bold text-muted-foreground tracking-wide">
              Diagnóstico
            </div>
            <div className="text-sm mt-1 leading-relaxed">
              Dinámica de{" "}
              <strong>"emprendedor apasionado – asesor estratégico"</strong>.
              Excelente complementariedad.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Recomendaciones ─────────────────────────────────────────────────
interface RecoData {
  num: number;
  titulo: string;
  original: string;
  mejorado: string;
  impacto: string;
}

const recoItems: RecoData[] = [
  {
    num: 1,
    titulo: "Cada reunión necesita agenda escrita y cierre con compromisos",
    original:
      'Se abrió con "a ver, cuéntame" y se cerró con "vámonos, güey". 20+ temas, 6 acciones vagas, 0 minutas.',
    mejorado:
      "«Agenda del martes: 1) Status del roadmap, 2) Presupuesto marketing Q1, 3) Preparación pitch para Lee. Cierre: [Poncho] manda tabla de costos antes del viernes. [Chris] contacta diseñador web antes del jueves.»",
    impacto:
      "Una reunión sin agenda produce entusiasmo. Una reunión con agenda produce resultados. Los inversionistas no invierten en entusiasmo — invierten en ejecución.",
  },
  {
    num: 2,
    titulo: 'Convierte cada "hay que" en "quién hace qué para cuándo"',
    original:
      '«Hay que hacer un muy buen estudio de mercado», «Hay que hacer una muy buena campaña de marketing», «Urgen mucho las redes sociales»',
    mejorado:
      "«Chris hace el benchmark de 3 competidores y lo presenta el martes 11. Poncho prepara demo grabada de 3 minutos para el viernes. Ambos revisan la tabla de precios antes del jueves.»",
    impacto:
      '"Hay que" es la frase más peligrosa del emprendimiento. Suena a compromiso pero no tiene dueño. Si las 6 acciones tuvieran dueño y fecha, para el próximo martes ya tendrían 6 resultados tangibles.',
  },
  {
    num: 3,
    titulo: 'Desarrolla un "modo pitch" sin muletillas ni groserías',
    original:
      '«Es un chingo de mamadas y papeles y testers», «Estos cabrones, o sea», «Ya no mames» — 142 muletillas, groserías cada 2-3 minutos.',
    mejorado:
      'Graba un pitch de 5 minutos SIN muletillas. Revísalo. Repite hasta que salga limpio. Ese es tu "modo inversor". Usa Maity para medir tu propia comunicación — dogfooding total.',
    impacto:
      'El primo de Chris que "tiene avión privado" va a escuchar este pitch. Si escucha "un putero de cosas", la credibilidad se desploma antes de ver el producto.',
  },
];

export function RecomendacionesSection() {
  return (
    <div className="space-y-3.5">
      {recoItems.map((r) => (
        <Card
          key={r.num}
          className="bg-[#0F0F0F] border border-white/10 border-l-[5px] border-l-blue-500 p-5"
        >
          <div className="flex gap-3.5">
            <div className="text-2xl font-extrabold text-blue-500 shrink-0">
              {r.num}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold uppercase">{r.titulo}</h4>
              <div className="bg-red-500/10 p-2.5 rounded-md mt-2 text-sm">
                <strong>Esta reunión:</strong> {r.original}
              </div>
              <div className="bg-green-500/10 p-2.5 rounded-md mt-2 text-sm">
                <strong>Prueba esto:</strong> {r.mejorado}
              </div>
              <div className="text-sm text-muted-foreground mt-2 leading-relaxed bg-white/5 rounded-md p-2.5">
                <span className="font-semibold text-amber-400/80">💡 ¿Por qué importa?</span>{" "}
                {r.impacto}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Fortalezas ──────────────────────────────────────────────────────
interface FortalezaItem {
  titulo: string;
  cita: string;
  porQue: string;
}

const fortalezaItems: FortalezaItem[] = [
  {
    titulo: "Producto funcionando en vivo",
    cita: "«En tiempo real lo que estoy diciendo se está transcribiendo» — Poncho no muestra slides, muestra el producto real.",
    porQue:
      "Un producto que funciona en vivo es 100x más convincente que una presentación. Para inversionistas, esto es oro.",
  },
  {
    titulo: "Complementariedad natural",
    cita: "Poncho = producto, tech, visión. Chris = marketing, negocio, inversión, contactos. Ambos reconocen lo que el otro aporta.",
    porQue:
      "La causa #1 de muerte de startups es tener co-fundadores con las mismas habilidades. Poncho y Chris se complementan de forma natural.",
  },
  {
    titulo: "Inteligencia competitiva real",
    cita: "«Jotley en su serie B, vale cuarenta millones», «Wong enfocado en ventas, cuesta ciento cincuenta dólares» — conocen a sus competidores.",
    porQue:
      "Saber quién es tu competencia y en qué se diferencian es fundamental para cualquier pitch.",
  },
  {
    titulo: "Skin in the game de Chris",
    cita: "«Yo le entro con mente y chamba... y voy aportando algo de capital para que sucedan»",
    porQue:
      "Chris no solo dice 'me interesa' — ofrece trabajo + dinero. Un socio que pone recursos es un socio que va a ejecutar.",
  },
  {
    titulo: "Visión de procesamiento local para reducir costos",
    cita: "«Todo el procesamiento se hace local... para que la utilidad se vaya al sesenta, setenta por ciento»",
    porQue:
      "La estrategia de procesamiento local reduce costos de infraestructura dramáticamente. Esto es un diferenciador técnico real.",
  },
];

export function FortalezasSection() {
  return (
    <Card className="bg-[#0F0F0F] border border-white/10 p-6">
      <div className="space-y-2">
        {fortalezaItems.map((f, i) => (
          <div
            key={i}
            className="flex gap-2.5 items-start p-3 bg-green-500/[0.06] rounded-lg"
          >
            <span className="text-xl shrink-0 mt-0.5">✅</span>
            <div className="text-sm leading-relaxed">
              <div className="font-bold">{f.titulo}</div>
              {f.cita}
              <div className="text-muted-foreground text-xs mt-1">
                ¿Por qué es valioso? {f.porQue}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── JSON Collapsible ────────────────────────────────────────────────
export function JsonCollapsible({
  data,
}: {
  data: MeetingAnalysisData;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="secondary"
          className="w-full bg-slate-800 text-white hover:bg-slate-700 text-sm font-semibold"
        >
          {open ? "▼" : "▶"} Ver / Ocultar JSON completo
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="bg-slate-800 text-slate-200 p-5 rounded-b-xl overflow-auto max-h-[600px] text-xs leading-relaxed font-mono">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}
