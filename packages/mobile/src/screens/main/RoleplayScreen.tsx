import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme';
import { getSupabase } from '../../lib/supabase/client';
import { MobileVoiceAssistant } from '../../components/roleplay/MobileVoiceAssistant';

interface CurrentScenario {
  scenarioName: string;
  scenarioCode: string;
  scenarioOrder: number;
  minScoreToPass: number;
  isLocked: boolean;
  progressId: string;
  userInstructions: string | null;
  objectives: string;
  profileDescription: string;
  profileKeyFocus: string;
  profileCommunicationStyle: string;
  profilePersonalityTraits: any;
  difficultyLevel: number;
  difficultyName: string;
  difficultyMood: string;
  difficultyObjectionFrequency: number;
  difficultyTimePressure: boolean;
  difficultyInterruptionTendency: number;
  profile: 'CEO' | 'CTO' | 'CFO';
}

export const RoleplayScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Usuario');
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentScenario, setCurrentScenario] = useState<CurrentScenario | null>(null);
  const [questionnaireData, setQuestionnaireData] = useState<{
    practiceStartProfile: 'CEO' | 'CTO' | 'CFO';
    questionnaireId: string;
  } | null>(null);

  // Use ref instead of state to persist across re-renders
  const isProcessingEndRef = useRef(false);

  useEffect(() => {
    checkUserAndQuestionnaire();
  }, []);

  useEffect(() => {
    if (questionnaireData && userId) {
      fetchCurrentScenario();
    }
  }, [questionnaireData, userId]);

  useEffect(() => {
    if (userId) {
      loadRecentSessions();
    }
  }, [userId]);

  const checkUserAndQuestionnaire = async () => {
    try {
      setInitialLoading(true);
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setInitialLoading(false);
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id, name, nickname, email')
        .eq('auth_id', user.id)
        .single();

      if (!userData) {
        setInitialLoading(false);
        return;
      }

      setUserId(userData.id);
      const displayName =
        userData.name?.trim() ||
        userData.nickname?.trim() ||
        userData.email?.split('@')[0] ||
        'Usuario';
      setUserName(displayName);

      console.log('[RoleplayScreen] Usuario obtenido:', {
        id: userData.id,
        name: userData.name,
        displayName
      });

      // Check if user has completed questionnaire
      const { data: existingQuestionnaire, error: questionnaireError } = await supabase
        .from('voice_pre_practice_questionnaire')
        .select('*')
        .eq('user_id', userData.id)
        .order('answered_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (questionnaireError) {
        console.error('[RoleplayScreen] Error fetching questionnaire:', questionnaireError);
      } else if (existingQuestionnaire) {
        console.log('[RoleplayScreen] Cuestionario encontrado:', existingQuestionnaire);
        setQuestionnaireData({
          practiceStartProfile: existingQuestionnaire.practice_start_profile,
          questionnaireId: existingQuestionnaire.id
        });
      } else {
        console.log('[RoleplayScreen] No hay cuestionario, usando CEO por defecto');
        // Default to CEO if no questionnaire
        setQuestionnaireData({
          practiceStartProfile: 'CEO',
          questionnaireId: '' // Empty for now
        });
      }
    } catch (error) {
      console.error('[RoleplayScreen] Error loading user:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchCurrentScenario = async () => {
    if (!userId || !questionnaireData) {
      console.log('[RoleplayScreen] No userId or questionnaireData, skipping scenario fetch');
      return;
    }

    try {
      setLoading(true);
      console.log('[RoleplayScreen] Fetching scenario with get_or_create_user_progress...');

      const supabase = getSupabase();
      const { data: progress, error } = await supabase.rpc('get_or_create_user_progress', {
        p_user_id: userId,
        p_profile_name: questionnaireData.practiceStartProfile
      });

      if (error) {
        console.error('[RoleplayScreen] Error fetching scenario:', error);
        Alert.alert('Error', 'No se pudo cargar el escenario actual');
        return;
      }

      if (progress && progress.length > 0) {
        const scenarioInfo = progress[0];

        console.log('[RoleplayScreen] Escenario obtenido:', {
          profile: questionnaireData.practiceStartProfile,
          scenario: scenarioInfo.current_scenario_name,
          scenarioCode: scenarioInfo.current_scenario_code,
          difficultyLevel: scenarioInfo.difficulty_level,
          difficultyName: scenarioInfo.difficulty_name
        });

        setCurrentScenario({
          scenarioName: scenarioInfo.current_scenario_name,
          scenarioCode: scenarioInfo.current_scenario_code,
          scenarioOrder: scenarioInfo.current_scenario_order,
          minScoreToPass: parseFloat(scenarioInfo.min_score_to_pass),
          isLocked: scenarioInfo.is_locked,
          progressId: scenarioInfo.progress_id,
          userInstructions: scenarioInfo.user_instructions || null,
          objectives: scenarioInfo.objectives || '',
          profileDescription: scenarioInfo.profile_description,
          profileKeyFocus: scenarioInfo.profile_key_focus,
          profileCommunicationStyle: scenarioInfo.profile_communication_style,
          profilePersonalityTraits: scenarioInfo.profile_personality_traits,
          difficultyLevel: scenarioInfo.difficulty_level,
          difficultyName: scenarioInfo.difficulty_name,
          difficultyMood: scenarioInfo.difficulty_mood,
          difficultyObjectionFrequency: scenarioInfo.difficulty_objection_frequency,
          difficultyTimePressure: scenarioInfo.difficulty_time_pressure,
          difficultyInterruptionTendency: scenarioInfo.difficulty_interruption_tendency,
          profile: questionnaireData.practiceStartProfile
        });
      }
    } catch (error) {
      console.error('[RoleplayScreen] Error in fetchCurrentScenario:', error);
      Alert.alert('Error', 'No se pudo cargar el escenario');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentSessions = async () => {
    if (!userId) {
      console.log('[RoleplayScreen] No userId, skipping sessions load');
      return;
    }

    try {
      const supabase = getSupabase();
      // Get recent sessions using RPC
      const { data: sessions, error } = await supabase.rpc('get_user_recent_sessions', {
        p_user_id: userId,
        p_limit: 3
      });

      if (error) {
        console.error('[RoleplayScreen] Error loading sessions:', error);
        return;
      }

      if (sessions) {
        console.log('[RoleplayScreen] Recent sessions loaded:', sessions.length);
        setRecentSessions(sessions);
      }
    } catch (error) {
      console.error('[RoleplayScreen] Error in loadRecentSessions:', error);
    }
  };

  const handleStartPractice = () => {
    if (!currentScenario) {
      Alert.alert('Error', 'No hay escenario disponible');
      return;
    }

    if (currentScenario.isLocked) {
      Alert.alert('Escenario bloqueado', 'Completa el escenario anterior para desbloquear este');
      return;
    }

    console.log('[RoleplayScreen] Starting practice with scenario:', currentScenario.scenarioName);
    setShowVoiceAssistant(true);
  };

  const handleSessionStart = async (): Promise<string | null> => {
    if (!userId || !currentScenario || !questionnaireData) {
      console.error('[RoleplayScreen] Missing required data for session start');
      Alert.alert('Error', 'No se pudo iniciar la sesión');
      return null;
    }

    try {
      console.log('[RoleplayScreen] Creating voice_session...', {
        userId,
        profile: currentScenario.profile,
        questionnaireId: questionnaireData.questionnaireId
      });

      const supabase = getSupabase();
      const { data: sessionId, error } = await supabase.rpc('create_voice_session', {
        p_user_id: userId,
        p_profile_name: currentScenario.profile,
        p_questionnaire_id: questionnaireData.questionnaireId || null,
      });

      if (error) {
        console.error('[RoleplayScreen] Error creating voice session:', error);
        Alert.alert('Error', `No se pudo crear la sesión: ${JSON.stringify(error)}`);
        return null;
      }

      if (sessionId) {
        const sessionIdString =
          typeof sessionId === 'string' ? sessionId : sessionId.toString();
        console.log('[RoleplayScreen] Voice session created successfully:', sessionIdString);
        setCurrentSessionId(sessionIdString);
        return sessionIdString;
      }

      return null;
    } catch (error) {
      console.error('[RoleplayScreen] Error in handleSessionStart:', error);
      Alert.alert('Error', `Error inesperado: ${error}`);
      return null;
    }
  };

  const handleSessionEnd = async (
    transcript: string,
    duration: number,
    sessionId?: string,
    messages?: Array<{
      id: string;
      timestamp: Date;
      source: 'user' | 'ai';
      message: string;
    }>
  ) => {
    // Prevent multiple simultaneous executions using ref
    if (isProcessingEndRef.current) {
      console.log('[RoleplayScreen] Already processing session end, skipping...');
      return;
    }

    // Set flag immediately
    isProcessingEndRef.current = true;

    try {
      // Use the session ID from state or parameter
      const effectiveSessionId = sessionId || currentSessionId;

      console.log('[RoleplayScreen] Session ended:', {
        duration,
        sessionId: effectiveSessionId,
        transcriptLength: transcript?.length || 0,
        messagesCount: messages?.length || 0,
        userMessages: messages?.filter(m => m.source === 'user').length || 0
      });

      // Close the voice assistant view
      setShowVoiceAssistant(false);

    // Save transcript and duration to database if we have a sessionId
    if (effectiveSessionId && transcript) {
      try {
        console.log('[RoleplayScreen] Saving transcript and duration to database...');
        const supabase = getSupabase();

        const { error: updateError } = await supabase
          .rpc('update_voice_session_transcript', {
            p_session_id: effectiveSessionId,
            p_duration_seconds: duration,
            p_raw_transcript: transcript
          });

        if (updateError) {
          console.error('[RoleplayScreen] Error saving transcript:', updateError);
        } else {
          console.log('[RoleplayScreen] Transcript and duration saved successfully');
        }

        // Create evaluation and trigger n8n webhook for processing
        if (userId) {
          try {
            // Generate unique request ID (UUID v4)
            const requestId = crypto.randomUUID();
            console.log('[RoleplayScreen] Creating evaluation with request_id:', requestId);

            // Create evaluation record
            const { error: evalError } = await supabase
              .rpc('create_evaluation', {
                p_request_id: requestId,
                p_user_id: userId,
                p_session_id: effectiveSessionId
              });

            if (evalError) {
              console.error('[RoleplayScreen] Error creating evaluation:', evalError);
            } else {
              console.log('[RoleplayScreen] Evaluation record created successfully');

              // Send to n8n webhook for processing
              const n8nWebhookUrl = process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL;

              if (n8nWebhookUrl && n8nWebhookUrl.length > 0 && !n8nWebhookUrl.includes('placeholder')) {
                const userMessageCount = messages?.filter(m => m.source === 'user').length || 0;

                const webhookPayload = {
                  request_id: requestId,
                  session_id: effectiveSessionId,
                  transcript: transcript,
                  messages: messages || [],
                  metadata: {
                    user_id: userId,
                    profile: questionnaireData?.practiceStartProfile,
                    scenario: currentScenario?.scenarioName,
                    scenario_code: currentScenario?.scenarioCode,
                    objectives: currentScenario?.objectives,
                    difficulty: currentScenario?.difficultyLevel,
                    duration_seconds: duration,
                    message_count: messages?.length || 0,
                    user_message_count: userMessageCount,
                    ai_message_count: messages?.filter(m => m.source === 'ai').length || 0
                  }
                };

                console.log('[RoleplayScreen] Sending to n8n webhook:', {
                  url: n8nWebhookUrl,
                  requestId,
                  userMessageCount
                });

                fetch(n8nWebhookUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify(webhookPayload)
                }).then(async response => {
                  console.log('[RoleplayScreen] n8n webhook response:', {
                    status: response.status,
                    ok: response.ok
                  });

                  if (!response.ok) {
                    console.error('[RoleplayScreen] n8n webhook error:', response.status);
                  }
                }).catch(error => {
                  console.error('[RoleplayScreen] Error sending to n8n:', error);
                });
              } else {
                console.log('[RoleplayScreen] n8n webhook not configured, evaluation will remain pending');
              }
            }
          } catch (error) {
            console.error('[RoleplayScreen] Error in evaluation creation:', error);
          }
        }
        } catch (error) {
          console.error('[RoleplayScreen] Error in save transcript:', error);
        }
      }

      // Navigate to results screen with sessionId (nested in Sessions tab)
      if (effectiveSessionId) {
        // Navigate to Sessions tab, then to SessionResults screen
        navigation.navigate('Sessions' as never, {
          screen: 'SessionResults',
          params: { sessionId: effectiveSessionId }
        } as never);

        // Refresh sessions list in background
        setTimeout(() => {
          loadRecentSessions();
        }, 1000);
      } else {
        // Fallback: if no sessionId, show error and go back to main view
        console.error('[RoleplayScreen] No sessionId available for results');
        Alert.alert(
          'Sesión Completada',
          'Tu sesión ha finalizado, pero no se pudo cargar los resultados. Verifica tu historial.',
          [{ text: 'Entendido' }]
        );

        // Refresh sessions list
        setTimeout(() => {
          loadRecentSessions();
        }, 1000);
      }

      // Reset session ID
      setCurrentSessionId(null);
    } finally {
      // Reset processing flag to allow future session ends
      setTimeout(() => {
        isProcessingEndRef.current = false;
      }, 2000);
    }
  };

  // If showing voice assistant, render it fullscreen
  if (showVoiceAssistant && currentScenario) {
    return (
      <SafeAreaView style={styles.container}>
        <MobileVoiceAssistant
          selectedProfile={currentScenario.profile}
          userName={userName}
          userId={userId || undefined}
          scenarioCode={currentScenario.scenarioCode}
          scenarioName={currentScenario.scenarioName}
          sessionId={currentSessionId || undefined}
          onSessionStart={handleSessionStart}
          onSessionEnd={handleSessionEnd}
          profileDescription={currentScenario.profileDescription}
          difficultyLevel={currentScenario.difficultyLevel}
          difficultyName={currentScenario.difficultyName}
          difficultyMood={currentScenario.difficultyMood}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading State */}
        {initialLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando escenario...</Text>
          </View>
        )}

        {/* Current Scenario */}
        {!initialLoading && currentScenario && (
          <Card
            title={`Escenario ${currentScenario.scenarioOrder}: ${currentScenario.scenarioName}`}
            style={styles.scenariosCard}
          >
            <View style={styles.scenarioDetails}>
              <View style={styles.scenarioInfo}>
                <Text style={styles.scenarioDescription}>
                  {currentScenario.objectives || currentScenario.userInstructions || 'Practica con este escenario'}
                </Text>
                <View style={styles.scenarioStats}>
                  <Text style={styles.scenarioStat}>👤 Perfil: {currentScenario.profile}</Text>
                  <Text style={styles.scenarioStat}>⭐ Nivel: {currentScenario.difficultyName}</Text>
                  {currentScenario.isLocked && (
                    <Text style={styles.lockedBadge}>🔒 Bloqueado</Text>
                  )}
                </View>
              </View>
              <Button
                title={loading ? "..." : "Iniciar Práctica"}
                variant="primary"
                onPress={handleStartPractice}
                disabled={loading || currentScenario.isLocked}
              />
            </View>
          </Card>
        )}

        {/* No scenario available */}
        {!initialLoading && !currentScenario && (
          <Card title="Sala de Entrenamiento" style={styles.scenariosCard}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No hay escenarios disponibles
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Contacta al administrador para configurar tu progreso
              </Text>
            </View>
          </Card>
        )}

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Preparando entrenamiento...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  scenariosCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  scenarioDetails: {
    gap: 16,
  },
  scenarioInfo: {
    marginBottom: 12,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  scenarioDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  scenarioStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scenarioStat: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  lockedBadge: {
    fontSize: 13,
    color: colors.warning || '#F59E0B',
    fontWeight: '600',
  },
  progressCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressItemLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  progressDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  scorePass: {
    backgroundColor: colors.success || colors.primary,
  },
  scoreFail: {
    backgroundColor: colors.error || '#EF4444',
  },
  statusBadge: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusCompleted: {
    color: colors.success || colors.primary,
  },
  statusPending: {
    color: colors.warning || '#F59E0B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    opacity: 0.7,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: colors.text,
    marginTop: 16,
    fontSize: 16,
  },
});