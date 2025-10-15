import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Avatar,
  List,
  Switch,
  Divider,
  RadioButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '../../../lib/supabase/auth';
// import { useUserRole } from '@maity/shared'; // Temporarily disabled
import { useLanguage } from '../../../contexts/LanguageContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { colors } from '../../../theme';

export const ProfileScreen: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  // const { userProfile } = useUserRole(); // Temporarily disabled
  const userProfile = { name: 'Usuario', email: 'user@example.com', role: 'user' };
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await AuthService.signOut();
          },
        },
      ]
    );
  };

  const handleLanguageChange = () => {
    setLanguage(selectedLanguage);
    setLanguageModalVisible(false);
  };

  const initials = userProfile?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <Avatar.Text
            size={80}
            label={initials}
            style={styles.avatar}
            color="white"
            labelStyle={{ color: 'white' }}
          />
          <Text style={styles.name}>{userProfile?.name || 'Usuario'}</Text>
          <Text style={styles.email}>{userProfile?.email || ''}</Text>
          <Text style={styles.role}>
            {userProfile?.role === 'admin'
              ? 'Administrador'
              : userProfile?.role === 'manager'
              ? 'Manager'
              : 'Usuario'}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Sesiones</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>2,450</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Racha</Text>
          </View>
        </View>

        {/* Settings */}
        <Card style={styles.settingsCard}>
          <List.Section>
            <List.Item
              title="Idioma"
              description={language === 'es' ? 'Español' : 'English'}
              left={(props) => <List.Icon {...props} icon="translate" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => setLanguageModalVisible(true)}
            />
            <Divider />
            <List.Item
              title="Notificaciones"
              description={notificationsEnabled ? 'Activadas' : 'Desactivadas'}
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  color={colors.primary}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Cambiar Contraseña"
              left={(props) => <List.Icon {...props} icon="lock" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => console.log('Change password')}
            />
          </List.Section>
        </Card>

        {/* Support */}
        <Card style={styles.supportCard}>
          <List.Section>
            <List.Item
              title="Centro de Ayuda"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => console.log('Help center')}
            />
            <Divider />
            <List.Item
              title="Términos y Condiciones"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => console.log('Terms')}
            />
            <Divider />
            <List.Item
              title="Política de Privacidad"
              left={(props) => <List.Icon {...props} icon="shield-lock" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => console.log('Privacy')}
            />
          </List.Section>
        </Card>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title={t('nav.logout')}
            variant="outline"
            fullWidth
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>

        {/* App Version */}
        <Text style={styles.version}>Versión 1.0.0</Text>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={languageModalVisible}
        onDismiss={() => setLanguageModalVisible(false)}
        title="Seleccionar Idioma"
        actions={[
          {
            label: 'Cancelar',
            onPress: () => setLanguageModalVisible(false),
            variant: 'text',
          },
          {
            label: 'Guardar',
            onPress: handleLanguageChange,
            variant: 'primary',
          },
        ]}
      >
        <RadioButton.Group
          onValueChange={(value) => setSelectedLanguage(value as any)}
          value={selectedLanguage}
        >
          <RadioButton.Item label="Español" value="es" />
          <RadioButton.Item label="English" value="en" />
        </RadioButton.Group>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: colors.surface,
  },
  avatar: {
    backgroundColor: colors.primary,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  role: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  settingsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 0,
  },
  supportCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 0,
  },
  logoutContainer: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  logoutButton: {
    borderColor: colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 20,
  },
});