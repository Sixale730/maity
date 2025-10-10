import { MD3DarkTheme as DefaultTheme } from 'react-native-paper';

// Paleta oficial de colores de MAITY
const colors = {
  // Colores principales oficiales
  primary: '#1bea9a',      // Verde brillante
  secondary: '#485df4',     // Azul vibrante
  accent: '#ff0050',        // Rosa/rojo vibrante

  // Colores de fondo
  background: '#000000',    // Negro puro
  surface: '#0F0F0F',       // Gris muy oscuro
  surfaceVariant: '#0F0F0F', // Gris oscuro

  // Colores de texto
  text: '#e7e7e9',          // Platino
  textSecondary: '#94A3B8', // Texto secundario gris claro

  // Estados
  error: '#ff0050',         // Rosa/rojo para errores
  success: '#1bea9a',       // Verde para éxito
  warning: '#F59E0B',       // Naranja para advertencias

  // Bordes
  border: '#333333',        // Borde oscuro

  // Para gradientes
  gradient1: '#1bea9a',     // Verde para gradientes
  gradient2: '#485df4',     // Azul para gradientes
  gradient3: '#ff0050',     // Rojo para gradientes

  // Para efectos neón
  neonGlow: '#1bea9a',      // Verde neón principal
  neonGlowSecondary: '#485df4', // Azul neón secundario
  neonGlowAccent: '#ff0050',    // Rojo neón acento
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.accent,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onSurface: colors.text,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
  },
};

export { colors };