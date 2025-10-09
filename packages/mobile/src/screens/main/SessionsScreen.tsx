import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Chip, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme';

interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: 'coaching' | 'roleplay' | 'evaluation';
  status: 'completed' | 'upcoming' | 'cancelled';
  score?: number;
}

export const SessionsScreen: React.FC = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  const sessions: Session[] = [
    {
      id: '1',
      title: 'Sesión de Coaching Personal',
      date: '2024-01-15',
      time: '15:00',
      duration: 30,
      type: 'coaching',
      status: 'upcoming',
    },
    {
      id: '2',
      title: 'Role Play: Negociación',
      date: '2024-01-14',
      time: '10:00',
      duration: 45,
      type: 'roleplay',
      status: 'completed',
      score: 85,
    },
    {
      id: '3',
      title: 'Evaluación 360°',
      date: '2024-01-12',
      time: '14:00',
      duration: 60,
      type: 'evaluation',
      status: 'completed',
      score: 92,
    },
    {
      id: '4',
      title: 'Sesión de Coaching Grupal',
      date: '2024-01-10',
      time: '16:00',
      duration: 45,
      type: 'coaching',
      status: 'completed',
    },
  ];

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return session.status === 'upcoming';
    if (filter === 'completed') return session.status === 'completed';
    return true;
  });

  const getTypeColor = (type: Session['type']) => {
    switch (type) {
      case 'coaching':
        return colors.primary;
      case 'roleplay':
        return colors.secondary;
      case 'evaluation':
        return colors.tertiary;
      default:
        return colors.textSecondary;
    }
  };

  const getTypeLabel = (type: Session['type']) => {
    switch (type) {
      case 'coaching':
        return 'Coaching';
      case 'roleplay':
        return 'Role Play';
      case 'evaluation':
        return 'Evaluación';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: Session['status']) => {
    switch (status) {
      case 'upcoming':
        return 'Próxima';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
            Todas
          </Chip>
          <Chip
            selected={filter === 'upcoming'}
            onPress={() => setFilter('upcoming')}
            style={styles.filterChip}
          >
            Próximas
          </Chip>
          <Chip
            selected={filter === 'completed'}
            onPress={() => setFilter('completed')}
            style={styles.filterChip}
          >
            Completadas
          </Chip>
        </ScrollView>

        {/* Sessions List */}
        <View style={styles.sessionsList}>
          {filteredSessions.map((session) => (
            <TouchableOpacity key={session.id} activeOpacity={0.7}>
              <Card style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionTypeContainer}>
                    <View
                      style={[
                        styles.typeIndicator,
                        { backgroundColor: getTypeColor(session.type) },
                      ]}
                    />
                    <Text style={styles.sessionType}>
                      {getTypeLabel(session.type)}
                    </Text>
                  </View>
                  {session.score && (
                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreLabel}>Score:</Text>
                      <Text style={styles.scoreValue}>{session.score}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.sessionTitle}>{session.title}</Text>

                <View style={styles.sessionDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>📅</Text>
                    <Text style={styles.detailText}>{session.date}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>🕐</Text>
                    <Text style={styles.detailText}>{session.time}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>⏱</Text>
                    <Text style={styles.detailText}>{session.duration} min</Text>
                  </View>
                </View>

                <View style={styles.sessionFooter}>
                  <Chip
                    compact
                    style={[
                      styles.statusChip,
                      session.status === 'completed' && styles.completedChip,
                      session.status === 'upcoming' && styles.upcomingChip,
                    ]}
                  >
                    {getStatusLabel(session.status)}
                  </Chip>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => console.log('Schedule new session')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100, // Space for FAB
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
  sessionCard: {
    marginBottom: 16,
    padding: 0,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    textTransform: 'uppercase',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 4,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
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
    backgroundColor: colors.background,
  },
  completedChip: {
    backgroundColor: '#D1FAE5',
  },
  upcomingChip: {
    backgroundColor: '#DBEAFE',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});