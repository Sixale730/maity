import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AudioLines, Clock, MessageSquare, ChevronRight, Sparkles, TrendingUp, Mic } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { getOmiConversations, OmiConversation } from '../services/omi.service';
import { OmiConversationDetail } from '../components/OmiConversationDetail';

export function OmiConversationsPage() {
  const { t } = useLanguage();
  const { userProfile } = useUser();
  const [selectedConversation, setSelectedConversation] = useState<OmiConversation | null>(null);

  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ['omi-conversations', userProfile?.id],
    queryFn: () => getOmiConversations(userProfile?.id),
    enabled: !!userProfile?.id,
  });

  const stats = useMemo(() => {
    if (!conversations?.length) return null;
    const withScore = conversations.filter(c => c.communication_feedback?.overall_score !== undefined);
    const avgScore = withScore.length > 0
      ? withScore.reduce((sum, c) => sum + (c.communication_feedback?.overall_score || 0), 0) / withScore.length
      : 0;
    const totalMinutes = Math.round(conversations.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / 60);
    return { total: conversations.length, avgScore: Math.round(avgScore * 10) / 10, totalMinutes, analyzed: withScore.length };
  }, [conversations]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (selectedConversation) {
    return <OmiConversationDetail conversation={selectedConversation} onBack={() => setSelectedConversation(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600"
            style={{ boxShadow: '0 0 20px rgba(0, 212, 170, 0.3)' }}
          >
            <Mic className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t('nav.omi_conversations')}</h1>
            <p className="text-gray-500 text-sm">{t('omi.page_description')}</p>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { icon: MessageSquare, value: stats.total, label: 'Conversaciones', color: '#00d4aa' },
              { icon: TrendingUp, value: stats.avgScore > 0 ? `${stats.avgScore}/10` : '--', label: 'Score Prom.', color: '#fbbf24' },
              { icon: Clock, value: `${stats.totalMinutes} min`, label: 'Tiempo Total', color: '#38bdf8' },
              { icon: Sparkles, value: stats.analyzed, label: 'Analizadas', color: '#a78bfa' },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-[#0F0F0F] border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: `${color}20` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color }}>{value}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-5 rounded-xl bg-[#0F0F0F] border border-white/10 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-[#1a1a2e]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-[#1a1a2e] rounded" />
                    <div className="h-4 w-full bg-[#1a1a2e] rounded" />
                    <div className="h-3 w-1/3 bg-[#1a1a2e] rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-8 rounded-xl bg-[#0F0F0F] border border-red-500/30 text-center">
            <AudioLines className="h-10 w-10 mx-auto text-red-400 mb-3" />
            <p className="text-red-400 font-medium">{t('omi.error_loading')}</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && conversations?.length === 0 && (
          <div className="p-12 rounded-xl bg-[#0F0F0F] border border-white/10 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 mx-auto mb-4">
              <AudioLines className="h-8 w-8 text-emerald-500/50" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{t('omi.no_conversations')}</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">{t('omi.no_conversations_desc')}</p>
          </div>
        )}

        {/* Conversations List */}
        {!isLoading && conversations && conversations.length > 0 && (
          <div className="space-y-3">
            {conversations.map(conversation => {
              const score = conversation.communication_feedback?.overall_score;
              const scoreColor = score !== undefined
                ? (score >= 8 ? '#00d4aa' : score >= 5 ? '#fbbf24' : '#ef4444')
                : null;

              return (
                <div
                  key={conversation.id}
                  className="group p-5 rounded-xl bg-[#0F0F0F] border border-white/10 cursor-pointer transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(0,212,170,0.08)]"
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-2xl group-hover:scale-110 transition-transform duration-300">
                        {conversation.emoji || '🎙️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate group-hover:text-emerald-100 transition-colors">
                          {conversation.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{conversation.overview}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {formatDuration(conversation.duration_seconds)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="h-3 w-3" />
                            {conversation.words_count || 0}
                          </span>
                          <span>{formatDate(conversation.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {score !== undefined && scoreColor && (
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold"
                          style={{ backgroundColor: `${scoreColor}15`, color: scoreColor, boxShadow: `0 0 10px ${scoreColor}20` }}
                        >
                          {score}
                        </div>
                      )}
                      {conversation.category && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/15 text-violet-400">
                          {conversation.category}
                        </span>
                      )}
                      {conversation.communication_feedback && score === undefined && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                          <Sparkles className="h-3 w-3" /> Análisis
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
