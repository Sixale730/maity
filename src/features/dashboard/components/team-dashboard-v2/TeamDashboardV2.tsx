import { Card } from '@/ui/components/ui/card';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, RadarChart as ReRadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from 'recharts';
import {
  Users, TrendingUp, TrendingDown, Minus, Target,
  Zap, MessageSquare, Award, AlertTriangle, ChevronUp,
  ChevronDown, ArrowUpRight, ArrowDownRight, Flame,
} from 'lucide-react';
import { useTeamDashboardData, type TeamMember } from '../../hooks/useTeamDashboardData';

// ============================================================================
// SCORE COLOR HELPERS
// ============================================================================

function scoreColor(score: number): string {
  if (score >= 7) return '#1bea9a';
  if (score >= 5) return '#ffd93d';
  return '#ef4444';
}

function scoreBg(score: number): string {
  if (score >= 7) return 'rgba(27,234,154,0.12)';
  if (score >= 5) return 'rgba(255,217,61,0.12)';
  return 'rgba(239,68,68,0.12)';
}

function trendIcon(trend: 'up' | 'down' | 'stable') {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-gray-500" />;
}

// ============================================================================
// EXECUTIVE HERO
// ============================================================================

function ExecutiveHero({ teamScore, teamScoreDelta, totalMembers, activeMembers, improving, worsening, totalSessions }: {
  teamScore: number;
  teamScoreDelta: number;
  totalMembers: number;
  activeMembers: number;
  improving: number;
  worsening: number;
  totalSessions: number;
}) {
  const scorePct = (teamScore / 10) * 100;

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 md:p-8"
      style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #111128 50%, #0a0a1a 100%)' }}
    >
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-[3px] text-gray-500">Panel Ejecutivo</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Rendimiento del Equipo</h1>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          {/* Team Score - large */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1a1a2e" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke={scoreColor(teamScore)} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${scorePct * 2.64} ${264 - scorePct * 2.64}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{teamScore}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Score</span>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {teamScoreDelta > 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />}
              <span className={`text-xs font-semibold ${teamScoreDelta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {teamScoreDelta > 0 ? '+' : ''}{teamScoreDelta} vs mes anterior
              </span>
            </div>
          </div>

          {/* Stat cards */}
          {[
            { label: 'Personas', value: `${activeMembers}/${totalMembers}`, sub: 'activas', icon: Users, color: '#485df4' },
            { label: 'Mejorando', value: improving, sub: 'personas', icon: TrendingUp, color: '#1bea9a' },
            { label: 'En Riesgo', value: worsening, sub: 'personas', icon: AlertTriangle, color: '#ef4444' },
            { label: 'Sesiones', value: totalSessions, sub: 'este mes', icon: MessageSquare, color: '#ffd93d' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
              <span className="text-2xl font-bold text-white">{stat.value}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.sub}</span>
              <span className="text-[10px] text-gray-600 mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// KPI CARDS
// ============================================================================

function KPICards({ kpis }: { kpis: ReturnType<typeof useTeamDashboardData>['kpis'] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="bg-[#0F0F0F] border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-gray-500">{kpi.label}</span>
            {trendIcon(kpi.trend)}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white">{kpi.value}</span>
            {kpi.suffix && <span className="text-sm text-gray-500">{kpi.suffix}</span>}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`text-xs font-medium ${kpi.delta > 0 ? 'text-emerald-400/80' : kpi.delta < 0 ? 'text-red-400/50' : 'text-gray-500'}`}>
              {kpi.delta > 0 ? '+' : ''}{kpi.delta} vs mes ant.
            </span>
          </div>
          {/* Accent line */}
          <div className="h-0.5 w-full mt-3 rounded-full bg-white/5">
            <div className="h-full rounded-full" style={{ width: `${Math.min((kpi.value / 10) * 100, 100)}%`, backgroundColor: kpi.color }} />
          </div>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// HEATMAP TABLE
// ============================================================================

const DIMENSIONS = [
  { key: 'clarity' as const, label: 'Claridad', short: 'CLA' },
  { key: 'structure' as const, label: 'Estructura', short: 'EST' },
  { key: 'empathy' as const, label: 'Empatía', short: 'EMP' },
  { key: 'vocabulary' as const, label: 'Vocabulario', short: 'VOC' },
  { key: 'objective' as const, label: 'Objetivo', short: 'OBJ' },
];

function HeatmapTable({ members }: { members: TeamMember[] }) {
  const sorted = [...members].sort((a, b) => b.scores.overall - a.scores.overall);

  return (
    <Card className="bg-[#0F0F0F] border-white/10 overflow-hidden">
      <div className="p-5 pb-3">
        <SectionLabel text="Mapa de Calor por Persona" />
        <p className="text-xs text-gray-500 mt-1">Score por dimensión de comunicación (0-10)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[2px] text-gray-500 w-48">Persona</th>
              {DIMENSIONS.map(d => (
                <th key={d.key} className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-[2px] text-gray-500">{d.short}</th>
              ))}
              <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-[2px] text-gray-500">TOTAL</th>
              <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-[2px] text-gray-500">TREND</th>
              <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-[2px] text-gray-500 hidden md:table-cell">RACHA</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m, i) => (
              <tr key={m.id} className={`border-b border-white/[0.03] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''} hover:bg-white/[0.03] transition-colors`}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: `${scoreColor(m.scores.overall)}15`, color: scoreColor(m.scores.overall) }}>
                      {m.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">{m.name}</p>
                      <p className="text-gray-600 text-[10px]">{m.role}</p>
                    </div>
                  </div>
                </td>
                {DIMENSIONS.map(d => {
                  const val = m.scores[d.key];
                  return (
                    <td key={d.key} className="text-center px-3 py-3">
                      <span className="inline-flex items-center justify-center w-10 h-7 rounded text-xs font-bold"
                        style={{ backgroundColor: scoreBg(val), color: scoreColor(val) }}>
                        {val.toFixed(1)}
                      </span>
                    </td>
                  );
                })}
                <td className="text-center px-3 py-3">
                  <span className="text-sm font-bold text-white">{m.scores.overall.toFixed(1)}</span>
                </td>
                <td className="text-center px-3 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {m.trend === 'up' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-400" /> :
                     m.trend === 'down' ? <ChevronDown className="w-3.5 h-3.5 text-red-400" /> :
                     <Minus className="w-3.5 h-3.5 text-gray-500" />}
                    <span className={`text-xs font-medium ${m.trend === 'up' ? 'text-emerald-400/80' : m.trend === 'down' ? 'text-red-400/50' : 'text-gray-500'}`}>
                      {m.trendDelta > 0 ? '+' : ''}{m.trendDelta}
                    </span>
                  </div>
                </td>
                <td className="text-center px-3 py-3 hidden md:table-cell">
                  {m.streak > 0 ? (
                    <div className="flex items-center justify-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span className="text-xs text-gray-400">{m.streak}d</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-600">--</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ============================================================================
// DISTRIBUTION CHART
// ============================================================================

function DistributionChart({ distribution }: { distribution: ReturnType<typeof useTeamDashboardData>['distribution'] }) {
  const data = distribution.map(d => ({
    name: d.dimension,
    'Alto (7+)': d.green,
    'Medio (4-7)': d.yellow,
    'Bajo (<4)': d.red,
  }));

  return (
    <Card className="bg-[#0F0F0F] border-white/10 p-5">
      <SectionLabel text="Distribución por Nivel" />
      <p className="text-xs text-gray-500 mb-4">% del equipo en cada rango por dimensión</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
          <Tooltip
            contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => [`${value}%`]}
          />
          <Bar dataKey="Alto (7+)" stackId="a" fill="#1bea9a" fillOpacity={0.7} radius={[0, 0, 0, 0]} />
          <Bar dataKey="Medio (4-7)" stackId="a" fill="#ffd93d" fillOpacity={0.5} />
          <Bar dataKey="Bajo (<4)" stackId="a" fill="#ef4444" fillOpacity={0.45} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2">
        {[
          { label: 'Alto (7+)', color: '#1bea9a' },
          { label: 'Medio (4-7)', color: '#ffd93d' },
          { label: 'Bajo (<4)', color: '#ef4444' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color, opacity: 0.7 }} />
            <span className="text-[10px] text-gray-500">{l.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// TEAM RADAR CHART
// ============================================================================

function TeamRadar({ radarData }: { radarData: ReturnType<typeof useTeamDashboardData>['radarData'] }) {
  return (
    <Card className="bg-[#0F0F0F] border-white/10 p-5">
      <SectionLabel text="Perfil del Equipo" />
      <p className="text-xs text-gray-500 mb-2">Promedio del equipo vs benchmark</p>
      <ResponsiveContainer width="100%" height={260}>
        <ReRadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#ffffff10" />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: '#9ca3af', fontSize: 10 }} />
          <Radar name="Equipo" dataKey="team" stroke="#1bea9a" fill="#1bea9a" fillOpacity={0.2} strokeWidth={2} />
          <Radar name="Benchmark" dataKey="benchmark" stroke="#485df4" fill="#485df4" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 4" />
          <Legend
            wrapperStyle={{ fontSize: '10px' }}
            iconType="line"
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }}
            itemStyle={{ color: '#fff' }}
          />
        </ReRadarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ============================================================================
// SCORE EVOLUTION
// ============================================================================

function ScoreEvolution({ data }: { data: ReturnType<typeof useTeamDashboardData>['scoreEvolution'] }) {
  return (
    <Card className="bg-[#0F0F0F] border-white/10 p-5">
      <SectionLabel text="Evolución del Score" />
      <p className="text-xs text-gray-500 mb-4">Score promedio del equipo por mes</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => [`${Number(value).toFixed(1)}`]}
          />
          <Line type="monotone" dataKey="score" stroke="#1bea9a" strokeWidth={2.5} dot={{ fill: '#1bea9a', r: 4, strokeWidth: 2, stroke: '#0F0F0F' }} />
        </LineChart>
      </ResponsiveContainer>
      {/* Inline stats */}
      <div className="flex items-center justify-center gap-8 mt-3">
        <div className="text-center">
          <span className="text-xs text-gray-500">Inicio</span>
          <span className="block text-sm font-bold text-gray-400">{data[0]?.score.toFixed(1)}</span>
        </div>
        <div className="text-center">
          <span className="text-xs text-gray-500">Actual</span>
          <span className="block text-sm font-bold text-white">{data[data.length - 1]?.score.toFixed(1)}</span>
        </div>
        <div className="text-center">
          <span className="text-xs text-gray-500">Cambio</span>
          <span className="block text-sm font-bold text-emerald-400">
            +{((data[data.length - 1]?.score || 0) - (data[0]?.score || 0)).toFixed(1)}
          </span>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// RANKINGS
// ============================================================================

function Rankings({ topImprovers, needsAttention }: {
  topImprovers: ReturnType<typeof useTeamDashboardData>['topImprovers'];
  needsAttention: ReturnType<typeof useTeamDashboardData>['needsAttention'];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Top Improvers */}
      <Card className="bg-[#0F0F0F] border-white/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-[2px] text-gray-400">Top Mejora</span>
        </div>
        <div className="space-y-3">
          {topImprovers.map((p, i) => (
            <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.03]">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{p.name}</p>
              </div>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">+{p.delta.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Needs Attention */}
      <Card className="bg-[#0F0F0F] border-white/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-xs font-bold uppercase tracking-[2px] text-gray-400">Requieren Atención</span>
        </div>
        <div className="space-y-3">
          {needsAttention.map((p) => (
            <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.03]">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-red-500/10 text-red-400">
                {p.score.toFixed(1)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{p.name}</p>
                <p className="text-[10px] text-gray-600">{p.issue}</p>
              </div>
              <ArrowDownRight className="w-3 h-3 text-red-400/60" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// ACTION PLANS
// ============================================================================

function ActionPlans({ plans }: { plans: ReturnType<typeof useTeamDashboardData>['actionPlans'] }) {
  const teamPlans = plans.filter(p => p.type === 'team');
  const individualPlans = plans.filter(p => p.type === 'individual');

  const priorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const styles = {
      high: 'bg-red-500/10 text-red-400 border-red-500/20',
      medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    const labels = { high: 'Alta', medium: 'Media', low: 'Baja' };
    return (
      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  const renderPlan = (plan: typeof plans[0]) => (
    <div key={plan.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
      style={{ borderLeftWidth: '3px', borderLeftColor: `${plan.accent}30` }}>
      <div className="flex items-center gap-2 mb-2">
        {priorityBadge(plan.priority)}
        <span className="text-[10px] text-gray-600 uppercase tracking-wider">{plan.dimension}</span>
      </div>
      <p className="text-white text-sm font-medium mb-1">{plan.title}</p>
      <p className="text-gray-500 text-xs leading-relaxed">{plan.description}</p>
      {plan.targetUser && (
        <div className="flex items-center gap-1.5 mt-2">
          <Target className="w-3 h-3 text-gray-600" />
          <span className="text-[10px] text-gray-500">{plan.targetUser}</span>
        </div>
      )}
    </div>
  );

  return (
    <Card className="bg-[#0F0F0F] border-white/10 p-5">
      <SectionLabel text="Plan de Acción" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Team Plans */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-gray-500">Equipo</span>
          </div>
          <div className="space-y-3">
            {teamPlans.map(renderPlan)}
          </div>
        </div>

        {/* Individual Plans */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-gray-500">Individuales</span>
          </div>
          <div className="space-y-3">
            {individualPlans.map(renderPlan)}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// DIMENSION TREND (team avg per dimension over months)
// ============================================================================

const DIM_COLORS: Record<string, string> = {
  clarity: '#485df4', structure: '#ff8c42', empathy: '#ef4444',
  vocabulary: '#9b4dca', objective: '#ffd93d',
};

const DIM_LABELS: Record<string, string> = {
  clarity: 'Claridad', structure: 'Estructura', empathy: 'Empatía',
  vocabulary: 'Vocabulario', objective: 'Objetivo',
};

function TeamDimensionTrend({ data }: { data: ReturnType<typeof useTeamDashboardData>['dimensionTrend'] }) {
  const current = data[data.length - 1];
  const first = data[0];

  return (
    <Card className="bg-[#0F0F0F] border-white/10 p-5">
      <SectionLabel text="Tendencia por Dimensión" />
      <p className="text-xs text-gray-500 mb-4">Promedio del equipo por competencia a lo largo del tiempo</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => [`${Number(value).toFixed(1)}`]}
          />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} iconType="circle" iconSize={8} />
          {Object.entries(DIM_COLORS).map(([key, color]) => (
            <Line key={key} type="monotone" dataKey={key} name={DIM_LABELS[key]} stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {/* Summary chips */}
      <div className="mt-4 grid grid-cols-5 gap-2">
        {Object.entries(DIM_COLORS).map(([key, color]) => {
          const val = current?.[key as keyof typeof current] as number;
          const delta = val - (first?.[key as keyof typeof first] as number || 0);
          return (
            <div key={key} className="text-center p-2 rounded-lg bg-[#141418]">
              <div className="flex items-center justify-center gap-1 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{DIM_LABELS[key]}</span>
              </div>
              <div className="text-lg font-extrabold text-white">{val?.toFixed(1)}</div>
              <div className={`text-[10px] ${delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{delta > 0 ? '+' : ''}{delta.toFixed(1)}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ============================================================================
// RADAR COMPARISON (first month vs current month - team)
// ============================================================================

function TeamRadarComparison({ data }: { data: ReturnType<typeof useTeamDashboardData>['radarComparison'] }) {
  return (
    <Card className="bg-[#0F0F0F] border-white/10 p-5">
      <SectionLabel text="Radar: Inicio vs Actual" />
      <p className="text-xs text-gray-500 mb-2">Primer mes del equipo vs mes actual</p>
      <ResponsiveContainer width="100%" height={280}>
        <ReRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#ffffff10" />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: '#9ca3af', fontSize: 10 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#4a4a5a' }} axisLine={false} />
          <Radar name="Inicio" dataKey="firstMonth" stroke="#ef4444" fill="#ef4444" fillOpacity={0.12} strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
          <Radar name="Actual" dataKey="currentMonth" stroke="#1bea9a" fill="#1bea9a" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: '#1bea9a' }} />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} iconType="circle" iconSize={8} />
          <Tooltip
            contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }}
            itemStyle={{ color: '#fff' }}
          />
        </ReRadarChart>
      </ResponsiveContainer>
      <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-gray-400 leading-relaxed">
        <strong className="text-gray-300">Lectura:</strong> El área verde (actual) debe ser mayor que la roja (inicio). Mayor expansión indica crecimiento del equipo en esa dimensión.
      </div>
    </Card>
  );
}

