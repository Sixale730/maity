import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../../api/client/supabase';
import { InterviewEvaluation } from '../interview.types';

interface UseInterviewEvaluationRealtimeProps {
  requestId: string;
  onUpdate?: (evaluation: InterviewEvaluation) => void;
  onComplete?: (analysis: string) => void;
  onError?: (errorMessage: string) => void;
}

/**
 * Hook to subscribe to real-time updates for interview evaluation by request_id
 *
 * @example
 * ```tsx
 * const { evaluation, isLoading, error } = useInterviewEvaluationRealtime({
 *   requestId: 'abc-123',
 *   onComplete: (analysis) => {
 *     console.log('Interview analysis completed!', analysis);
 *   },
 *   onError: (errorMessage) => {
 *     console.error('Interview analysis failed:', errorMessage);
 *   }
 * });
 * ```
 */
export function useInterviewEvaluationRealtime({
  requestId,
  onUpdate,
  onComplete,
  onError,
}: UseInterviewEvaluationRealtimeProps) {
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setIsLoading(false);
      setError('Missing request_id');
      return;
    }

    let channel: RealtimeChannel | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const initializeSubscription = async () => {
      console.log('[useInterviewEvaluationRealtime] 🚀 Iniciando suscripción para request_id:', requestId);

      try {
        // Fetch initial evaluation state from maity schema
        const { data: initialData, error: fetchError } = await supabase
          .schema('maity')
          .from('interview_evaluations')
          .select('*')
          .eq('request_id', requestId)
          .maybeSingle();

        if (fetchError) {
          console.error('[useInterviewEvaluationRealtime] ❌ Fetch error:', fetchError);
          setError(fetchError.message);
          setIsLoading(false);
          return;
        }

        if (!initialData) {
          console.error('[useInterviewEvaluationRealtime] ❌ Interview evaluation not found for request_id:', requestId);
          setError('Interview evaluation not found');
          setIsLoading(false);
          return;
        }

        console.log('[useInterviewEvaluationRealtime] 📊 Estado inicial:', {
          request_id: initialData.request_id,
          status: initialData.status,
          hasAnalysis: !!initialData.analysis_text,
          interviewee_name: initialData.interviewee_name
        });

        setEvaluation(initialData as InterviewEvaluation);
        setIsLoading(false);

        // If already complete/error, trigger callbacks
        if (initialData.status === 'complete' && onComplete && initialData.analysis_text) {
          console.log('✅ [Interview Evaluation] Completada:', {
            interviewee: initialData.interviewee_name,
            analysis_length: initialData.analysis_text.length
          });
          onComplete(initialData.analysis_text);
          return; // No need to subscribe if already complete
        } else if (initialData.status === 'error' && onError && initialData.error_message) {
          onError(initialData.error_message);
          return; // No need to subscribe if error
        }

        // Start polling as backup (check every 3 seconds)
        console.log('[useInterviewEvaluationRealtime] 🔄 Iniciando polling de respaldo cada 3s');
        pollInterval = setInterval(async () => {
          console.log('[useInterviewEvaluationRealtime] 🔍 Polling: verificando estado...');

          const { data: polledData, error: pollError } = await supabase
            .schema('maity')
            .from('interview_evaluations')
            .select('*')
            .eq('request_id', requestId)
            .maybeSingle();

          if (!pollError && polledData) {
            console.log('[useInterviewEvaluationRealtime] 📊 Polling: estado actual:', polledData.status);

            if (polledData.status === 'complete' || polledData.status === 'error') {
              console.log('[useInterviewEvaluationRealtime] ✅ Polling: evaluación finalizada, limpiando interval');

              setEvaluation(polledData as InterviewEvaluation);

              if (polledData.status === 'complete' && onComplete && polledData.analysis_text) {
                console.log('✅ [Interview Evaluation via Polling] Completada:', {
                  interviewee: polledData.interviewee_name,
                  analysis_length: polledData.analysis_text.length
                });
                onComplete(polledData.analysis_text);
              } else if (polledData.status === 'error' && onError && polledData.error_message) {
                onError(polledData.error_message);
              }

              // Clear polling
              if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
              }
            }
          }
        }, 3000);

        // Subscribe to real-time updates filtered by request_id (maity schema)
        console.log('[useInterviewEvaluationRealtime] 📡 Suscribiendo a canal:', `interview_evaluations:${requestId}`);
        channel = supabase
          .channel(`interview_evaluations:${requestId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'maity',
              table: 'interview_evaluations',
              filter: `request_id=eq.${requestId}`,
            },
            (payload) => {
              console.log('[useInterviewEvaluationRealtime] 🔔 Update recibido:', payload);
              const updated = payload.new as InterviewEvaluation;

              console.log('[useInterviewEvaluationRealtime] 📊 Nuevo estado:', {
                status: updated.status,
                hasAnalysis: !!updated.analysis_text,
                interviewee_name: updated.interviewee_name
              });

              setEvaluation(updated);

              // Trigger callbacks
              if (onUpdate) {
                onUpdate(updated);
              }

              if (updated.status === 'complete' && onComplete && updated.analysis_text) {
                console.log('✅ [Interview Evaluation] Completada:', {
                  interviewee: updated.interviewee_name,
                  analysis_length: updated.analysis_text.length
                });
                onComplete(updated.analysis_text);
              } else if (updated.status === 'error' && onError && updated.error_message) {
                onError(updated.error_message);
              }
            }
          )
          .subscribe((status, err) => {
            console.log('[useInterviewEvaluationRealtime] 📡 Estado de suscripción:', status);

            if (status === 'SUBSCRIBED') {
              console.log('[useInterviewEvaluationRealtime] ✅ Suscrito exitosamente');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('[useInterviewEvaluationRealtime] ❌ Subscription error:', err);
              setError('Real-time subscription failed');
            } else if (status === 'TIMED_OUT') {
              console.error('[useInterviewEvaluationRealtime] ⏱️ Subscription timed out');
              setError('Real-time subscription timed out');
            }
          });
      } catch (err) {
        console.error('[useInterviewEvaluationRealtime] ❌ Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    initializeSubscription();

    // Cleanup subscription on unmount
    return () => {
      console.log('[useInterviewEvaluationRealtime] 🧹 Cleanup: limpiando suscripciones y polling');
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [requestId, onUpdate, onComplete, onError]);

  return {
    evaluation,
    isLoading,
    error,
  };
}
