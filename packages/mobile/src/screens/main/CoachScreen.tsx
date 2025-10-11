import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors } from '../../theme';
import { getSupabase } from '../../lib/supabase/client';
import { MobileVoiceAssistantSVG } from '../../components/roleplay/MobileVoiceAssistantSVG';

export const CoachScreen: React.FC = () => {
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Usuario');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
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
        setUserId(userData.id);
        const displayName =
          userData.name?.trim() ||
          userData.nickname?.trim() ||
          userData.email?.split('@')[0] ||
          'Usuario';
        setUserName(displayName);
      }
    } catch (error) {
      console.error('[CoachScreen] Error loading user:', error);
    }
  };

  const handleSessionStart = async (): Promise<string | null> => {
    // Simple version without database session creation
    // Just return a mock session ID for testing
    const mockSessionId = `coach-${Date.now()}`;
    console.log('[CoachScreen] Mock session created:', mockSessionId);
    return mockSessionId;
  };

  const handleSessionEnd = async (
    transcript: string,
    duration: number,
    sessionId?: string
  ) => {
    console.log('[CoachScreen] Session ended:', { transcript: transcript.length, duration, sessionId });

    Alert.alert(
      'Sesión Completada',
      `Tu práctica de ${duration}s ha finalizado.`,
      [{ text: 'Entendido' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <MobileVoiceAssistantSVG
        selectedProfile="CTO"
        userName={userName}
        userId={userId || undefined}
        scenarioCode="coach_practice"
        scenarioName="Práctica con Coach"
        onSessionStart={handleSessionStart}
        onSessionEnd={handleSessionEnd}
        profileDescription="Coach de desarrollo personal"
        difficultyLevel={1}
        difficultyName="Fácil"
        difficultyMood="receptivo"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    opacity: 0.7,
  },
});
