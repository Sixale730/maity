import { Card } from '@/ui/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
  RadarChart as RechartsRadar, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

// ============================================================================
// MOCK DATA (same as the HTML prototype)
// ============================================================================

const SESSIONS = [
  { fecha: '8 Ene', num: 1, global: 38, claridad: 30, estructura: 28, vocabulario: 62, empatia: 45, objetivo: 32, adaptacion: 70, muletillas_min: 3.9 },
  { fecha: '15 Ene', num: 2, global: 42, claridad: 34, estructura: 30, vocabulario: 64, empatia: 42, objetivo: 35, adaptacion: 72, muletillas_min: 3.6 },
  { fecha: '22 Ene', num: 3, global: 47, claridad: 40, estructura: 33, vocabulario: 65, empatia: 48, objetivo: 38, adaptacion: 74, muletillas_min: 3.3 },
  { fecha: '29 Ene', num: 4, global: 45, claridad: 42, estructura: 35, vocabulario: 66, empatia: 48, objetivo: 40, adaptacion: 75, muletillas_min: 3.1 },
  { fecha: '5 Feb', num: 5, global: 50, claridad: 45, estructura: 36, vocabulario: 67, empatia: 50, objetivo: 42, adaptacion: 77, muletillas_min: 2.9 },
  { fecha: '12 Feb', num: 6, global: 55, claridad: 48, estructura: 38, vocabulario: 68, empatia: 52, objetivo: 45, adaptacion: 78, muletillas_min: 2.8 },
];

const EMOTION_DATA = SESSIONS.map(s => ({
  fecha: s.fecha,
  Anticipación: +([ 0.82, 0.85, 0.80, 0.78, 0.88, 0.82 ][s.num - 1]).toFixed(2),
  Confianza: +([ 0.65, 0.68, 0.70, 0.72, 0.72, 0.75 ][s.num - 1]).toFixed(2),
  Alegría: +([ 0.35, 0.38, 0.42, 0.45, 0.50, 0.55 ][s.num - 1]).toFixed(2),
}));

const RADAR_S1 = [
  { dim: 'Claridad', s1: 30, s6: 48 },
  { dim: 'Estructura', s1: 28, s6: 38 },
  { dim: 'Vocabulario', s1: 62, s6: 68 },
  { dim: 'Empatía', s1: 45, s6: 52 },
  { dim: 'Objetivo', s1: 32, s6: 45 },
  { dim: 'Adaptación', s1: 70, s6: 78 },
];

// ============================================================================
// SHARED CHART CONFIG
// ============================================================================

const CHART_TOOLTIP_STYLE = {
  contentStyle: { background: '#141418', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#a0a0b0' },
  itemStyle: { color: '#fff' },
};

const AXIS_STYLE = { fontSize: 10, fill: '#6b7280' };
const GRID_STYLE = { stroke: '#1a1a2e', strokeDasharray: '3 3' };

// ============================================================================
// DIMENSION TREND CHART (Multi-line)
// ============================================================================

const DIM_COLORS: Record<string, string> = {
  claridad: '#485df4', estructura: '#ff8c42', vocabulario: '#3b82f6',
  empatia: '#ef4444', objetivo: '#ffd93d', adaptacion: '#1bea9a',
};

const DIM_SUMMARY = [
  { key: 'claridad', label: 'Claridad', current: 48, delta: +18 },
  { key: 'estructura', label: 'Estructura', current: 38, delta: +10 },
  { key: 'vocabulario', label: 'Vocabulario', current: 68, delta: +6 },
  { key: 'empatia', label: 'Empatía', current: 52, delta: +7 },
  { key: 'objetivo', label: 'Objetivo', current: 45, delta: +13 },
  { key: 'adaptacion', label: 'Adaptación', current: 78, delta: +8 },
];

function DimensionTrendChart() {
  return (
    <Card className="p-5 bg-[#0F0F0F] border border-white/10">
      <h3 className="font-bold text-white mb-1">Tendencia por Dimensión</h3>
      <p className="text-xs text-gray-500 mb-4">Las que suben son mejoras; las planas necesitan intervención.</p>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={SESSIONS} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis dataKey="fecha" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <Tooltip {...CHART_TOOLTIP_STYLE} />
            <Legend
              wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
              iconType="circle"
              iconSize={8}
            />
            {Object.entries(DIM_COLORS).map(([key, color]) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key.charAt(0).toUpperCase() + key.slice(1)}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3, fill: color }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Compact score summary per dimension */}
      <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2">
        {DIM_SUMMARY.map((dim) => {
          const color = DIM_COLORS[dim.key];
          return (
            <div key={dim.key} className="text-center p-2 rounded-lg bg-[#141418]">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{dim.label}</span>
              </div>
              <div className="text-lg font-extrabold text-white">{dim.current}</div>
              <div className="text-[10px] text-gray-500">+{dim.delta}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================================
// RADAR COMPARISON (Session 1 vs Session 6)
// ============================================================================

function RadarComparisonChart() {
  return (
    <Card className="p-5 bg-[#0F0F0F] border border-white/10">
      <h3 className="font-bold text-white mb-1">Radar: Sesión 1 vs Última</h3>
      <p className="text-xs text-gray-500 mb-4">El área verde debería ser más grande que la roja.</p>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={RADAR_S1}>
            <PolarGrid stroke="#1a1a2e" />
            <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: '#a0a0b0' }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#4a4a5a' }} axisLine={false} />
            <Radar name="Sesión 1" dataKey="s1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
            <Radar name="Última" dataKey="s6" stroke="#1bea9a" fill="#1bea9a" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: '#1bea9a' }} />
            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} iconType="circle" iconSize={8} />
            <Tooltip {...CHART_TOOLTIP_STYLE} />
          </RechartsRadar>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-gray-400 leading-relaxed">
        <strong className="text-gray-300">Lectura:</strong> Área verde más grande en todas las dimensiones excepto estructura (mejora mínima). Mayor expansión en claridad y objetivo.
      </div>
    </Card>
  );
}

// ============================================================================
// FILLER WORDS TREND
// ============================================================================

function FillerWordsTrendChart() {
  return (
    <Card className="p-5 bg-[#0F0F0F] border border-white/10">
      <h3 className="font-bold text-white mb-1">Muletillas por Minuto</h3>
      <p className="text-xs text-gray-500 mb-4">Menos muletillas = mensaje más limpio y creíble.</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={SESSIONS} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis dataKey="fecha" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 5]} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: number) => [`${v}/min`, 'Muletillas']} />
            <Line
              type="monotone"
              dataKey="muletillas_min"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 5, fill: '#f97316', stroke: '#0F0F0F', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-gray-400 leading-relaxed">
        <strong className="text-gray-300">Lectura:</strong> De 3.9 a 2.8/min — 28% de reducción. Meta: &lt;1.5/min (nivel profesional). Al ritmo actual, ~4 sesiones más.
      </div>
    </Card>
  );
}

