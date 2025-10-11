import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthService } from '../../lib/supabase/auth';
// import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { GoogleIcon } from '../../components/icons/GoogleIcon';
import { MicrosoftIcon } from '../../components/icons/MicrosoftIcon';
import { Logo } from '../../components/ui/Logo';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  // const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Correo inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await AuthService.signIn({ email, password });

      if (error) {
        Alert.alert('Error', error.message || 'Error al iniciar sesión');
      } else if (data.user) {
        // Navigation will be handled automatically by auth state change
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await AuthService.signUp({ email, password });

      if (error) {
        Alert.alert('Error', error.message || 'Error al crear cuenta');
      } else if (data.user) {
        Alert.alert('Éxito', 'Cuenta creada exitosamente. Por favor verifica tu email.');
        setIsLogin(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      console.log('[LoginScreen] Starting Google OAuth...');
      const { data, error } = await AuthService.signInWithOAuth('google');

      if (error) {
        console.error('[LoginScreen] Google OAuth error:', error);
        if (error.message.includes('cancelled')) {
          // User cancelled, don't show error
          console.log('[LoginScreen] User cancelled Google login');
        } else {
          Alert.alert('Error', error.message || 'Error al iniciar sesión con Google');
        }
      } else if (data) {
        console.log('[LoginScreen] Google OAuth successful');
        // Navigation will be handled automatically by auth state change
      }
    } catch (error) {
      console.error('[LoginScreen] Unexpected Google OAuth error:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    try {
      console.log('[LoginScreen] Starting Microsoft/Azure OAuth...');
      const { data, error } = await AuthService.signInWithOAuth('azure');

      if (error) {
        console.error('[LoginScreen] Microsoft OAuth error:', error);
        if (error.message.includes('cancelled')) {
          // User cancelled, don't show error
          console.log('[LoginScreen] User cancelled Microsoft login');
        } else {
          Alert.alert('Error', error.message || 'Error al iniciar sesión con Microsoft');
        }
      } else if (data) {
        console.log('[LoginScreen] Microsoft OAuth successful');
        // Navigation will be handled automatically by auth state change
      }
    } catch (error) {
      console.error('[LoginScreen] Unexpected Microsoft OAuth error:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a1a', '#000000', '#000000']}
      style={styles.gradient}
      locations={[0, 0.5, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Logo width={100} height={100} />
            </View>

            {/* Form Card */}
            <View style={styles.formContainer}>
              <Text style={styles.title}>
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </Text>
              <Text style={styles.subtitle}>
                {isLogin
                  ? 'Accede a tu cuenta para continuar'
                  : 'Crea tu cuenta para comenzar tu transformación'
                }
              </Text>

              {/* OAuth Buttons primero (como en web) */}
              <View style={styles.oauthContainer}>
                <TouchableOpacity
                  onPress={handleGoogleLogin}
                  disabled={loading}
                  style={styles.oauthButton}
                  activeOpacity={0.8}
                >
                  <View style={styles.oauthContent}>
                    <GoogleIcon width={20} height={20} />
                    <Text style={styles.oauthText}>Continuar con Google</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleMicrosoftLogin}
                  disabled={loading}
                  style={styles.oauthButton}
                  activeOpacity={0.8}
                >
                  <View style={styles.oauthContent}>
                    <MicrosoftIcon width={20} height={20} />
                    <Text style={styles.oauthText}>Continuar con Microsoft</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Separador */}
              <View style={styles.dividerContainer}>
                <LinearGradient
                  colors={['transparent', `${colors.primary}33`, 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dividerGradient}
                />
                <Text style={styles.dividerText}>O continúa con email</Text>
                <LinearGradient
                  colors={['transparent', `${colors.primary}33`, 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dividerGradient}
                />
              </View>

              {/* Formulario */}
              <Input
                label="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
                containerStyle={styles.input}
              />

              <Input
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                error={errors.password}
                containerStyle={styles.input}
              />

              <Button
                title={loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
                onPress={isLogin ? handleLogin : handleRegister}
                disabled={loading}
                fullWidth
                gradient
                gradientColors={
                  isLogin
                    ? [colors.gradient1, colors.gradient2]
                    : [colors.gradient3, colors.gradient2]
                }
                style={styles.loginButton}
              />

              {isLogin && (
                <Button
                  title="¿Olvidaste tu contraseña?"
                  variant="text"
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={styles.forgotButton}
                />
              )}

              {/* Toggle Login/Register */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>
                  {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                </Text>
                <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                  <Text style={styles.registerLink}>
                    {isLogin ? 'Regístrate' : 'Inicia sesión'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  oauthContainer: {
    marginBottom: 0,
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
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerGradient: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  oauthButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border || '#333',
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  oauthContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oauthText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 6,
  },
  registerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});