// ============================================================================
// MULETILLAS TREND (team avg/best/worst)
// ============================================================================

function TeamMuletillasTrend({ data }: { data: ReturnType<typeof useTeamDashboardData>['muletillasTrend'] }) {
  const current = data[data.length - 1];
  const first = data[0];
  const reduction = first && current ? Math.round((1 - current.avg / first.avg) * 100) : 0;

  return (
    <Card className="bg-[#0F0F0F] border-white/10 p-5">
      <SectionLabel text="Muletillas por Minuto" />
      <p className="text-xs text-gray-500 mb-4">Promedio del equipo, mejor y peor caso</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 8]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => [`${Number(value).toFixed(1)}/min`]}
          />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} iconType="circle" iconSize={8} />
          <Area type="monotone" dataKey="worst" name="Peor" stroke="#ef444480" fill="#ef444410" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          <Area type="monotone" dataKey="avg" name="Promedio" stroke="#f97316" fill="#f9731615" strokeWidth={2.5} dot={{ r: 4, fill: '#f97316', stroke: '#0F0F0F', strokeWidth: 2 }} />
          <Area type="monotone" dataKey="best" name="Mejor" stroke="#1bea9a80" fill="#1bea9a10" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-gray-400 leading-relaxed">
        <strong className="text-gray-300">Lectura:</strong> Promedio de {first?.avg} a {current?.avg}/min — {reduction}% de reducción. Meta equipo: &lt;1.5/min (nivel profesional).
      </div>
    </Card>
  );
}

