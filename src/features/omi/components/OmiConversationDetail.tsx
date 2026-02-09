import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Clock, MessageSquare, CheckCircle2, Calendar, Sparkles,
  User, Bot, Lightbulb, MessageCircle, LayoutList, Shield, Target, Trash2
} from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/ui/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useDeleteConversation } from '../hooks/useDeleteConversation';
import { OmiConversation, getOmiTranscriptSegments } from '../services/omi.service';
import {
  SectionLabel,
  RadiografiaKPIGrid,
  MuletillasSection,
  PreguntasSection,
  TemasSection,
  AccionesSection,
  TemasSinCerrarSection
} from './ConversationSections';

const METRIC_COLORS: Record<string, { color: string; bg: string }> = {
  clarity: { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)' },
  engagement: { color: '#00d4aa', bg: 'rgba(0, 212, 170, 0.1)' },
  structure: { color: '#ff8c42', bg: 'rgba(255, 140, 66, 0.1)' },
};

function InsightCard({ icon: Icon, title, content }: { icon: React.ComponentType<{ className?: string }>; title: string; content: string }) {
  return (
    <div className="p-4 rounded-xl bg-[#1a1a2e] border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-emerald-400" />
        <h5 className="text-sm font-medium text-white">{title}</h5>
      </div>
      <p className="text-sm text-gray-400">{content}</p>
    </div>
  );
}

interface OmiConversationDetailProps {
  conversation: OmiConversation;
  onBack: () => void;
}