// ============================================================================
// EMOTION TREND (Stacked Bar)
// ============================================================================

function EmotionTrendChart() {
  return (
    <Card className="p-5 bg-[#0F0F0F] border border-white/10">
      <h3 className="font-bold text-white mb-1">Emoción Dominante</h3>
      <p className="text-xs text-gray-500 mb-4">Cómo cambia la emoción que transmites en cada sesión.</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={EMOTION_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis dataKey="fecha" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 1]} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <Tooltip {...CHART_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} iconType="circle" iconSize={8} />
            <Bar dataKey="Anticipación" fill="#485df4" fillOpacity={0.45} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Confianza" fill="#1bea9a" fillOpacity={0.4} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Alegría" fill="#ffd93d" fillOpacity={0.35} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-gray-400 leading-relaxed">
        <strong className="text-gray-300">Lectura:</strong> Anticipación y confianza consistentes. La alegría subió, indicando mayor comodidad.
      </div>
    </Card>
  );
}

// ============================================================================
// SESSION HISTORY TABLE
// ============================================================================

const SESSION_HISTORY = [
  { num: 1, fecha: '8 Ene', tipo: 'Coaching', con: 'Lorena', global: 38, claridad: 30, estructura: 28, empatia: 45, objetivo: 32, muletillas: 3.9 },
  { num: 2, fecha: '15 Ene', tipo: 'Reunión negocio', con: 'Inversionista', global: 42, claridad: 34, estructura: 30, empatia: 42, objetivo: 35, muletillas: 3.6 },
  { num: 3, fecha: '22 Ene', tipo: 'Coaching', con: 'Lorena', global: 47, claridad: 40, estructura: 33, empatia: 48, objetivo: 38, muletillas: 3.3 },
  { num: 4, fecha: '29 Ene', tipo: 'Reunión equipo', con: 'Jules, Kari', global: 45, claridad: 42, estructura: 35, empatia: 48, objetivo: 40, muletillas: 3.1 },
  { num: 5, fecha: '5 Feb', tipo: 'Reunión negocio', con: 'Chris', global: 50, claridad: 45, estructura: 36, empatia: 50, objetivo: 42, muletillas: 2.9 },
  { num: 6, fecha: '12 Feb', tipo: 'Coaching', con: 'Lorena', global: 55, claridad: 48, estructura: 38, empatia: 52, objetivo: 45, muletillas: 2.8 },
];

function scoreColor(val: number): string {
  if (val >= 70) return 'text-emerald-300/80';
  if (val >= 40) return 'text-gray-300';
  return 'text-red-400/50';
}

