import { useState, useEffect, useCallback, useRef } from 'react';
import { env } from '@/lib/env';
import type { AgentState } from '@/components/coach/CoachPage';

interface ConversationConfig {
  agentId?: string;
  onStateChange?: (state: AgentState) => void;
  onError?: (error: Error) => void;
  onResponse?: (text: string) => void;
}

interface ConversationStatus {
  status: 'disconnected' | 'connecting' | 'connected' | 'listening' | 'thinking' | 'speaking';
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastResponse: string | null;
}

export function useElevenLabsConversation(config: ConversationConfig = {}) {
  const [status, setStatus] = useState<ConversationStatus>({
    status: 'disconnected',
    isConnected: false,
    isLoading: false,
    error: null,
    lastResponse: null,
  });

  const clientRef = useRef<ElevenLabsClient | null>(null);
  const conversationRef = useRef<any | null>(null);
  const { agentId, onStateChange, onError, onResponse } = config;

  // Initialize ElevenLabs client
  useEffect(() => {
    if (!env.elevenLabsApiKey) {
      setStatus(prev => ({
        ...prev,
        error: 'ElevenLabs API key not configured',
        status: 'disconnected'
      }));
      return;
    }

    try {
      clientRef.current = new ElevenLabsClient({
        apiKey: env.elevenLabsApiKey,
      });

      setStatus(prev => ({
        ...prev,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize ElevenLabs client';
      setStatus(prev => ({
        ...prev,
        error: errorMessage,
        status: 'disconnected'
      }));
      onError?.(new Error(errorMessage));
    }
  }, [onError]);

  // Handle state changes
  useEffect(() => {
    const agentState: AgentState =
      status.status === 'listening' ? 'listening' :
      status.status === 'thinking' ? 'thinking' :
      status.status === 'speaking' ? 'speaking' : 'idle';

    onStateChange?.(agentState);
  }, [status.status, onStateChange]);

  // Connect to conversation
  const connect = useCallback(async () => {
    if (!clientRef.current || !env.elevenLabsAgentId) {
      setStatus(prev => ({
        ...prev,
        error: 'Client not initialized or agent ID not configured'
      }));
      return false;
    }

    try {
      setStatus(prev => ({
        ...prev,
        isLoading: true,
        status: 'connecting',
        error: null
      }));

      // Note: This is a simplified implementation
      // The actual ElevenLabs conversational API might have different methods
      conversationRef.current = await clientRef.current.conversationalAI.connect({
        agentId: agentId || env.elevenLabsAgentId,
        onStatusChange: (newStatus: any) => {
          setStatus(prev => ({
            ...prev,
            status: newStatus.status,
            isConnected: newStatus.status === 'connected',
            isLoading: false
          }));
        },
        onResponse: (response: string) => {
          setStatus(prev => ({
            ...prev,
            lastResponse: response,
            status: 'idle'
          }));
          onResponse?.(response);
        },
        onError: (error: any) => {
          const errorMessage = error.message || 'Conversation error';
          setStatus(prev => ({
            ...prev,
            error: errorMessage,
            status: 'disconnected',
            isConnected: false,
            isLoading: false
          }));
          onError?.(new Error(errorMessage));
        }
      });

      setStatus(prev => ({
        ...prev,
        isConnected: true,
        status: 'connected',
        isLoading: false
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to conversation';
      setStatus(prev => ({
        ...prev,
        error: errorMessage,
        status: 'disconnected',
        isConnected: false,
        isLoading: false
      }));
      onError?.(new Error(errorMessage));
      return false;
    }
  }, [agentId, onError, onResponse]);

  // Disconnect from conversation
  const disconnect = useCallback(async () => {
    if (conversationRef.current) {
      try {
        await conversationRef.current.disconnect();
      } catch (error) {
        console.warn('Error disconnecting:', error);
      }
      conversationRef.current = null;
    }

    setStatus(prev => ({
      ...prev,
      isConnected: false,
      status: 'disconnected',
      isLoading: false
    }));
  }, []);

  // Start listening
  const startListening = useCallback(async () => {
    if (!conversationRef.current || !status.isConnected) {
      return false;
    }

    try {
      setStatus(prev => ({ ...prev, status: 'listening' }));
      await conversationRef.current.startListening();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start listening';
      setStatus(prev => ({
        ...prev,
        error: errorMessage,
        status: 'connected'
      }));
      onError?.(new Error(errorMessage));
      return false;
    }
  }, [status.isConnected, onError]);

  // Stop listening
  const stopListening = useCallback(async () => {
    if (!conversationRef.current) {
      return false;
    }

    try {
      await conversationRef.current.stopListening();
      setStatus(prev => ({ ...prev, status: 'connected' }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop listening';
      setStatus(prev => ({
        ...prev,
        error: errorMessage
      }));
      onError?.(new Error(errorMessage));
      return false;
    }
  }, [onError]);

  // Send text message
  const sendMessage = useCallback(async (message: string) => {
    if (!conversationRef.current || !status.isConnected) {
      return false;
    }

    try {
      setStatus(prev => ({ ...prev, status: 'thinking' }));
      await conversationRef.current.sendMessage(message);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setStatus(prev => ({
        ...prev,
        error: errorMessage,
        status: 'connected'
      }));
      onError?.(new Error(errorMessage));
      return false;
    }
  }, [status.isConnected, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Status
    ...status,

    // Actions
    connect,
    disconnect,
    startListening,
    stopListening,
    sendMessage,

    // Computed properties
    canConnect: !!env.elevenLabsApiKey && !!env.elevenLabsAgentId,
    isConfigured: !!env.elevenLabsApiKey && !!env.elevenLabsAgentId,
  };
}