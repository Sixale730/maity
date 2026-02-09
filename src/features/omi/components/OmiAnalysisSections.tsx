import { Card } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  Clock, MessageSquare, CheckCircle2, Target, Lightbulb
} from 'lucide-react';
import type { OmiConversation, CommunicationFeedback } from '../services/omi.service';

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
  const { t } = useLanguage();

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    return `${mins} ${t('omi.minutes')}`;
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

// ─── Score Bars (horizontal metrics) ──────────────────────────────
const SCORE_COLORS: Record<string, { bar: string; text: string }> = {
  clarity: { bar: 'bg-sky-500', text: 'text-sky-400' },
  engagement: { bar: 'bg-emerald-500', text: 'text-emerald-400' },
  structure: { bar: 'bg-orange-500', text: 'text-orange-400' },
};

interface OmiScoreBarsProps {
  feedback: CommunicationFeedback;
}

export function OmiScoreBars({ feedback }: OmiScoreBarsProps) {
  const { t } = useLanguage();

  const metrics = [
    { key: 'clarity', value: feedback.clarity, label: t('omi.clarity'), emoji: '🔵' },
    { key: 'engagement', value: feedback.engagement, label: t('omi.engagement'), emoji: '🟢' },
    { key: 'structure', value: feedback.structure, label: t('omi.structure'), emoji: '🟠' },
  ].filter(m => m.value !== undefined);

  if (metrics.length === 0) return null;

  const getScoreLevel = (score: number) => {
    if (score >= 8) return t('omi.level_excellent');
    if (score >= 6) return t('omi.level_good');
    if (score >= 4) return t('omi.level_developing');
    return t('omi.level_needs_work');
  };

  return (
    <Card className="bg-[#0F0F0F] border border-white/10 p-5">
      <div className="space-y-4">
        {metrics.map(({ key, value, label, emoji }) => (
          <div key={key} className="flex items-center gap-3.5">
            <div className="text-xl shrink-0">{emoji}</div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm text-white">{label}</span>
                <span className={`text-xs ${SCORE_COLORS[key].text}`}>
                  {getScoreLevel(value!)}
                </span>
              </div>
              <div className="h-2.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${SCORE_COLORS[key].bar} transition-all duration-700`}
                  style={{ width: `${(value! / 10) * 100}%` }}
                />
              </div>
            </div>
            <div className={`text-2xl font-bold shrink-0 w-12 text-right ${SCORE_COLORS[key].text}`}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </Card>
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