// ============================================================================
// EMOTION TREND (team aggregate)
// ============================================================================

function TeamEmotionTrend({ data }: { data: ReturnType<typeof useTeamDashboardData>['emotionTrend'] }) {
  return (
    <Card className="bg-[#0F0F0F] border-white/10 p-5">
      <SectionLabel text="Emoción Dominante del Equipo" />
      <p className="text-xs text-gray-500 mb-4">Tono emocional promedio en sesiones del equipo</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 1]} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} iconType="circle" iconSize={8} />
          <Bar dataKey="anticipation" name="Anticipación" fill="#485df4" fillOpacity={0.45} radius={[3, 3, 0, 0]} />
          <Bar dataKey="confidence" name="Confianza" fill="#1bea9a" fillOpacity={0.4} radius={[3, 3, 0, 0]} />
          <Bar dataKey="joy" name="Alegría" fill="#ffd93d" fillOpacity={0.35} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-gray-400 leading-relaxed">
        <strong className="text-gray-300">Lectura:</strong> Anticipación y confianza consistentes. La alegría subiendo indica mayor comodidad del equipo en sus conversaciones.
      </div>
    </Card>
  );
}

// ============================================================================
// RECENT SESSIONS TABLE
// ============================================================================

function recentScoreColor(val: number): string {
  if (val >= 7) return 'text-emerald-300/80';
  if (val >= 5) return 'text-gray-300';
  return 'text-red-400/50';
}

