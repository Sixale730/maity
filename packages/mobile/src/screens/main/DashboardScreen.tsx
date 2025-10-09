import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Text, ProgressBar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { useUserRole, AuthService } from '@maity/shared'; // Temporarily disabled
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme';

const { width: screenWidth } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const { t } = useLanguage();
  // Temporarily comment out useUserRole to fix hook error
  // const { userRole, userProfile, loading: roleLoading, refreshRole } = useUserRole();
  const userProfile = { name: 'Usuario', email: 'user@example.com', role: 'user' };
  const roleLoading = false;
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    sessionsCompleted: 12,
    sessionsScheduled: 3,
    attendanceRate: 85,
    averageMood: 7.5,
    currentStreak: 5,
    totalXP: 2450,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // await refreshRole(); // Temporarily disabled
    // Refresh dashboard data here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (roleLoading && !userProfile) {
    return (
      <View style={styles.centerContainer}>
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{userProfile?.name || 'Usuario'}</Text>
          <Text style={styles.subtitle}>{t('dashboard.user.description')}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{dashboardData.sessionsCompleted}</Text>
              <Text style={styles.statLabel}>{t('dashboard.user.sessions_completed')}</Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{dashboardData.currentStreak}</Text>
              <Text style={styles.statLabel}>Racha de días</Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{dashboardData.totalXP}</Text>
              <Text style={styles.statLabel}>XP Total</Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{dashboardData.attendanceRate}%</Text>
              <Text style={styles.statLabel}>{t('dashboard.user.attendance_rate')}</Text>
            </View>
          </Card>
        </View>

        {/* Progress Section */}
        <Card
          title="Mi Progreso Semanal"
          subtitle="Has completado 3 de 5 sesiones esta semana"
          style={styles.progressCard}
        >
          <ProgressBar
            progress={0.6}
            color={colors.primary}
            style={styles.progressBar}
          />
          <View style={styles.progressStats}>
            <Text style={styles.progressText}>60% Completado</Text>
            <Text style={styles.progressText}>2 sesiones restantes</Text>
          </View>
        </Card>

        {/* Upcoming Sessions */}
        <Card
          title={t('dashboard.user.upcoming')}
          style={styles.sessionsCard}
        >
          <View style={styles.sessionItem}>
            <View style={styles.sessionTime}>
              <Text style={styles.sessionDay}>HOY</Text>
              <Text style={styles.sessionHour}>15:00</Text>
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle}>Sesión de Coaching</Text>
              <Text style={styles.sessionDescription}>
                Comunicación efectiva en equipos remotos
              </Text>
              <View style={styles.sessionChips}>
                <Chip compact style={styles.chip}>30 min</Chip>
                <Chip compact style={styles.chip}>Zoom</Chip>
              </View>
            </View>
          </View>

          <View style={[styles.sessionItem, styles.sessionItemLast]}>
            <View style={styles.sessionTime}>
              <Text style={styles.sessionDay}>MAÑ</Text>
              <Text style={styles.sessionHour}>10:00</Text>
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle}>Role Play</Text>
              <Text style={styles.sessionDescription}>
                Práctica de negociación con cliente
              </Text>
              <View style={styles.sessionChips}>
                <Chip compact style={styles.chip}>45 min</Chip>
                <Chip compact style={styles.chip}>IA</Chip>
              </View>
            </View>
          </View>
        </Card>

        {/* Achievements */}
        <Card
          title="Logros Recientes"
          style={styles.achievementsCard}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.achievementsScroll}
          >
            <View style={styles.achievement}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementEmoji}>🔥</Text>
              </View>
              <Text style={styles.achievementName}>En Racha</Text>
              <Text style={styles.achievementDesc}>5 días</Text>
            </View>

            <View style={styles.achievement}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementEmoji}>⭐</Text>
              </View>
              <Text style={styles.achievementName}>Novato</Text>
              <Text style={styles.achievementDesc}>10 sesiones</Text>
            </View>

            <View style={styles.achievement}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementEmoji}>💬</Text>
              </View>
              <Text style={styles.achievementName}>Comunicador</Text>
              <Text style={styles.achievementDesc}>Nivel 2</Text>
            </View>

            <View style={styles.achievement}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementEmoji}>🎯</Text>
              </View>
              <Text style={styles.achievementName}>Objetivo</Text>
              <Text style={styles.achievementDesc}>Completado</Text>
            </View>
          </ScrollView>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  welcomeSection: {
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  statCard: {
    width: (screenWidth - 48) / 2,
    margin: 4,
    padding: 0,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  progressCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 12,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sessionsCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sessionItem: {
    flexDirection: 'row',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sessionItemLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  sessionTime: {
    width: 60,
    alignItems: 'center',
    marginRight: 16,
  },
  sessionDay: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sessionHour: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 2,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  sessionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sessionChips: {
    flexDirection: 'row',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    backgroundColor: colors.background,
  },
  achievementsCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  achievementsScroll: {
    marginTop: 8,
  },
  achievement: {
    alignItems: 'center',
    marginRight: 24,
    width: 80,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementEmoji: {
    fontSize: 28,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});