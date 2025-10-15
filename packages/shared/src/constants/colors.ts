// Paleta oficial de colores de Maity
export const MAITY_COLORS = {
  // Colores principales
  primary: '#1bea9a',      // Verde brillante
  secondary: '#485df4',     // Azul vibrante
  accent: '#ff0050',        // Rosa/rojo vibrante

  // Colores de fondo
  black: '#000000',         // Negro puro
  darkGray: '#0F0F0F',      // Gris muy oscuro
  lightGray: '#e7e7e9',     // Platino

  // Variantes con alpha para efectos
  primaryAlpha: (alpha: number) => `rgba(27, 234, 154, ${alpha})`,
  secondaryAlpha: (alpha: number) => `rgba(72, 93, 244, ${alpha})`,
  accentAlpha: (alpha: number) => `rgba(255, 0, 80, ${alpha})`,
  blackAlpha: (alpha: number) => `rgba(0, 0, 0, ${alpha})`,
  darkGrayAlpha: (alpha: number) => `rgba(15, 15, 15, ${alpha})`,
  lightGrayAlpha: (alpha: number) => `rgba(231, 231, 233, ${alpha})`,

  // Estados específicos para el agente
  listening: '#1bea9a',     // Verde brillante cuando escucha
  speaking: '#485df4',      // Azul cuando habla
  idle: '#e7e7e9',         // Gris cuando está inactivo
  error: '#ff0050',        // Rosa/rojo para errores
} as const;

export type MaityColorKey = keyof typeof MAITY_COLORS;