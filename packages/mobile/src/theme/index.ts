import { MD3DarkTheme as DefaultTheme } from 'react-native-paper';

// MAITY color palette - Dark Mode with Neon
const colors = {
  primary: '#8B5CF6', // Morado neón principal
  secondary: '#F97316', // Naranja neón
  tertiary: '#06B6D4', // Cyan neón
  background: '#0F172A', // Fondo muy oscuro
  surface: '#1E293B', // Superficie oscura
  surfaceVariant: '#334155', // Superficie variante
  text: '#F8FAFC', // Texto blanco
  textSecondary: '#94A3B8', // Texto secundario gris claro
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  border: '#334155', // Borde oscuro
  gradient1: '#8B5CF6', // Para gradientes
  gradient2: '#EC4899', // Rosa para gradientes
  neonGlow: '#8B5CF6', // Color para efectos de brillo
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onSurface: colors.text,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
  },
};

export { colors };