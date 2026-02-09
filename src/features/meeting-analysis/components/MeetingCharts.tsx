import {
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/ui/components/ui/card";
import type { MeetingAnalysisData } from "../types";

const BLUE = "#3b82f6";
const PURPLE = "#8b5cf6";
const GREEN = "#22c55e";
const RED = "#ef4444";
const YELLOW = "#eab308";

const EMO_LABELS = [
  "Alegría",
  "Confianza",
  "Miedo",
  "Sorpresa",
  "Tristeza",
  "Disgusto",
  "Ira",
  "Anticipación",
];

const EMO_KEYS = [
  "alegria",
  "confianza",
  "miedo",
  "sorpresa",
  "tristeza",
  "disgusto",
  "ira",
  "anticipacion",
] as const;

// ─── Shared dark-mode styles ─────────────────────────────────────────
const GRID_STROKE = "rgba(255,255,255,0.1)";
const TICK_STYLE = { fill: "rgba(255,255,255,0.6)" };
const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#1a1a2e",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#fff",
  },
  itemStyle: { color: "#fff" },
  labelStyle: { color: "rgba(255,255,255,0.7)" },
};
const LEGEND_STYLE = {
  wrapperStyle: { fontSize: 12, paddingTop: 8, color: "rgba(255,255,255,0.7)" },
};

const CHART_CARD =
  "bg-[#0F0F0F] border border-white/10 hover:border-white/20 transition-all p-5";

