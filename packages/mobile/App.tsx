import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeSupabase, AuthService } from '@maity/shared';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { theme } from './src/theme';

// Initialize Supabase for mobile
const supabase = initializeSupabase('mobile');

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('App mounted, checking auth state...');
    // Check initial auth state
    checkAuthState();

    // Listen to auth changes
    const { data: authListener } = AuthService.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session);
      setIsAuthenticated(!!session);
      if (event === 'SIGNED_OUT') {
        // Handle sign out
        setIsAuthenticated(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('Checking auth state...');
      const session = await AuthService.getSession();
      console.log('Session found:', !!session);
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      console.log('Auth check complete, setting loading to false');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#94A3B8' }}>Cargando...</Text>
      </View>
    );
  }

  console.log('Rendering app with auth:', isAuthenticated);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <LanguageProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <RootNavigator isAuthenticated={isAuthenticated} />
          </NavigationContainer>
        </LanguageProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}