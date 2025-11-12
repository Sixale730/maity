/**
 * Helper functions for the level system
 */

import { LevelInfo, LevelNumber, LEVEL_NAMES } from '../types/levels.types';

export const LEVELS_DATA: Record<LevelNumber, LevelInfo> = {
  1: {
    level: 1,
    name: LEVEL_NAMES[1],
    icon: '🌱',
    color: 'text-green-500',
    description: 'Estás comenzando tu viaje de desarrollo. ¡Cada paso cuenta!',
  },
  2: {
    level: 2,
    name: LEVEL_NAMES[2],
    icon: '⭐',
    color: 'text-yellow-500',
    description: 'Muestras potencial y progreso constante.',
  },
  3: {
    level: 3,
    name: LEVEL_NAMES[3],
    icon: '⚔️',
    color: 'text-orange-500',
    description: 'Enfrentas desafíos con valentía y determinación.',
  },
  4: {
    level: 4,
    name: LEVEL_NAMES[4],
    icon: '👑',
    color: 'text-purple-500',
    description: 'Has alcanzado un nivel de excelencia notable.',
  },
  5: {
    level: 5,
    name: LEVEL_NAMES[5],
    icon: '🏆',
    color: 'text-amber-500',
    description: '¡Eres una leyenda! Tu dominio es inspirador.',
  },
};

/**
 * Get level information by level number
 */
export function getLevelInfo(level: number): LevelInfo {
  // Ensure level is between 1 and 5
  const validLevel = Math.max(1, Math.min(5, level)) as LevelNumber;
  return LEVELS_DATA[validLevel];
}

/**
 * Get all levels as an array
 */
export function getAllLevels(): LevelInfo[] {
  return Object.values(LEVELS_DATA);
}

/**
 * Get level name by number
 */
export function getLevelName(level: number): string {
  const validLevel = Math.max(1, Math.min(5, level)) as LevelNumber;
  return LEVEL_NAMES[validLevel];
}
