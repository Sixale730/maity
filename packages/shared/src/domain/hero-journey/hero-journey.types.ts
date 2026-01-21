/**
 * Hero Journey Types
 * Mountain roadmap visualization with nodes and progress tracking
 */

// Node type determines visual representation and behavior
export type JourneyNodeType = 'checkpoint' | 'scenario' | 'resource' | 'boss';

// Node status for visual states
export type JourneyNodeStatus = 'locked' | 'available' | 'current' | 'completed';

// Theme determines color palette
export type JourneyTheme = 'snow' | 'forest' | 'desert';

/**
 * Individual node in the hero's journey
 */
export interface JourneyNode {
  id: string;
  x: number;            // Position X (0-100%)
  y: number;            // Position Y (0-100%)
  type: JourneyNodeType;
  status: JourneyNodeStatus;
  icon: string;         // Emoji or icon identifier
  title: string;
  description?: string;
}

/**
 * Mountain peak point for SVG generation
 */
export interface MountainPeak {
  x: number;            // Position X (0-100%)
  height: number;       // Height (0-100%)
}

/**
 * Mountain layer for parallax effect
 */
export interface MountainLayer {
  depth: number;        // 0 = furthest back, higher = closer
  color: string;        // Hex color
  peaks: MountainPeak[];
}

/**
 * Complete hero journey configuration
 */
export interface HeroJourneyConfig {
  id: string;
  name: string;
  description?: string;
  theme: JourneyTheme;
  nodes: JourneyNode[];
  mountainLayers: MountainLayer[];
  isDefault: boolean;
  companyId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request to save a hero journey config
 */
export interface SaveHeroJourneyConfigRequest {
  id?: string;          // If provided, updates existing
  name: string;
  description?: string;
  theme?: JourneyTheme;
  nodes: JourneyNode[];
  mountainLayers?: MountainLayer[];
  isDefault?: boolean;
  companyId?: string;
}

/**
 * Raw database row from RPC
 */
export interface HeroJourneyConfigRow {
  id: string;
  name: string;
  description: string | null;
  theme: string;
  nodes: JourneyNode[];
  mountain_layers: MountainLayer[];
  is_default: boolean;
  company_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Theme color palettes
 */
export const JOURNEY_THEME_COLORS = {
  snow: {
    background: '#1a1a2e',
    mountainBack: '#16213e',
    mountainMid: '#1f3460',
    mountainFront: '#2a4a7f',
    snow: '#e8f4f8',
    pathLine: '#00f5d4',
    nodeCompleted: '#00f5d4',
    nodeCurrent: '#f15bb5',
    nodeAvailable: '#ffd93d',
    nodeLocked: '#4a5568',
    text: '#ffffff',
  },
  forest: {
    background: '#1a2e1a',
    mountainBack: '#163e16',
    mountainMid: '#1f601f',
    mountainFront: '#2a7f2a',
    snow: '#e8f8e8',
    pathLine: '#90ee90',
    nodeCompleted: '#90ee90',
    nodeCurrent: '#f15bb5',
    nodeAvailable: '#ffd93d',
    nodeLocked: '#4a5848',
    text: '#ffffff',
  },
  desert: {
    background: '#2e2a1a',
    mountainBack: '#3e3616',
    mountainMid: '#60501f',
    mountainFront: '#7f6a2a',
    snow: '#f8f4e8',
    pathLine: '#ffa500',
    nodeCompleted: '#ffa500',
    nodeCurrent: '#f15bb5',
    nodeAvailable: '#ffd93d',
    nodeLocked: '#58564a',
    text: '#ffffff',
  },
} as const;

/**
 * Node type icons (default emoji)
 */
export const NODE_TYPE_ICONS: Record<JourneyNodeType, string> = {
  checkpoint: '⛺',
  scenario: '🎭',
  resource: '📚',
  boss: '👑',
};

/**
 * Default mountain layers for new configs
 */
export const DEFAULT_MOUNTAIN_LAYERS: MountainLayer[] = [
  {
    depth: 0,
    color: '#16213e',
    peaks: [
      { x: 0, height: 60 },
      { x: 30, height: 75 },
      { x: 50, height: 80 },
      { x: 70, height: 70 },
      { x: 100, height: 55 },
    ],
  },
  {
    depth: 1,
    color: '#1f3460',
    peaks: [
      { x: 15, height: 65 },
      { x: 45, height: 85 },
      { x: 75, height: 72 },
    ],
  },
  {
    depth: 2,
    color: '#2a4a7f',
    peaks: [
      { x: 25, height: 58 },
      { x: 55, height: 78 },
      { x: 85, height: 68 },
    ],
  },
];
