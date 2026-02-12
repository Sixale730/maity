import type { SkillTest, ArenaBadge } from '../types/skills-arena.types';

// =============================================================================
// TESTS CATALOG
// =============================================================================

export const TESTS_CATALOG: SkillTest[] = [
  // -----------------------------------------------------------------------------
  // TEST 1: MARCA PERSONAL
  // -----------------------------------------------------------------------------
  {
    id: 'personal-brand',
    slug: 'marca-personal',
    titleKey: 'skills_arena.tests.personal_brand.title',
    descriptionKey: 'skills_arena.tests.personal_brand.description',
    category: 'self-knowledge',
    difficulty: 'beginner',
    icon: '🎭',
    baseXP: 100,
    bonusXP: 10,
    firstAttemptBonus: 15,
    estimatedMinutes: 5,
    questionsCount: 10,
    color: '#9b4dca',
    badge: {
      id: 'badge-clear-identity',
      name: 'Identidad Clara',
      icon: '🎯',
      xp: 75,
    },
  },

  // -----------------------------------------------------------------------------
  // TEST 2: RUEDA DE LA VIDA
  // -----------------------------------------------------------------------------
  {
    id: 'wheel-of-life',
    slug: 'rueda-de-la-vida',
    titleKey: 'skills_arena.tests.wheel_of_life.title',
    descriptionKey: 'skills_arena.tests.wheel_of_life.description',
    category: 'balance',
    difficulty: 'intermediate',
    icon: '🎡',
    baseXP: 150,
    bonusXP: 25,
    firstAttemptBonus: 30,
    estimatedMinutes: 10,
    questionsCount: 8,
    color: '#1bea9a',
    badge: {
      id: 'badge-balanced-life',
      name: 'Vida Equilibrada',
      icon: '⚖️',
      xp: 75,
    },
  },

  // -----------------------------------------------------------------------------
  // TEST 3: ESCUCHA ACTIVA
  // -----------------------------------------------------------------------------
  {
    id: 'active-listening',
    slug: 'escucha-activa',
    titleKey: 'skills_arena.tests.active_listening.title',
    descriptionKey: 'skills_arena.tests.active_listening.description',
    category: 'communication',
    difficulty: 'intermediate',
    icon: '👂',
    baseXP: 120,
    bonusXP: 25,
    firstAttemptBonus: 30,
    estimatedMinutes: 8,
    questionsCount: 12,
    color: '#485df4',
    badge: {
      id: 'badge-attentive-ear',
      name: 'Oído Atento',
      icon: '👂',
      xp: 75,
    },
  },

  // -----------------------------------------------------------------------------
  // TEST 4: BLACK STORIES
  // -----------------------------------------------------------------------------
  {
    id: 'black-stories',
    slug: 'black-stories',
    titleKey: 'skills_arena.tests.black_stories.title',
    descriptionKey: 'skills_arena.tests.black_stories.description',
    category: 'communication',
    difficulty: 'beginner',
    icon: '🕵️',
    baseXP: 120,
    bonusXP: 15,
    firstAttemptBonus: 30,
    estimatedMinutes: 8,
    questionsCount: 10,
    color: '#d12dff',
    badge: {
      id: 'badge-detective',
      name: 'Detective',
      icon: '🔍',
      xp: 100,
    },
  },

  // -----------------------------------------------------------------------------
  // FUTURE TESTS (Locked)
  // -----------------------------------------------------------------------------
  {
    id: 'empathy-quotient',
    slug: 'cociente-empatia',
    titleKey: 'skills_arena.tests.empathy_quotient.title',
    descriptionKey: 'skills_arena.tests.empathy_quotient.description',
    category: 'emotional',
    difficulty: 'intermediate',
    icon: '❤️',
    baseXP: 130,
    bonusXP: 25,
    firstAttemptBonus: 30,
    estimatedMinutes: 10,
    questionsCount: 15,
    color: '#ef4444',
    prerequisites: ['active-listening'],
    badge: {
      id: 'badge-empath',
      name: 'Empata Natural',
      icon: '💝',
      xp: 100,
    },
  },
  {
    id: 'leadership-style',
    slug: 'estilo-liderazgo',
    titleKey: 'skills_arena.tests.leadership_style.title',
    descriptionKey: 'skills_arena.tests.leadership_style.description',
    category: 'leadership',
    difficulty: 'advanced',
    icon: '👑',
    baseXP: 200,
    bonusXP: 50,
    firstAttemptBonus: 50,
    estimatedMinutes: 15,
    questionsCount: 20,
    color: '#ff8c42',
    prerequisites: ['personal-brand', 'active-listening'],
    badge: {
      id: 'badge-leader',
      name: 'Líder Nato',
      icon: '👑',
      xp: 150,
    },
  },
  {
    id: 'conflict-resolution',
    slug: 'resolucion-conflictos',
    titleKey: 'skills_arena.tests.conflict_resolution.title',
    descriptionKey: 'skills_arena.tests.conflict_resolution.description',
    category: 'communication',
    difficulty: 'advanced',
    icon: '🤝',
    baseXP: 180,
    bonusXP: 50,
    firstAttemptBonus: 50,
    estimatedMinutes: 12,
    questionsCount: 16,
    color: '#485df4',
    prerequisites: ['empathy-quotient'],
    badge: {
      id: 'badge-mediator',
      name: 'Mediador',
      icon: '🕊️',
      xp: 125,
    },
  },
];

