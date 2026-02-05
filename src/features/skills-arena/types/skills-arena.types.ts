// Skills Arena Types

// =============================================================================
// RESOURCE TYPES (Educational Resources from AI Resources)
// =============================================================================

export type ResourceType = 'article' | 'video' | 'tool' | 'guide' | 'course' | 'external';

export type ResourceCategory = TestCategory | 'general';

export interface ArenaResource {
  id: string;
  title: string;
  description: string | null;
  url: string;
  icon: string;           // Icon name (brain, sparkles, book-open, etc.)
  color: string;          // Color key (purple, pink, cyan, etc.)
  type: ResourceType;
  category?: ResourceCategory;
  isNew?: boolean;        // Show "NEW" badge
}

// Icon mapping for resources (matches AI Resources icons)
export const RESOURCE_ICON_MAP: Record<string, string> = {
  'brain': '🧠',
  'sparkles': '✨',
  'book-open': '📖',
  'lightbulb': '💡',
  'graduation-cap': '🎓',
  'video': '🎬',
  'file-text': '📄',
};

// Color mapping for resources (matches AI Resources colors)
export const RESOURCE_COLOR_MAP: Record<string, string> = {
  'purple': '#a855f7',
  'pink': '#ec4899',
  'cyan': '#06b6d4',
  'blue': '#3b82f6',
  'green': '#22c55e',
  'orange': '#f97316',
  'slate': '#64748b',
};

// =============================================================================
// TEST TYPES
// =============================================================================

export type TestCategory =
  | 'self-knowledge'      // Autoconocimiento
  | 'communication'       // Comunicación
  | 'balance'             // Equilibrio
  | 'leadership'          // Liderazgo
  | 'emotional';          // Inteligencia emocional

export type TestDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type TestStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface TestQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'likert' | 'slider' | 'wheel';
  options?: TestOption[];
  category?: string;  // For categorized tests like Wheel of Life
}

export interface TestOption {
  id: string;
  text: string;
  value: number;
  icon?: string;
}

export interface TestResult {
  score: number;
  maxScore: number;
  xpEarned: number;
  completedAt: string;
  insights?: string[];
  categoryScores?: Record<string, number>;
}

export interface SkillTest {
  id: string;
  slug: string;
  titleKey: string;
  descriptionKey: string;
  category: TestCategory;
  difficulty: TestDifficulty;
  icon: string;
  baseXP: number;
  bonusXP: number;          // For 100% score
  firstAttemptBonus: number;
  estimatedMinutes: number;
  questionsCount: number;
  color: string;
  prerequisites?: string[]; // Test IDs that must be completed first
  badge?: {
    id: string;
    name: string;
    icon: string;
    xp: number;
  };
}

export interface UserTestProgress {
  testId: string;
  status: TestStatus;
  progress: number;       // 0-100 percentage
  attempts: number;
  bestScore?: number;
  lastAttemptAt?: string;
  completedAt?: string;
  xpEarned: number;
}

export interface ArenaStats {
  totalXP: number;
  testsCompleted: number;
  testsTotal: number;
  currentStreak: number;
  badges: ArenaBadge[];
  level: number;
  levelProgress: number;  // 0-100
}

export interface ArenaBadge {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  xp: number;
  color: string;
}

export interface SkillsArenaData {
  stats: ArenaStats;
  tests: SkillTest[];
  userProgress: Record<string, UserTestProgress>;
  featuredTestId: string;
  loading: boolean;
}

export interface ArenaResourcesData {
  resources: ArenaResource[];
  loading: boolean;
  error: Error | null;
}

// Category metadata for UI
export const CATEGORY_METADATA: Record<TestCategory, {
  labelKey: string;
  color: string;
  icon: string;
}> = {
  'self-knowledge': {
    labelKey: 'skills_arena.category.self_knowledge',
    color: '#9b4dca',
    icon: '🎭'
  },
  'communication': {
    labelKey: 'skills_arena.category.communication',
    color: '#485df4',
    icon: '💬'
  },
  'balance': {
    labelKey: 'skills_arena.category.balance',
    color: '#1bea9a',
    icon: '⚖️'
  },
  'leadership': {
    labelKey: 'skills_arena.category.leadership',
    color: '#ff8c42',
    icon: '👑'
  },
  'emotional': {
    labelKey: 'skills_arena.category.emotional',
    color: '#ef4444',
    icon: '❤️'
  },
};

export const DIFFICULTY_METADATA: Record<TestDifficulty, {
  labelKey: string;
  color: string;
  icon: string;
}> = {
  'beginner': {
    labelKey: 'skills_arena.difficulty.beginner',
    color: '#1bea9a',
    icon: '🏆',
  },
  'intermediate': {
    labelKey: 'skills_arena.difficulty.intermediate',
    color: '#ffd93d',
    icon: '⚡',
  },
  'advanced': {
    labelKey: 'skills_arena.difficulty.advanced',
    color: '#ff0050',
    icon: '🔥',
  },
};
