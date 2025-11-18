import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { TechWeekService, supabase } from '@maity/shared';
import { toast } from '@/shared/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { TechWeekSessionResults } from '../components/TechWeekSessionResults';
import { env } from '@/lib/env';
import { Button } from '@/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/ui/dialog';

/**
 * TechWeekResultsPage - Display results for a Tech Week session
 *
 * Loads session data and evaluation with synchronous OpenAI evaluation
 */
export function TechWeekResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { userProfile } = useUser();

  const [session, setSession] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluationLoading, setIsEvaluationLoading] = useState(false);
  const [isReEvaluating, setIsReEvaluating] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [customName, setCustomName] = useState('');

  // Check if admin is viewing another user's session
  const isViewingOtherUser = session && userProfile && session.user_id !== userProfile.id;

  // Load session and evaluation
  useEffect(() => {
    const loadData = async () => {
      if (!sessionId) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'ID de sesión no válido'
        });
        return;
      }

      try {
        setIsLoading(true);

        // Load session
        const sessionData = await TechWeekService.getSessionById(sessionId);
        setSession(sessionData);

        // Load evaluation
        const evaluationData = await TechWeekService.getEvaluationBySessionId(sessionId);
        if (evaluationData) {
          setEvaluation(evaluationData);
          setIsEvaluationLoading(
            evaluationData.status === 'pending' || evaluationData.status === 'processing'
          );
        }
      } catch (error) {
        console.error('Error loading Tech Week session:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo cargar la sesión de Tech Week'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [sessionId]);

  // Re-evaluate session using OpenAI API
  const handleReEvaluate = async () => {
    if (!sessionId) return;

    try {
      setIsReEvaluating(true);
      setIsEvaluationLoading(true);

      // Get access token
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.access_token) {
        throw new Error('No authentication session');
      }

      console.log('[TechWeekResults] 🔄 Re-evaluating session:', sessionId);

      // Call Tech Week evaluation API
      const response = await fetch(`${env.apiUrl}/api/evaluate-tech-week`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession.access_token}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Re-evaluation failed');
      }

      const result = await response.json();
      console.log('[TechWeekResults] ✅ Re-evaluation completed:', result);

      // Reload session and evaluation data
      const sessionData = await TechWeekService.getSessionById(sessionId);
      setSession(sessionData);

      const evaluationData = await TechWeekService.getEvaluationBySessionId(sessionId);
      if (evaluationData) {
        setEvaluation(evaluationData);
      }

      toast({
        title: 'Reevaluación completada',
        description: `Nueva puntuación: ${result.evaluation?.score}/100`,
      });

    } catch (error) {
      console.error('[TechWeekResults] ❌ Error re-evaluating:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo reevaluar la sesión',
      });
    } finally {
      setIsReEvaluating(false);
      setIsEvaluationLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#FF69B4' }} />
          <p className="text-gray-400">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  // Session not found
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No se encontró la sesión</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TechWeekSessionResults
        sessionId={sessionId!}
        sessionData={session}
        evaluationData={evaluation}
        isEvaluationLoading={isEvaluationLoading}
        isViewingOtherUser={isViewingOtherUser}
        onReEvaluate={handleReEvaluate}
        isReEvaluating={isReEvaluating}
        onViewTranscript={() => setShowTranscript(true)}
        customName={customName}
        onCustomNameChange={setCustomName}
      />

      {/* Transcript Modal */}
      <Dialog open={showTranscript} onOpenChange={setShowTranscript}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              Transcripción de la Sesión
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh] p-4 bg-gray-800/50 rounded-lg">
            {session?.transcript ? (
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {session.transcript}
              </pre>
            ) : (
              <p className="text-gray-400 italic">No hay transcripción disponible</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

