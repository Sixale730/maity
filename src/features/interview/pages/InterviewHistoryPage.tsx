import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/ui/components/ui/sidebar';
import { Button } from '@/ui/components/ui/button';
import { InterviewHistoryTable } from '../components/InterviewHistoryTable';
import { InterviewService, InterviewSessionWithEvaluation } from '@maity/shared';
import { useToast } from '@/shared/hooks/use-toast';
import { Briefcase, Plus, RefreshCw } from 'lucide-react';

export function InterviewHistoryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<InterviewSessionWithEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSessions = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Pass null to get all sessions (admin can see all, users see their own)
      const data = await InterviewService.getSessionHistory(null);
      setSessions(data);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el historial de entrevistas.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRefresh = () => {
    fetchSessions(true);
  };

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
                  Historial de Entrevistas
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Todas las entrevistas realizadas
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>

            <Button
              size="sm"
              onClick={() => navigate('/primera-entrevista')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Entrevista
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl">
          <InterviewHistoryTable sessions={sessions} isLoading={isLoading} onRefresh={handleRefresh} />
        </div>
      </main>
    </div>
  );
}

export default InterviewHistoryPage;
