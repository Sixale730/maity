import { useState } from 'react';
import { Card } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { Button } from '@/ui/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  Clock, MessageSquare, CheckCircle2, Target, Lightbulb, Copy, Check, Calendar
} from 'lucide-react';
import type {
  OmiConversation,
  CommunicationFeedback,
  Radiografia,
  PreguntasAnalisis,
  TemasAnalisis
} from '../services/omi.service';

// ─── Gauge Chart (semicircle) ─────────────────────────────────────
function GaugeChart({ score, maxScore = 10 }: { score: number; maxScore?: number }) {
  const percentage = (score / maxScore) * 100;
  const color = score >= 8 ? '#00d4aa' : score >= 5 ? '#fbbf24' : '#ef4444';

  const data = [
    { name: 'score', value: percentage },
    { name: 'rest', value: 100 - percentage },
  ];

  return (
    <ResponsiveContainer width={180} height={100}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="100%"
          startAngle={180}
          endAngle={0}
          innerRadius={50}
          outerRadius={70}
          dataKey="value"
          stroke="none"
        >
          <Cell fill={color} />
          <Cell fill="rgba(255,255,255,0.1)" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Header Section (centered title + metadata) ───────────────────
interface OmiHeaderSectionProps {
  conversation: OmiConversation;
}

export function OmiHeaderSection({ conversation }: OmiHeaderSectionProps) {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    return `${mins} ${t('omi.minutes')}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(conversation.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy ID:', err);
    }
  };

  const truncateId = (id: string) => {
    if (id.length <= 12) return id;
    return `${id.slice(0, 6)}...${id.slice(-6)}`;
  };

  return (
    <div className="text-center pt-2 pb-4">
      <div className="flex items-center justify-center gap-3 mb-3">
        {conversation.emoji && (
          <span className="text-4xl">{conversation.emoji}</span>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {conversation.title || t('omi.analysis_title')}
        </h1>
      </div>

      {/* ID + Date row */}
      <div className="text-gray-500 text-xs flex flex-wrap items-center justify-center gap-2 mb-2">
        <span className="flex items-center gap-1.5 font-mono">
          {t('omi.conversation_id')}: {truncateId(conversation.id)}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-gray-500 hover:text-white"
            onClick={handleCopyId}
            title={t('omi.copy_id')}
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          </Button>
        </span>
        {conversation.created_at && (
          <>
            <span className="text-gray-600">&bull;</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(conversation.created_at)}
            </span>
          </>
        )}
      </div>

      {/* Existing metadata row */}
      <div className="text-gray-400 text-sm flex flex-wrap items-center justify-center gap-2">
        {conversation.category && (
          <>
            <Badge variant="secondary" className="bg-violet-500/15 text-violet-400">
              {conversation.category}
            </Badge>
            <span className="text-gray-600">&bull;</span>
          </>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatDuration(conversation.duration_seconds)}
        </span>
        <span className="text-gray-600">&bull;</span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          {conversation.words_count?.toLocaleString() || 0} {t('omi.words_analyzed')}
        </span>
      </div>
    </div>
  );
}

// ─── Resumen Hero (gauge + score + description) ───────────────────
interface OmiResumenHeroProps {
  feedback: CommunicationFeedback;
}

export function OmiResumenHero({ feedback }: OmiResumenHeroProps) {
  const { t } = useLanguage();

  const score = feedback.overall_score ?? 0;
  const scoreColor = score >= 8 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : 'text-red-400';
  const scoreLabel = score >= 8 ? t('omi.score_excellent') : score >= 5 ? t('omi.score_good') : t('omi.score_developing');

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 md:p-8 text-white shadow-lg">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Gauge + Score */}
        <div className="flex-none text-center">
          <GaugeChart score={score} />
          <div className={`text-4xl md:text-5xl font-extrabold leading-none mt-2 ${scoreColor}`}>
            {score.toFixed(1)}
          </div>
          <div className="text-base font-semibold mt-1">{scoreLabel}</div>
          <div className="text-sm opacity-70">{t('omi.of_10_points')}</div>
        </div>

        {/* Description */}
        <div className="flex-1 min-w-0">
          <p className="text-base leading-relaxed opacity-95">
            {feedback.feedback || feedback.summary || t('omi.no_feedback_available')}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── KPI Grid (8 cards with emojis - Meeting Analysis style) ──────
const KPI_ACCENT_BORDER: Record<string, string> = {
  red: 'border-t-red-500',
  yellow: 'border-t-yellow-500',
  green: 'border-t-green-500',
  blue: 'border-t-blue-500',
  purple: 'border-t-purple-500',
  orange: 'border-t-orange-500',
  cyan: 'border-t-cyan-500',
  pink: 'border-t-pink-500',
};

const KPI_ACCENT_TEXT: Record<string, string> = {
  red: 'text-red-400',
  yellow: 'text-yellow-400',
  green: 'text-green-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  orange: 'text-orange-400',
  cyan: 'text-cyan-400',
  pink: 'text-pink-400',
};

interface OmiKPIGridProps {
  radiografia?: Radiografia;
  preguntas?: PreguntasAnalisis;
  temas?: TemasAnalisis;
}

export function OmiKPIGrid({ radiografia, preguntas, temas }: OmiKPIGridProps) {
  const { t } = useLanguage();

  // Helper to get accent color for muletillas
  const getMuletillasAccent = (total?: number) => {
    if (!total) return 'green';
    if (total > 50) return 'red';
    if (total > 20) return 'yellow';
    return 'green';
  };

  // Helper to get accent color for ratio
  const getRatioAccent = (ratio?: number) => {
    if (!ratio) return 'blue';
    if (ratio >= 0.8 && ratio <= 1.5) return 'green';
    if (ratio > 2) return 'yellow';
    return 'blue';
  };

  // Format ratio for display
  const formatRatio = (ratio?: number) => {
    if (!ratio) return '-';
    return ratio >= 1 ? `${ratio.toFixed(1)}x` : `1:${(1 / ratio).toFixed(1)}`;
  };

  // Get top muletillas for detail text
  const getTopMuletillas = () => {
    if (!radiografia?.muletillas_detectadas) return t('omi.no_muletillas');
    const top = Object.entries(radiografia.muletillas_detectadas)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([word]) => `"${word}"`)
      .join(', ');
    return top || t('omi.no_muletillas');
  };

  // Get ratio description
  const getRatioDescription = () => {
    if (!radiografia?.ratio_habla) return '-';
    if (radiografia.ratio_habla >= 0.8 && radiografia.ratio_habla <= 1.5) {
      return t('omi.balanced_conversation');
    }
    if (radiografia.ratio_habla > 1.5) {
      return t('omi.you_talk_more');
    }
    return t('omi.others_talk_more');
  };

  const kpis = [
    // Row 1
    {
      icon: '🗣️',
      number: String(radiografia?.muletillas_total || 0),
      label: t('omi.muletillas'),
      detail: getTopMuletillas(),
      accent: getMuletillasAccent(radiografia?.muletillas_total),
    },
    {
      icon: '⚖️',
      number: formatRatio(radiografia?.ratio_habla),
      label: t('omi.talk_ratio'),
      detail: getRatioDescription(),
      accent: getRatioAccent(radiografia?.ratio_habla),
    },
    {
      icon: '❓',
      number: preguntas ? `${preguntas.total_usuario}/${preguntas.total_otros}` : '-/-',
      label: t('omi.questions'),
      detail: preguntas
        ? `${t('omi.you')}: ${preguntas.total_usuario}, ${t('omi.others')}: ${preguntas.total_otros}`
        : t('omi.no_questions_data'),
      accent: 'purple' as const,
    },
    {
      icon: '📝',
      number: String(radiografia?.palabras_usuario || 0),
      label: t('omi.words_user'),
      detail: `${t('omi.others')}: ${radiografia?.palabras_otros || 0}`,
      accent: 'cyan' as const,
    },
    // Row 2
    {
      icon: '💬',
      number: String(radiografia?.palabras_otros || 0),
      label: t('omi.words_others'),
      detail: `${t('omi.total')}: ${(radiografia?.palabras_usuario || 0) + (radiografia?.palabras_otros || 0)}`,
      accent: 'blue' as const,
    },
    {
      icon: '📋',
      number: String(temas?.temas_tratados?.length || 0),
      label: t('omi.topics'),
      detail: temas?.temas_tratados?.slice(0, 2).join(', ') || t('omi.no_topics'),
      accent: 'orange' as const,
    },
    {
      icon: '✅',
      number: String(temas?.acciones_usuario?.length || 0),
      label: t('omi.commitments'),
      detail: temas?.acciones_usuario?.filter(a => a.tiene_fecha).length
        ? `${temas.acciones_usuario.filter(a => a.tiene_fecha).length} ${t('omi.with_date')}`
        : t('omi.no_commitments'),
      accent: 'green' as const,
    },
    {
      icon: '🚪',
      number: String(temas?.temas_sin_cerrar?.length || 0),
      label: t('omi.open_topics'),
      detail: temas?.temas_sin_cerrar?.[0]?.tema || t('omi.all_closed'),
      accent: temas?.temas_sin_cerrar?.length ? 'pink' as const : 'green' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((kpi, index) => (
        <Card
          key={index}
          className={`bg-[#0F0F0F] border border-white/10 border-t-[3px] ${KPI_ACCENT_BORDER[kpi.accent]} p-4 text-center hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg transition-all`}
        >
          <div className="text-2xl mb-1.5">{kpi.icon}</div>
          <div className={`text-3xl font-extrabold leading-tight ${KPI_ACCENT_TEXT[kpi.accent]}`}>
            {kpi.number}
          </div>
          <div className="text-sm font-semibold mt-1 text-white">{kpi.label}</div>
          <div className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
            {kpi.detail}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Score Bars (cards in 2-column grid - Meeting Analysis style) ─
const SCORE_BAR_COLORS: Record<string, { bar: string; text: string }> = {
  clarity: { bar: 'bg-sky-500', text: 'text-sky-400' },
  structure: { bar: 'bg-orange-500', text: 'text-orange-400' },
  empatia: { bar: 'bg-rose-500', text: 'text-rose-400' },
  vocabulario: { bar: 'bg-violet-500', text: 'text-violet-400' },
  objetivo: { bar: 'bg-amber-500', text: 'text-amber-400' },
};

interface OmiScoreBarsProps {
  feedback: CommunicationFeedback;
}

export function OmiScoreBars({ feedback }: OmiScoreBarsProps) {
  const { t } = useLanguage();

  // Get emoji based on score
  const getScoreEmoji = (score?: number) => {
    if (!score) return '⚪';
    if (score >= 8) return '🟢';
    if (score >= 6) return '🟡';
    if (score >= 4) return '🟠';
    return '🔴';
  };

  // Get level description based on score
  const getScoreLevel = (score: number) => {
    if (score >= 8) return t('omi.level_excellent');
    if (score >= 6) return t('omi.level_good');
    if (score >= 4) return t('omi.level_developing');
    return t('omi.level_needs_work');
  };

  // Get detailed description based on metric and score
  const getScoreDescription = (metric: string, score: number) => {
    const key = `omi.${metric}_desc_${score >= 8 ? 'high' : score >= 5 ? 'medium' : 'low'}`;
    return t(key);
  };

  const metrics = [
    { key: 'clarity', value: feedback.clarity, label: t('omi.clarity') },
    { key: 'structure', value: feedback.structure, label: t('omi.structure') },
    { key: 'empatia', value: feedback.empatia, label: t('omi.empatia') },
    { key: 'vocabulario', value: feedback.vocabulario, label: t('omi.vocabulario') },
    { key: 'objetivo', value: feedback.objetivo, label: t('omi.objetivo') },
  ].filter(m => m.value !== undefined);

  if (metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {metrics.map(({ key, value, label }) => (
        <Card key={key} className="bg-[#0F0F0F] border border-white/10 p-4 flex items-center gap-3.5">
          <div className="text-2xl shrink-0">{getScoreEmoji(value)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-semibold text-sm text-white">{label}</span>
            </div>
            <div className="text-xs text-muted-foreground mb-1.5 truncate">
              {getScoreLevel(value!)} — {getScoreDescription(key, value!)}
            </div>
            <div className="h-2.5 bg-[#1a1a2e] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${SCORE_BAR_COLORS[key].bar} transition-all duration-700`}
                style={{ width: `${(value! / 10) * 100}%` }}
              />
            </div>
          </div>
          <div className={`text-2xl font-bold shrink-0 ${SCORE_BAR_COLORS[key].text}`}>
            {value}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Fortalezas Section (with green checks) ───────────────────────
interface OmiFortalezasSectionProps {
  strengths: string[];
}

export function OmiFortalezasSection({ strengths }: OmiFortalezasSectionProps) {
  const { t } = useLanguage();

  if (!strengths || strengths.length === 0) return null;

  return (
    <Card className="bg-[#0F0F0F] border border-white/10 p-5">
      <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <Target className="h-4 w-4 text-emerald-400" />
        {t('omi.strengths_section')}
      </h4>
      <div className="space-y-2">
        {strengths.map((strength, i) => (
          <div
            key={i}
            className="flex gap-2.5 items-start p-3 bg-emerald-500/[0.06] rounded-lg"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-sm text-gray-300 leading-relaxed">{strength}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Areas de Mejora Section (insights style) ─────────────────────
const INSIGHT_BORDERS = [
  'border-l-orange-500',
  'border-l-purple-500',
  'border-l-red-500',
  'border-l-yellow-500',
  'border-l-blue-500',
];

interface OmiAreasSectionProps {
  areas: string[];
}

export function OmiAreasSection({ areas }: OmiAreasSectionProps) {
  const { t } = useLanguage();

  if (!areas || areas.length === 0) return null;

  return (
    <Card className="bg-[#0F0F0F] border border-white/10 p-5">
      <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-400" />
        {t('omi.areas_section')}
      </h4>
      <div className="space-y-3">
        {areas.map((area, i) => (
          <div
            key={i}
            className={`bg-[#1a1a2e] border border-white/5 border-l-[4px] ${INSIGHT_BORDERS[i % INSIGHT_BORDERS.length]} p-4 rounded-lg hover:translate-x-1 hover:border-white/10 transition-all`}
          >
            <div className="text-sm text-gray-300 leading-relaxed">{area}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Transcript Section ───────────────────────────────────────────
interface TranscriptSectionProps {
  segments: Array<{
    id: string;
    text: string;
    speaker: string | null;
    is_user: boolean | null;
    start_time: number;
  }>;
  transcriptText: string | null;
  userName: string | null;
  isLoading: boolean;
}

export function TranscriptSection({ segments, transcriptText, userName, isLoading }: TranscriptSectionProps) {
  const { t } = useLanguage();

  const formatSpeakerName = (
    speaker: string | null,
    isUser: boolean | null
  ): string => {
    if (isUser) return userName || t('omi.you');
    if (!speaker) return t('omi.participant');
    if (speaker.startsWith('Participante')) return speaker;
    const match = speaker.match(/SPEAKER_(\d+)/i);
    if (match) {
      const num = parseInt(match[1]) + 1;
      return `${t('omi.participant')} ${num}`;
    }
    if (speaker === 'Usuario') return userName || t('omi.you');
    return speaker;
  };

  return (
    <Card className="bg-[#0F0F0F] border border-white/10 p-6">
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-[#1a1a2e]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 bg-[#1a1a2e] rounded" />
                <div className="h-4 w-full bg-[#1a1a2e] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : segments && segments.length > 0 ? (
        <div className="space-y-4">
          {segments.map(segment => {
            const displayName = formatSpeakerName(segment.speaker, segment.is_user);
            return (
              <div key={segment.id} className="flex gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  segment.is_user ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[#1a1a2e] text-gray-500'
                }`}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${segment.is_user ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {displayName}
                    </span>
                    <span className="text-xs text-gray-600">
                      {Math.floor(segment.start_time / 60)}:{Math.floor(segment.start_time % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{segment.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : transcriptText ? (
        <p className="text-sm text-gray-300 whitespace-pre-wrap">{transcriptText}</p>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">{t('omi.no_transcript')}</p>
      )}
    </Card>
  );
}
