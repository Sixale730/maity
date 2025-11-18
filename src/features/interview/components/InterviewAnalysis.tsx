import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { FileText, User, Calendar, Clock, Loader2, AlertCircle, Star, Sparkles, Eye, BookOpen } from 'lucide-react';
import { InterviewSessionDetails, InterviewRubrics } from '@maity/shared';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { InterviewRubricCard } from './InterviewRubricCard';

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

  // Parse structured data from analysis_text if needed (backwards compatibility)
  const getStructuredData = () => {
    // If we have direct structured fields, use them
    if (evaluation?.rubrics || evaluation?.summary || evaluation?.key_observations) {
      return {
        rubrics: evaluation.rubrics || null,
        summary: evaluation.summary || null,
        key_observations: evaluation.key_observations || null,
        amazing_comment: evaluation.amazing_comment || null,
      };
    }

    // Otherwise, try to parse from analysis_text (legacy format)
    if (evaluation?.analysis_text) {
      try {
        const parsed = JSON.parse(evaluation.analysis_text);
        return {
          rubrics: parsed.rubrics || null,
          summary: parsed.summary || null,
          key_observations: parsed.key_observations || null,
          amazing_comment: parsed.amazing_comment || null,
        };
      } catch (err) {
        // If parsing fails, it's plain text - return null
        console.error('Failed to parse analysis_text:', err);
        return null;
      }
    }

    return null;
  };

  const structuredData = getStructuredData();

  // Si está cargando o en proceso
  if (isLoading || !evaluation || evaluation.status === 'pending' || evaluation.status === 'processing') {
    return (
      <div className="space-y-6">
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

        {/* Show transcript while waiting for analysis */}
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

  // Si hubo error
  if (evaluation.status === 'error') {
    return (
      <div className="space-y-6">
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

        {/* Show transcript even on error */}
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

      {/* Summary Card */}
      {structuredData?.summary && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Resumen General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">
              {structuredData.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Amazing Comment Card */}
      {structuredData?.amazing_comment && (
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Observación Destacada
            </CardTitle>
            <CardDescription>
              Un patrón interesante identificado en tu entrevista
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">
              {structuredData.amazing_comment}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Key Observations */}
      {structuredData?.key_observations && structuredData.key_observations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Observaciones Clave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {structuredData.key_observations.map((observation, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="flex-1 leading-relaxed">{observation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Rubrics Section */}
      {structuredData?.rubrics && Object.keys(structuredData.rubrics).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Evaluación Detallada por Competencias</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(structuredData.rubrics).map(([key, rubric]) => (
              rubric && <InterviewRubricCard key={key} title={key} rubric={rubric} />
            ))}
          </div>
        </div>
      )}

      {/* Fallback: Plain text analysis (for old data without structure) */}
      {!structuredData && evaluation.analysis_text && (
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
                {evaluation.analysis_text}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
