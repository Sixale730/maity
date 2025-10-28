import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { TechWeekService, supabase } from '@maity/shared';
import { toast } from '@/ui/components/ui/use-toast';
import { TechWeekSessionResults } from '../components/TechWeekSessionResults';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * TechWeekResultsPage - Display results for a Tech Week session
 *
 * Loads session data and evaluation, with realtime updates for evaluation status
 */
export function TechWeekResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [session, setSession] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluationLoading, setIsEvaluationLoading] = useState(false);

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

  // Realtime subscription for evaluation updates
  useEffect(() => {
    if (!sessionId || !evaluation?.request_id) return;

    let channel: RealtimeChannel | null = null;

    const subscribeToEvaluation = async () => {
      try {
        console.log('[TechWeekResults] 🔔 Setting up realtime subscription for:', evaluation.request_id);

        channel = supabase
          .channel(`tech_week_evaluation:${evaluation.request_id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'maity',
              table: 'tech_week_evaluations',
              filter: `request_id=eq.${evaluation.request_id}`,
            },
            (payload) => {
              console.log('[TechWeekResults] 🔄 Evaluation updated:', payload.new);
              setEvaluation(payload.new);

              // Stop loading if evaluation is complete or error
              if (payload.new.status === 'complete' || payload.new.status === 'error') {
                setIsEvaluationLoading(false);
                console.log('[TechWeekResults] ✅ Evaluation finalized');
              }
            }
          )
          .subscribe((status) => {
            console.log('[TechWeekResults] 📡 Subscription status:', status);
          });
      } catch (error) {
        console.error('[TechWeekResults] ❌ Error setting up realtime subscription:', error);
      }
    };

    subscribeToEvaluation();

    // Cleanup
    return () => {
      if (channel) {
        console.log('[TechWeekResults] 🔕 Unsubscribing from realtime');
        supabase.removeChannel(channel);
      }
    };
  }, [sessionId, evaluation?.request_id]);

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
    <TechWeekSessionResults
      sessionId={sessionId!}
      sessionData={session}
      evaluationData={evaluation}
      isEvaluationLoading={isEvaluationLoading}
      onRetry={() => {
        // Reload evaluation
        TechWeekService.getEvaluationBySessionId(sessionId!)
          .then(data => {
            if (data) {
              setEvaluation(data);
              setIsEvaluationLoading(
                data.status === 'pending' || data.status === 'processing'
              );
            }
          })
          .catch(err => {
            console.error('Error reloading evaluation:', err);
          });
      }}
    />
  );
}
