import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SessionsScreen, SessionResultsScreen } from '../features/roleplay';

export type SessionsStackParamList = {
  SessionsList: undefined;
  SessionResults: { sessionId: string };
};

const Stack = createNativeStackNavigator<SessionsStackParamList>();

export const SessionsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SessionsList" component={SessionsScreen} />
      <Stack.Screen name="SessionResults" component={SessionResultsScreen} />
    </Stack.Navigator>
  );
};
