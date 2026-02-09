/**
 * Recording Context
 *
 * Provides global state management for the web recorder feature.
 * Handles audio capture, Deepgram connection, and recording lifecycle.
 */

import React, { createContext, useContext, useReducer, useCallback, useRef, useState } from 'react';
import { supabase, saveRecorderLogs, type RecorderLogInput } from '@maity/shared';
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

export type DebugLogType =
  | 'WS_OPEN'
  | 'WS_CLOSE'
  | 'WS_ERROR'
  | 'DEEPGRAM'
  | 'SEGMENT'
  | 'INTERIM'
  | 'AUDIO'
  | 'STATE'
  | 'ERROR'
  | 'SAVE'
  | 'KEEPALIVE'
  | 'STALL';

export interface DebugLogEntry {
  id: string;
  timestamp: number;      // ms desde inicio de grabación
  type: DebugLogType;
  message: string;
  details?: {
    is_final?: boolean;
    speech_final?: boolean;
    speaker?: number;
    confidence?: number;
    wordCount?: number;
    text?: string;
    code?: number;
    reason?: string;
  };
}

export interface SpeakerStats {
  [speakerId: number]: { wordCount: number; segmentCount: number };
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
  speakerStats: SpeakerStats;
  primarySpeaker: number | null;
  debugLogs: DebugLogEntry[];
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
  | { type: 'RESET' }
  | { type: 'UPDATE_SPEAKER_STATS'; speakerId: number; wordCount: number }
  | { type: 'SET_PRIMARY_SPEAKER'; speakerId: number }
  | { type: 'ADD_DEBUG_LOG'; entry: DebugLogEntry };

interface RecordingContextValue {
  state: RecordingState;
  isStalled: boolean;
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
  speakerStats: {},
  primarySpeaker: null,
  debugLogs: [],
};

const MAX_DEBUG_LOGS = 500;

// WebSocket resilience constants
const KEEPALIVE_INTERVAL = 8000; // 8 seconds - send keep-alive to prevent Deepgram timeout
const STALL_THRESHOLD = 15000;   // 15 seconds without response = stalled
const STALL_CHECK_INTERVAL = 5000; // Check for stalling every 5 seconds

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

    case 'UPDATE_SPEAKER_STATS': {
      const existing = state.speakerStats[action.speakerId] || { wordCount: 0, segmentCount: 0 };
      return {
        ...state,
        speakerStats: {
          ...state.speakerStats,
          [action.speakerId]: {
            wordCount: existing.wordCount + action.wordCount,
            segmentCount: existing.segmentCount + 1,
          },
        },
      };
    }

    case 'SET_PRIMARY_SPEAKER':
      return { ...state, primarySpeaker: action.speakerId };

    case 'ADD_DEBUG_LOG': {
      const newLogs = [...state.debugLogs, action.entry];
      // Keep only the last MAX_DEBUG_LOGS entries
      return {
        ...state,
        debugLogs: newLogs.length > MAX_DEBUG_LOGS
          ? newLogs.slice(-MAX_DEBUG_LOGS)
          : newLogs,
      };
    }

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

  // Stalling detection state
  const [isStalled, setIsStalled] = useState(false);

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

  // Ref to track the latest interim text (avoids stale closure in stopRecording)
  const latestInterimText = useRef<string>('');

  // Audio buffer tracking for debug logs
  const audioBufferCount = useRef(0);
  const recordingStartTime = useRef<number>(0);

  // Prevent double-click / race condition on startRecording
  const isStartingRecording = useRef(false);

