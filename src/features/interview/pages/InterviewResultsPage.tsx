import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/ui/components/ui/sidebar';
import { Button } from '@/ui/components/ui/button';
import { InterviewAnalysis } from '../components/InterviewAnalysis';
import { InterviewService, InterviewSessionDetails, useInterviewEvaluationRealtime } from '@maity/shared';
import { useToast } from '@/ui/components/ui/use-toast';
import { ArrowLeft, Briefcase, Loader2 } from 'lucide-react';

export function InterviewResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [session, setSession] = useState<InterviewSessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Setup realtime monitoring if evaluation exists
  const evaluationRequestId = session?.evaluation_id || '';
  const {
    evaluation: realtimeEvaluation,
    isLoading: isRealtimeLoading,
    error: realtimeError,
  } = useInterviewEvaluationRealtime({
    requestId: evaluationRequestId,
    onComplete: (analysis) => {
      console.log('[InterviewResultsPage] ✅ Análisis completado:', analysis.substring(0, 100));
      // Refetch session to get updated data
      fetchSession();
    },
    onError: (errorMessage) => {
      console.error('[InterviewResultsPage] ❌ Error en análisis:', errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const fetchSession = async () => {
    if (!sessionId) {
      setError('ID de sesión no válido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await InterviewService.getSessionWithEvaluation(sessionId);

      if (!data) {
        setError('No se encontró la sesión');
        setIsLoading(false);
        return;
      }

      setSession(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error al cargar sesión:', err);
      setError('Ocurrió un error al cargar la sesión');
      setIsLoading(false);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la sesión de entrevista.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  // Update session with realtime evaluation data
  useEffect(() => {
    if (realtimeEvaluation && session) {
      setSession({
        ...session,
        evaluation: realtimeEvaluation,
      });
    }
  }, [realtimeEvaluation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando análisis de entrevista...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium text-destructive">{error || 'Sesión no encontrada'}</p>
          <Button onClick={() => navigate('/primera-entrevista/historial')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al historial
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2 sm:gap-3">
              <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  Resultados de Entrevista
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Análisis detallado de tu sesión
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/primera-entrevista/historial')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Historial
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
          <InterviewAnalysis session={session} isLoading={isRealtimeLoading} />
        </div>
      </main>
    </div>
  );
}

export default InterviewResultsPage;
