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
    // Early return if requestId is missing or empty
    if (!requestId || requestId.trim() === '') {
      setIsLoading(false);
      setError('Missing request_id');
      return;
    }

    let channel: RealtimeChannel | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let isMounted = true; // Track if component is still mounted

    const initializeSubscription = async () => {
      // Double-check requestId before proceeding
      if (!requestId || requestId.trim() === '') {
        return;
      }
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
          if (isMounted) {
            setError(fetchError.message);
            setIsLoading(false);
          }
          return;
        }

        if (!initialData) {
          console.error('[useInterviewEvaluationRealtime] ❌ Interview evaluation not found for request_id:', requestId);
          if (isMounted) {
            setError('Interview evaluation not found');
            setIsLoading(false);
          }
          return;
        }

        if (!isMounted) return;

        setEvaluation(initialData as InterviewEvaluation);
        setIsLoading(false);

        // If already complete/error, trigger callbacks
        if (initialData.status === 'complete' && onComplete && initialData.analysis_text) {
          onComplete(initialData.analysis_text);
          return; // No need to subscribe if already complete
        } else if (initialData.status === 'error' && onError && initialData.error_message) {
          onError(initialData.error_message);
          return; // No need to subscribe if error
        }

        // Start polling as backup (check every 3 seconds)
        pollInterval = setInterval(async () => {
          if (!isMounted) {
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
            return;
          }

          const { data: polledData, error: pollError } = await supabase
            .schema('maity')
            .from('interview_evaluations')
            .select('*')
            .eq('request_id', requestId)
            .maybeSingle();

          if (!isMounted) return;

          if (!pollError && polledData) {
            if (polledData.status === 'complete' || polledData.status === 'error') {
              setEvaluation(polledData as InterviewEvaluation);

              if (polledData.status === 'complete' && onComplete && polledData.analysis_text) {
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
          } else if (pollError) {
            console.error('[useInterviewEvaluationRealtime] ❌ Polling error:', pollError);
          }
        }, 3000);

        // Subscribe to real-time updates filtered by request_id (maity schema)
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
              if (!isMounted) return;

              const updated = payload.new as InterviewEvaluation;

              setEvaluation(updated);

              // Trigger callbacks
              if (onUpdate) {
                onUpdate(updated);
              }

              if (updated.status === 'complete' && onComplete && updated.analysis_text) {
                onComplete(updated.analysis_text);
              } else if (updated.status === 'error' && onError && updated.error_message) {
                onError(updated.error_message);
              }
            }
          )
          .subscribe((status, err) => {
            if (!isMounted) return;

            if (status === 'CHANNEL_ERROR') {
              console.error('[useInterviewEvaluationRealtime] ❌ Subscription error:', err);
              setError('Real-time subscription failed');
            } else if (status === 'TIMED_OUT') {
              console.error('[useInterviewEvaluationRealtime] ⏱️ Subscription timed out');
              setError('Real-time subscription timed out');
            }
          });
      } catch (err) {
        console.error('[useInterviewEvaluationRealtime] ❌ Initialization error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setIsLoading(false);
        }
      }
    };

    initializeSubscription();

    // Cleanup subscription on unmount
    return () => {
      isMounted = false; // Prevent any further state updates

      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };
  }, [requestId, onUpdate, onComplete, onError]);

  return {
    evaluation,
    isLoading,
    error,
  };
}
