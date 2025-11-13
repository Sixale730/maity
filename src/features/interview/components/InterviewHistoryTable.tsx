import { useState } from 'react';
import { InterviewSessionWithEvaluation, InterviewService } from '@maity/shared';
import { Badge } from '@/ui/components/ui/badge';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent } from '@/ui/components/ui/card';
import { Calendar, Clock, Eye, User, FileText, RefreshCw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/shared/hooks/use-toast';

interface InterviewHistoryTableProps {
  sessions: InterviewSessionWithEvaluation[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function InterviewHistoryTable({ sessions, isLoading, onRefresh }: InterviewHistoryTableProps) {
  const navigate = useNavigate();
  const { isAdmin } = useUser();
  const { toast } = useToast();
  const [evaluatingSessionId, setEvaluatingSessionId] = useState<string | null>(null);

  const handleEvaluate = async (sessionId: string) => {
    if (evaluatingSessionId) return; // Prevent multiple evaluations at once

    try {
      setEvaluatingSessionId(sessionId);

      toast({
        title: 'Evaluando entrevista...',
        description: 'Esto puede tomar entre 3-10 segundos.',
      });

      const result = await InterviewService.triggerManualEvaluation(sessionId);

      if (result.success) {
        toast({
          title: 'Evaluación completada',
          description: 'La entrevista ha sido evaluada exitosamente.',
        });

        // Refresh the list
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al evaluar',
          description: result.error || 'No se pudo completar la evaluación.',
        });
      }
    } catch (error) {
      console.error('Error al evaluar entrevista:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error inesperado al evaluar la entrevista.',
      });
    } finally {
      setEvaluatingSessionId(null);
    }
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string, evaluationStatus?: string | null) => {
    // Check evaluation status first
    if (evaluationStatus === 'complete') {
      return <Badge variant="default" className="bg-green-600">Análisis Completo</Badge>;
    } else if (evaluationStatus === 'pending' || evaluationStatus === 'processing') {
      return <Badge variant="secondary">Procesando...</Badge>;
    } else if (evaluationStatus === 'error') {
      return <Badge variant="destructive">Error</Badge>;
    }

    // Fallback to session status
    if (status === 'completed') {
      return <Badge variant="outline">Completada</Badge>;
    } else if (status === 'in_progress') {
      return <Badge variant="default">En progreso</Badge>;
    } else {
      return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No hay entrevistas</p>
          <p className="text-sm text-muted-foreground">
            Aún no se han realizado entrevistas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Card key={session.session_id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left Side - Info */}
              <div className="flex-1 space-y-3">
                {/* Header Row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {session.interviewee_name || session.user_name || 'Usuario'}
                    </span>
                  </div>
                  {getStatusBadge(session.status, session.evaluation_status)}
                </div>

                {/* Metadata Row */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {format(new Date(session.started_at), "d 'de' MMM, yyyy", { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDuration(session.duration_seconds)}</span>
                  </div>
                </div>

                {/* Preview */}
                {session.analysis_preview && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {session.analysis_preview}...
                  </p>
                )}
              </div>

              {/* Right Side - Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Admin: Evaluate Button (only if no evaluation or error) */}
                {isAdmin && (!session.evaluation_status || session.evaluation_status === 'error') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEvaluate(session.session_id)}
                    disabled={evaluatingSessionId === session.session_id}
                    className="border-green-600/40 hover:bg-green-900/30 text-green-400 hover:text-green-300"
                  >
                    {evaluatingSessionId === session.session_id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Evaluando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Evaluar
                      </>
                    )}
                  </Button>
                )}

                {/* Ver Análisis Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/primera-entrevista/resultados/${session.session_id}`)}
                  disabled={!session.evaluation_status || session.evaluation_status === 'pending'}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Análisis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
