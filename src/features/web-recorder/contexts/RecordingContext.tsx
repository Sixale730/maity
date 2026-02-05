/**
 * Recording Context
 *
 * Provides global state management for the web recorder feature.
 * Handles audio capture, Deepgram connection, and recording lifecycle.
 */

import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { supabase } from '@maity/shared';
import { AudioCapture, isAudioCaptureSupported } from '../lib/audioCapture';
import {
  buildDeepgramParams,
  createAuthenticatedDeepgramWebSocket,
} from '../lib/authenticatedWebSocket';

// ============================================================================
// TYPES
// ============================================================================

export interface TranscriptSegment {
  id: string;
  text: string;
  isFinal: boolean;
  startTime: number;
  endTime: number;
  speaker?: number;
  confidence: number;
}

export type RecordingStatus =
  | 'idle'
  | 'initializing'
  | 'ready'
  | 'recording'
  | 'paused'
  | 'processing'
  | 'saving'
  | 'completed'
  | 'error';

export interface RecordingState {
  status: RecordingStatus;
  conversationId: string | null;
  segments: TranscriptSegment[];
  interimText: string;
  durationSeconds: number;
  pausedDuration: number;
  audioLevel: number;
  error: string | null;
  isSupported: boolean;
}

type RecordingAction =
  | { type: 'SET_STATUS'; status: RecordingStatus }
  | { type: 'SET_CONVERSATION_ID'; id: string }
  | { type: 'ADD_SEGMENT'; segment: TranscriptSegment }
  | { type: 'UPDATE_INTERIM'; text: string }
  | { type: 'SET_DURATION'; seconds: number }
  | { type: 'ADD_PAUSED_TIME'; seconds: number }
  | { type: 'SET_AUDIO_LEVEL'; level: number }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

interface RecordingContextValue {
  state: RecordingState;
  // Actions
  initialize: () => Promise<void>;
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  saveRecording: () => Promise<string>;
  reset: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: RecordingState = {
  status: 'idle',
  conversationId: null,
  segments: [],
  interimText: '',
  durationSeconds: 0,
  pausedDuration: 0,
  audioLevel: 0,
  error: null,
  isSupported: isAudioCaptureSupported(),
};

// ============================================================================
// REDUCER
// ============================================================================

function recordingReducer(state: RecordingState, action: RecordingAction): RecordingState {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.status, error: null };

    case 'SET_CONVERSATION_ID':
      return { ...state, conversationId: action.id };

    case 'ADD_SEGMENT':
      return {
        ...state,
        segments: [...state.segments, action.segment],
        interimText: '',
      };

    case 'UPDATE_INTERIM':
      return { ...state, interimText: action.text };

    case 'SET_DURATION':
      return { ...state, durationSeconds: action.seconds };

    case 'ADD_PAUSED_TIME':
      return { ...state, pausedDuration: state.pausedDuration + action.seconds };

    case 'SET_AUDIO_LEVEL':
      return { ...state, audioLevel: action.level };

