/**
 * RecorderHomePage
 *
 * Main page for the Recorder App.
 * Shows a prominent CTA to start recording and recent conversations.
 */

import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Mic, Clock, MessageSquare, ChevronRight, AudioLines, Sparkles } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { useRecorderUser } from '../contexts/RecorderUserContext';
import { getOmiConversations, OmiConversation } from '@/features/omi/services/omi.service';
import { isAudioCaptureSupported } from '@/features/web-recorder/lib/audioCapture';

export function RecorderHomePage() {
  const navigate = useNavigate();
  const { userProfile } = useRecorderUser();
  const isSupported = isAudioCaptureSupported();

  // Fetch recent conversations (last 5)
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['recent-conversations', userProfile?.id],
    queryFn: () => getOmiConversations(userProfile?.id),
    enabled: !!userProfile?.id,
    select: (data) => data.slice(0, 5), // Only show last 5
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRelativeDate = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffDays = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return then.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    });
  };

  const handleStartRecording = () => {
    navigate('/record');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          Hola, {userProfile?.name?.split(' ')[0] || 'Usuario'}
        </h1>
        <p className="text-muted-foreground">
          Graba y analiza tus conversaciones con IA
        </p>
      </div>

      {/* Main CTA - Record Button */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-8 text-center">
          <button
            onClick={handleStartRecording}
            disabled={!isSupported}
            className="group relative w-32 h-32 mx-auto mb-4 rounded-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/30"
          >
            <Mic className="w-12 h-12 text-primary-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20 group-hover:opacity-30" />
          </button>
          <h2 className="text-xl font-semibold mb-2">Grabar Conversación</h2>
          <p className="text-muted-foreground text-sm">
            {isSupported
              ? 'Toca para empezar a grabar'
              : 'Tu navegador no soporta grabación de audio'}
          </p>
        </CardContent>
      </Card>

      {/* Recent Conversations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AudioLines className="h-5 w-5 text-primary" />
            Conversaciones Recientes
          </h2>
          {conversations && conversations.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/conversations')}
              className="text-primary"
            >
              Ver todas
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!conversations || conversations.length === 0) && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <AudioLines className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Sin conversaciones aún</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Graba tu primera conversación para verla aquí
              </p>
              <Button onClick={handleStartRecording} disabled={!isSupported}>
                <Mic className="h-4 w-4 mr-2" />
                Grabar ahora
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Conversations list */}
        {!isLoading && conversations && conversations.length > 0 && (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                formatDuration={formatDuration}
                formatRelativeDate={formatRelativeDate}
                onClick={() => navigate(`/conversations?id=${conversation.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Conversation card component
interface ConversationCardProps {
  conversation: OmiConversation;
  formatDuration: (seconds: number | null) => string;
  formatRelativeDate: (date: string) => string;
  onClick: () => void;
}

function ConversationCard({
  conversation,
  formatDuration,
  formatRelativeDate,
  onClick,
}: ConversationCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {conversation.emoji && <span className="text-lg">{conversation.emoji}</span>}
              <h3 className="font-medium truncate">{conversation.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
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
              <span>{formatRelativeDate(conversation.created_at)}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
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
  );
}

export default RecorderHomePage;