// ─── 1. Gauge Chart (semicircle) ─────────────────────────────────────
export function GaugeChart({ score }: { score: number }) {
  const data = [
    { name: "score", value: score },
    { name: "rest", value: 100 - score },
  ];
  return (
    <ResponsiveContainer width={240} height={140}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="100%"
          startAngle={180}
          endAngle={0}
          innerRadius={65}
          outerRadius={90}
          dataKey="value"
          stroke="none"
        >
          <Cell fill={RED} />
          <Cell fill="rgba(255,255,255,0.1)" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── 2 & 3. Mini Radar per speaker ───────────────────────────────────
export function MiniRadar({
  speakerData,
  color,
}: {
  speakerData: Record<string, number>;
  color: string;
}) {
  const data = EMO_LABELS.map((label, i) => ({
    label,
    value: speakerData[EMO_KEYS[i]] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke={GRID_STROKE} />
        <PolarAngleAxis
          dataKey="label"
          tick={{ fontSize: 11, fontWeight: 600, ...TICK_STYLE }}
        />
        <PolarRadiusAxis
          domain={[0, 1]}
          tick={false}
          axisLine={false}
        />
        <Radar
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── 4. Combined Radar Chart ─────────────────────────────────────────
export function EmotionRadarChart({
  data,
}: {
  data: MeetingAnalysisData;
}) {
  const poncho = data.dimensiones.emociones.por_hablante.Poncho;
  const chris = data.dimensiones.emociones.por_hablante.Chris;

  const chartData = EMO_LABELS.map((label, i) => ({
    label,
    Poncho: poncho[EMO_KEYS[i]] ?? 0,
    Chris: chris[EMO_KEYS[i]] ?? 0,
  }));

  return (
    <Card className={CHART_CARD}>
      <h3 className="text-base font-bold mb-1">Perfil Emocional General</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Cada punta del radar es una emoción. Cuanto más grande el área, más
        presente está esa emoción en la reunión.
      </p>
      <ResponsiveContainer width="100%" height={380}>
        <RadarChart data={chartData}>
          <PolarGrid stroke={GRID_STROKE} />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fontSize: 12, fontWeight: 600, ...TICK_STYLE }}
          />
          <PolarRadiusAxis
            domain={[0, 1]}
            tickCount={5}
            tick={{ fontSize: 11, ...TICK_STYLE }}
          />
          <Radar
            name="Poncho"
            dataKey="Poncho"
            stroke={BLUE}
            fill={BLUE}
            fillOpacity={0.12}
            strokeWidth={2}
          />
          <Radar
            name="Chris"
            dataKey="Chris"
            stroke={PURPLE}
            fill={PURPLE}
            fillOpacity={0.12}
            strokeWidth={2}
          />
          <Legend iconSize={12} {...LEGEND_STYLE} />
          <Tooltip {...TOOLTIP_STYLE} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="bg-blue-500/10 rounded-lg p-3 text-sm mt-3">
        <strong>Lectura:</strong> La reunión está dominada por{" "}
        <strong>anticipación</strong> (0.82) y <strong>confianza</strong> (0.71),
        típico de una reunión donde dos personas ven una oportunidad grande y se
        están alineando. La <strong>alegría</strong> (0.56) refleja el entusiasmo
        genuino de ambos por el proyecto. Las emociones negativas son mínimas —
        buena señal para una futura sociedad.
      </div>
    </Card>
  );
}

// ─── 5. Objetivo Chart (horizontal bar) ──────────────────────────────
export function ObjetivoChart({
  data,
}: {
  data: MeetingAnalysisData;
}) {
  const sub = data.dimensiones.objetivo.sub_puntajes;
  const chartData = [
    { name: "¿De qué habla?", value: sub.especificidad.puntaje_0_100 },
    { name: "¿Qué hacer?", value: sub.accion.puntaje_0_100 },
    { name: "¿Para cuándo?", value: sub.temporalidad.puntaje_0_100 },
    { name: "¿Quién?", value: sub.responsable.puntaje_0_100 },
    { name: "¿Cómo verificar?", value: sub.verificabilidad.puntaje_0_100 },
  ];
  const colors = [YELLOW, RED, RED, YELLOW, RED];

  return (
    <Card className={CHART_CARD}>
      <h3 className="text-base font-bold mb-1">
        ¿Qué tan claros son los objetivos de la reunión?
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        Muestra las 5 preguntas clave de un mensaje con objetivo claro. Las
        barras llenas indican que la reunión SÍ responde esa pregunta.
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical">
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 11, ...TICK_STYLE }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fontWeight: 600, ...TICK_STYLE }}
            width={120}
          />
          <Tooltip {...TOOLTIP_STYLE} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="bg-blue-500/10 rounded-lg p-3 text-sm mt-3">
        <strong>Lectura:</strong> Se habla de muchos temas (
        <strong>especificidad parcial</strong>) pero las acciones son vagas, casi
        sin fechas y sin criterios de éxito. Es como planear un viaje diciendo
        "vamos a Europa" sin decidir país, fechas ni presupuesto.
      </div>
    </Card>
  );
}

// ─── 6. Muletillas Chart (grouped horizontal bar) ────────────────────
export function MuletillasChart({
  data,
}: {
  data: MeetingAnalysisData;
}) {
  const md = data.radiografia.muletillas_detalle;
  const chartData = Object.entries(md).map(([key, val]) => ({
    name: `"${key}"`,
    Poncho: val.Poncho,
    Chris: val.Chris,
  }));

  return (
    <Card className={CHART_CARD}>
      <h3 className="text-base font-bold mb-1">Muletillas por frecuencia</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Cada barra muestra cuántas veces aparece cada muletilla. Azul = Poncho,
        Morado = Chris. Una muletilla no es un error — es un hábito.
        Sustituirlas por silencio transmite más seguridad.
      </p>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={chartData} layout="vertical">
          <XAxis
            type="number"
            tick={{ fontSize: 11, ...TICK_STYLE }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fontWeight: 600, ...TICK_STYLE }}
            width={80}
          />
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend iconSize={12} {...LEGEND_STYLE} />
          <Bar
            name="Poncho"
            dataKey="Poncho"
            fill="rgba(59,130,246,0.7)"
            radius={[0, 4, 4, 0]}
            barSize={14}
          />
          <Bar
            name="Chris"
            dataKey="Chris"
            fill="rgba(139,92,246,0.7)"
            radius={[0, 4, 4, 0]}
            barSize={14}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="bg-blue-500/10 rounded-lg p-3 text-sm mt-3">
        <strong>Lectura:</strong> "Este" es la muletilla dominante (
        <strong>37 veces</strong> entre ambos), seguida de "o sea" (25) y "güey"
        (20). "Güey" es la única muletilla donde ambos empatan — señal de
        rapport. Si esta reunión fuera frente a un inversionista, cada "güey"
        sería un punto menos de credibilidad.
      </div>
    </Card>
  );
}

