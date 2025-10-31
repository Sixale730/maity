import { InterviewSessionWithEvaluation } from '@maity/shared';
import { Badge } from '@/ui/components/ui/badge';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent } from '@/ui/components/ui/card';
import { Calendar, Clock, Eye, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface InterviewHistoryTableProps {
  sessions: InterviewSessionWithEvaluation[];
  isLoading?: boolean;
}

export function InterviewHistoryTable({ sessions, isLoading }: InterviewHistoryTableProps) {
  const navigate = useNavigate();

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

              {/* Right Side - Action */}
              <div>
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
