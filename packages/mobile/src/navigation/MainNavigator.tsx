import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { CoachScreen } from '../screens/main/CoachScreen';
import { RoleplayScreen } from '../screens/main/RoleplayScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { SessionsNavigator } from './SessionsNavigator';
import { LanguageScreen } from '../screens/settings/LanguageScreen';
import { NotificationsScreen } from '../screens/settings/NotificationsScreen';
import { HelpCenterScreen } from '../screens/help/HelpCenterScreen';
import { TermsScreen } from '../screens/help/TermsScreen';
import { PrivacyScreen } from '../screens/help/PrivacyScreen';
import OmiConnectionScreen from '../screens/main/OmiConnectionScreen';
import OmiVADTestScreen from '../screens/main/OmiVADTestScreen';
import { useLanguage } from '../contexts/LanguageContext';
import { DrawerModal } from '../components/navigation/DrawerModal';
import { DrawerContent } from '../components/navigation/DrawerContent';
import { colors } from '../theme';

export type MainTabParamList = {
  Dashboard: undefined;
  Coach: undefined;
  Roleplay: undefined;
  Sessions: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
  Language: undefined;
  Notifications: undefined;
  HelpCenter: undefined;
  Terms: undefined;
  Privacy: undefined;
  OmiConnection: undefined;
  OmiVADTest: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

const MainTabs: React.FC = () => {
  const { t } = useLanguage();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Coach') {
            iconName = focused ? 'megaphone' : 'megaphone-outline';
          } else if (route.name === 'Roleplay') {
            iconName = focused ? 'play-circle' : 'play-circle-outline';
          } else if (route.name === 'Sessions') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.secondary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={openDrawer}
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
        ),
      })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: t('nav.dashboard') }}
        />
        <Tab.Screen
          name="Coach"
          component={CoachScreen}
          options={{ title: t('nav.coach') }}
        />
        <Tab.Screen
          name="Roleplay"
          component={RoleplayScreen}
          options={{ title: t('nav.roleplay') }}
        />
        <Tab.Screen
          name="Sessions"
          component={SessionsNavigator}
          options={{ title: t('nav.sessions') }}
        />
      </Tab.Navigator>

      <DrawerModal visible={drawerVisible} onClose={closeDrawer}>
        <DrawerContent
          navigation={navigation}
          currentRoute={route.name}
          onClose={closeDrawer}
        />
      </DrawerModal>
    </>
  );
};

export const MainNavigator: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.secondary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('nav.profile') }}
      />
      <Stack.Screen
        name="Language"
        component={LanguageScreen}
        options={{ title: t('nav.language') }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: t('nav.notifications') }}
      />
      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{ title: t('nav.helpCenter') }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ title: t('nav.terms') }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: t('nav.privacy') }}
      />
      <Stack.Screen
        name="OmiConnection"
        component={OmiConnectionScreen}
        options={{ title: 'Conectar Omi' }}
      />
      <Stack.Screen
        name="OmiVADTest"
        component={OmiVADTestScreen}
        options={{ title: 'Omi VAD Test' }}
      />
    </Stack.Navigator>
  );
};