// ─── 7. Participación Chart (doughnut) ───────────────────────────────
export function ParticipacionChart() {
  const data = [
    { name: "Poncho (3,600 palabras)", value: 59 },
    { name: "Chris (2,500 palabras)", value: 41 },
  ];

  return (
    <Card className={CHART_CARD}>
      <h3 className="text-base font-bold mb-1">
        Distribución de la conversación
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        Muestra qué proporción de la conversación ocupa cada participante. Una
        distribución equilibrada indica que ambos aportan.
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            dataKey="value"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={2}
          >
            <Cell fill="rgba(59,130,246,0.8)" />
            <Cell fill="rgba(139,92,246,0.8)" />
          </Pie>
          <Legend iconSize={12} {...LEGEND_STYLE} />
          <Tooltip {...TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
      <div className="bg-blue-500/10 rounded-lg p-3 text-sm mt-3">
        <strong>Lectura:</strong> Poncho domina ligeramente con el{" "}
        <strong>59%</strong> — normal porque es quien presenta los avances. En la
        segunda mitad, Chris toma más espacio con estrategia. El ratio 1.4x es
        saludable para una reunión de update + planning.
      </div>
    </Card>
  );
}

// ─── 8. Comparación Chart (vertical grouped bar) ─────────────────────
export function ComparacionChart({
  data,
}: {
  data: MeetingAnalysisData;
}) {
  const p = data.por_hablante.Poncho;
  const c = data.por_hablante.Chris;
  const chartData = [
    { name: "Claridad", Poncho: p.claridad.puntaje, Chris: c.claridad.puntaje },
    {
      name: "Vocabulario",
      Poncho: p.vocabulario.puntaje,
      Chris: c.vocabulario.puntaje,
    },
    {
      name: "Empatía",
      Poncho: data.empatia.Poncho.puntaje,
      Chris: data.empatia.Chris.puntaje,
    },
    {
      name: "Formalidad",
      Poncho: p.formalidad.puntaje,
      Chris: c.formalidad.puntaje,
    },
  ];

  return (
    <Card className={CHART_CARD}>
      <h3 className="text-base font-bold mb-1">
        Comparación entre participantes
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        Compara las puntuaciones de cada persona en las mismas dimensiones.
        Diferencias grandes pueden indicar desequilibrio.
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fontWeight: 600, ...TICK_STYLE }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, ...TICK_STYLE }}
          />
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend iconSize={12} {...LEGEND_STYLE} />
          <Bar
            name="Poncho"
            dataKey="Poncho"
            fill="rgba(59,130,246,0.7)"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
          <Bar
            name="Chris"
            dataKey="Chris"
            fill="rgba(139,92,246,0.7)"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="bg-blue-500/10 rounded-lg p-3 text-sm mt-3">
        <strong>Lectura:</strong> Chris supera a Poncho en claridad y empatía,
        coherente con su rol de asesor que escucha y organiza. Poncho tiene mejor
        vocabulario técnico por ser el fundador del producto. Ambos tienen
        formalidad muy baja — funciona entre ellos, pero no funcionaría con
        inversionistas.
      </div>
    </Card>
  );
}

// ─── 9. Timeline Bar (custom divs, no Recharts) ─────────────────────
const TIMELINE_COLORS: Record<string, string> = {
  poncho: "rgba(59,130,246,0.55)",
  chris: "rgba(139,92,246,0.55)",
  dialogo: "rgba(34,197,94,0.55)",
};

export function TimelineChart({
  data,
}: {
  data: MeetingAnalysisData;
}) {
  return (
    <Card className={CHART_CARD}>
      <h3 className="text-base font-bold mb-1">
        Línea temporal de la reunión
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        Cada segmento muestra quién habla. Los segmentos verdes son diálogo real
        — intercambio rápido entre ambos.
      </p>

      {/* Timeline bar */}
      <div className="mt-4">
        <div
          className="flex h-9 rounded-lg overflow-hidden"
          style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.05)" }}
        >
          {data.timeline.segmentos.map((seg, i) => (
            <div
              key={i}
              className="h-full hover:opacity-80 transition-opacity"
              style={{
                width: `${seg.pct}%`,
                backgroundColor: TIMELINE_COLORS[seg.tipo],
              }}
              title={`${seg.tipo.charAt(0).toUpperCase() + seg.tipo.slice(1)} (${seg.pct}%)`}
            />
          ))}
        </div>

        {/* Time markers */}
        <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
          <span>0:00</span>
          <span>10:00</span>
          <span>20:00</span>
          <span>30:00</span>
          <span>39:00</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2.5 text-sm">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm shrink-0"
            style={{ background: TIMELINE_COLORS.poncho }}
          />
          Poncho habla
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm shrink-0"
            style={{ background: TIMELINE_COLORS.chris }}
          />
          Chris habla
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm shrink-0"
            style={{ background: TIMELINE_COLORS.dialogo }}
          />
          Diálogo real
        </div>
      </div>

      {/* Key moments */}
      <div className="flex flex-wrap gap-2 mt-3">
        {data.timeline.momentos_clave.map((m) => (
          <span
            key={m.nombre}
            className="inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-500/20 px-2.5 py-1 rounded-full text-xs font-semibold text-yellow-800 dark:text-yellow-200"
          >
            ⭐ {m.nombre} (min {m.minuto})
          </span>
        ))}
      </div>

      <div className="bg-green-500/10 rounded-lg p-3 text-sm mt-3">
        <strong>Lectura:</strong> Primera mitad: Poncho presenta (azul
        dominante). Segunda mitad: Chris toma el liderazgo con estrategia
        (morado dominante). Los momentos verdes (diálogo) aparecen cuando
        discuten ideas nuevas juntos — ahí es donde la reunión brilla.
      </div>
    </Card>
  );
}
