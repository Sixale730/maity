import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@maity/shared';
import { AuthService } from './src/lib/supabase/auth';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { theme } from './src/theme';
import { ElevenLabsProvider } from '@elevenlabs/react-native';

const SESSION_KEY = 'maity_session';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('App mounted, checking auth state...');
    // Check initial auth state (including stored session)
    checkAuthState();

    // Listen to auth changes
    const { data: authListener } = AuthService.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, !!session);
      setIsAuthenticated(!!session);

      if (event === 'SIGNED_IN' && session) {
        // Save session to secure storage
        try {
          await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
          console.log('Session saved to secure storage');
        } catch (error) {
          console.error('Error saving session:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear session from storage
        setIsAuthenticated(false);
        try {
          await SecureStore.deleteItemAsync(SESSION_KEY);
          console.log('Session cleared from secure storage');
        } catch (error) {
          console.error('Error clearing session:', error);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('Checking auth state...');

      // First try to get current session
      let session = await AuthService.getSession();

      // If no active session, try to restore from storage
      if (!session) {
        try {
          const storedSession = await SecureStore.getItemAsync(SESSION_KEY);
          if (storedSession) {
            const parsedSession = JSON.parse(storedSession);
            // Attempt to restore the session
            const { data, error } = await supabase.auth.setSession({
              access_token: parsedSession.access_token,
              refresh_token: parsedSession.refresh_token,
            });
            if (!error && data.session) {
              session = data.session;
              console.log('Session restored from secure storage');
            } else {
              // If restore fails, clear invalid stored session
              await SecureStore.deleteItemAsync(SESSION_KEY);
              console.log('Stored session was invalid, cleared');
            }
          }
        } catch (error) {
          console.error('Error restoring session:', error);
        }
      }

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
    <ElevenLabsProvider>
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
    </ElevenLabsProvider>
  );
}