function RecentSessionsTable({ sessions }: { sessions: ReturnType<typeof useTeamDashboardData>['recentSessions'] }) {
  const cols = ['Persona', 'Fecha', 'Tipo', 'Global', 'Claridad', 'Estructura', 'Empatía', 'Mulet/min'];

  return (
    <Card className="bg-[#0F0F0F] border-white/10 overflow-hidden">
      <div className="p-5 pb-3">
        <SectionLabel text="Sesiones Recientes del Equipo" />
        <p className="text-xs text-gray-500 mt-1">Últimas sesiones de todos los miembros</p>
      </div>
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
            {sessions.map((s, i) => (
              <tr key={s.id} className={`border-t border-white/5 transition-colors hover:bg-white/[0.03] ${i === 0 ? 'bg-[#1bea9a]/5' : ''}`}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ backgroundColor: `${scoreColor(s.global)}15`, color: scoreColor(s.global) }}>
                      {s.member.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-white text-xs font-medium whitespace-nowrap">{s.member}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-gray-400 whitespace-nowrap">{s.date}</td>
                <td className="px-3 py-2.5 text-gray-300 whitespace-nowrap">{s.type}</td>
                <td className={`px-3 py-2.5 font-semibold ${recentScoreColor(s.global)}`}>{s.global.toFixed(1)}</td>
                <td className={`px-3 py-2.5 ${recentScoreColor(s.clarity)}`}>{s.clarity.toFixed(1)}</td>
                <td className={`px-3 py-2.5 ${recentScoreColor(s.structure)}`}>{s.structure.toFixed(1)}</td>
                <td className={`px-3 py-2.5 ${recentScoreColor(s.empathy)}`}>{s.empathy.toFixed(1)}</td>
                <td className={`px-3 py-2.5 text-gray-400`}>{s.muletillas.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ============================================================================
// ENGAGEMENT HEATMAP (GitHub-style: members × days)
// ============================================================================

function EngagementHeatmap({ data }: { data: ReturnType<typeof useTeamDashboardData>['engagementHeatmap'] }) {
  // Generate day labels for last 30 days
  const dayLabels: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayLabels.push(d.getDate().toString());
  }

  return (
    <Card className="bg-[#0F0F0F] border-white/10 overflow-hidden">
      <div className="p-5 pb-3">
        <SectionLabel text="Mapa de Actividad" />
        <p className="text-xs text-gray-500 mt-1">Sesiones por persona en los últimos 30 días — identifica quién practica y quién no</p>
      </div>
      <div className="overflow-x-auto px-5 pb-5">
        <div className="min-w-[600px]">
          {/* Day numbers header */}
          <div className="flex items-center gap-0 mb-1">
            <div className="w-28 flex-shrink-0" />
            {dayLabels.map((day, i) => (
              <div key={i} className="flex-1 text-center">
                <span className={`text-[8px] ${i % 5 === 0 ? 'text-gray-500' : 'text-transparent'}`}>{day}</span>
              </div>
            ))}
          </div>
          {/* Rows */}
          {data.map((row) => {
            const total = row.days.reduce((a, b) => a + b, 0);
            const isInactive = total < 5;
            return (
              <div key={row.member} className="flex items-center gap-0 mb-0.5">
                {/* Member name */}
                <div className="w-28 flex-shrink-0 flex items-center gap-1.5 pr-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${isInactive ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {row.initials}
                  </div>
                  <span className="text-[10px] text-gray-400 truncate">{row.member.split(' ')[0]}</span>
                </div>
                {/* Day cells */}
                {row.days.map((sessions, i) => {
                  let bg = '#141418'; // no activity
                  if (sessions === 1) bg = '#1bea9a40';
                  if (sessions >= 2) bg = '#1bea9a80';
                  return (
                    <div key={i} className="flex-1 px-[1px]">
                      <div className="h-4 rounded-[2px]" style={{ backgroundColor: bg }} />
                    </div>
                  );
                })}
                {/* Total */}
                <div className="w-8 flex-shrink-0 text-right">
                  <span className={`text-[10px] font-bold ${total >= 10 ? 'text-emerald-400' : total >= 5 ? 'text-gray-400' : 'text-red-400'}`}>{total}</span>
                </div>
              </div>
            );
          })}
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 justify-end">
            <span className="text-[9px] text-gray-600">Menos</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: '#141418' }} />
              <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: '#1bea9a40' }} />
              <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: '#1bea9a80' }} />
            </div>
            <span className="text-[9px] text-gray-600">Más</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// TOP FILLER WORDS (horizontal bar chart - team aggregate)
