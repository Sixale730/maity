import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { RadarChart } from '../../../components/charts/RadarChart';
import { colors } from '../../../theme';
import { supabase } from '@maity/shared';
import {
  parseEvaluationData,
  prepareRadarData,
  prepareSubdimensionsRadarData,
  formatDuration,
  calculateWordCount,
  getScoreColor,
  getScoreBg
} from '../../../utils/sessionResults';
import {
  DIMENSION_DESCRIPTIONS,
  SUBDIMENSION_DESCRIPTIONS,
  DIMENSION_NAMES,
  DIMENSION_COLORS
} from '../../../constants/dimensions';

type SessionsStackParamList = {
  SessionsList: undefined;
  SessionResults: { sessionId: string };
};

type SessionResultsRouteProp = RouteProp<SessionsStackParamList, 'SessionResults'>;

interface SessionData {
  id: string;
  profile_name: string;
  scenario_name: string;
  scenario_code: string;
  objectives: string | null;
  difficulty_level: number;
  score: number | null;
  passed: boolean | null;
  min_score_to_pass: number;
  processed_feedback: any;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  raw_transcript: string | null;
}

export const SessionResultsScreen: React.FC = () => {
  const route = useRoute<SessionResultsRouteProp>();
  const navigation = useNavigation();
  const { sessionId } = route.params;

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transcriptVisible, setTranscriptVisible] = useState(false);
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionData();
  }, [sessionId]);

  // Poll for updates if session is still processing
  useEffect(() => {
    if (!session || !isProcessing) return;

    console.log('[SessionResultsScreen] Starting polling for processing session');
    const pollInterval = setInterval(() => {
      console.log('[SessionResultsScreen] Polling for updates...');
      fetchSessionData(false); // Don't show loading spinner on polls
    }, 5000); // Poll every 5 seconds

    return () => {
      console.log('[SessionResultsScreen] Stopping polling');
      clearInterval(pollInterval);
    };
  }, [session?.status, isProcessing]);

  const fetchSessionData = async (isInitialLoad: boolean = true) => {
    try {
      // Only show loading spinner on initial load
      if (isInitialLoad) {
        setLoading(true);
      }
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      const { data, error: fetchError } = await supabase
        .rpc('get_user_sessions_history', { p_auth_id: user.id });

      if (fetchError) {
        console.error('Error fetching session:', fetchError);
        setError('No se pudo cargar la sesión');
        return;
      }

      // Find the specific session
      const sessionData = data?.find((s: any) => s.id === sessionId);

      if (!sessionData) {
        setError('Sesión no encontrada');
        return;
      }

      console.log('[SessionResultsScreen] Session data updated:', {
        status: sessionData.status,
        hasScore: sessionData.score !== null,
        hasFeedback: !!sessionData.processed_feedback
      });

      setSession(sessionData);
    } catch (err) {
      console.error('Error:', err);
      setError('Ocurrió un error al cargar la sesión');
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  // Parse evaluation data
  const evaluation = useMemo(() => {
    if (!session) return null;
    return parseEvaluationData(session.processed_feedback, session.score);
  }, [session]);

  // Prepare radar chart data
  const radarData = useMemo(() => {
    if (!evaluation) return [];
    return prepareRadarData(evaluation.dimensionScores);
  }, [evaluation]);

  const radarSubdimensionsData = useMemo(() => {
    if (!evaluation?.subdimensionData) return [];
    return prepareSubdimensionsRadarData(evaluation.subdimensionData);
  }, [evaluation]);

  // Calculate metrics
  const userWordCount = useMemo(() => {
    if (!session?.raw_transcript) return 0;
    return calculateWordCount(session.raw_transcript);
  }, [session]);

  const handleRetry = () => {
    // Navigate back to roleplay screen
    navigation.navigate('Roleplay' as never);
  };

  const handleViewTranscript = () => {
    setTranscriptVisible(true);
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

  if (error || !session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error || 'Sesión no encontrada'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isProcessing = session.status !== 'completed';
  const displayScore = evaluation?.calculatedScore || session.score || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Resultados de la Sesión</Text>
            <Text style={styles.subtitle}>
              {session.scenario_name} • {session.profile_name}
            </Text>
          </View>
        </View>

        {/* Score Card */}
        <Card
          style={{
            ...styles.scoreCard,
            backgroundColor: isProcessing ? 'rgba(59, 130, 246, 0.1)' : getScoreBg(displayScore)
          }}
        >
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <Ionicons name="hourglass-outline" size={48} color="#3b82f6" />
              <Text style={styles.processingTitle}>Procesando evaluación...</Text>
              <Text style={styles.processingText}>
                Nuestro agente AI está analizando tu conversación
              </Text>
              <ActivityIndicator size="small" color="#3b82f6" style={{ marginTop: 12 }} />
            </View>
          ) : (
            <>
              <View style={styles.scoreIconContainer}>
                {session.passed ? (
                  <Ionicons name="trophy" size={48} color="#10B981" />
                ) : (
                  <Ionicons name="alert-circle" size={48} color="#EF4444" />
                )}
              </View>
              <Text style={[styles.scoreValue, { color: getScoreColor(displayScore) }]}>
                {displayScore}
                <Text style={styles.scoreMax}>/100</Text>
              </Text>
              <Text style={[styles.scoreStatus, { color: session.passed ? '#10B981' : '#EF4444' }]}>
                {session.passed
                  ? '¡Aprobado!'
                  : `Necesitas ${session.min_score_to_pass} puntos para aprobar`}
              </Text>
              <Text style={styles.scoreNote}>
                Score mínimo: {session.min_score_to_pass}
              </Text>
            </>
          )}
        </Card>

        {/* Metrics Cards */}
        <View style={styles.metricsRow}>
          <Card style={{ ...styles.metricCard, ...styles.wordsCard }}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="document-text" size={32} color="#a78bfa" />
            </View>
            <View style={styles.metricTextContainer}>
              <Text style={styles.metricLabel}>Palabras Pronunciadas</Text>
              <Text style={[styles.metricValue, { color: '#a78bfa' }]}>
                {userWordCount.toLocaleString()}
              </Text>
            </View>
          </Card>

          <Card style={{ ...styles.metricCard, ...styles.durationCard }}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="time" size={32} color="#60a5fa" />
            </View>
            <View style={styles.metricTextContainer}>
              <Text style={styles.metricLabel}>Duración</Text>
              <Text style={[styles.metricValue, { color: '#60a5fa' }]}>
                {session.duration_seconds ? formatDuration(session.duration_seconds) : 'N/A'}
              </Text>
            </View>
          </Card>
        </View>

        {/* Objectives Section */}
        {session.objectives && (
          <Card style={styles.objectivesCard}>
            <View style={styles.objectivesHeader}>
              <Ionicons name="flag" size={24} color="#10b981" />
              <Text style={styles.objectivesTitle}>Objetivo del Escenario</Text>
            </View>
            <Text style={styles.objectivesText}>{session.objectives}</Text>

            {/* Objective Feedback */}
            {!isProcessing && evaluation?.objectiveFeedback && (
              <View style={styles.objectiveFeedbackContainer}>
                <View style={styles.objectiveFeedbackHeader}>
                  {session.passed ? (
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  ) : (
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                  )}
                  <Text style={[
                    styles.objectiveFeedbackTitle,
                    { color: session.passed ? '#10b981' : '#ef4444' }
                  ]}>
                    {session.passed ? 'Objetivo Cumplido' : 'Objetivo No Cumplido'}
                  </Text>
                </View>
                <Text style={styles.objectiveFeedbackText}>
                  {evaluation.objectiveFeedback}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Radar Charts */}
        {!isProcessing && radarData.length > 0 && (
          <Card style={styles.radarCard}>
            <Text style={styles.sectionTitle}>Evaluación 360° de Habilidades</Text>
            <Text style={styles.sectionSubtitle}>
              Visualización de tus competencias evaluadas
            </Text>

            <View style={styles.radarChartsContainer}>
              {/* Main Dimensions Chart */}
              <View style={styles.radarChartSection}>
                <Text style={styles.radarChartTitle}>Dimensiones Principales</Text>
                <RadarChart
                  data={radarData}
                  size={Dimensions.get('window').width - 80}
                  strokeColor="#3b82f6"
                  fillColor="#3b82f6"
                />
              </View>

              {/* Subdimensions Chart */}
              {radarSubdimensionsData.length > 0 && (
                <View style={styles.radarChartSection}>
                  <Text style={styles.radarChartTitle}>Subdimensiones Detalladas</Text>
                  <RadarChart
                    data={radarSubdimensionsData}
                    size={Dimensions.get('window').width - 80}
                    strokeColor="#10b981"
                    fillColor="#10b981"
                    fontSize={9}
                  />
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Dimensions Analysis */}
        {!isProcessing && evaluation && (
          <Card style={styles.dimensionsCard}>
            <View style={styles.dimensionsHeader}>
              <Ionicons name="analytics" size={24} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Análisis por Categoría</Text>
            </View>
            <Text style={styles.dimensionsSubtitle}>
              Toca cada dimensión para ver el desglose detallado
            </Text>

            <View style={styles.dimensionsList}>
              {Object.entries(evaluation.dimensionScores).map(([key, value]) => {
                const dimensionName = DIMENSION_NAMES[key as keyof typeof DIMENSION_NAMES];
                const dimensionColor = DIMENSION_COLORS[key as keyof typeof DIMENSION_COLORS];
                const dimensionKey = key;

                const subdimensionData =
                  key === 'clarity' ? evaluation.subdimensionData?.Claridad :
                  key === 'structure' ? evaluation.subdimensionData?.Estructura :
                  key === 'connection' ? evaluation.subdimensionData?.Alineacion_Emocional :
                  evaluation.subdimensionData?.Influencia;

                const isExpanded = expandedDimension === dimensionKey;
                const progressValue = value !== null ? value : 0;

                return (
                  <View key={key} style={styles.dimensionItem}>
                    <TouchableOpacity
                      style={styles.dimensionHeader}
                      onPress={() => setExpandedDimension(isExpanded ? null : dimensionKey)}
                    >
                      <View style={styles.dimensionHeaderContent}>
                        <View style={[styles.dimensionDot, { backgroundColor: dimensionColor }]} />
                        <View style={styles.dimensionInfo}>
                          <View style={styles.dimensionTitleRow}>
                            <Text style={styles.dimensionName}>{dimensionName}</Text>
                            <Text style={[styles.dimensionScore, { color: value ? getScoreColor(value) : colors.textSecondary }]}>
                              {value !== null ? `${Math.round(value)}/100` : '—'}
                            </Text>
                          </View>
                          <Text style={styles.dimensionDescription}>
                            {DIMENSION_DESCRIPTIONS[key as keyof typeof DIMENSION_DESCRIPTIONS]}
                          </Text>
                          <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: `${progressValue}%`, backgroundColor: dimensionColor }]} />
                          </View>
                        </View>
                        {subdimensionData && (
                          <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={colors.textSecondary}
                          />
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Subdimensions Breakdown */}
                    {isExpanded && subdimensionData && (
                      <View style={styles.subdimensionsContainer}>
                        <Text style={styles.subdimensionsLabel}>Subdimensiones evaluadas:</Text>
                        {Object.entries(subdimensionData).map(([subKey, subValue]) => {
                          const valueNum = parseFloat(String(subValue)) * 10; // 1-10 to 0-100
                          const description = SUBDIMENSION_DESCRIPTIONS[subKey] || '';
                          return (
                            <View key={subKey} style={styles.subdimensionItem}>
                              <View style={styles.subdimensionHeader}>
                                <View style={styles.subdimensionTextContainer}>
                                  <Text style={styles.subdimensionName}>
                                    {subKey.replace(/_/g, ' ')}
                                  </Text>
                                  {description && (
                                    <Text style={styles.subdimensionDescription}>{description}</Text>
                                  )}
                                </View>
                                <Text style={[styles.subdimensionScore, { color: dimensionColor }]}>
                                  {Math.round(valueNum)}/100
                                </Text>
                              </View>
                              <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBar, { width: `${valueNum}%`, backgroundColor: dimensionColor }]} />
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </Card>
        )}

        {/* Feedback Section */}
        {!isProcessing && evaluation && (
          <Card style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <Ionicons name="trending-up" size={24} color="#10b981" />
              <Text style={styles.sectionTitle}>Feedback del Agente</Text>
            </View>

            {/* Fortalezas */}
            {evaluation.fortalezas && (
              <View style={styles.feedbackSection}>
                <Text style={[styles.feedbackSectionTitle, { color: '#10b981' }]}>
                  Fortalezas
                </Text>
                {evaluation.fortalezas.Cita && (
                  <View style={[styles.quoteContainer, { borderLeftColor: '#10b981' }]}>
                    <Text style={styles.quoteText}>"{evaluation.fortalezas.Cita}"</Text>
                  </View>
                )}
                {evaluation.fortalezas.Feedback && (
                  <Text style={styles.feedbackText}>{evaluation.fortalezas.Feedback}</Text>
                )}
              </View>
            )}

            {/* Errores */}
            {evaluation.errores && (
              <View style={[styles.feedbackSection, styles.feedbackSectionBorder]}>
                <Text style={[styles.feedbackSectionTitle, { color: '#ef4444' }]}>
                  Errores
                </Text>
                {evaluation.errores.Cita && (
                  <View style={[styles.quoteContainer, { borderLeftColor: '#ef4444' }]}>
                    <Text style={styles.quoteText}>"{evaluation.errores.Cita}"</Text>
                  </View>
                )}
                {evaluation.errores.Feedback && (
                  <Text style={styles.feedbackText}>{evaluation.errores.Feedback}</Text>
                )}
              </View>
            )}

            {/* Recomendaciones */}
            {evaluation.recomendaciones && (
              <View style={[styles.feedbackSection, styles.feedbackSectionBorder]}>
                <Text style={[styles.feedbackSectionTitle, { color: '#f59e0b' }]}>
                  Recomendaciones
                </Text>
                {evaluation.recomendaciones.Cita && (
                  <View style={[styles.quoteContainer, { borderLeftColor: '#f59e0b' }]}>
                    <Text style={styles.quoteText}>"{evaluation.recomendaciones.Cita}"</Text>
                  </View>
                )}
                {evaluation.recomendaciones.Feedback && (
                  <Text style={styles.feedbackText}>{evaluation.recomendaciones.Feedback}</Text>
                )}
              </View>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        <Card style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={20} color={colors.text} />
            <Text style={styles.actionButtonText}>Repetir Escenario</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleViewTranscript}
          >
            <Ionicons name="document-text" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Ver Transcripción</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Transcript Modal */}
      <Modal
        visible={transcriptVisible}
        animationType="slide"
        onRequestClose={() => setTranscriptVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Transcripción</Text>
            <TouchableOpacity onPress={() => setTranscriptVisible(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.transcriptText}>
              {session.raw_transcript || 'No hay transcripción disponible'}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
    color: colors.error,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scoreCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3b82f6',
    marginTop: 16,
  },
  processingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  scoreIconContainer: {
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 32,
    color: colors.textSecondary,
  },
  scoreStatus: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  scoreNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    padding: 16,
  },
  wordsCard: {
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
  },
  durationCard: {
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
  },
  metricIconContainer: {
    marginBottom: 8,
  },
  metricTextContainer: {
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  objectivesCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  objectivesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  objectivesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  objectivesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  objectiveFeedbackContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.2)',
  },
  objectiveFeedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  objectiveFeedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  objectiveFeedbackText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  radarCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  radarChartsContainer: {
    gap: 24,
  },
  radarChartSection: {
    alignItems: 'center',
  },
  radarChartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  dimensionsCard: {
    padding: 16,
    marginBottom: 16,
  },
  dimensionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  dimensionsSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  dimensionsList: {
    gap: 12,
  },
  dimensionItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dimensionHeader: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  dimensionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dimensionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  dimensionInfo: {
    flex: 1,
    gap: 8,
  },
  dimensionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dimensionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dimensionScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  dimensionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  subdimensionsContainer: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  subdimensionsLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  subdimensionItem: {
    gap: 6,
  },
  subdimensionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  subdimensionTextContainer: {
    flex: 1,
  },
  subdimensionName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  subdimensionDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  subdimensionScore: {
    fontSize: 13,
    fontWeight: '600',
  },
  feedbackCard: {
    padding: 16,
    marginBottom: 16,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  feedbackSection: {
    marginBottom: 16,
  },
  feedbackSectionBorder: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  feedbackSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quoteContainer: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.text,
    lineHeight: 18,
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  transcriptText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
});
