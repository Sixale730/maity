import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Text, ActivityIndicator, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme';
import { getSupabase } from '@maity/shared';

interface SessionData {
  id: string;
  profile_name: string;
  scenario_name: string;
  objectives: string | null;
  score: number | null;
  passed: boolean | null;
  duration_seconds: number | null;
  started_at: string;
  ended_at: string | null;
  processed_feedback: any;
  status: string;
  raw_transcript: string | null;
}

type SessionsStackParamList = {
  SessionsList: undefined;
  SessionResults: { sessionId: string };
};

type SessionResultsScreenRouteProp = RouteProp<SessionsStackParamList, 'SessionResults'>;
type SessionResultsScreenNavigationProp = NativeStackNavigationProp<SessionsStackParamList, 'SessionResults'>;

export const SessionResultsScreen: React.FC = () => {
  const route = useRoute<SessionResultsScreenRouteProp>();
  const navigation = useNavigation<SessionResultsScreenNavigationProp>();
  const { sessionId } = route.params;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      const { data: sessions, error: fetchError } = await supabase
        .rpc('get_user_sessions_history', { p_auth_id: user.id });

      if (fetchError) {
        console.error('Error fetching session:', fetchError);
        setError('No se pudo cargar la sesión');
        return;
      }

      const session = sessions?.find((s: any) => s.id === sessionId);

      if (!session) {
        setError('Sesión no encontrada');
        return;
      }

      setSessionData(session);
    } catch (err) {
      console.error('Error:', err);
      setError('Ocurrió un error al cargar la sesión');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return colors.textSecondary;
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const calculateUserWordCount = (transcript: string | null) => {
    if (!transcript) return 0;

    const userLines = transcript
      .split('\n')
      .filter(line => line.trim().startsWith('Usuario:'))
      .map(line => line.replace('Usuario:', '').trim())
      .join(' ');

    return userLines
      ? userLines.trim().split(/\s+/).filter(word => word.length > 0).length
      : 0;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando resultados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !sessionData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Sesión no encontrada'}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.backButtonText}>Volver al Historial</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isProcessing = sessionData.status === 'evaluating';
  const evaluation = sessionData.processed_feedback;
  const userWordCount = calculateUserWordCount(sessionData.raw_transcript);

  // Extract metrics from evaluation
  const metrics = {
    clarity: evaluation?.dimension_scores?.clarity ?? evaluation?.clarity ?? null,
    structure: evaluation?.dimension_scores?.structure ?? evaluation?.structure ?? null,
    connection: evaluation?.dimension_scores?.connection ?? evaluation?.connection ?? null,
    influence: evaluation?.dimension_scores?.influence ?? evaluation?.influence ?? null
  };

  // Extract feedback
  const fortalezas = evaluation?.Fortalezas || null;
  const errores = evaluation?.Errores || null;
  const recomendaciones = evaluation?.Recomendaciones || null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resultados</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Resultados de la Sesión</Text>
          <Text style={styles.subtitle}>
            {sessionData.scenario_name} • {sessionData.profile_name}
          </Text>
        </View>

        {/* Score Card */}
        <Card style={[styles.scoreCard, { borderColor: isProcessing ? '#3B82F6' : getScoreColor(sessionData.score) }]}>
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.processingTitle}>Procesando evaluación...</Text>
              <Text style={styles.processingText}>
                Nuestro agente AI está analizando tu conversación
              </Text>
            </View>
          ) : (
            <View style={styles.scoreContainer}>
              <Ionicons
                name={sessionData.passed ? "trophy" : "alert-circle"}
                size={48}
                color={sessionData.passed ? '#10B981' : '#EF4444'}
              />
              <View style={styles.scoreValue}>
                <Text style={[styles.scoreNumber, { color: getScoreColor(sessionData.score) }]}>
                  {sessionData.score || '—'}
                </Text>
                <Text style={styles.scoreTotal}>/100</Text>
              </View>
              <Text style={[
                styles.scoreStatus,
                { color: sessionData.passed ? '#10B981' : '#EF4444' }
              ]}>
                {sessionData.passed
                  ? '¡Aprobado!'
                  : sessionData.passed === false
                  ? 'Necesitas 60 puntos para aprobar'
                  : 'Evaluación pendiente'
                }
              </Text>
            </View>
          )}
        </Card>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          {/* Words Card */}
          <Card style={[styles.statCard, styles.wordsCard]}>
            <Ionicons name="document-text" size={32} color="#A78BFA" />
            <Text style={styles.statValue}>{userWordCount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>palabras</Text>
          </Card>

          {/* Duration Card */}
          <Card style={[styles.statCard, styles.durationCard]}>
            <Ionicons name="time" size={32} color="#60A5FA" />
            <Text style={styles.statValue}>{formatDuration(sessionData.duration_seconds)}</Text>
            <Text style={styles.statLabel}>minutos</Text>
          </Card>
        </View>

        {/* Objectives Card */}
        {sessionData.objectives && (
          <Card style={styles.objectivesCard}>
            <View style={styles.objectivesHeader}>
              <Ionicons name="flag" size={24} color="#10B981" />
              <Text style={styles.objectivesTitle}>Objetivo del Escenario</Text>
            </View>
            <Text style={styles.objectivesText}>{sessionData.objectives}</Text>
          </Card>
        )}

        {/* Metrics Section */}
        {!isProcessing && metrics.clarity !== null && (
          <Card style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>Evaluación de Habilidades</Text>
            <View style={styles.metricsContainer}>
              {[
                { key: 'clarity', label: 'Claridad', value: metrics.clarity, color: '#60A5FA' },
                { key: 'structure', label: 'Estructura', value: metrics.structure, color: '#10B981' },
                { key: 'connection', label: 'Alineación Emocional', value: metrics.connection, color: '#F59E0B' },
                { key: 'influence', label: 'Influencia', value: metrics.influence, color: '#EF4444' }
              ].map((metric) => (
                <View key={metric.key} style={styles.metricItem}>
                  <View style={styles.metricHeader}>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    <Text style={[styles.metricValue, { color: metric.color }]}>
                      {Math.round(metric.value || 0)}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={(metric.value || 0) / 100}
                    color={metric.color}
                    style={styles.progressBar}
                  />
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Feedback Section */}
        {!isProcessing && (fortalezas || errores || recomendaciones) && (
          <Card style={styles.feedbackCard}>
            <Text style={styles.sectionTitle}>Feedback del Agente</Text>

            {/* Fortalezas */}
            {fortalezas && (
              <View style={styles.feedbackSection}>
                <Text style={[styles.feedbackTitle, { color: '#10B981' }]}>
                  Fortalezas
                </Text>
                {fortalezas.Cita && (
                  <View style={[styles.quote, { borderLeftColor: '#10B981' }]}>
                    <Text style={styles.quoteText}>{fortalezas.Cita}</Text>
                  </View>
                )}
                {fortalezas.Feedback && (
                  <Text style={styles.feedbackText}>{fortalezas.Feedback}</Text>
                )}
              </View>
            )}

            {/* Errores */}
            {errores && (
              <View style={styles.feedbackSection}>
                <Text style={[styles.feedbackTitle, { color: '#EF4444' }]}>
                  Errores
                </Text>
                {errores.Cita && (
                  <View style={[styles.quote, { borderLeftColor: '#EF4444' }]}>
                    <Text style={styles.quoteText}>{errores.Cita}</Text>
                  </View>
                )}
                {errores.Feedback && (
                  <Text style={styles.feedbackText}>{errores.Feedback}</Text>
                )}
              </View>
            )}

            {/* Recomendaciones */}
            {recomendaciones && (
              <View style={styles.feedbackSection}>
                <Text style={[styles.feedbackTitle, { color: '#F59E0B' }]}>
                  Recomendaciones
                </Text>
                {recomendaciones.Cita && (
                  <View style={[styles.quote, { borderLeftColor: '#F59E0B' }]}>
                    <Text style={styles.quoteText}>{recomendaciones.Cita}</Text>
                  </View>
                )}
                {recomendaciones.Feedback && (
                  <Text style={styles.feedbackText}>{recomendaciones.Feedback}</Text>
                )}
              </View>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        <Card style={styles.actionsCard}>
          {sessionData.raw_transcript && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowTranscript(true)}
            >
              <Ionicons name="document-text-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Ver Transcripción</Text>
            </TouchableOpacity>
          )}
        </Card>
      </ScrollView>

      {/* Transcript Modal */}
      <Modal
        visible={showTranscript}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTranscript(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Transcripción</Text>
            <TouchableOpacity onPress={() => setShowTranscript(false)}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.transcriptScroll}>
            <Text style={styles.transcriptText}>
              {sessionData?.raw_transcript || 'No hay transcripción disponible'}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  scoreCard: {
    marginBottom: 16,
    padding: 24,
    borderWidth: 2,
  },
  processingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  processingText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    gap: 12,
  },
  scoreValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  scoreTotal: {
    fontSize: 28,
    color: colors.textSecondary,
  },
  scoreStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  wordsCard: {
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  durationCard: {
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  objectivesCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  objectivesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  objectivesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  objectivesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  metricsCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  metricsContainer: {
    gap: 16,
  },
  metricItem: {
    gap: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  feedbackCard: {
    marginBottom: 16,
    padding: 16,
  },
  feedbackSection: {
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  quote: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  feedbackText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actionsCard: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  transcriptScroll: {
    flex: 1,
    padding: 20,
  },
  transcriptText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
});
