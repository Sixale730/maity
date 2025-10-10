import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Chip, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme';
import { getSupabase } from '@maity/shared';

type SessionsStackParamList = {
  SessionsList: undefined;
  SessionResults: { sessionId: string };
};

type SessionsScreenNavigationProp = NativeStackNavigationProp<SessionsStackParamList, 'SessionsList'>;

interface VoiceSession {
  id: string;
  profile_name: string;
  scenario_name: string;
  status: string;
  score: number | null;
  passed: boolean | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
}

export const SessionsScreen: React.FC = () => {
  const { t } = useLanguage();
  const navigation = useNavigation<SessionsScreenNavigationProp>();
  const [filter, setFilter] = useState<'all' | 'completed'>('all');
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      const { data, error: fetchError } = await supabase
        .rpc('get_user_sessions_history', { p_auth_id: user.id });

      if (fetchError) {
        console.error('Error fetching sessions:', fetchError);
        setError('No se pudieron cargar las sesiones');
        return;
      }

      setSessions(data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Ocurrió un error al cargar las sesiones');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    if (filter === 'completed') return session.status === 'completed';
    return true;
  });

  const getStatusBadge = (status: string, passed: boolean | null) => {
    if (status === 'completed' && passed !== null) {
      return {
        label: passed ? 'Aprobado' : 'No Aprobado',
        color: passed ? '#10B981' : '#EF4444'
      };
    } else if (status === 'in_progress') {
      return { label: 'En Progreso', color: '#F59E0B' };
    } else if (status === 'abandoned') {
      return { label: 'Abandonado', color: '#6B7280' };
    }
    return { label: 'Pendiente', color: colors.textSecondary };
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return colors.textSecondary;
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSessions}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('nav.sessions')}</Text>
          <Text style={styles.subtitle}>
            Tu historial completo de sesiones
          </Text>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={styles.filterChip}
          >
            Todas ({sessions.length})
          </Chip>
          <Chip
            selected={filter === 'completed'}
            onPress={() => setFilter('completed')}
            style={styles.filterChip}
          >
            Completadas ({sessions.filter(s => s.status === 'completed').length})
          </Chip>
        </ScrollView>

        {/* Sessions List */}
        <View style={styles.sessionsList}>
          {filteredSessions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No hay sesiones registradas</Text>
              <Text style={styles.emptyText}>
                Comienza tu primera práctica de roleplay
              </Text>
            </Card>
          ) : (
            filteredSessions.map((session) => {
              const statusBadge = getStatusBadge(session.status, session.passed);

              return (
                <TouchableOpacity
                  key={session.id}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('SessionResults', { sessionId: session.id })}
                >
                  <Card style={styles.sessionCard}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionTitle}>
                        {session.scenario_name || 'Sesión de Práctica'}
                      </Text>
                      {session.score !== null && (
                        <View style={styles.scoreContainer}>
                          <Text
                            style={[
                              styles.scoreValue,
                              { color: getScoreColor(session.score) }
                            ]}
                          >
                            {session.score}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.sessionMeta}>
                      <View
                        style={[
                          styles.typeIndicator,
                          { backgroundColor: colors.primary }
                        ]}
                      />
                      <Text style={styles.sessionType}>
                        {session.profile_name}
                      </Text>
                    </View>

                    <View style={styles.sessionDetails}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>📅</Text>
                        <Text style={styles.detailText}>
                          {formatDate(session.started_at)}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>⏱</Text>
                        <Text style={styles.detailText}>
                          {formatDuration(session.duration_seconds)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.sessionFooter}>
                      <Chip
                        compact
                        style={[
                          styles.statusChip,
                          { backgroundColor: statusBadge.color + '20' }
                        ]}
                        textStyle={{ color: statusBadge.color }}
                      >
                        {statusBadge.label}
                      </Chip>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  sessionsList: {
    paddingHorizontal: 20,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sessionCard: {
    marginBottom: 16,
    padding: 0,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  sessionType: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scoreContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sessionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  sessionDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sessionFooter: {
    flexDirection: 'row',
  },
  statusChip: {
    paddingHorizontal: 8,
  },
});