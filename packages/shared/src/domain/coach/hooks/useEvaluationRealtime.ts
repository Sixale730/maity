import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../../api/client/supabase';

interface Evaluation {
  request_id: string; // Ahora es la primary key
  user_id: string;
  session_id: string | null;
  status: 'pending' | 'processing' | 'complete' | 'error';
  result: Record<string, any> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface UseEvaluationRealtimeProps {
  requestId: string;
  onUpdate?: (evaluation: Evaluation) => void;
  onComplete?: (result: Record<string, any>) => void;
  onError?: (errorMessage: string) => void;
}

/**
 * Hook to subscribe to real-time updates for a specific evaluation by request_id
 *
 * @example
 * ```tsx
 * const { evaluation, isLoading, error } = useEvaluationRealtime({
 *   requestId: 'abc-123',
 *   onComplete: (result) => {
 *     console.log('Evaluation completed!', result);
 *   },
 *   onError: (errorMessage) => {
 *     console.error('Evaluation failed:', errorMessage);
 *   }
 * });
 * ```
 */
export function useEvaluationRealtime({
  requestId,
  onUpdate,
  onComplete,
  onError,
}: UseEvaluationRealtimeProps) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
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
      console.log('[useEvaluationRealtime] 🚀 Iniciando suscripción para request_id:', requestId);

      try {
        // Fetch initial evaluation state from maity schema
        const { data: initialData, error: fetchError } = await supabase
          .schema('maity')
          .from('evaluations')
          .select('*')
          .eq('request_id', requestId)
          .maybeSingle();

        if (fetchError) {
          console.error('[useEvaluationRealtime] ❌ Fetch error:', fetchError);
          setError(fetchError.message);
          setIsLoading(false);
          return;
        }

        if (!initialData) {
          console.error('[useEvaluationRealtime] ❌ Evaluation not found for request_id:', requestId);
          setError('Evaluation not found');
          setIsLoading(false);
          return;
        }

        console.log('[useEvaluationRealtime] 📊 Estado inicial:', {
          request_id: initialData.request_id,
          status: initialData.status,
          hasResult: !!initialData.result
        });

        setEvaluation(initialData);
        setIsLoading(false);

        // If already complete/error, trigger callbacks
        if (initialData.status === 'complete' && onComplete && initialData.result) {
          console.log('✅ [Evaluation] Completada:', initialData.result);
          onComplete(initialData.result);
          return; // No need to subscribe if already complete
        } else if (initialData.status === 'error' && onError && initialData.error_message) {
          onError(initialData.error_message);
          return; // No need to subscribe if error
        }

        // Start polling as backup (check every 3 seconds)
        console.log('[useEvaluationRealtime] 🔄 Iniciando polling de respaldo cada 3s');
        pollInterval = setInterval(async () => {
          console.log('[useEvaluationRealtime] 🔍 Polling: verificando estado...');

          const { data: polledData, error: pollError } = await supabase
            .schema('maity')
            .from('evaluations')
            .select('*')
            .eq('request_id', requestId)
            .maybeSingle();

          if (!pollError && polledData) {
            console.log('[useEvaluationRealtime] 📊 Polling: estado actual:', polledData.status);

            if (polledData.status === 'complete' || polledData.status === 'error') {
              console.log('[useEvaluationRealtime] ✅ Polling: evaluación finalizada, limpiando interval');

              setEvaluation(polledData);

              if (polledData.status === 'complete' && onComplete && polledData.result) {
                console.log('✅ [Evaluation via Polling] Completada:', polledData.result);
                onComplete(polledData.result);
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
        console.log('[useEvaluationRealtime] 📡 Suscribiendo a canal:', `evaluations:${requestId}`);
        channel = supabase
          .channel(`evaluations:${requestId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'maity',
              table: 'evaluations',
              filter: `request_id=eq.${requestId}`,
            },
            (payload) => {
              console.log('[useEvaluationRealtime] 🔔 Update recibido:', payload);
              const updated = payload.new as Evaluation;

              console.log('[useEvaluationRealtime] 📊 Nuevo estado:', {
                status: updated.status,
                hasResult: !!updated.result
              });

              setEvaluation(updated);

              // Trigger callbacks
              if (onUpdate) {
                onUpdate(updated);
              }

              if (updated.status === 'complete' && onComplete && updated.result) {
                console.log('✅ [Evaluation] Completada:', updated.result);
                onComplete(updated.result);
              } else if (updated.status === 'error' && onError && updated.error_message) {
                onError(updated.error_message);
              }
            }
          )
          .subscribe((status, err) => {
            console.log('[useEvaluationRealtime] 📡 Estado de suscripción:', status);

            if (status === 'SUBSCRIBED') {
              console.log('[useEvaluationRealtime] ✅ Suscrito exitosamente');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('[useEvaluationRealtime] ❌ Subscription error:', err);
              setError('Real-time subscription failed');
            } else if (status === 'TIMED_OUT') {
              console.error('[useEvaluationRealtime] ⏱️ Subscription timed out');
              setError('Real-time subscription timed out');
            }
          });
      } catch (err) {
        console.error('[useEvaluationRealtime] ❌ Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    initializeSubscription();

    // Cleanup subscription on unmount
    return () => {
      console.log('[useEvaluationRealtime] 🧹 Cleanup: limpiando suscripciones y polling');
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

/**
 * Utility function to create a new evaluation entry in the database
 *
 * @param requestId - Unique UUID for this evaluation request
 * @param maityUserId - The maity.users.id (not auth.users.id)
 * @param sessionId - Optional voice_sessions.id to link this evaluation to a practice session
 *
 * @example
 * ```tsx
 * const requestId = crypto.randomUUID();
 * const { data, error } = await createEvaluation(requestId, maityUserId, sessionId);
 * if (!error) {
 *   // Start listening for updates
 *   const { evaluation } = useEvaluationRealtime({ requestId });
 * }
 * ```
 */
export async function createEvaluation(
  requestId: string,
  maityUserId: string,
  sessionId?: string
) {
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    console.error('[createEvaluation] ❌ User not authenticated');
    return { data: null, error: new Error('User not authenticated') };
  }

  // Use RPC function to create evaluation (bypasses RLS issues)
  // The public wrapper calls maity.create_evaluation internally
  const { data, error } = await supabase.rpc('create_evaluation', {
    p_request_id: requestId,
    p_user_id: maityUserId,
    p_session_id: sessionId || null
  });

  if (error) {
    console.error('[createEvaluation] ❌ Failed to create evaluation:', error);
    return { data: null, error };
  }

  return { data, error: null };
}