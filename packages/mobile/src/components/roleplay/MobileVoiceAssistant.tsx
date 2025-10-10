import React, { useState, useEffect } from 'react';
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
import { colors } from '../../theme';

interface MobileVoiceAssistantProps {
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

export function MobileVoiceAssistant({
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
}: MobileVoiceAssistantProps) {
  const [conversationStartTime, setConversationStartTime] = useState<number | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);
  const [conversationMessages, setConversationMessages] = useState<Array<{
    id: string;
    timestamp: Date;
    source: 'user' | 'ai';
    message: string;
  }>>([]);
  const [detailedStatus, setDetailedStatus] = useState<string>('Listo para iniciar');
  const [lastError, setLastError] = useState<string | null>(null);

  const agentId = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID_TEST;

  console.log('[MobileVoiceAssistant] Component mounted with config:', {
    hasAgentId: !!agentId,
    agentId: agentId,
    scenarioCode,
    userId,
    userName,
  });

  const {
    startSession,
    endSession,
    status,
    isSpeaking,
    getConversationId,
  } = useConversation({
    onConnect: () => {
      console.log('[MobileVoiceAssistant] ✅ Conectado exitosamente a ElevenLabs');
      setDetailedStatus('Conectado - Listo para hablar');
      setLastError(null);
    },
    onDisconnect: () => {
      console.log('[MobileVoiceAssistant] 🔌 Desconectado de ElevenLabs');
      setDetailedStatus('Desconectado');
      handleConversationEnd();
    },
    onError: (error) => {
      const errorDetails = {
        message: error?.message || 'Error desconocido',
        name: error?.name || 'UnknownError',
        stack: error?.stack || 'No stack trace',
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      };

      console.error('[MobileVoiceAssistant] ❌ Error en conversación:', errorDetails);
      console.error('[MobileVoiceAssistant] ❌ Error completo:', error);
      console.error('[MobileVoiceAssistant] ❌ Tipo de error:', typeof error);

      // Extraer mensaje de error
      const errorMessage = errorDetails.message || error?.toString() || 'Error desconocido';
      const errorLower = errorMessage.toLowerCase();

      let userFriendlyMessage = '';
      let errorTitle = 'Error en la conversación';

      // Manejo específico para errores de WebRTC/PeerConnection
      if (errorLower.includes('could not establish pc connection') ||
          errorLower.includes('peerconnection') ||
          errorLower.includes('webrtc') ||
          errorLower.includes('peer connection')) {
        console.error('[MobileVoiceAssistant] 🔴 WebRTC/PeerConnection error detected');
        errorTitle = 'Error de Conexión de Voz';
        userFriendlyMessage =
          'No se pudo establecer la conexión de voz.\n\n' +
          'Causas posibles:\n' +
          '• Firewall o red corporativa bloqueando WebRTC\n' +
          '• Problemas de conexión a internet\n' +
          '• Límite de cuota alcanzado\n\n' +
          'Soluciones:\n' +
          '1. Verificar tu conexión a internet\n' +
          '2. Intentar con datos móviles en lugar de WiFi\n' +
          '3. Desactivar VPN si tienes una activa\n' +
          '4. Esperar unos minutos y volver a intentar';
      }
      // Manejo específico para errores de cuota/límites
      else if (errorLower.includes('quota') ||
               errorLower.includes('limit') ||
               errorLower.includes('rate') ||
               errorLower.includes('429') ||
               errorLower.includes('insufficient') ||
               errorLower.includes('exceeded')) {
        console.error('[MobileVoiceAssistant] ⚠️ Límite de ElevenLabs alcanzado');
        errorTitle = 'Límite Alcanzado';
        userFriendlyMessage =
          'Se ha alcanzado el límite de uso del servicio de voz.\n\n' +
          'Por favor, intenta más tarde o contacta al administrador.';
      }
      // Manejo específico para errores de tipo desconocido
      else if (errorLower.includes('unknown type') ||
               errorLower.includes('tipo desconocido') ||
               errorMessage === '[object Object]') {
        console.error('[MobileVoiceAssistant] ❓ Unknown error type detected');
        errorTitle = 'Error Desconocido';
        userFriendlyMessage =
          'Error desconocido al conectar con el servicio de voz.\n\n' +
          'Soluciones:\n' +
          '1. Cierra y abre la aplicación\n' +
          '2. Verifica tu conexión a internet\n' +
          '3. Asegúrate de haber dado permisos al micrófono\n' +
          '4. Si persiste, contacta a soporte técnico';
      }
      // Manejo para errores de permisos de micrófono
      else if (errorLower.includes('permission') ||
               errorLower.includes('notallowed') ||
               errorLower.includes('denied')) {
        console.error('[MobileVoiceAssistant] 🎤 Microphone permission error');
        errorTitle = 'Sin Permiso de Micrófono';
        userFriendlyMessage =
          'No se pudo acceder al micrófono.\n\n' +
          'Por favor, permite el acceso al micrófono en la configuración de tu dispositivo.';
      }
      // Error genérico
      else {
        console.error('[MobileVoiceAssistant] ❌ Generic error');
        userFriendlyMessage =
          `Error en la conversación:\n\n${errorMessage.substring(0, 150)}\n\n` +
          'Por favor, verifica tu conexión y vuelve a intentar.';
      }

      const shortErrorMsg = `${errorTitle}: ${errorMessage.substring(0, 50)}...`;
      setLastError(shortErrorMsg);
      setDetailedStatus(`Error: ${errorTitle}`);

      Alert.alert(
        errorTitle,
        userFriendlyMessage,
        [
          {
            text: 'Ver detalles técnicos',
            onPress: () => Alert.alert(
              'Detalles Técnicos',
              `Tipo: ${errorDetails.name}\nMensaje: ${errorDetails.message}\n\nStack:\n${errorDetails.stack}`,
              [{ text: 'OK' }]
            )
          },
          { text: 'Entendido' }
        ]
      );
    },
    onMessage: (message) => {
      console.log('[MobileVoiceAssistant] 💬 Mensaje recibido:', {
        source: message.source,
        messageLength: message.message?.length || 0,
        message: message.message
      });

      // Agregar mensaje a la lista
      const newMessage = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        source: message.source === 'user' ? 'user' as const : 'ai' as const,
        message: message.message,
      };

      setConversationMessages((prev) => [...prev, newMessage]);
    },
    onModeChange: (mode) => {
      console.log('[MobileVoiceAssistant] 🔄 Modo cambiado:', mode);
    },
  });

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      console.log('[MobileVoiceAssistant] 🎤 Verificando permisos de micrófono...');
      setDetailedStatus('Verificando permisos de micrófono...');

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
          console.log('[MobileVoiceAssistant] ✅ Permiso de micrófono concedido');
          return true;
        } else {
          console.log('[MobileVoiceAssistant] ❌ Permiso de micrófono denegado');
          Alert.alert(
            'Permiso necesario',
            'Necesitamos acceso al micrófono para iniciar la práctica'
          );
          return false;
        }
      }

      // iOS permissions are handled automatically by the system
      return true;
    } catch (err: any) {
      console.error('[MobileVoiceAssistant] Error solicitando permisos:', err);
      Alert.alert('Error', 'No se pudo verificar permisos de micrófono');
      return false;
    }
  };

  const getConversationToken = async (): Promise<string | null> => {
    try {
      console.log('[MobileVoiceAssistant] 🔑 Paso 1/4: Obteniendo conversation token...');
      setDetailedStatus('Obteniendo token de autenticación...');

      // Determinar URL del endpoint
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || process.env.VITE_API_URL || 'https://www.maity.com.mx';
      const endpoint = `${apiUrl}/api/elevenlabs-conversation-token`;

      console.log('[MobileVoiceAssistant] Llamando a endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[MobileVoiceAssistant] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[MobileVoiceAssistant] ❌ Error del servidor:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        });

        throw new Error(
          `Error ${response.status}: ${errorData.error || errorData.message || 'No se pudo obtener el token'}\n` +
          `Detalles: ${errorData.details || 'Sin detalles'}`
        );
      }

      const data = await response.json();
      console.log('[MobileVoiceAssistant] ✅ Token obtenido exitosamente:', {
        hasToken: !!data.token,
        tokenLength: data.token?.length || 0,
        agentId: data.agentId
      });

      if (!data.token) {
        throw new Error('El servidor no devolvió un token válido');
      }

      return data.token;
    } catch (err: any) {
      const errorMsg = `Error obteniendo token:\nTipo: ${err?.name || 'Unknown'}\nMensaje: ${err?.message || 'Sin mensaje'}`;
      console.error('[MobileVoiceAssistant]', errorMsg);
      console.error('[MobileVoiceAssistant] Error completo:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

      setLastError(errorMsg);
      setDetailedStatus('Error obteniendo token');

      Alert.alert(
        'Error de Autenticación',
        `No se pudo obtener el token de conversación:\n\n${err?.message || 'Error desconocido'}`,
        [
          {
            text: 'Ver detalles',
            onPress: () => Alert.alert('Detalles del error', JSON.stringify(err, Object.getOwnPropertyNames(err), 2))
          },
          { text: 'OK' }
        ]
      );

      return null;
    }
  };

  const handleStartConversation = async () => {
    try {
      console.log('[MobileVoiceAssistant] 🚀 Iniciando proceso de conversación...');
      setLastError(null);

      // Paso 0: Verificar permisos
      console.log('[MobileVoiceAssistant] 📋 Paso 0/4: Verificando permisos...');
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        console.log('[MobileVoiceAssistant] ⚠️ Sin permisos de micrófono, abortando');
        return;
      }

      // Paso 1: Obtener conversation token
      const conversationToken = await getConversationToken();
      if (!conversationToken) {
        console.log('[MobileVoiceAssistant] ⚠️ No se obtuvo token, abortando');
        return;
      }

      // Paso 2: Crear sesión en DB
      console.log('[MobileVoiceAssistant] 💾 Paso 2/4: Creando sesión en base de datos...');
      setDetailedStatus('Creando sesión...');

      let newSessionId = currentSessionId;
      if (onSessionStart && !newSessionId) {
        console.log('[MobileVoiceAssistant] Llamando a onSessionStart...');
        newSessionId = await onSessionStart();
        if (newSessionId) {
          setCurrentSessionId(newSessionId);
          console.log('[MobileVoiceAssistant] ✅ Sesión creada en DB:', newSessionId);
        } else {
          console.warn('[MobileVoiceAssistant] ⚠️ onSessionStart no devolvió sessionId');
        }
      }

      // Paso 3: Preparar para iniciar
      console.log('[MobileVoiceAssistant] ⚙️ Paso 3/4: Preparando configuración...');
      setDetailedStatus('Preparando conversación...');

      setConversationStartTime(Date.now());
      setConversationMessages([]);

      // Paso 4: Iniciar sesión con ElevenLabs
      console.log('[MobileVoiceAssistant] 🎙️ Paso 4/4: Conectando a ElevenLabs...');
      setDetailedStatus('Conectando...');

      const sessionConfig = {
        conversationToken: conversationToken,
        userId: userId || undefined,
      };

      console.log('[MobileVoiceAssistant] Configuración de sesión:', {
        hasToken: !!sessionConfig.conversationToken,
        tokenLength: sessionConfig.conversationToken?.length || 0,
        userId: sessionConfig.userId,
      });

      await startSession(sessionConfig);

      console.log('[MobileVoiceAssistant] ✅ startSession() llamado exitosamente');
      setDetailedStatus('Conectando a agente...');

    } catch (err: any) {
      const errorMsg = `Error iniciando conversación:\nTipo: ${err?.name || 'Unknown'}\nMensaje: ${err?.message || 'Sin mensaje'}\nStack: ${err?.stack || 'No stack'}`;
      console.error('[MobileVoiceAssistant]', errorMsg);
      console.error('[MobileVoiceAssistant] Error completo:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

      setLastError(errorMsg);
      setDetailedStatus('Error al iniciar');

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
      console.log('[MobileVoiceAssistant] 🛑 Finalizando conversación...');
      setDetailedStatus('Finalizando...');
      await endSession();
      handleConversationEnd();
    } catch (err: any) {
      console.error('[MobileVoiceAssistant] Error finalizando conversación:', err);
    }
  };

  const handleConversationEnd = () => {
    if (conversationStartTime && onSessionEnd) {
      const duration = Math.floor((Date.now() - conversationStartTime) / 1000);

      // Construir transcript desde los mensajes
      const transcript = conversationMessages
        .map(msg => `${msg.source === 'user' ? 'Usuario' : 'AI'}: ${msg.message}`)
        .join('\n');

      console.log('[MobileVoiceAssistant] 📊 Sesión terminada - Estadísticas:', {
        duration: `${duration}s`,
        messageCount: conversationMessages.length,
        transcriptLength: transcript.length,
        sessionId: currentSessionId,
        conversationId: getConversationId ? getConversationId() : 'N/A'
      });

      onSessionEnd(transcript, duration, currentSessionId || undefined, conversationMessages);

      // Limpiar estado
      setConversationStartTime(null);
      setConversationMessages([]);
      setDetailedStatus('Sesión finalizada');
    }
  };

  const getStatusColor = () => {
    if (lastError) return colors.error;

    switch (status) {
      case 'connected':
        return isSpeaking ? colors.primary : colors.success;
      case 'connecting':
        return colors.warning;
      case 'disconnected':
        return colors.error;
      default:
        return colors.text;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{detailedStatus}</Text>
        </View>

        {lastError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{lastError}</Text>
          </View>
        )}

        <Text style={styles.scenarioTitle}>{scenarioName}</Text>
        <Text style={styles.scenarioSubtitle}>Perfil: {selectedProfile}</Text>

        {status && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Estado SDK: {status}</Text>
            {isSpeaking && <Text style={styles.infoText}>🗣️ Agente hablando</Text>}
          </View>
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
          {status === 'disconnected' || !status ? (
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
  errorBox: {
    backgroundColor: colors.error + '20',
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    fontFamily: 'monospace',
  },
  infoBox: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
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
