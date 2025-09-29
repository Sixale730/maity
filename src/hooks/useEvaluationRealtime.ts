import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

    const initializeSubscription = async () => {
      console.log('[useEvaluationRealtime] 🚀 Initializing subscription for request_id:', requestId);

      try {
        // Fetch initial evaluation state from maity schema
        console.log('[useEvaluationRealtime] 🔍 Fetching initial evaluation state...');
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
          console.warn('[useEvaluationRealtime] ⚠️ Evaluation not found for request_id:', requestId);
          setError('Evaluation not found');
          setIsLoading(false);
          return;
        }

        console.log('[useEvaluationRealtime] ✅ Initial evaluation fetched:', {
          request_id: initialData.request_id,
          status: initialData.status,
          hasResult: !!initialData.result,
          created_at: initialData.created_at
        });

        setEvaluation(initialData);
        setIsLoading(false);

        // If already complete/error, trigger callbacks
        if (initialData.status === 'complete' && onComplete && initialData.result) {
          console.log('[useEvaluationRealtime] ✅ Already complete, triggering onComplete callback');
          onComplete(initialData.result);
        } else if (initialData.status === 'error' && onError && initialData.error_message) {
          console.log('[useEvaluationRealtime] ❌ Already errored, triggering onError callback');
          onError(initialData.error_message);
        }

        // Subscribe to real-time updates filtered by request_id (maity schema)
        console.log('[useEvaluationRealtime] 📡 Setting up realtime subscription...');
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
              console.log('[useEvaluationRealtime] 🔔 Received realtime update!', {
                eventType: payload.eventType,
                old: payload.old,
                new: payload.new
              });

              const updated = payload.new as Evaluation;
              setEvaluation(updated);

              console.log('[useEvaluationRealtime] 📝 Evaluation updated:', {
                status: updated.status,
                hasResult: !!updated.result,
                hasError: !!updated.error_message
              });

              // Trigger callbacks
              if (onUpdate) {
                console.log('[useEvaluationRealtime] 🔄 Triggering onUpdate callback');
                onUpdate(updated);
              }

              if (updated.status === 'complete' && onComplete && updated.result) {
                console.log('[useEvaluationRealtime] ✅ Status complete, triggering onComplete callback');
                onComplete(updated.result);
              } else if (updated.status === 'error' && onError && updated.error_message) {
                console.log('[useEvaluationRealtime] ❌ Status error, triggering onError callback');
                onError(updated.error_message);
              }
            }
          )
          .subscribe((status, err) => {
            console.log('[useEvaluationRealtime] 📡 Subscription status changed:', status);

            if (status === 'SUBSCRIBED') {
              console.log('[useEvaluationRealtime] ✅ Successfully subscribed to updates for:', requestId);
            } else if (status === 'CHANNEL_ERROR') {
              console.error('[useEvaluationRealtime] ❌ Subscription error:', err);
              setError('Real-time subscription failed');
            } else if (status === 'TIMED_OUT') {
              console.error('[useEvaluationRealtime] ⏱️ Subscription timed out');
              setError('Real-time subscription timed out');
            } else if (status === 'CLOSED') {
              console.log('[useEvaluationRealtime] 🔌 Subscription closed');
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
      if (channel) {
        console.log('[useEvaluationRealtime] 🔌 Unsubscribing and cleaning up for:', requestId);
        supabase.removeChannel(channel);
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
  console.log('[createEvaluation] 🚀 Creating evaluation via RPC', {
    requestId,
    maityUserId,
    sessionId: sessionId || 'none'
  });

  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    console.error('[createEvaluation] ❌ User not authenticated');
    return { data: null, error: new Error('User not authenticated') };
  }

  console.log('[createEvaluation] ✅ User authenticated:', user.user.id);
  console.log('[createEvaluation] 🔧 Calling RPC create_evaluation...');

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

  console.log('[createEvaluation] ✅ Evaluation created successfully via RPC:', {
    request_id: data.request_id,
    user_id: data.user_id,
    session_id: data.session_id,
    status: data.status,
    created_at: data.created_at
  });

  return { data, error: null };
}