export function OmiConversationDetail({ conversation, onBack }: OmiConversationDetailProps) {
  const { t } = useLanguage();
  const { isAdmin } = useUser();
  const deleteConversation = useDeleteConversation();

  const { data: segments, isLoading: loadingSegments } = useQuery({
    queryKey: ['omi-segments', conversation.id],
    queryFn: () => getOmiTranscriptSegments(conversation.id),
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const feedback = conversation.communication_feedback;
  const overallColor = feedback?.overall_score !== undefined
    ? (feedback.overall_score >= 8 ? '#00d4aa' : feedback.overall_score >= 5 ? '#fbbf24' : '#ef4444')
    : '#a78bfa';

  // Check if we have radiografia data
  const hasRadiografia = feedback?.radiografia;
  const hasPreguntas = feedback?.preguntas;
  const hasTemas = feedback?.temas;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 -ml-2 text-gray-400 hover:text-white hover:bg-white/5">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            {conversation.emoji && (
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-3xl">
                {conversation.emoji}
              </div>
            )}
            <h1 className="text-2xl font-bold text-white flex-1">{conversation.title}</h1>
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('omi.delete_conversation')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('omi.delete_conversation_description')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        deleteConversation.mutate(conversation.id, {
                          onSuccess: () => onBack(),
                        });
                      }}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {t('common.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <p className="text-gray-400 mb-4">{conversation.overview}</p>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { icon: Calendar, text: formatDate(conversation.created_at) },
              { icon: Clock, text: formatDuration(conversation.duration_seconds) },
              { icon: MessageSquare, text: `${conversation.words_count || 0} palabras` },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F0F0F] border border-white/10 text-xs text-gray-400">
                <Icon className="h-3.5 w-3.5" /> {text}
              </span>
            ))}
            {conversation.category && (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-violet-500/15 text-violet-400">
                {conversation.category}
              </span>
            )}
          </div>
        </div>

        {/* Radiografía KPIs - Show first if available */}
        {hasRadiografia && (
          <>
            <SectionLabel>{t('omi.radiografia')}</SectionLabel>
            <RadiografiaKPIGrid
              radiografia={feedback.radiografia!}
              preguntas={feedback.preguntas}
            />
          </>
        )}

        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          {/* Communication Feedback - Scores */}
          {feedback && (feedback.overall_score !== undefined || feedback.clarity !== undefined) && (
            <div className="lg:col-span-2 p-6 rounded-xl bg-[#0F0F0F] border border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">{t('omi.communication_analysis')}</h3>
              </div>

              {/* Overall Score */}
              {feedback.overall_score !== undefined && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">{t('omi.overall_score')}</span>
                    <span className="text-2xl font-bold" style={{ color: overallColor }}>
                      {feedback.overall_score}/10
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#1a1a2e] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${feedback.overall_score * 10}%`,
                        backgroundColor: overallColor,
                        boxShadow: `0 0 10px ${overallColor}60`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Individual Scores */}
              <div className="grid gap-3 sm:grid-cols-3 mb-6">
                {([
                  { key: 'clarity', value: feedback.clarity, label: t('omi.clarity') },
                  { key: 'engagement', value: feedback.engagement, label: t('omi.engagement') },
                  { key: 'structure', value: feedback.structure, label: t('omi.structure') },
                ] as const).map(({ key, value, label }) => value !== undefined && (
                  <div
                    key={key}
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: METRIC_COLORS[key].bg, border: `1px solid ${METRIC_COLORS[key].color}20` }}
                  >
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">{label}</div>
                    <div className="text-xl font-bold" style={{ color: METRIC_COLORS[key].color }}>{value}/10</div>
                    <div className="h-1 rounded-full bg-[#1a1a2e] mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${value * 10}%`, backgroundColor: METRIC_COLORS[key].color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Feedback Text */}
              {(feedback.feedback || feedback.summary) && (
                <p className="text-sm text-gray-400 mb-6">{feedback.feedback || feedback.summary}</p>
              )}

              {/* Strengths & Areas */}
              <div className="grid gap-4 sm:grid-cols-2">
                {feedback.strengths && feedback.strengths.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#1a1a2e]">
                    <h4 className="text-sm font-bold mb-3 text-emerald-400">{t('omi.strengths')}</h4>
                    <ul className="space-y-2">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 text-gray-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {feedback.areas_to_improve && feedback.areas_to_improve.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#1a1a2e]">
                    <h4 className="text-sm font-bold mb-3 text-amber-400">{t('omi.areas_to_improve')}</h4>
                    <ul className="space-y-2">
                      {feedback.areas_to_improve.map((a, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">•</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Muletillas Section */}
          {hasRadiografia && feedback.radiografia!.muletillas_total > 0 && (
            <div className="lg:col-span-2">
              <MuletillasSection
                muletillas={feedback.radiografia!.muletillas_detectadas}
                total={feedback.radiografia!.muletillas_total}
              />
            </div>
          )}

          {/* Preguntas Section */}
          {hasPreguntas && (
            <div className="lg:col-span-2">
              <SectionLabel>{t('omi.questions')}</SectionLabel>
              <PreguntasSection preguntas={feedback.preguntas!} />
            </div>
          )}

          {/* Temas Section */}
          {hasTemas && feedback.temas!.temas_tratados.length > 0 && (
            <div className="lg:col-span-2">
              <SectionLabel>{t('omi.topics')}</SectionLabel>
              <TemasSection temas={feedback.temas!.temas_tratados} />
            </div>
          )}

          {/* Acciones Section */}
          {hasTemas && feedback.temas!.acciones_usuario.length > 0 && (
            <div className="lg:col-span-2">
              <SectionLabel>{t('omi.your_commitments')}</SectionLabel>
              <AccionesSection acciones={feedback.temas!.acciones_usuario} />
            </div>
          )}

          {/* Temas Sin Cerrar Section */}
          {hasTemas && feedback.temas!.temas_sin_cerrar.length > 0 && (
            <div className="lg:col-span-2">
              <SectionLabel>{t('omi.open_topics')}</SectionLabel>
              <TemasSinCerrarSection temasSinCerrar={feedback.temas!.temas_sin_cerrar} />
            </div>
          )}

          {/* Insights - Only show if no radiografia (legacy) */}
          {feedback?.observations && !hasRadiografia && (
            <div className="lg:col-span-2 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">{t('omi.insights')}</h4>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {feedback.observations.clarity && (
                  <InsightCard icon={MessageCircle} title={t('omi.clarity')} content={feedback.observations.clarity} />
                )}
                {feedback.observations.structure && (
                  <InsightCard icon={LayoutList} title={t('omi.structure')} content={feedback.observations.structure} />
                )}
                {feedback.observations.objections && (
                  <InsightCard icon={Shield} title={t('omi.objections')} content={feedback.observations.objections} />
                )}
                {feedback.observations.calls_to_action && (
                  <InsightCard icon={Target} title={t('omi.calls_to_action')} content={feedback.observations.calls_to_action} />
                )}
              </div>
            </div>
          )}

          {/* Action Items */}
          {conversation.action_items && conversation.action_items.length > 0 && (
            <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">{t('omi.action_items')}</h3>
              <ul className="space-y-3">
                {conversation.action_items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className={`h-4 w-4 mt-0.5 flex-shrink-0 ${item.completed ? 'text-emerald-500' : 'text-gray-600'}`} />
                    <span className={item.completed ? 'line-through text-gray-600' : 'text-gray-300'}>
                      {item.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Events */}
          {conversation.events && conversation.events.length > 0 && (
            <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">{t('omi.events')}</h3>
              <ul className="space-y-3">
                {conversation.events.map((event, i) => (
                  <li key={i} className="border-l-2 border-emerald-500/30 pl-3">
                    <div className="font-medium text-sm text-white">{event.title}</div>
                    {event.description && (
                      <div className="text-xs text-gray-500">{event.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Transcript */}
        <SectionLabel>{t('omi.transcript')}</SectionLabel>
        <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/10">
          {loadingSegments ? (
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
              {segments.map(segment => (
                <div key={segment.id} className="flex gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    segment.is_user ? 'bg-emerald-500/15' : 'bg-[#1a1a2e]'
                  }`}>
                    {segment.is_user
                      ? <User className="h-4 w-4 text-emerald-400" />
                      : <Bot className="h-4 w-4 text-gray-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${segment.is_user ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {segment.speaker || (segment.is_user ? 'Tú' : 'Otro')}
                      </span>
                      <span className="text-xs text-gray-600">
                        {Math.floor(segment.start_time / 60)}:{Math.floor(segment.start_time % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{segment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : conversation.transcript_text ? (
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{conversation.transcript_text}</p>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">{t('omi.no_transcript')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
