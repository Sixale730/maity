import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AudioLines, Clock, MessageSquare, ChevronRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { Skeleton } from '@/ui/components/ui/skeleton';
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

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (selectedConversation) {
    return (
      <OmiConversationDetail
        conversation={selectedConversation}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
          <AudioLines className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t('nav.omi_conversations')}</h1>
          <p className="text-muted-foreground">{t('omi.page_description')}</p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6 text-center text-destructive">
            {t('omi.error_loading')}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !error && conversations?.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AudioLines className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('omi.no_conversations')}</h3>
            <p className="text-muted-foreground">{t('omi.no_conversations_desc')}</p>
          </CardContent>
        </Card>
      )}

      {/* Conversations list */}
      {!isLoading && conversations && conversations.length > 0 && (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
              onClick={() => setSelectedConversation(conversation)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {conversation.emoji && (
                        <span className="text-lg">{conversation.emoji}</span>
                      )}
                      <h3 className="font-medium truncate">{conversation.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {conversation.overview}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(conversation.duration_seconds)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {conversation.words_count || 0} palabras
                      </span>
                      <span>{formatDate(conversation.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {conversation.category && (
                      <Badge variant="secondary" className="text-xs">
                        {conversation.category}
                      </Badge>
                    )}
                    {conversation.communication_feedback && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Sparkles className="h-3 w-3" />
                        Análisis
                      </Badge>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
