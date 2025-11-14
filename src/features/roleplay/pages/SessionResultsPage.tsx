import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@maity/shared';
import { useUser } from '@/contexts/UserContext';
import { useUserRole } from '@/hooks/useUserRole';
import { SessionResults } from '@/features/roleplay/components/SessionResults';
import { TranscriptViewer } from '@/features/roleplay/components/TranscriptViewer';
import { Button } from '@/ui/components/ui/button';
import { ArrowLeft, User, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/components/ui/dialog';
import { useToast } from '@/shared/hooks/use-toast';
import { env } from '@/lib/env';

interface SessionData {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  company_name: string | null;
  profile_name: string;
  scenario_name: string;
  objectives: string | null;
  score: number | null;
  passed: boolean | null;
  duration_seconds: number | null;
  started_at: string;
  ended_at: string | null;
  processed_feedback: any;
  status: string;
  raw_transcript: string | null;
}

export default function SessionResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isReEvaluating, setIsReEvaluating] = useState(false);

  // Check if admin is viewing another user's session
  const isViewingOtherUser = sessionData && userProfile && sessionData.user_id !== userProfile.id;

  // Admins can re-evaluate any session, users can only re-evaluate their own
  const canReEvaluate = isAdmin || !isViewingOtherUser;

  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch single session by ID using new RPC function
      // RLS policies ensure users see only their own sessions, admins see all
      const { data: sessions, error: fetchError } = await supabase
        .rpc('get_session_by_id', { p_session_id: sessionId });

      if (fetchError) {
        console.error('Error fetching session:', fetchError);
        setError('No se pudo cargar la sesión');
        return;
      }

      if (!sessions || sessions.length === 0) {
        setError('Sesión no encontrada');
        return;
      }

      setSessionData(sessions[0]);
    } catch (err) {
      console.error('Error:', err);
      setError('Ocurrió un error al cargar la sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    // Navigate to roleplay page to start a new session with the same profile
    navigate('/roleplay');
  };

  const handleViewTranscript = () => {
    setShowTranscript(true);
  };

  const handleBack = () => {
    // Use browser history if available, otherwise go to sessions
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/sessions');
    }
  };

  const evaluateSession = async (evalSessionId: string) => {
    try {
      console.log('🤖 [SessionResultsPage] Evaluando sesión con OpenAI:', { sessionId: evalSessionId });

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No hay sesión autenticada');
      }

      const payload = { session_id: evalSessionId };

      console.log('📤 [SessionResultsPage] Llamando a API de evaluación...');

      const response = await fetch(`${env.apiUrl}/api/evaluate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [SessionResultsPage] Error en evaluate-session:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });

        let errorMessage = 'Error al evaluar la sesión';
        if (response.status === 400) {
          errorMessage = errorData.error || 'La sesión no es válida para evaluación.';
        } else if (response.status === 401) {
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
        } else if (response.status === 429) {
          errorMessage = 'Has alcanzado el límite de evaluaciones. Por favor, intenta más tarde.';
        } else if (response.status === 500) {
          errorMessage = 'Error del servidor. Por favor, intenta de nuevo en unos momentos.';
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }

        throw new Error(errorMessage);
      }

      const { evaluation } = await response.json();
      console.log('✅ [SessionResultsPage] Evaluación recibida:', evaluation);

      if (!evaluation || !evaluation.result) {
        console.error('❌ [SessionResultsPage] Respuesta inválida del API:', evaluation);
        throw new Error('La evaluación no contiene los datos esperados. Por favor, intenta de nuevo.');
      }

      const result = evaluation.result;
      const evaluationScore = evaluation.score ??
        (result.dimension_scores?.clarity !== undefined
          ? Math.round((result.dimension_scores.clarity + result.dimension_scores.structure +
                       result.dimension_scores.connection + result.dimension_scores.influence) / 4)
          : 0);

      console.log('📊 [SessionResultsPage] Score calculado:', {
        scoreFromAPI: evaluation.score,
        scoreCalculated: evaluationScore
      });

      // Update sessionData with new evaluation
      setSessionData(prev => prev ? {
        ...prev,
        score: evaluationScore,
        passed: evaluationScore >= 60,
        status: 'completed',
        processed_feedback: result
      } : null);

      toast({
        title: "Evaluación completa",
        description: `Puntuación: ${evaluationScore}/100`,
      });

    } catch (error) {
      console.error('❌ [SessionResultsPage] Error al evaluar sesión:', error);

      toast({
        title: "Error en evaluación",
        description: error instanceof Error ? error.message : 'No se pudo procesar la evaluación',
        variant: "destructive"
      });

      throw error;
    }
  };

  const handleReEvaluate = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "No hay sesión para reevaluar",
        variant: "destructive"
      });
      return;
    }

    setIsReEvaluating(true);

    try {
      console.log('🔄 [SessionResultsPage] Reevaluando sesión:', sessionId);
      await evaluateSession(sessionId);
    } catch (error) {
      console.error('❌ Error en reevaluación:', error);
    } finally {
      setIsReEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Sesión no encontrada'}</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Historial
          </Button>
        </div>
      </div>
    );
  }

  // Calculate duration
  const duration = sessionData.duration_seconds ||
    (sessionData.started_at && sessionData.ended_at
      ? Math.floor((new Date(sessionData.ended_at).getTime() - new Date(sessionData.started_at).getTime()) / 1000)
      : 0);

  return (
    <div className="min-h-screen bg-black">
      <div className="p-3 sm:p-4">
        <Button
          onClick={handleBack}
          variant="ghost"
          className="text-gray-400 hover:text-white text-sm sm:text-base h-9 sm:h-10"
        >
          <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Volver al Historial
        </Button>
      </div>

      <SessionResults
        sessionId={sessionData.id}
        profile={sessionData.profile_name as 'CEO' | 'CTO' | 'CFO'}
        scenarioName={sessionData.scenario_name}
        objectives={sessionData.objectives || undefined}
        score={sessionData.score}
        passed={sessionData.passed}
        duration={duration}
        isProcessing={sessionData.status === 'evaluating'}
        evaluation={sessionData.processed_feedback}
        error={sessionData.status === 'abandoned' ? 'Sesión abandonada' : undefined}
        transcript={sessionData.raw_transcript}
        onRetry={handleRetry}
        onViewTranscript={handleViewTranscript}
        onReEvaluate={canReEvaluate ? handleReEvaluate : undefined}
        isReEvaluating={isReEvaluating}
        canProceedNext={false}
        showRetryButton={canReEvaluate}
        isViewingOtherUser={isViewingOtherUser}
        sessionUserName={sessionData.user_name || undefined}
        sessionUserEmail={sessionData.user_email || undefined}
        sessionCompanyName={sessionData.company_name || undefined}
        sessionStartedAt={sessionData.started_at}
      />

      {/* Modal de Transcripción */}
      <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader className="px-3 sm:px-6 py-3 sm:py-4">
            <DialogTitle className="text-base sm:text-lg lg:text-xl text-white">Transcripción de la Sesión</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-400">
              {sessionData.scenario_name} • Perfil {sessionData.profile_name}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 sm:mt-4 px-3 sm:px-6">
            {sessionData.raw_transcript ? (
              <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 lg:p-6 border border-gray-700 max-h-[60vh] sm:max-h-[55vh] overflow-y-auto">
                <TranscriptViewer transcript={sessionData.raw_transcript} />
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-400">
                <p className="text-sm sm:text-base">No hay transcripción disponible para esta sesión</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