// =============================================================================
// BADGES CATALOG
// =============================================================================

export const ARENA_BADGES: ArenaBadge[] = [
  // Test completion badges
  {
    id: 'badge-clear-identity',
    name: 'Identidad Clara',
    icon: '🎯',
    unlocked: false,
    xp: 75,
    color: '#9b4dca',
  },
  {
    id: 'badge-balanced-life',
    name: 'Vida Equilibrada',
    icon: '⚖️',
    unlocked: false,
    xp: 75,
    color: '#1bea9a',
  },
  {
    id: 'badge-attentive-ear',
    name: 'Oído Atento',
    icon: '👂',
    unlocked: false,
    xp: 75,
    color: '#485df4',
  },
  {
    id: 'badge-detective',
    name: 'Detective',
    icon: '🔍',
    unlocked: false,
    xp: 100,
    color: '#d12dff',
  },
  // Achievement badges
  {
    id: 'badge-explorer',
    name: 'Explorador',
    icon: '🌟',
    unlocked: false,
    xp: 100,
    color: '#ffd93d',
  },
  {
    id: 'badge-perfectionist',
    name: 'Perfeccionista',
    icon: '💎',
    unlocked: false,
    xp: 100,
    color: '#00f5d4',
  },
  {
    id: 'badge-streak-7',
    name: 'Constante',
    icon: '🔥',
    unlocked: false,
    xp: 50,
    color: '#ff8c42',
  },
];

// =============================================================================
// XP CALCULATION HELPERS
// =============================================================================

export function calculateTestXP(
  test: SkillTest,
  scorePercentage: number,
  isFirstAttempt: boolean
): number {
  let xp = test.baseXP;

  // Bonus for perfect score
  if (scorePercentage === 100) {
    xp += test.bonusXP;
  }

  // First attempt bonus
  if (isFirstAttempt) {
    xp += test.firstAttemptBonus;
  }

  return xp;
}

export function getXPForLevel(level: number): number {
  // XP needed to reach each level (exponential curve)
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXP(totalXP: number): { level: number; progress: number } {
  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = getXPForLevel(level);

  while (totalXP >= xpForNextLevel) {
    level++;
    xpForCurrentLevel = xpForNextLevel;
    xpForNextLevel += getXPForLevel(level);
  }

  const progress = ((totalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  return { level, progress: Math.min(progress, 100) };
}
