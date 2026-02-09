import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGamifiedDashboardDataV2 } from '../../hooks/useGamifiedDashboardDataV2';
import { Card } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { RadarChart } from './RadarChart';
import {
  Zap, Flame, Map, ArrowRight, ChevronRight,
  Activity, Trophy, Crown, Lock, Swords,
  TrendingUp, TrendingDown, Target, Medal,
  Gamepad2, Clock, Play
} from 'lucide-react';

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

// Circular Score Component
const CircularScore = ({ value, label, color, size = 80 }: {
  value: number;
  label: string;
  color: string;
  size?: number;
}) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 10) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">{value.toFixed(1)}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 mt-2 uppercase font-bold tracking-wider">{label}</span>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ value, max = 100, color = '#485df4', height = 'h-2', glow = false }: {
  value: number;
  max?: number;
  color?: string;
  height?: string;
  glow?: boolean;
}) => (
  <div className={`w-full bg-[#1a1a2e] rounded-full overflow-hidden ${height}`}>
    <div
      className="h-full rounded-full transition-all duration-1000 ease-out"
      style={{
        width: `${(value / max) * 100}%`,
        backgroundColor: color,
        boxShadow: glow ? `0 0 10px ${color}60` : 'none'
      }}
    />
  </div>
);

// Badge Component - Compact inline style
const Badge = ({ icon, name, unlocked, color, xp }: {
  icon: string;
  name: string;
  unlocked: boolean;
  color: string;
  xp?: number;
}) => (
  <div
    className={`group flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
      unlocked
        ? 'bg-[#1a1a2e] hover:bg-[#252536] cursor-pointer border border-white/5'
        : 'bg-[#0a0a12] opacity-50 border border-white/5'
    }`}
    title={`${name}${xp ? ` • ${xp} XP` : ''}`}
  >
    <span className={`text-lg ${!unlocked && 'grayscale opacity-50'}`}>
      {unlocked ? icon : '🔒'}
    </span>
    <span className={`text-xs font-medium whitespace-nowrap ${unlocked ? 'text-white' : 'text-gray-600'}`}>
      {name}
    </span>
    {unlocked && (
      <span className="text-[10px] text-green-400">✓</span>
    )}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GamifiedDashboardV2() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const data = useGamifiedDashboardDataV2();

  const firstName = data.userName?.split(' ')[0] || 'Usuario';

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#ff0050] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Find strongest and weakest competency
  const strongest = data.competencies.reduce((max, c) => c.value > max.value ? c : max, data.competencies[0]);
  const weakest = data.competencies.reduce((min, c) => c.value < min.value ? c : min, data.competencies[0]);

  // Calculate XP progress percentage
  const xpProgress = Math.min((data.xp / data.nextLevelXP) * 100, 100);

  return (
    <div className="max-w-[1500px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ================================================================== */}
      {/* HEADER: Avatar + Greeting + Stats */}
      {/* ================================================================== */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        {/* Left: Avatar + Greeting */}
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ff0050] to-[#485df4] p-1 shadow-lg shadow-pink-500/20">
              <div className="w-full h-full rounded-full bg-[#0a0a12] flex items-center justify-center text-4xl">
                🦁
              </div>
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-1 -right-1 bg-[#485df4] text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-[#0a0a12]">
              Lv.{data.level}
            </div>
          </div>

          {/* Greeting */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
              Hola, {firstName}! <span className="inline-block animate-pulse">👋</span>
            </h1>
            <p className="text-gray-400 text-sm">
              <span className="text-[#1bea9a] font-semibold">{data.rank}</span> • {data.xp} / {data.nextLevelXP} XP
            </p>
            {/* XP Progress Bar */}
            <div className="mt-2 w-48">
              <ProgressBar value={xpProgress} color="#ff0050" height="h-1.5" glow />
            </div>
          </div>
        </div>

        {/* Right: Quick Stats */}
        <div className="flex gap-3">
          {/* Streak */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 px-5 py-3 rounded-2xl border border-orange-500/20">
            <div className="p-2 bg-orange-500/20 rounded-xl">
              <Flame size={22} className="text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{data.streak}</div>
              <div className="text-[10px] text-orange-400 uppercase font-bold tracking-wider">Días Racha</div>
            </div>
          </div>

          {/* XP */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 px-5 py-3 rounded-2xl border border-pink-500/20">
            <div className="p-2 bg-pink-500/20 rounded-xl">
              <Zap size={22} className="text-pink-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{data.xp}</div>
              <div className="text-[10px] text-pink-400 uppercase font-bold tracking-wider">XP Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MAIN GRID: Mission + Radar + Score */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

        {/* LEFT: Mission Card (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="h-full relative overflow-hidden border-2 border-pink-500/20 hover:border-pink-500/40 transition-all bg-[#0F0F0F] group flex flex-col">
            {/* Background Image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40 z-10" />
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80')" }}
            />

            {/* Content */}
            <div className="relative z-20 p-6 lg:p-8 flex-1">
              {/* Header with duration */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-pink-500 font-bold tracking-widest uppercase text-xs">
                  <Swords size={14} /> Misión Actual
                </div>
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-yellow-500">📅</span>
                  <span className="text-xs text-white font-medium">30 días</span>
                </div>
              </div>

              {/* Mission Title */}
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                {data.mission.map}
              </h2>

              {/* Enemy Card */}
              <div className="inline-flex items-center gap-4 bg-black/60 backdrop-blur-sm px-4 py-3 rounded-2xl border border-red-500/30 mb-4 shadow-lg">
                <div className="text-5xl drop-shadow-lg">{data.mission.enemyIcon}</div>
                <div>
                  <div className="text-[10px] text-red-400 uppercase font-bold tracking-wider mb-0.5">⚔️ Enemigo Final</div>
                  <div className="text-white font-bold text-lg">{data.mission.enemy}</div>
                  <div className="text-xs text-gray-400">{data.mission.enemyDesc}</div>
                </div>
              </div>

              {/* Items */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-400 mr-1">🎒 Equipo:</span>
                {data.mission.items.map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full text-xs text-white border border-white/10 flex items-center gap-2"
                  >
                    <span className="text-base">{item.icon}</span> {item.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer: Progress + CTA */}
            <div className="relative z-20 p-4 lg:px-8 lg:pb-6 bg-gradient-to-t from-black/90 to-transparent">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-gray-300 flex items-center gap-2">
                    <span className="text-lg">🗺️</span> Progreso del mapa
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-[10px]">Día {Math.ceil(data.mission.progress * 0.3)} de 30</span>
                    <span className="text-pink-400 font-bold text-sm">{data.mission.progress}%</span>
                  </div>
                </div>
                <div className="relative">
                  <ProgressBar value={data.mission.progress} color="#ff0050" height="h-3" glow />
                  {/* Progress markers */}
                  <div className="absolute top-0 left-0 right-0 h-3 flex justify-between px-0.5 pointer-events-none">
                    {[0, 25, 50, 75, 100].map((mark) => (
                      <div
                        key={mark}
                        className={`w-0.5 h-full ${mark <= data.mission.progress ? 'bg-white/30' : 'bg-white/10'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => navigate('/roleplay')}
                className="w-full sm:w-auto bg-gradient-to-r from-[#ff0050] to-[#485df4] hover:opacity-90 text-white font-bold px-8 py-4 text-lg shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:-translate-y-0.5 transition-all"
              >
                <Swords size={20} className="mr-2" /> Continuar Misión <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          </Card>
        </div>

        {/* RIGHT: Radar + Score (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Radar Card */}
          <Card className="p-4 bg-[#0F0F0F] border border-white/10 hover:border-blue-500/30 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Target size={16} className="text-blue-400" /> Tu Radar
              </h3>
              <button
                className="text-xs text-blue-400 hover:text-white transition-colors"
                onClick={() => navigate('/progress')}
              >
                Ver detalle →
              </button>
            </div>
            <div className="flex justify-center -mx-2">
              <RadarChart data={data.competencies} size={260} />
            </div>
            <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-500/10 rounded-lg p-2 text-center">
                <span className="text-gray-500 block mb-1">💪 Fortaleza</span>
                <span className="text-green-400 font-bold">{strongest.name}</span>
              </div>
              <div className="bg-pink-500/10 rounded-lg p-2 text-center">
                <span className="text-gray-500 block mb-1">🎯 Mejorar</span>
                <span className="text-pink-400 font-bold">{weakest.name}</span>
              </div>
            </div>
          </Card>

          {/* Score Comparison Card */}
          <Card className="p-5 bg-[#0F0F0F] border border-white/10">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              {data.score.today >= data.score.yesterday ? (
                <TrendingUp size={18} className="text-green-400" />
              ) : (
                <TrendingDown size={18} className="text-red-400" />
              )}
              Score Diario
            </h3>
            <div className="flex items-center justify-around">
              <CircularScore value={data.score.yesterday} label="Ayer" color="#6b7280" size={70} />
              <div className="flex flex-col items-center">
                <div className={`text-2xl font-bold ${data.score.today >= data.score.yesterday ? 'text-green-400' : 'text-red-400'}`}>
                  {data.score.today >= data.score.yesterday ? '↑' : '↓'}
                </div>
                <div className={`text-sm font-bold ${data.score.today >= data.score.yesterday ? 'text-green-400' : 'text-red-400'}`}>
                  {data.score.today >= data.score.yesterday ? '+' : ''}{(data.score.today - data.score.yesterday).toFixed(1)}
                </div>
              </div>
              <CircularScore
                value={data.score.today}
                label="Hoy"
                color={data.score.today >= data.score.yesterday ? '#1bea9a' : '#ef4444'}
                size={70}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* ================================================================== */}
      {/* BADGES SECTION */}
      {/* ================================================================== */}
      <Card className="p-5 bg-[#0F0F0F] border border-white/10 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" /> Insignias
          </h3>
          <span className="text-xs text-gray-500">
            {data.badges.filter(b => b.unlocked).length} / {data.badges.length} desbloqueadas
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.badges.map((badge) => (
            <Badge
              key={badge.id}
              icon={badge.icon}
              name={badge.name}
              unlocked={badge.unlocked}
              color={badge.color}
              xp={badge.xp}
            />
          ))}
        </div>
      </Card>

      {/* ================================================================== */}
      {/* SKILLS ARENA PREVIEW */}
      {/* ================================================================== */}
      <Card className="p-5 bg-[#0F0F0F] border border-white/10 mb-6 overflow-hidden relative group">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full -translate-y-32 translate-x-32 group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full translate-y-24 -translate-x-24 group-hover:scale-110 transition-transform duration-500" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                <Gamepad2 size={22} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Arena de Habilidades</h3>
                <p className="text-xs text-gray-500">Tests y juegos para crecer</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/skills-arena')}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-500/10"
            >
              Ver todo <ArrowRight size={16} />
            </button>
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Test 1: Marca Personal */}
            <div
              onClick={() => navigate('/skills-arena')}
              className="group/card p-4 rounded-xl bg-[#141418] hover:bg-[#1a1a22] border border-transparent hover:border-purple-500/30 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#9b4dca]/20 flex items-center justify-center text-2xl group-hover/card:scale-110 transition-transform">
                  🎭
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm mb-1">Marca Personal</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">Descubre tu esencia única</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock size={10} /> 5 min
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/20 text-green-400">
                    FÁCIL
                  </span>
                </div>
                <span className="flex items-center gap-1 text-xs text-yellow-400 font-bold">
                  <Zap size={12} /> +100 XP
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-purple-400 group-hover/card:text-white transition-colors">
                <Play size={14} className="fill-current" /> Comenzar test
              </div>
            </div>

            {/* Test 2: Rueda de la Vida */}
            <div
              onClick={() => navigate('/skills-arena')}
              className="group/card p-4 rounded-xl bg-[#141418] hover:bg-[#1a1a22] border border-transparent hover:border-green-500/30 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/10"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#1bea9a]/20 flex items-center justify-center text-2xl group-hover/card:scale-110 transition-transform">
                  🎡
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm mb-1">Rueda de la Vida</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">Equilibra todas tus áreas</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock size={10} /> 10 min
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-400">
                    MEDIO
                  </span>
                </div>
                <span className="flex items-center gap-1 text-xs text-yellow-400 font-bold">
                  <Zap size={12} /> +150 XP
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-green-400 group-hover/card:text-white transition-colors">
                <Play size={14} className="fill-current" /> Comenzar test
              </div>
            </div>

            {/* Test 3: Escucha Activa */}
            <div
              onClick={() => navigate('/skills-arena')}
              className="group/card p-4 rounded-xl bg-[#141418] hover:bg-[#1a1a22] border border-transparent hover:border-blue-500/30 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#485df4]/20 flex items-center justify-center text-2xl group-hover/card:scale-110 transition-transform">
                  👂
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm mb-1">Escucha Activa</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">Mejora tu comunicación</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock size={10} /> 8 min
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-400">
                    MEDIO
                  </span>
                </div>
                <span className="flex items-center gap-1 text-xs text-yellow-400 font-bold">
                  <Zap size={12} /> +120 XP
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-blue-400 group-hover/card:text-white transition-colors">
                <Play size={14} className="fill-current" /> Comenzar test
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-5 text-center">
            <Button
              onClick={() => navigate('/skills-arena')}
              variant="outline"
              className="bg-transparent border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-white hover:border-purple-500/50 px-6"
            >
              <Gamepad2 size={16} className="mr-2" />
              Explorar Arena de Habilidades
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </Card>

      {/* ================================================================== */}
      {/* BOTTOM GRID: Activity + Ranking */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Activity Card (2 cols) */}
        <Card className="p-5 lg:col-span-2 bg-[#0F0F0F] border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-green-400" /> Actividad Reciente
            </h3>
            <button
              className="text-xs text-blue-400 hover:text-white transition-colors"
              onClick={() => navigate('/conversaciones')}
            >
              Ver todo →
            </button>
          </div>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {data.recentActivity.length > 0 ? (
              data.recentActivity.slice(0, 5).map((conv) => (
                <div
                  key={conv.id}
                  className="p-3 rounded-xl bg-[#141418] hover:bg-[#1a1a22] transition-all cursor-pointer border border-transparent hover:border-white/10 group"
                  onClick={() => navigate('/conversaciones')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Emoji + Score */}
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xl">{conv.emoji}</span>
                        <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                          conv.score >= 80 ? 'bg-green-500/20 text-green-400' :
                          conv.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {conv.score}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm truncate">{conv.title}</span>
                          {conv.topSkill && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded whitespace-nowrap">
                              {conv.topSkill}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">{conv.date} • {conv.duration}</div>
                        {conv.insight && (
                          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 group-hover:text-gray-300 transition-colors">
                            {conv.insight}
                          </p>
                        )}
                      </div>
                    </div>

                    <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Activity size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Aún no tienes actividad</p>
                <p className="text-xs mt-1">¡Empieza una práctica para ver tus resultados!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Ranking Card (1 col) */}
        <Card className="p-5 bg-[#0F0F0F] border border-white/10">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Crown size={18} className="text-yellow-500" /> Ranking
          </h3>
          <div className="space-y-2">
            {data.ranking.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  entry.isCurrentUser
                    ? 'bg-gradient-to-r from-pink-500/20 to-blue-500/20 border border-pink-500/30'
                    : 'bg-[#141418] hover:bg-[#1a1a22]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Position */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    entry.position === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                    entry.position === 2 ? 'bg-gray-400/20 text-gray-400' :
                    entry.position === 3 ? 'bg-orange-600/20 text-orange-500' :
                    'bg-[#1a1a2e] text-gray-500'
                  }`}>
                    {entry.position <= 3 ? (
                      entry.position === 1 ? '🥇' : entry.position === 2 ? '🥈' : '🥉'
                    ) : entry.position}
                  </div>
                  <span className={`font-medium text-sm ${entry.isCurrentUser ? 'text-pink-400' : 'text-white'}`}>
                    {entry.name} {entry.isCurrentUser && '⭐'}
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  {entry.xp >= 1000 ? `${(entry.xp / 1000).toFixed(1)}K` : entry.xp}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default GamifiedDashboardV2;
