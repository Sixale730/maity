import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { FileText, User, Calendar, Clock, Loader2, AlertCircle, Star } from 'lucide-react';
import { InterviewSessionDetails } from '@maity/shared';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface InterviewAnalysisProps {
  session: InterviewSessionDetails;
  isLoading?: boolean;
}

export function InterviewAnalysis({ session, isLoading = false }: InterviewAnalysisProps) {
  const { evaluation, user } = session;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Si está cargando o en proceso
  if (isLoading || !evaluation || evaluation.status === 'pending' || evaluation.status === 'processing') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            Procesando análisis...
          </CardTitle>
          <CardDescription>
            El análisis de tu entrevista se está generando. Esto puede tomar algunos minutos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Si hubo error
  if (evaluation.status === 'error') {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error en el análisis
          </CardTitle>
          <CardDescription>
            {evaluation.error_message || 'Ocurrió un error al procesar el análisis de tu entrevista.'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Detalles de la Entrevista</CardTitle>
              <CardDescription>Información de la sesión</CardDescription>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Completada
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {/* Score/Average */}
          {session.score !== null && session.score !== undefined && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50 dark:bg-yellow-950">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Promedio</p>
                <p className="text-sm text-muted-foreground">
                  {session.score.toFixed(1)}/10
                </p>
              </div>
            </div>
          )}

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Participante</p>
                <p className="text-sm text-muted-foreground">
                  {user.name || user.email}
                </p>
              </div>
            </div>
          )}

          {/* Interviewee Name (extracted from transcript) */}
          {evaluation.interviewee_name && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Entrevistado</p>
                <p className="text-sm text-muted-foreground">
                  {evaluation.interviewee_name}
                </p>
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-950">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Fecha</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(session.started_at), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
          </div>

          {/* Duration */}
          {session.duration_seconds && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Duración</p>
                <p className="text-sm text-muted-foreground">
                  {formatDuration(session.duration_seconds)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Análisis
          </CardTitle>
          <CardDescription>
            Análisis detallado de la entrevista generado por IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {evaluation.analysis_text || 'No hay análisis disponible.'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript Card (if available) */}
      {session.raw_transcript && (
        <Card>
          <CardHeader>
            <CardTitle>Transcripción</CardTitle>
            <CardDescription>
              Conversación completa de la entrevista
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto rounded-lg bg-muted p-4">
              <pre className="text-xs whitespace-pre-wrap font-mono">
                {session.raw_transcript}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
