import { useMemo } from 'react';
import { TESTS_CATALOG, ARENA_BADGES, getLevelFromXP } from '../data/tests-catalog';
import type {
  SkillsArenaData,
  UserTestProgress,
  TestStatus,
  TestCategory,
} from '../types/skills-arena.types';

// =============================================================================
// MOCK DATA - Replace with real data fetching later
// =============================================================================

const MOCK_USER_PROGRESS: Record<string, UserTestProgress> = {
  'personal-brand': {
    testId: 'personal-brand',
    status: 'available',
    progress: 0,
    attempts: 0,
    xpEarned: 0,
  },
  'wheel-of-life': {
    testId: 'wheel-of-life',
    status: 'available',
    progress: 0,
    attempts: 0,
    xpEarned: 0,
  },
  'active-listening': {
    testId: 'active-listening',
    status: 'available',
    progress: 0,
    attempts: 0,
    xpEarned: 0,
  },
  'empathy-quotient': {
    testId: 'empathy-quotient',
    status: 'locked',
    progress: 0,
    attempts: 0,
    xpEarned: 0,
  },
  'leadership-style': {
    testId: 'leadership-style',
    status: 'locked',
    progress: 0,
    attempts: 0,
    xpEarned: 0,
  },
  'conflict-resolution': {
    testId: 'conflict-resolution',
    status: 'locked',
    progress: 0,
    attempts: 0,
    xpEarned: 0,
  },
};

// =============================================================================
// HOOK
// =============================================================================

export function useSkillsArena(categoryFilter?: TestCategory): SkillsArenaData {
  const data = useMemo(() => {
    // Calculate user progress based on mock data
    const userProgress = { ...MOCK_USER_PROGRESS };

    // Calculate total XP
    const totalXP = Object.values(userProgress).reduce(
      (sum, p) => sum + p.xpEarned,
      0
    );

    // Calculate completed tests
    const testsCompleted = Object.values(userProgress).filter(
      (p) => p.status === 'completed'
    ).length;

    // Get level info
    const { level, progress: levelProgress } = getLevelFromXP(totalXP);

    // Build badges with unlock status
    const badges = ARENA_BADGES.map((badge) => ({
      ...badge,
      // Check if badge is unlocked based on test completion
      unlocked: Object.values(userProgress).some(
        (p) =>
          p.status === 'completed' &&
          TESTS_CATALOG.find((t) => t.id === p.testId)?.badge?.id === badge.id
      ),
    }));

    // Filter tests by category if specified
    const tests = categoryFilter
      ? TESTS_CATALOG.filter((t) => t.category === categoryFilter)
      : TESTS_CATALOG;

    // Featured test: first available test that hasn't been completed
    const featuredTest = TESTS_CATALOG.find(
      (t) => userProgress[t.id]?.status === 'available'
    );

    return {
      stats: {
        totalXP,
        testsCompleted,
        testsTotal: TESTS_CATALOG.length,
        currentStreak: 5, // Mock streak
        badges,
        level,
        levelProgress,
      },
      tests,
      userProgress,
      featuredTestId: featuredTest?.id || TESTS_CATALOG[0].id,
      loading: false,
    };
  }, [categoryFilter]);

  return data;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getTestStatus(
  testId: string,
  userProgress: Record<string, UserTestProgress>,
  tests: typeof TESTS_CATALOG
): TestStatus {
  const progress = userProgress[testId];
  if (!progress) return 'locked';

  // Check if prerequisites are met
  const test = tests.find((t) => t.id === testId);
  if (test?.prerequisites) {
    const allPrereqsMet = test.prerequisites.every(
      (prereqId) => userProgress[prereqId]?.status === 'completed'
    );
    if (!allPrereqsMet) return 'locked';
  }

  return progress.status;
}

export function isTestAvailable(
  testId: string,
  userProgress: Record<string, UserTestProgress>,
  tests: typeof TESTS_CATALOG
): boolean {
  const status = getTestStatus(testId, userProgress, tests);
  return status === 'available' || status === 'in_progress';
}
