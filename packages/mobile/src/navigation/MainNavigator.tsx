import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { CoachScreen } from '../screens/main/CoachScreen';
import { RoleplayScreen } from '../screens/main/RoleplayScreen';
import { SessionsNavigator } from './SessionsNavigator';
import { useLanguage } from '../contexts/LanguageContext';
import { colors } from '../theme';

export type MainTabParamList = {
  Dashboard: undefined;
  Coach: undefined;
  Roleplay: undefined;
  Sessions: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  const { t } = useLanguage();

  return (
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
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
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
        options={{ title: 'Coach' }}
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
  );
};