// ============================================================================

function TopFillerWords({ data }: { data: ReturnType<typeof useTeamDashboardData>['topFillerWords'] }) {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <Card className="bg-[#0F0F0F] border-white/10 p-5">
      <SectionLabel text="Muletillas Más Frecuentes" />
      <p className="text-xs text-gray-500 mb-4">Palabras de relleno más usadas por el equipo (total acumulado)</p>
      <div className="space-y-2.5">
        {data.map((item, i) => (
          <div key={item.word} className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-500 w-4 text-right">{i + 1}</span>
            <span className="text-xs text-gray-300 w-24 truncate font-medium">"{item.word}"</span>
            <div className="flex-1 h-5 bg-[#141418] rounded overflow-hidden">
              <div
                className="h-full rounded transition-all duration-500"
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: item.color,
                  opacity: 0.6,
                }}
              />
            </div>
            <span className="text-xs font-bold text-gray-400 w-10 text-right">{item.count}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-gray-400 leading-relaxed">
        <strong className="text-gray-300">Acción:</strong> Las 3 principales representan el 68% de todas las muletillas. Enfocarse en eliminar "este..." y "o sea" tendría el mayor impacto.
      </div>
    </Card>
  );
}

// ============================================================================
// SECTION LABEL
// ============================================================================

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-[10px] font-bold uppercase tracking-[3px] text-gray-500">{text}</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export function TeamDashboardV2() {
  const data = useTeamDashboardData();

  if (data.loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
      {/* Executive Hero */}
      <ExecutiveHero
        teamScore={data.teamScore}
        teamScoreDelta={data.teamScoreDelta}
        totalMembers={data.totalMembers}
        activeMembers={data.activeMembers}
        improving={data.improving}
        worsening={data.worsening}
        totalSessions={data.totalSessions}
      />

      {/* KPI Cards */}
      <KPICards kpis={data.kpis} />

      {/* Heatmap Table */}
      <HeatmapTable members={data.members} />

      {/* Engagement Heatmap (who's practicing) */}
      <EngagementHeatmap data={data.engagementHeatmap} />

      {/* Charts Row: Distribution + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DistributionChart distribution={data.distribution} />
        <TeamRadar radarData={data.radarData} />
      </div>

      {/* Score Evolution */}
      <ScoreEvolution data={data.scoreEvolution} />

      {/* Divider: Deep Analysis */}
      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <span className="text-xs font-bold uppercase tracking-[4px] text-emerald-500/60">Análisis Profundo</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </div>

      {/* Dimension Trend + Radar Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamDimensionTrend data={data.dimensionTrend} />
        <TeamRadarComparison data={data.radarComparison} />
      </div>

      {/* Muletillas Trend + Top Filler Words */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamMuletillasTrend data={data.muletillasTrend} />
        <TopFillerWords data={data.topFillerWords} />
      </div>

      {/* Emotion Trend (full width) */}
      <TeamEmotionTrend data={data.emotionTrend} />

      {/* Recent Sessions Table */}
      <RecentSessionsTable sessions={data.recentSessions} />

      {/* Rankings */}
      <Rankings topImprovers={data.topImprovers} needsAttention={data.needsAttention} />

      {/* Action Plans */}
      <ActionPlans plans={data.actionPlans} />
    </div>
  );
}
