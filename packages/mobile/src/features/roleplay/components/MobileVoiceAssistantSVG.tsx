import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useConversation } from '@elevenlabs/react-native';
import type { ConversationStatus, Role } from '@elevenlabs/react-native';
import { colors } from '../../../theme';
import { VoiceOrbSVG } from './VoiceOrbSVG';

interface MobileVoiceAssistantSVGProps {
  selectedProfile?: 'CEO' | 'CTO' | 'CFO';
  questionnaireId?: string;
  userName?: string;
  userId?: string;
  scenarioCode?: string;
  scenarioName?: string;
  sessionId?: string;
  onSessionStart?: () => Promise<string | null>;
  onSessionEnd?: (
    transcript: string,
    duration: number,
    sessionId?: string,
    messages?: Array<{
      id: string;
      timestamp: Date;
      source: 'user' | 'ai';
      message: string;
    }>
  ) => void;
  profileDescription?: string;
  profileKeyFocus?: string;
  profileCommunicationStyle?: string;
  objectives?: string;
  difficultyLevel?: number;
  difficultyName?: string;
  difficultyMood?: string;
}

export function MobileVoiceAssistantSVG({
  selectedProfile = 'CEO',
  questionnaireId,
  userName,
  userId,
  scenarioCode = 'first_visit',
  scenarioName = 'Primera Visita',
  sessionId,
  onSessionStart,
  onSessionEnd,
  profileDescription,
  profileKeyFocus,
  profileCommunicationStyle,
  objectives,
  difficultyLevel = 1,
  difficultyName = 'Fácil',
  difficultyMood = 'neutral',
}: MobileVoiceAssistantSVGProps) {
  const [conversationStartTime, setConversationStartTime] = useState<number | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);
  const [conversationMessages, setConversationMessages] = useState<Array<{
    id: string;
    timestamp: Date;
    source: 'user' | 'ai';
    message: string;
  }>>([]);
  const [status, setStatus] = useState<ConversationStatus>('disconnected');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const agentId = process.env.EXPO_PUBLIC_AGENT_ID || process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID_TEST;

  console.log('[MobileVoiceAssistantSVG] Component mounted with config:', {
    hasAgentId: !!agentId,
    agentId,
    scenarioCode,
    userId,
    userName,
  });

  const conversation = useConversation({
    onConnect: ({ conversationId }: { conversationId: string }) => {
      console.log('[MobileVoiceAssistantSVG] ✅ Connected to conversation', conversationId);
      setCurrentConversationId(conversationId);
    },
    onDisconnect: (details: string) => {
      console.log('[MobileVoiceAssistantSVG] 🔌 Disconnected from conversation', details);
      setCurrentConversationId(null);
      handleConversationEnd();
    },
    onError: (message: string, context?: Record<string, unknown>) => {
      console.error('[MobileVoiceAssistantSVG] ❌ Conversation error:', message, context);
      Alert.alert(
        'Error en la Conversación',
        `Error: ${message}\n\nDetalles: ${JSON.stringify(context || {})}`,
        [
          {
            text: 'Ver detalles técnicos',
            onPress: () => Alert.alert(
              'Detalles Técnicos',
              JSON.stringify({ message, context }, null, 2)
            )
          },
          { text: 'Entendido' }
        ]
      );
    },
    onMessage: ({
      message,
      source,
    }: {
      message: any;
      source: Role;
    }) => {
      console.log('[MobileVoiceAssistantSVG] 💬 Message from', source, ':', message);

      if (typeof message === 'object' && message.type) {
        const eventType = message.type;

        if (eventType === 'user_transcript' && message.user_transcription_event) {
          const userText = message.user_transcription_event.user_transcript;
          if (userText && userText.trim()) {
            const newMessage = {
              id: `${Date.now()}-${Math.random()}`,
              timestamp: new Date(),
              source: 'user' as const,
              message: userText,
            };
            setConversationMessages((prev) => [...prev, newMessage]);
          }
        } else if (eventType === 'agent_response' && message.agent_response_event) {
          const agentText = message.agent_response_event.agent_response;
          if (agentText && agentText.trim()) {
            const newMessage = {
              id: `${Date.now()}-${Math.random()}`,
              timestamp: new Date(),
              source: 'ai' as const,
              message: agentText,
            };
            setConversationMessages((prev) => [...prev, newMessage]);
          }
        }
      }
    },
    onModeChange: ({ mode }: { mode: 'speaking' | 'listening' }) => {
      console.log('[MobileVoiceAssistantSVG] 🔊 Mode changed:', mode);
      setIsSpeaking(mode === 'speaking');
    },
    onStatusChange: ({ status: newStatus }: { status: ConversationStatus }) => {
      console.log('[MobileVoiceAssistantSVG] 📡 Status changed:', newStatus);
      setStatus(newStatus);
    },
    onCanSendFeedbackChange: ({
      canSendFeedback,
    }: {
      canSendFeedback: boolean;
    }) => {
      console.log('[MobileVoiceAssistantSVG] 🔊 Can send feedback:', canSendFeedback);
    },
  });

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      console.log('[MobileVoiceAssistantSVG] 🎤 Verificando permisos de micrófono...');

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Permiso de Micrófono',
            message: 'Necesitamos acceso al micrófono para la práctica de voz',
            buttonNeutral: 'Preguntar luego',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('[MobileVoiceAssistantSVG] ✅ Permiso de micrófono concedido');
          return true;
        } else {
          console.log('[MobileVoiceAssistantSVG] ❌ Permiso de micrófono denegado');
          Alert.alert(
            'Permiso necesario',
            'Necesitamos acceso al micrófono para iniciar la práctica'
          );
          return false;
        }
      }

      return true;
    } catch (err: any) {
      console.error('[MobileVoiceAssistantSVG] Error solicitando permisos:', err);
      Alert.alert('Error', 'No se pudo verificar permisos de micrófono');
      return false;
    }
  };

  const handleStartConversation = async () => {
    try {
      console.log('[MobileVoiceAssistantSVG] 🚀 Iniciando proceso de conversación...');

      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        console.log('[MobileVoiceAssistantSVG] ⚠️ Sin permisos de micrófono, abortando');
        return;
      }

      if (!agentId) {
        console.error('[MobileVoiceAssistantSVG] ❌ No agent ID configured');
        Alert.alert('Error de Configuración', 'No se encontró el ID del agente');
        return;
      }

      console.log('[MobileVoiceAssistantSVG] 💾 Creando sesión en base de datos...');

      let newSessionId = currentSessionId;
      if (onSessionStart && !newSessionId) {
        console.log('[MobileVoiceAssistantSVG] Llamando a onSessionStart...');
        newSessionId = await onSessionStart();
        if (newSessionId) {
          setCurrentSessionId(newSessionId);
          console.log('[MobileVoiceAssistantSVG] ✅ Sesión creada en DB:', newSessionId);
        } else {
          console.warn('[MobileVoiceAssistantSVG] ⚠️ onSessionStart no devolvió sessionId');
        }
      }

      setConversationStartTime(Date.now());
      setConversationMessages([]);

      const dynamicVars = {
        user_name: userName || 'Usuario',
        profile: selectedProfile,
        profile_description: profileDescription || '',
        profile_key_focus: profileKeyFocus || '',
        profile_style: profileCommunicationStyle || '',
        scenary: scenarioName,
        scenario_code: scenarioCode,
        objectives: objectives || '',
        difficulty: difficultyName,
        level: difficultyLevel.toString(),
        mood: difficultyMood || 'neutral',
        questionnaire_id: questionnaireId || '',
        session_id: newSessionId || sessionId || ''
      };

      console.log('[MobileVoiceAssistantSVG] 🚀 Enviando variables dinámicas a ElevenLabs:', dynamicVars);

      console.log('[MobileVoiceAssistantSVG] 🎙️ Conectando a ElevenLabs con agentId:', agentId);

      await conversation.startSession({
        agentId: agentId,
        dynamicVariables: dynamicVars,
      });

      console.log('[MobileVoiceAssistantSVG] ✅ startSession() llamado exitosamente');

    } catch (err: any) {
      const errorMsg = `Error iniciando conversación:\nTipo: ${err?.name || 'Unknown'}\nMensaje: ${err?.message || 'Sin mensaje'}\nStack: ${err?.stack || 'No stack'}`;
      console.error('[MobileVoiceAssistantSVG]', errorMsg);

      Alert.alert(
        'Error al Iniciar',
        `No se pudo iniciar la conversación:\n\n${err?.message || 'Error desconocido'}`,
        [
          {
            text: 'Ver detalles completos',
            onPress: () => Alert.alert('Error completo', errorMsg)
          },
          { text: 'OK' }
        ]
      );
    }
  };

  const handleEndConversation = async () => {
    try {
      console.log('[MobileVoiceAssistantSVG] 🛑 Finalizando conversación...');
      await conversation.endSession();
      handleConversationEnd();
    } catch (err: any) {
      console.error('[MobileVoiceAssistantSVG] Error finalizando conversación:', err);
    }
  };

  const handleConversationEnd = () => {
    if (conversationStartTime && onSessionEnd) {
      const duration = Math.floor((Date.now() - conversationStartTime) / 1000);

      const transcript = conversationMessages
        .map(msg => `${msg.source === 'user' ? 'Usuario' : 'AI'}: ${msg.message}`)
        .join('\n');

      console.log('[MobileVoiceAssistantSVG] 📊 Sesión terminada - Estadísticas:', {
        duration: `${duration}s`,
        messageCount: conversationMessages.length,
        transcriptLength: transcript.length,
        sessionId: currentSessionId,
        conversationId: currentConversationId,
      });

      onSessionEnd(transcript, duration, currentSessionId || undefined, conversationMessages);

      setConversationStartTime(null);
      setConversationMessages([]);
    }
  };

  const getStatusColor = () => {
    if (currentConversationId) {
      return colors.success;
    }

    switch (status) {
      case 'connected':
        return colors.success;
      case 'connecting':
        return colors.warning;
      case 'disconnected':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const getStatusText = () => {
    if (currentConversationId) {
      return 'Conectado - Listo para hablar';
    }

    switch (status) {
      case 'connected':
        return 'Conectado - Listo para hablar';
      case 'connecting':
        return 'Conectando...';
      case 'disconnected':
        return 'Desconectado';
      default:
        return 'Listo para iniciar';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Status bar */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        {/* Voice Orb SVG - show when connected */}
        {currentConversationId ? (
          <View style={styles.orbContainer}>
            <VoiceOrbSVG isListening={!isSpeaking} isSpeaking={isSpeaking} />
            <Text style={styles.orbLabel}>
              {isSpeaking ? 'Agente hablando...' : 'Escuchando...'}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.scenarioTitle}>{scenarioName}</Text>
            <Text style={styles.scenarioSubtitle}>Perfil: {selectedProfile}</Text>
          </>
        )}

        {conversationMessages.length > 0 && (
          <View style={styles.messagesContainer}>
            <Text style={styles.messagesTitle}>
              📝 Mensajes intercambiados: {conversationMessages.length}
            </Text>
            <Text style={styles.messagesSubtitle}>
              Usuario: {conversationMessages.filter(m => m.source === 'user').length} |
              AI: {conversationMessages.filter(m => m.source === 'ai').length}
            </Text>
          </View>
        )}

        <View style={styles.controls}>
          {!currentConversationId && status === 'disconnected' ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartConversation}
            >
              <Text style={styles.startButtonText}>Iniciar Conversación</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.endButton}
              onPress={handleEndConversation}
            >
              <Text style={styles.endButtonText}>Finalizar Conversación</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  orbLabel: {
    marginTop: 16,
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  scenarioTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  scenarioSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  messagesContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  messagesTitle: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  messagesSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  controls: {
    marginTop: 'auto',
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  endButton: {
    backgroundColor: colors.error,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  endButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
