import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, Avatar, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { AuthService } from '../../lib/supabase/auth';
import { getSupabase } from '../../lib/supabase/client';
import { colors } from '../../theme';
import type { NavigationProp } from '@react-navigation/native';

interface DrawerItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isActive?: boolean;
  isDanger?: boolean;
}

const DrawerItem: React.FC<DrawerItemProps> = ({
  icon,
  label,
  onPress,
  isActive = false,
  isDanger = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.drawerItem,
        isActive && styles.drawerItemActive,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={22}
        color={isDanger ? colors.error : isActive ? colors.secondary : colors.textSecondary}
        style={styles.drawerItemIcon}
      />
      <Text
        style={[
          styles.drawerItemLabel,
          isActive && styles.drawerItemLabelActive,
          isDanger && styles.drawerItemLabelDanger,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

interface DrawerContentProps {
  navigation: NavigationProp<any>;
  currentRoute: string;
  onClose: () => void;
}

export const DrawerContent: React.FC<DrawerContentProps> = ({
  navigation,
  currentRoute,
  onClose,
}) => {
  const { t } = useLanguage();
  const [userName, setUserName] = useState<string>('Usuario');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('id, name, nickname, email')
        .eq('auth_id', user.id)
        .single();

      if (userData) {
        const displayName =
          userData.name?.trim() ||
          userData.nickname?.trim() ||
          userData.email?.split('@')[0] ||
          'Usuario';
        setUserName(displayName);
        setUserEmail(userData.email || user.email || '');
      }
    } catch (error) {
      console.error('[DrawerContent] Error loading user:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('nav.logout'),
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('nav.logout'),
          style: 'destructive',
          onPress: async () => {
            await AuthService.signOut();
            onClose();
          },
        },
      ]
    );
  };

  const navigateTo = (screenName: string) => {
    navigation.navigate(screenName as never);
    onClose();
  };

  const initials = userName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with user info */}
        <View style={styles.header}>
          <Avatar.Text
            size={64}
            label={initials}
            style={styles.avatar}
            color="white"
            labelStyle={{ color: 'white' }}
          />
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        <Divider style={styles.divider} />

        {/* Navigation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NAVEGACIÓN</Text>
          <DrawerItem
            icon="home"
            label={t('nav.dashboard')}
            onPress={() => navigateTo('Dashboard')}
            isActive={currentRoute === 'Dashboard'}
          />
          <DrawerItem
            icon="play-circle"
            label={t('nav.roleplay')}
            onPress={() => navigateTo('Roleplay')}
            isActive={currentRoute === 'Roleplay'}
          />
          <DrawerItem
            icon="megaphone"
            label={t('nav.coach')}
            onPress={() => navigateTo('Coach')}
            isActive={currentRoute === 'Coach'}
          />
          <DrawerItem
            icon="calendar"
            label={t('nav.sessions')}
            onPress={() => navigateTo('Sessions')}
            isActive={currentRoute === 'Sessions'}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONFIGURACIÓN</Text>
          <DrawerItem
            icon="person"
            label={t('nav.profile')}
            onPress={() => navigateTo('Profile')}
          />
          <DrawerItem
            icon="bluetooth"
            label="Conectar Omi"
            onPress={() => navigateTo('OmiConnection')}
          />
          <DrawerItem
            icon="globe"
            label={t('nav.language')}
            onPress={() => navigateTo('Language')}
          />
          <DrawerItem
            icon="notifications"
            label={t('nav.notifications')}
            onPress={() => navigateTo('Notifications')}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AYUDA</Text>
          <DrawerItem
            icon="help-circle"
            label={t('nav.helpCenter')}
            onPress={() => navigateTo('HelpCenter')}
          />
          <DrawerItem
            icon="document-text"
            label={t('nav.terms')}
            onPress={() => navigateTo('Terms')}
          />
          <DrawerItem
            icon="shield-checkmark"
            label={t('nav.privacy')}
            onPress={() => navigateTo('Privacy')}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Logout */}
        <View style={styles.section}>
          <DrawerItem
            icon="log-out"
            label={t('nav.logout')}
            onPress={handleLogout}
            isDanger
          />
        </View>
      </ScrollView>

      {/* Footer with version */}
      <View style={styles.footer}>
        <Text style={styles.version}>{t('nav.version')} 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingTop: 0,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  avatar: {
    backgroundColor: colors.secondary,
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  drawerItemActive: {
    backgroundColor: 'rgba(72, 93, 244, 0.15)', // colors.secondary with opacity
  },
  drawerItemIcon: {
    marginRight: 16,
  },
  drawerItemLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  drawerItemLabelActive: {
    color: colors.secondary,
    fontWeight: '600',
  },
  drawerItemLabelDanger: {
    color: colors.error,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  version: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