    case 'SET_ERROR':
      return { ...state, status: 'error', error: action.error };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'RESET':
      return { ...initialState, isSupported: state.isSupported };

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

const RecordingContext = createContext<RecordingContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface RecordingProviderProps {
  children: React.ReactNode;
}

export function RecordingProvider({ children }: RecordingProviderProps) {
  const [state, dispatch] = useReducer(recordingReducer, initialState);

  // Refs for audio and WebSocket
  const audioCapture = useRef<AudioCapture | null>(null);
  const websocket = useRef<WebSocket | null>(null);
  const apiKey = useRef<string | null>(null);

  // Timer refs
  const startTime = useRef<number>(0);
  const pauseStartTime = useRef<number>(0);
  const timerInterval = useRef<number | null>(null);

  // Segment tracking
  const segmentCounter = useRef(0);

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  const fetchDeepgramConfig = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch('/api/deepgram-token', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get Deepgram configuration');
    }

    const data = await response.json();
    return data;
  }, []);

  const createDraftConversation = useCallback(async () => {
    // Get current user's maity.users.id
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('No hay sesión activa');

    const { data: profile, error: profileError } = await supabase
      .schema('maity')
      .from('users')
      .select('id')
      .eq('auth_id', authUser.id)
      .single();

    if (profileError || !profile) {
      console.error('[Recording] Error fetching user profile:', profileError);
      throw new Error('Usuario no encontrado');
    }

    // Insert draft directly via Supabase (RLS allows this)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conversation, error: insertError } = await (supabase as any)
      .schema('maity')
      .from('omi_conversations')
      .insert({
        user_id: profile.id,
        transcript_text: '',
        action_items: [],
        events: [],
        source: 'web_recorder',
        language: 'es',
        discarded: false,
        deleted: false,
        starred: false,
        structured_generated: false,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[Recording] Error creating draft:', insertError);
      throw new Error('Error al crear conversación');
    }

    return conversation.id;
  }, []);

  const appendSegments = useCallback(async (conversationId: string, segments: TranscriptSegment[]) => {
    // Get max segment_index for this conversation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: maxResult } = await (supabase as any)
      .schema('maity')
      .from('omi_transcript_segments')
      .select('segment_index')
      .eq('conversation_id', conversationId)
      .order('segment_index', { ascending: false })
      .limit(1)
      .single();

    const startIndex = (maxResult?.segment_index ?? -1) + 1;

    const segmentsToInsert = segments.map((s, i) => ({
      conversation_id: conversationId,
      segment_index: startIndex + i,
      text: s.text,
      speaker: 'Usuario',
      is_user: true,
      start_time: s.startTime,
      end_time: s.endTime,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .schema('maity')
      .from('omi_transcript_segments')
      .insert(segmentsToInsert);

    if (error) {
      console.error('[Recording] Error appending segments:', error);
    }
  }, []);

  const finalizeConversation = useCallback(async (accessToken: string, conversationId: string, durationSeconds: number) => {
    const response = await fetch('/api/omi/conversations-finalize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        duration_seconds: durationSeconds,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to finalize conversation');
    }

    return await response.json();
  }, []);

  const startTimer = useCallback(() => {
    startTime.current = Date.now();
    timerInterval.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      dispatch({ type: 'SET_DURATION', seconds: Math.floor(elapsed) });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  }, []);

  // ==========================================================================
  // WEBSOCKET HANDLERS
  // ==========================================================================

  const handleTranscript = useCallback((data: any) => {
    try {
      const parsed = JSON.parse(data);

      if (parsed.type !== 'Results') return;

      const channel = parsed.channel;
      const alternative = channel?.alternatives?.[0];
      const transcript = alternative?.transcript || '';

      if (!transcript) return;

      const isFinal = parsed.is_final && parsed.speech_final;

      if (isFinal) {
        const segment: TranscriptSegment = {
          id: `seg-${segmentCounter.current++}`,
          text: transcript,
          isFinal: true,
          startTime: parsed.start || 0,
          endTime: (parsed.start || 0) + (parsed.duration || 0),
          confidence: alternative?.confidence || 0,
        };
        dispatch({ type: 'ADD_SEGMENT', segment });
      } else {
        dispatch({ type: 'UPDATE_INTERIM', text: transcript });
      }
    } catch (error) {
      console.error('[Recording] Error parsing transcript:', error);
    }
  }, []);

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  const initialize = useCallback(async () => {
    if (!state.isSupported) {
      dispatch({ type: 'SET_ERROR', error: 'Tu navegador no soporta grabación de audio' });
      return;
    }

    dispatch({ type: 'SET_STATUS', status: 'initializing' });

    try {
      // Get Deepgram config
      const dgConfig = await fetchDeepgramConfig();
      apiKey.current = dgConfig.api_key;

      dispatch({ type: 'SET_STATUS', status: 'ready' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de inicialización';
      dispatch({ type: 'SET_ERROR', error: message });
    }
  }, [state.isSupported, fetchDeepgramConfig]);

  const startRecording = useCallback(async () => {
    if (state.status !== 'ready' && state.status !== 'idle') {
      return;
    }

    dispatch({ type: 'SET_STATUS', status: 'initializing' });

    try {
      // Create draft conversation (uses Supabase directly)
      const conversationId = await createDraftConversation();
      dispatch({ type: 'SET_CONVERSATION_ID', id: conversationId });

      // Get Deepgram config if not already
      if (!apiKey.current) {
        const dgConfig = await fetchDeepgramConfig();
        apiKey.current = dgConfig.api_key;
      }

      // Initialize audio capture
      audioCapture.current = new AudioCapture({
        onAudioData: (data) => {
          if (websocket.current?.readyState === WebSocket.OPEN) {
            websocket.current.send(data);
          }
        },
        onAudioLevel: (level) => {
          dispatch({ type: 'SET_AUDIO_LEVEL', level });
        },
        onError: (error) => {
          console.error('[Recording] Audio error:', error);
          dispatch({ type: 'SET_ERROR', error: error.message });
        },
        onStateChange: () => {},
      });

      await audioCapture.current.initialize();

      // Get actual sample rate
      const sampleRate = audioCapture.current.getSampleRate();

      // Connect to Deepgram
      const params = buildDeepgramParams({ sampleRate });
      websocket.current = createAuthenticatedDeepgramWebSocket(apiKey.current!, params);

      websocket.current.onopen = async () => {
        console.log('[Recording] Deepgram connected');
        await audioCapture.current?.start();
        startTimer();
        dispatch({ type: 'SET_STATUS', status: 'recording' });
      };

      websocket.current.onmessage = (event) => {
        handleTranscript(event.data);
      };

      websocket.current.onerror = (error) => {
        console.error('[Recording] WebSocket error:', error);
        dispatch({ type: 'SET_ERROR', error: 'Error de conexión con el servicio de transcripción' });
      };

      websocket.current.onclose = () => {
        console.log('[Recording] WebSocket closed');
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar grabación';
      dispatch({ type: 'SET_ERROR', error: message });
    }
  }, [state.status, createDraftConversation, fetchDeepgramConfig, handleTranscript, startTimer]);

  const pauseRecording = useCallback(() => {
    if (state.status !== 'recording') return;

    audioCapture.current?.pause();
    pauseStartTime.current = Date.now();
    stopTimer();
    dispatch({ type: 'SET_STATUS', status: 'paused' });
  }, [state.status, stopTimer]);

  const resumeRecording = useCallback(async () => {
    if (state.status !== 'paused') return;

    // Calculate paused duration
    const pausedSeconds = (Date.now() - pauseStartTime.current) / 1000;
    dispatch({ type: 'ADD_PAUSED_TIME', seconds: pausedSeconds });

    await audioCapture.current?.resume();
    startTimer();
    dispatch({ type: 'SET_STATUS', status: 'recording' });
  }, [state.status, startTimer]);

  const stopRecording = useCallback(async () => {
    if (state.status !== 'recording' && state.status !== 'paused') return;

    dispatch({ type: 'SET_STATUS', status: 'processing' });

    stopTimer();

    // Stop audio capture
    audioCapture.current?.stop();
    audioCapture.current = null;

    // Close WebSocket
    if (websocket.current) {
      websocket.current.close();
      websocket.current = null;
    }

    dispatch({ type: 'SET_AUDIO_LEVEL', level: 0 });
  }, [state.status, stopTimer]);

  const saveRecording = useCallback(async () => {
    if (!state.conversationId) {
      throw new Error('No hay conversación para guardar');
    }

    dispatch({ type: 'SET_STATUS', status: 'saving' });

    try {
      // Append remaining segments (uses Supabase directly)
      if (state.segments.length > 0) {
        await appendSegments(state.conversationId, state.segments);
      }

      // Finalize conversation (requires API for OpenAI processing)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      await finalizeConversation(
        session.access_token,
        state.conversationId,
        state.durationSeconds - state.pausedDuration
      );

      dispatch({ type: 'SET_STATUS', status: 'completed' });

      return state.conversationId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar';
      dispatch({ type: 'SET_ERROR', error: message });
      throw error;
    }
  }, [state.conversationId, state.segments, state.durationSeconds, state.pausedDuration, appendSegments, finalizeConversation]);

  const reset = useCallback(() => {
    stopTimer();
    audioCapture.current?.stop();
    audioCapture.current = null;
    websocket.current?.close();
    websocket.current = null;
    segmentCounter.current = 0;
    dispatch({ type: 'RESET' });
  }, [stopTimer]);

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================

  const value: RecordingContextValue = {
    state,
    initialize,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    saveRecording,
    reset,
  };

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useRecording() {
  const context = useContext(RecordingContext);

  if (!context) {
    throw new Error('useRecording must be used within a RecordingProvider');
  }

  return context;
}
