import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/ui/components/ui/sidebar';
import { Button } from '@/ui/components/ui/button';
import { InterviewAnalysis } from '../components/InterviewAnalysis';
import { InterviewService, InterviewSessionDetails, PDFService } from '@maity/shared';
import { useToast } from '@/shared/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, Briefcase, Loader2, User, Building2, Copy, Check, FileText, Download } from 'lucide-react';

export function InterviewResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useUser();

  // Helper function for back navigation
  const handleBackNavigation = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/primera-entrevista/historial');
    }
  };

  const [session, setSession] = useState<InterviewSessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Función para copiar el ID de sesión
  const handleCopySessionId = async () => {
    if (!sessionId) return;
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Función para generar PDF
  const handleGeneratePDF = async () => {
    if (!session || !sessionId) return;
    try {
      setIsGeneratingPDF(true);

      const duration = session.duration_seconds ||
        (session.started_at && session.ended_at
          ? Math.floor((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000)
          : 0);

      await PDFService.generateSessionPDF(
        {
          sessionId,
          userName: session.user?.name,
          userEmail: session.user?.email,
          companyName: session.user?.company_name,
          sessionType: 'interview',
          score: null, // Interview doesn't have numeric score
          duration,
          startedAt: session.started_at,
        },
        {
          includeCharts: false,
          chartElementIds: [],
        }
      );

      toast({
        title: 'PDF generado',
        description: 'El reporte se ha descargado exitosamente',
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo generar el PDF. Por favor, intenta de nuevo.',
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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

  // Check if admin is viewing another user's session
  const isViewingOtherUser = session && userProfile && session.user_id !== userProfile.id;

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
          <Button onClick={handleBackNavigation}>
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

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="border-green-600/40 hover:bg-green-900/30 text-green-400 hover:text-green-300"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-green-400 border-t-transparent rounded-full" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackNavigation}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Historial
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
          {/* User Info Banner for Admins */}
          {isViewingOtherUser && session.user && (
            <div className="mb-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-700/30 rounded-full p-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                    Entrevista de Usuario
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{session.user.name || session.user.email}</span>
                    </div>
                    {session.user.company_name && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{session.user.company_name}</span>
                      </div>
                    )}
                    {/* ID de Sesión */}
                    <div className="pt-2 border-t border-blue-700/30">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <FileText className="h-3 w-3 flex-shrink-0" />
                        <span>ID de Sesión</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-white text-xs font-mono bg-gray-800/50 px-2 py-1 rounded border border-gray-700 flex-1 overflow-x-auto">
                          {sessionId}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopySessionId}
                          className="shrink-0 h-7 text-xs border-blue-600/40 hover:bg-blue-900/30"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copiar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <InterviewAnalysis session={session} isLoading={false} />
        </div>
      </main>
    </div>
  );
}

export default InterviewResultsPage;
