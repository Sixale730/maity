import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthService } from '../../../lib/supabase/auth';
// import { useLanguage } from '../../../contexts/LanguageContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { colors } from '../../../theme';
import { AuthStackParamList } from '../../../navigation/AuthNavigator';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  // const { t } = useLanguage();
  const t = (key: string) => key; // Temporary placeholder

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string>('');

  const validateEmail = () => {
    if (!email) {
      setError('El correo es requerido');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor ingresa un correo válido');
      return false;
    }
    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const { error } = await AuthService.resetPassword(email);

      if (error) {
        Alert.alert('Error', error.message || 'Error al enviar el correo');
      } else {
        setEmailSent(true);
        Alert.alert(
          'Correo Enviado',
          'Te hemos enviado un enlace para restablecer tu contraseña. Por favor revisa tu correo.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Recuperar Contraseña</Text>

            {!emailSent ? (
              <>
                <Text style={styles.description}>
                  Ingresa tu correo electrónico y te enviaremos un enlace para
                  restablecer tu contraseña.
                </Text>

                <Input
                  label={t('auth.email')}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  placeholder="tu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={error}
                  containerStyle={styles.input}
                />

                <Button
                  title={loading ? 'Enviando...' : 'Enviar Enlace'}
                  onPress={handleResetPassword}
                  disabled={loading}
                  fullWidth
                  style={styles.submitButton}
                />
              </>
            ) : (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>
                  ✓ Correo enviado exitosamente
                </Text>
                <Text style={styles.successDescription}>
                  Revisa tu bandeja de entrada y sigue las instrucciones para
                  restablecer tu contraseña.
                </Text>
              </View>
            )}

            <Button
              title="Volver al Login"
              variant="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.backButton}
            />
          </View>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  backButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  successContainer: {
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    marginVertical: 16,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
    marginBottom: 8,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});