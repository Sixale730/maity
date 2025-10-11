import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors } from '../../theme';

interface UnderConstructionScreenProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const UnderConstructionScreen: React.FC<UnderConstructionScreenProps> = ({
  title,
  description,
  icon = 'construct',
}) => {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name={icon} size={80} color={colors.textSecondary} style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
        <View style={styles.badge}>
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <Text style={styles.badgeText}>{t('common.comingSoon')}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    marginBottom: 24,
    opacity: 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 234, 154, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
});