  // WebSocket resilience refs
  const keepAliveRef = useRef<number | null>(null);
  const stallCheckRef = useRef<number | null>(null);
  const lastDeepgramMessageRef = useRef<number>(Date.now());

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
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[Recording] Error creating draft:', insertError);
      throw new Error('Error al crear conversación');
    }

    return conversation.id;
  }, []);

  const appendSegments = useCallback(async (
    conversationId: string,
    segments: TranscriptSegment[],
    primarySpeaker: number | null,
    userName: string
  ) => {
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

    const segmentsToInsert = segments.map((s, i) => {
      const isUser = s.speaker === primarySpeaker;
      const speakerLabel = isUser
        ? userName
        : s.speaker !== undefined
          ? `Participante ${s.speaker + 1}`
          : 'Desconocido';

      return {
        conversation_id: conversationId,
        segment_index: startIndex + i,
        text: s.text,
        speaker: speakerLabel,
        speaker_id: s.speaker,
        is_user: isUser,
        start_time: s.startTime,
        end_time: s.endTime,
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .schema('maity')
      .from('omi_transcript_segments')
      .insert(segmentsToInsert);

    if (error) {
      console.error('[Recording] Error appending segments:', error);
      throw new Error(`Error al guardar segmentos: ${error.message}`);
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
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || 'Error desconocido';
      throw new Error(`Error al finalizar: ${errorMessage}`);
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
  // DEBUG LOGGING
  // ==========================================================================

  const addDebugLog = useCallback((
    type: DebugLogType,
    message: string,
    details?: DebugLogEntry['details']
  ) => {
    const entry: DebugLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: recordingStartTime.current ? Date.now() - recordingStartTime.current : 0,
      type,
      message,
      details,
    };
    dispatch({ type: 'ADD_DEBUG_LOG', entry });
  }, []);

  // ==========================================================================
  // WEBSOCKET HANDLERS
  // ==========================================================================

  const handleTranscript = useCallback((data: any) => {
    try {
      const parsed = JSON.parse(data);

      // Update last message timestamp for stall detection
      lastDeepgramMessageRef.current = Date.now();
      setIsStalled(false);

      if (parsed.type !== 'Results') return;

      const channel = parsed.channel;
      const alternative = channel?.alternatives?.[0];
      const transcript = alternative?.transcript || '';

      if (!transcript) return;

      // Accept any finalized segment from Deepgram
      // is_final=true means the audio chunk is fully processed (won't change)
      // speech_final=true means long pause detected (speaker stopped)
      // Previously we required BOTH, which caused intermediate segments to be lost
      const isFinal = parsed.is_final;
      const speechFinal = parsed.speech_final;

      // Extract speaker from words array (Deepgram diarization)
      // Each word has { word, start, end, speaker }
      const words = alternative?.words || [];
      let speaker: number | undefined;

      if (words.length > 0) {
        // Count speakers in this segment to find the majority speaker
        const speakerCounts: Record<number, number> = {};
        for (const word of words) {
          if (typeof word.speaker === 'number') {
            speakerCounts[word.speaker] = (speakerCounts[word.speaker] || 0) + 1;
          }
        }

        // Find the speaker with the most words in this segment
        let maxCount = 0;
        for (const [spk, count] of Object.entries(speakerCounts)) {
          if (count > maxCount) {
            maxCount = count;
            speaker = parseInt(spk);
          }
        }
      }

      // Log Deepgram message
      const truncatedText = transcript.length > 40 ? transcript.substring(0, 40) + '...' : transcript;
      addDebugLog('DEEPGRAM',
        `is_final:${isFinal ? 'T' : 'F'} speech_final:${speechFinal ? 'T' : 'F'} "${truncatedText}"`,
        { is_final: isFinal, speech_final: speechFinal, wordCount: words.length, text: transcript }
      );

      if (isFinal) {
        const confidence = alternative?.confidence || 0;
        const segment: TranscriptSegment = {
          id: `seg-${segmentCounter.current++}`,
          text: transcript,
          isFinal: true,
          startTime: parsed.start || 0,
          endTime: (parsed.start || 0) + (parsed.duration || 0),
          speaker,
          confidence,
        };
        dispatch({ type: 'ADD_SEGMENT', segment });
        latestInterimText.current = ''; // Clear ref when segment is finalized

        // Log segment added
        addDebugLog('SEGMENT',
          `#${segmentCounter.current - 1} speaker:${speaker ?? '?'} conf:${(confidence * 100).toFixed(0)}% "${truncatedText}"`,
          { speaker, confidence, wordCount: words.length, text: transcript }
        );

        // Update speaker stats
        if (typeof speaker === 'number') {
          const wordCount = words.length;
          dispatch({ type: 'UPDATE_SPEAKER_STATS', speakerId: speaker, wordCount });
        }
      } else {
        dispatch({ type: 'UPDATE_INTERIM', text: transcript });
        latestInterimText.current = transcript;

        // Log interim text update
        addDebugLog('INTERIM', `${transcript.length} chars`, { text: transcript });
      }
    } catch (error) {
      console.error('[Recording] Error parsing transcript:', error);
      addDebugLog('ERROR', `Parse error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }, [addDebugLog]);

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
    // Prevent double-click race condition
    if (isStartingRecording.current) {
      console.log('[Recording] startRecording already in progress, ignoring');
      return;
    }

    if (state.status !== 'ready' && state.status !== 'idle') {
      return;
    }

    isStartingRecording.current = true;
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

      // Reset audio buffer count
      audioBufferCount.current = 0;
      recordingStartTime.current = Date.now();

      // Initialize audio capture
      audioCapture.current = new AudioCapture({
        onAudioData: (data) => {
          if (websocket.current?.readyState === WebSocket.OPEN) {
            websocket.current.send(data);
            audioBufferCount.current++;

            // Log audio stats every 20 buffers (~5 seconds)
            if (audioBufferCount.current % 20 === 0) {
              const approxSeconds = Math.round(audioBufferCount.current * 0.256);
              addDebugLog('AUDIO', `${audioBufferCount.current} buffers (~${approxSeconds}s) processed`);
            }
          }
        },
        onAudioLevel: (level) => {
          dispatch({ type: 'SET_AUDIO_LEVEL', level });
        },
        onError: (error) => {
          console.error('[Recording] Audio error:', error);
          addDebugLog('ERROR', `Audio error: ${error.message}`);
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
        addDebugLog('WS_OPEN', 'Deepgram connected');
        addDebugLog('STATE', 'status: initializing → recording');

        // Initialize stall detection timestamp
        lastDeepgramMessageRef.current = Date.now();
        setIsStalled(false);

        // Start keep-alive interval to prevent Deepgram from closing the connection
        keepAliveRef.current = window.setInterval(() => {
          if (websocket.current?.readyState === WebSocket.OPEN) {
            websocket.current.send(JSON.stringify({ type: 'KeepAlive' }));
            addDebugLog('KEEPALIVE', 'Sent keep-alive ping');
          }
        }, KEEPALIVE_INTERVAL);

        // Start stall detection interval
        stallCheckRef.current = window.setInterval(() => {
          const elapsed = Date.now() - lastDeepgramMessageRef.current;
          if (elapsed > STALL_THRESHOLD) {
            setIsStalled(true);
            addDebugLog('STALL', `No response from Deepgram for ${Math.round(elapsed / 1000)}s`);
          }
        }, STALL_CHECK_INTERVAL);

        await audioCapture.current?.start();
        startTimer();
        dispatch({ type: 'SET_STATUS', status: 'recording' });
        isStartingRecording.current = false; // Allow new recordings after this one completes
      };

      websocket.current.onmessage = (event) => {
        handleTranscript(event.data);
      };

      websocket.current.onerror = (error) => {
        console.error('[Recording] WebSocket error:', error);
        addDebugLog('WS_ERROR', 'WebSocket connection error');
        dispatch({ type: 'SET_ERROR', error: 'Error de conexión con el servicio de transcripción' });
      };

      websocket.current.onclose = (event) => {
        console.log('[Recording] WebSocket closed');
        addDebugLog('WS_CLOSE', `Disconnected (code: ${event.code})`, { code: event.code, reason: event.reason });
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar grabación';
      addDebugLog('ERROR', message);
      dispatch({ type: 'SET_ERROR', error: message });
      isStartingRecording.current = false; // Allow retry on error
    }
  }, [state.status, createDraftConversation, fetchDeepgramConfig, handleTranscript, startTimer, addDebugLog]);

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

  // Determine primary speaker based on word count
  const determinePrimarySpeaker = useCallback((stats: SpeakerStats): number => {
    let primarySpeaker = 0;
    let maxWords = 0;

    for (const [speakerId, data] of Object.entries(stats)) {
      if (data.wordCount > maxWords) {
        maxWords = data.wordCount;
        primarySpeaker = parseInt(speakerId);
      }
    }

    return primarySpeaker;
  }, []);

  const stopRecording = useCallback(async () => {
    if (state.status !== 'recording' && state.status !== 'paused') return;

    addDebugLog('STATE', `status: ${state.status} → processing`);
    dispatch({ type: 'SET_STATUS', status: 'processing' });

    stopTimer();

    // Capture pending interim text BEFORE closing WebSocket
    // This prevents losing the last segment that was displayed but not finalized
    // Use ref instead of state to avoid stale closure issues
    const pendingText = latestInterimText.current.trim();
    if (pendingText) {
      const pendingSegment: TranscriptSegment = {
        id: `seg-${segmentCounter.current++}`,
        text: pendingText,
        isFinal: true,
        startTime: state.durationSeconds,
        endTime: state.durationSeconds,
        speaker: undefined, // No speaker info for recovered interim text
        confidence: 0.8,
      };
      dispatch({ type: 'ADD_SEGMENT', segment: pendingSegment });
      latestInterimText.current = ''; // Clear the ref
      console.log('[Recording] Captured pending interim text:', pendingText);
      addDebugLog('SAVE', `Captured pending: ${pendingText.length} chars`, { text: pendingText });
    }

    // Stop audio capture
    audioCapture.current?.stop();
    audioCapture.current = null;

    // Clear keep-alive and stall detection intervals
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
    if (stallCheckRef.current) {
      clearInterval(stallCheckRef.current);
      stallCheckRef.current = null;
    }
    setIsStalled(false);

    // Close WebSocket
    if (websocket.current) {
      websocket.current.close();
      websocket.current = null;
    }

    // Determine primary speaker (user with most words)
    const primary = determinePrimarySpeaker(state.speakerStats);
    dispatch({ type: 'SET_PRIMARY_SPEAKER', speakerId: primary });

    dispatch({ type: 'SET_AUDIO_LEVEL', level: 0 });
  }, [state.status, state.durationSeconds, state.speakerStats, stopTimer, determinePrimarySpeaker, addDebugLog]);

  const saveRecording = useCallback(async () => {
    if (!state.conversationId) {
      throw new Error('No hay conversación para guardar');
    }

    dispatch({ type: 'SET_STATUS', status: 'saving' });

    try {
      // Get current user's name
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let userName = 'Usuario';

      if (authUser) {
        const { data: profile } = await supabase
          .schema('maity')
          .from('users')
          .select('name')
          .eq('auth_id', authUser.id)
          .single();

        if (profile?.name) {
          userName = profile.name;
        }
      }

      // Append remaining segments with speaker info
      if (state.segments.length > 0) {
        await appendSegments(
          state.conversationId,
          state.segments,
          state.primarySpeaker,
          userName
        );
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

      // Save debug logs to database for admin debugging
      if (state.debugLogs.length > 0) {
        try {
          const logsToSave: RecorderLogInput[] = state.debugLogs.map((log) => ({
            timestamp_ms: log.timestamp,
            log_type: log.type,
            message: log.message,
            details: log.details,
          }));
          await saveRecorderLogs(state.conversationId, logsToSave);
          console.log(`[Recording] Saved ${logsToSave.length} debug logs to database`);
        } catch (logsError) {
          // Don't fail the save if logs fail to save
          console.error('[Recording] Failed to save debug logs:', logsError);
        }
      }

      dispatch({ type: 'SET_STATUS', status: 'completed' });

      return state.conversationId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar';
      dispatch({ type: 'SET_ERROR', error: message });
      throw error;
    }
  }, [state.conversationId, state.segments, state.durationSeconds, state.pausedDuration, state.primarySpeaker, state.debugLogs, appendSegments, finalizeConversation]);

  const reset = useCallback(() => {
    stopTimer();
    audioCapture.current?.stop();
    audioCapture.current = null;
    websocket.current?.close();
    websocket.current = null;
    segmentCounter.current = 0;
    latestInterimText.current = '';
    isStartingRecording.current = false; // Allow new recordings

    // Clear keep-alive and stall detection intervals
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
    if (stallCheckRef.current) {
      clearInterval(stallCheckRef.current);
      stallCheckRef.current = null;
    }
    setIsStalled(false);

    dispatch({ type: 'RESET' });
  }, [stopTimer]);

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================

  const value: RecordingContextValue = {
    state,
    isStalled,
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
