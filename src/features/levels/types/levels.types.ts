/**
 * Level types for the user progression system
 */

export type LevelNumber = 1 | 2 | 3 | 4 | 5;

export interface LevelInfo {
  level: LevelNumber;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const LEVEL_NAMES = {
  1: 'Aprendiz',
  2: 'Promesa',
  3: 'Guerrero',
  4: 'Maestro',
  5: 'Leyenda',
} as const;
