import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button as PaperButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme';

export const RoleplayScreen: React.FC = () => {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('nav.roleplay')}</Text>
          <Text style={styles.subtitle}>
            Practica con escenarios realistas impulsados por IA
          </Text>
        </View>

        {/* Active Scenarios */}
        <Card
          title="Escenarios Disponibles"
          style={styles.scenariosCard}
        >
          <View style={styles.scenarioItem}>
            <View style={styles.scenarioInfo}>
              <Text style={styles.scenarioTitle}>Negociación con Cliente</Text>
              <Text style={styles.scenarioDescription}>
                Practica técnicas de negociación efectiva
              </Text>
              <View style={styles.scenarioStats}>
                <Text style={styles.scenarioStat}>⏱ 15-20 min</Text>
                <Text style={styles.scenarioStat}>⭐ Intermedio</Text>
              </View>
            </View>
            <Button
              title="Iniciar"
              variant="primary"
              onPress={() => console.log('Start scenario')}
            />
          </View>

          <View style={styles.scenarioItem}>
            <View style={styles.scenarioInfo}>
              <Text style={styles.scenarioTitle}>Feedback Constructivo</Text>
              <Text style={styles.scenarioDescription}>
                Aprende a dar retroalimentación efectiva
              </Text>
              <View style={styles.scenarioStats}>
                <Text style={styles.scenarioStat}>⏱ 10-15 min</Text>
                <Text style={styles.scenarioStat}>⭐ Básico</Text>
              </View>
            </View>
            <Button
              title="Iniciar"
              variant="primary"
              onPress={() => console.log('Start scenario')}
            />
          </View>

          <View style={[styles.scenarioItem, styles.scenarioItemLast]}>
            <View style={styles.scenarioInfo}>
              <Text style={styles.scenarioTitle}>Presentación Ejecutiva</Text>
              <Text style={styles.scenarioDescription}>
                Mejora tus habilidades de presentación
              </Text>
              <View style={styles.scenarioStats}>
                <Text style={styles.scenarioStat}>⏱ 20-25 min</Text>
                <Text style={styles.scenarioStat}>⭐ Avanzado</Text>
              </View>
            </View>
            <Button
              title="Iniciar"
              variant="primary"
              onPress={() => console.log('Start scenario')}
            />
          </View>
        </Card>

        {/* Recent Progress */}
        <Card
          title="Tu Progreso Reciente"
          style={styles.progressCard}
        >
          <View style={styles.progressItem}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Comunicación Asertiva</Text>
              <Text style={styles.progressDate}>Completado hace 2 días</Text>
            </View>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>85</Text>
            </View>
          </View>

          <View style={[styles.progressItem, styles.progressItemLast]}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Gestión de Conflictos</Text>
              <Text style={styles.progressDate}>Completado hace 5 días</Text>
            </View>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>78</Text>
            </View>
          </View>
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
  scenarioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scenarioItemLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  scenarioInfo: {
    flex: 1,
    marginRight: 12,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  scenarioDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scenarioStats: {
    flexDirection: 'row',
    marginTop: 8,
  },
  scenarioStat: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 12,
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
});