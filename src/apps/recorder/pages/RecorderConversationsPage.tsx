/**
 * RecorderConversationsPage
 *
 * Full list of conversations with inline expandable detail.
 * Reuses omi.service and OmiConversationDetail component.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AudioLines,
  Clock,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  Mic,
} from 'lucide-react';
import { Card, CardContent } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { Button } from '@/ui/components/ui/button';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { useRecorderUser } from '../contexts/RecorderUserContext';
import {
  getOmiConversations,
  OmiConversation,
} from '@/features/omi/services/omi.service';
import { OmiConversationDetail } from '@/features/omi/components/OmiConversationDetail';

export function RecorderConversationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile } = useRecorderUser();

  // Get selected conversation ID from URL
  const selectedId = searchParams.get('id');
  const [expandedId, setExpandedId] = useState<string | null>(selectedId);

  // Sync URL with expanded state
  useEffect(() => {
    if (selectedId) {
      setExpandedId(selectedId);
    }
  }, [selectedId]);

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

  const handleToggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setSearchParams({});
    } else {
      setExpandedId(id);
      setSearchParams({ id });
    }
  };

  const handleBack = () => {
    setExpandedId(null);
    setSearchParams({});
  };

  // If a conversation is expanded, show its detail
  const selectedConversation = expandedId
    ? conversations?.find((c) => c.id === expandedId)
    : null;

  if (selectedConversation) {
    return (
      <OmiConversationDetail
        conversation={selectedConversation}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AudioLines className="h-6 w-6 text-primary" />
            Mis Conversaciones
          </h1>
          <p className="text-muted-foreground text-sm">
            {conversations?.length || 0} conversaciones grabadas
          </p>
        </div>
        <Button onClick={() => navigate('/record')}>
          <Mic className="h-4 w-4 mr-2" />
          Grabar
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
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
            Error al cargar conversaciones. Por favor intenta de nuevo.
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !error && conversations?.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AudioLines className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sin conversaciones aún</h3>
            <p className="text-muted-foreground mb-6">
              Graba tu primera conversación para verla aquí
            </p>
            <Button onClick={() => navigate('/record')}>
              <Mic className="h-4 w-4 mr-2" />
              Grabar conversación
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Conversations list */}
      {!isLoading && conversations && conversations.length > 0 && (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isExpanded={expandedId === conversation.id}
              formatDuration={formatDuration}
              formatDate={formatDate}
              onToggle={() => handleToggleExpand(conversation.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// List item component
interface ConversationListItemProps {
  conversation: OmiConversation;
  isExpanded: boolean;
  formatDuration: (seconds: number | null) => string;
  formatDate: (date: string) => string;
  onToggle: () => void;
}

function ConversationListItem({
  conversation,
  isExpanded,
  formatDuration,
  formatDate,
  onToggle,
}: ConversationListItemProps) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        isExpanded
          ? 'border-primary/50 shadow-md'
          : 'hover:shadow-md hover:border-primary/30'
      }`}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {conversation.emoji && <span className="text-lg">{conversation.emoji}</span>}
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
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-primary" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecorderConversationsPage;
