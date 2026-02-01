import { MountainNode } from '../../hooks/useGamifiedDashboardData';

export interface MountainMapRendererProps {
  nodes: MountainNode[];
  completedNodes: number;
}

export const ENEMIES = [
  { name: 'EL REGATEADOR', nodeIndex: 4, icon: '\uD83D\uDC79' },
  { name: 'PICO DE PIEDRA', nodeIndex: 9, icon: '\uD83D\uDDFF' },
  { name: 'CASCO DE LAVA', nodeIndex: 14, icon: '\uD83C\uDF0B' },
];

export const NODE_COLORS = {
  completed: '#00f5d4',
  current: '#f15bb5',
  locked: '#4a5568',
};

export const THEME = {
  skyTop: '#05051a',
  skyMid: '#0a0a2e',
  skyBottom: '#0f0f22',
  mountainBottom: '#1a1a2e',
  mountainMid: '#2a2a4e',
  mountainUpper: '#4a1a1a',
  mountainTop: '#6a2a2a',
  lavaOrange: '#ff6b35',
  lavaRed: '#ff4500',
  lavaYellow: '#ffaa00',
  craterDark: '#0a0505',
  craterMid: '#2a0a0a',
  craterWarm: '#5a1a00',
  lavaStreamTop: '#ffaa00',
  lavaStreamMid: '#ff6b35',
  lavaStreamBottom: '#cc3300',
  bgMountain: '#0d0d1a',
  ground: '#1a1a35',
  smoke: '#666677',
  starColor: '#ffffff',
  pathSkeleton: '#4a5568',
  crackOrange: '#ff4500',
  crackLight: '#ff6b35',
  baseRock: '#151530',
  baseRockStroke: '#1a1a40',
  emberColor: '#ffaa00',
  bubbleColor: '#ffcc00',
};

export function getPathD(nodes: MountainNode[]): string {
  if (nodes.length < 2) return '';
  const parts = [`M ${nodes[0].x} ${nodes[0].y}`];
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    const cpX = (prev.x + curr.x) / 2;
    parts.push(`Q ${cpX} ${prev.y} ${curr.x} ${curr.y}`);
  }
  return parts.join(' ');
}

/**
 * Parse an SVG path string (M/L/Z commands) into an array of [x, y] coordinate pairs.
 */
export function parseSVGPathToPoints(d: string): number[][] {
  const points: number[][] = [];
  const commands = d.match(/[MLZ][^MLZ]*/gi);
  if (!commands) return points;

  for (const cmd of commands) {
    const letter = cmd.charAt(0).toUpperCase();
    if (letter === 'Z') continue;
    const nums = cmd.slice(1).trim().split(/[\s,]+/).map(Number);
    for (let i = 0; i < nums.length; i += 2) {
      if (!isNaN(nums[i]) && !isNaN(nums[i + 1])) {
        points.push([nums[i], nums[i + 1]]);
      }
    }
  }
  return points;
}
