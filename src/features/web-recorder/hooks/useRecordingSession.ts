/**
 * useRecordingSession Hook
 *
 * Manages the recording session lifecycle including API calls.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@maity/shared';

interface RecordingSessionState {
  conversationId: string | null;
  isCreating: boolean;
  isSaving: boolean;
  isFinalized: boolean;
  error: string | null;
}

interface TranscriptSegment {
  text: string;
  is_user?: boolean;
  start_time?: number;
  end_time?: number;
}

interface UseRecordingSessionReturn {
  state: RecordingSessionState;
  createDraft: () => Promise<string>;
  appendSegments: (segments: TranscriptSegment[]) => Promise<void>;
  finalize: (durationSeconds: number) => Promise<void>;
  reset: () => void;
}

export function useRecordingSession(): UseRecordingSessionReturn {
  const [state, setState] = useState<RecordingSessionState>({
    conversationId: null,
    isCreating: false,
    isSaving: false,
    isFinalized: false,
    error: null,
  });

  // Get access token
  const getAccessToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No hay sesión activa');
    }
    return session.access_token;
  }, []);

  // Create draft conversation
  const createDraft = useCallback(async () => {
    setState((prev) => ({ ...prev, isCreating: true, error: null }));

    try {
      const accessToken = await getAccessToken();

      const response = await fetch('/api/omi/conversations-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ source: 'web_recorder' }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la conversación');
      }

      const data = await response.json();
      const conversationId = data.conversation_id;

      setState((prev) => ({
        ...prev,
        conversationId,
        isCreating: false,
      }));

      return conversationId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setState((prev) => ({ ...prev, isCreating: false, error: message }));
      throw error;
    }
  }, [getAccessToken]);

  // Append segments to conversation
  const appendSegments = useCallback(
    async (segments: TranscriptSegment[]) => {
      if (!state.conversationId || segments.length === 0) return;

      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      try {
        const accessToken = await getAccessToken();

        const response = await fetch('/api/omi/conversations-segments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            conversation_id: state.conversationId,
            segments,
          }),
        });

        if (!response.ok) {
          console.error('Error appending segments');
        }

        setState((prev) => ({ ...prev, isSaving: false }));
      } catch (error) {
        console.error('Error appending segments:', error);
        setState((prev) => ({ ...prev, isSaving: false }));
      }
    },
    [state.conversationId, getAccessToken]
  );

  // Finalize conversation
  const finalize = useCallback(
    async (durationSeconds: number) => {
      if (!state.conversationId) {
        throw new Error('No hay conversación para finalizar');
      }

      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      try {
        const accessToken = await getAccessToken();

        const response = await fetch('/api/omi/conversations-finalize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            conversation_id: state.conversationId,
            duration_seconds: durationSeconds,
          }),
        });

        if (!response.ok) {
          throw new Error('Error al finalizar la conversación');
        }

        setState((prev) => ({
          ...prev,
          isSaving: false,
          isFinalized: true,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        setState((prev) => ({ ...prev, isSaving: false, error: message }));
        throw error;
      }
    },
    [state.conversationId, getAccessToken]
  );

  // Reset state
  const reset = useCallback(() => {
    setState({
      conversationId: null,
      isCreating: false,
      isSaving: false,
      isFinalized: false,
      error: null,
    });
  }, []);

  return {
    state,
    createDraft,
    appendSegments,
    finalize,
    reset,
  };
}