function SessionHistoryTable() {
  const cols = ['#', 'Fecha', 'Tipo', 'Con quién', 'Global', 'Claridad', 'Estructura', 'Empatía', 'Objetivo', 'Mulet/min'];

  return (
    <div>
      <SectionLabel text="Historial de Sesiones" />
      <Card className="bg-[#0F0F0F] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#141418]">
                {cols.map(col => (
                  <th key={col} className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SESSION_HISTORY.map((s, i) => {
                const isLast = i === SESSION_HISTORY.length - 1;
                return (
                  <tr
                    key={s.num}
                    className={`border-t border-white/5 transition-colors hover:bg-white/[0.03] ${isLast ? 'bg-[#1bea9a]/5' : ''}`}
                  >
                    <td className={`px-3 py-2.5 text-gray-400 ${isLast ? 'font-bold text-white' : ''}`}>{s.num}</td>
                    <td className={`px-3 py-2.5 text-gray-300 whitespace-nowrap ${isLast ? 'font-bold text-white' : ''}`}>{s.fecha}</td>
                    <td className="px-3 py-2.5 text-gray-300 whitespace-nowrap">{s.tipo}</td>
                    <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap">{s.con}</td>
                    <td className={`px-3 py-2.5 font-semibold ${scoreColor(s.global)}`}>{s.global}</td>
                    <td className={`px-3 py-2.5 ${scoreColor(s.claridad)}`}>{s.claridad}</td>
                    <td className={`px-3 py-2.5 ${scoreColor(s.estructura)}`}>{s.estructura}</td>
                    <td className={`px-3 py-2.5 ${scoreColor(s.empatia)}`}>{s.empatia}</td>
                    <td className={`px-3 py-2.5 ${scoreColor(s.objetivo)}`}>{s.objetivo}</td>
                    <td className={`px-3 py-2.5 text-gray-400 ${isLast ? 'font-bold text-white' : ''}`}>{s.muletillas}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// ACTION PLAN
// ============================================================================

const ACTION_ITEMS = [
  {
    num: 1,
    title: 'PRIORIDAD CRÍTICA: Estructura de reuniones',
    desc: 'La estructura es la dimensión más baja (38) y está estancada. Implementar: agenda escrita antes de cada reunión (3-5 temas), cierre con compromisos (quién-qué-cuándo), y enviar minutas después.',
    meta: 'Dimensión: Estructura (38/100) • Tendencia: Estancada • Meta: 50+ en 4 sesiones',
    accent: '#ef4444',
  },
  {
    num: 2,
    title: 'Seguir reduciendo muletillas',
    desc: 'Las muletillas han bajado 28% pero siguen en nivel alto (2.8/min). Ejercicio: Grabar 1 minuto de habla diario y contar "estes". Sustituir por pausas de silencio. Meta: <1.5/min.',
    meta: 'Actual: 2.8/min • Meta: <1.5/min • Tendencia: Mejorando',
    accent: '#f97316',
  },
  {
    num: 3,
    title: 'Convertir "hay que" en acciones concretas',
    desc: 'El objetivo mejoró de 32 a 45 pero necesita más. Regla: Cada vez que diga "hay que hacer X", reformular a "[Nombre] hace [X] para [fecha]". Practicar en reuniones semanales.',
    meta: 'Dimensión: Objetivo (45/100) • Tendencia: Mejorando • Meta: 60+ en 4 sesiones',
    accent: '#ffd93d',
  },
  {
    num: 4,
    title: 'Desarrollar "modo pitch" para inversionistas',
    desc: 'Preparar un pitch de 5 minutos sin muletillas ni groserías. Grabarlo con Maity, analizar, iterar. Objetivo: tenerlo listo antes de la próxima reunión.',
    meta: 'Preparación para fundraising • Deadline sugerido: 4 semanas',
    accent: '#485df4',
  },
];

function ActionPlan() {
  return (
    <div>
      <SectionLabel text="Plan de Acción Recomendado" />
      <div className="space-y-3">
        {ACTION_ITEMS.map((item) => (
          <Card
            key={item.num}
            className="p-5 bg-[#0F0F0F] border border-white/10 border-l-4 flex gap-4"
            style={{ borderLeftColor: `${item.accent}30` }}
          >
            {/* Number */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-extrabold flex-shrink-0"
              style={{ backgroundColor: `${item.accent}10`, color: `${item.accent}90` }}
            >
              {item.num}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">{item.desc}</p>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider">{item.meta}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SECTION LABEL
// ============================================================================

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-[10px] font-bold uppercase tracking-[3px] text-gray-500">{text}</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export function ProgressChartsSection() {
  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Divider */}
      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
        <span className="text-xs font-bold uppercase tracking-[4px] text-pink-500/60">Análisis de Progreso</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
      </div>

      {/* 1. Dimension Trends + Radar Comparison (side by side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DimensionTrendChart />
        <RadarComparisonChart />
      </div>

      {/* 4. Filler Words + Emotions (side by side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FillerWordsTrendChart />
        <EmotionTrendChart />
      </div>

      {/* 5. Session History Table */}
      <SessionHistoryTable />

      {/* 7. Action Plan */}
      <ActionPlan />
    </div>
  );
}
