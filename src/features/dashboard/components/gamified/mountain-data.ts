// Pixel-art volcano mountain data arrays
// Used by MountainMap.tsx to render the gamified volcano

/** Pixel-art volcano silhouette path (stepped/staircase edges) */
export const VOLCANO_PATH =
  'M 46,5 L 46,3 L 54,3 L 54,5' + // crater opening
  ' L 56,5 L 56,8 L 58,8 L 58,11 L 60,11 L 60,14' +
  ' L 62,14 L 62,17 L 64,17 L 64,20 L 66,20 L 66,23' +
  ' L 68,23 L 68,26 L 70,26 L 70,30 L 72,30 L 72,34' +
  ' L 74,34 L 74,38 L 76,38 L 76,42 L 78,42 L 78,46' +
  ' L 80,46 L 80,50 L 82,50 L 82,55 L 84,55 L 84,60' +
  ' L 86,60 L 86,66 L 88,66 L 88,72 L 89,72 L 89,78' +
  ' L 90,78 L 90,84 L 91,84 L 91,90 L 92,90 L 92,96' +
  // base line
  ' L 8,96' +
  // left side going up
  ' L 8,90 L 9,90 L 9,84 L 10,84 L 10,78 L 11,78 L 11,72' +
  ' L 12,72 L 12,66 L 14,66 L 14,60 L 16,60 L 16,55' +
  ' L 18,55 L 18,50 L 20,50 L 20,46 L 22,46 L 22,42' +
  ' L 24,42 L 24,38 L 26,38 L 26,34 L 28,34 L 28,30' +
  ' L 30,30 L 30,26 L 32,26 L 32,23 L 34,23 L 34,20' +
  ' L 36,20 L 36,17 L 38,17 L 38,14 L 40,14 L 40,11' +
  ' L 42,11 L 42,8 L 44,8 L 44,5 L 46,5 Z';

/** Sky stars (small pixel rects) */
export const STARS: { x: number; y: number; size: number; opacity: number; twinkle?: boolean }[] = [
  { x: 5, y: 3, size: 0.6, opacity: 0.9, twinkle: true },
  { x: 12, y: 7, size: 0.4, opacity: 0.6 },
  { x: 3, y: 15, size: 0.5, opacity: 0.7, twinkle: true },
  { x: 8, y: 22, size: 0.4, opacity: 0.5 },
  { x: 15, y: 10, size: 0.5, opacity: 0.8 },
  { x: 20, y: 4, size: 0.6, opacity: 0.7, twinkle: true },
  { x: 28, y: 8, size: 0.4, opacity: 0.6 },
  { x: 35, y: 2, size: 0.5, opacity: 0.9 },
  { x: 42, y: 1, size: 0.4, opacity: 0.5, twinkle: true },
  { x: 58, y: 1, size: 0.5, opacity: 0.7 },
  { x: 65, y: 2, size: 0.6, opacity: 0.8, twinkle: true },
  { x: 72, y: 8, size: 0.4, opacity: 0.6 },
  { x: 80, y: 4, size: 0.5, opacity: 0.9, twinkle: true },
  { x: 85, y: 10, size: 0.4, opacity: 0.5 },
  { x: 88, y: 7, size: 0.5, opacity: 0.7 },
  { x: 92, y: 3, size: 0.6, opacity: 0.8, twinkle: true },
  { x: 95, y: 15, size: 0.4, opacity: 0.6 },
  { x: 97, y: 6, size: 0.5, opacity: 0.7 },
  { x: 7, y: 30, size: 0.4, opacity: 0.4 },
  { x: 93, y: 25, size: 0.4, opacity: 0.5, twinkle: true },
];

/** Background mountain silhouettes for depth */
export const BG_MOUNTAINS: { points: string; fill: string; opacity: number }[] = [
  {
    points: '0,96 0,70 5,65 10,68 18,58 25,62 30,55 38,60 42,96',
    fill: '#0d0d1a',
    opacity: 0.6,
  },
  {
    points: '58,96 62,60 68,55 75,58 80,50 85,54 90,48 95,55 97,60 100,65 100,96',
    fill: '#0d0d1a',
    opacity: 0.5,
  },
];

/** Pixel texture blocks scattered across the mountain body */
export const PIXEL_BLOCKS: { x: number; y: number; w: number; h: number; color: string; opacity: number }[] = [
  // Base zone (dark blue-purple)
  { x: 20, y: 85, w: 2, h: 1, color: '#1e1e3a', opacity: 0.7 },
  { x: 30, y: 82, w: 1.5, h: 1, color: '#252545', opacity: 0.6 },
  { x: 55, y: 86, w: 2, h: 1, color: '#1e1e3a', opacity: 0.7 },
  { x: 70, y: 83, w: 1.5, h: 1, color: '#20204a', opacity: 0.5 },
  { x: 15, y: 78, w: 1, h: 1, color: '#252550', opacity: 0.6 },
  { x: 80, y: 76, w: 1.5, h: 1, color: '#1e1e3a', opacity: 0.6 },
  { x: 40, y: 80, w: 2, h: 1.5, color: '#232348', opacity: 0.5 },
  // Mid zone (transition)
  { x: 25, y: 65, w: 1.5, h: 1, color: '#2a2a50', opacity: 0.6 },
  { x: 45, y: 68, w: 2, h: 1, color: '#2d2d4e', opacity: 0.5 },
  { x: 65, y: 62, w: 1, h: 1.5, color: '#302a48', opacity: 0.6 },
  { x: 35, y: 58, w: 1.5, h: 1, color: '#332840', opacity: 0.5 },
  { x: 55, y: 55, w: 2, h: 1, color: '#352638', opacity: 0.6 },
  { x: 30, y: 50, w: 1, h: 1, color: '#382430', opacity: 0.5 },
  { x: 60, y: 48, w: 1.5, h: 1, color: '#3a2228', opacity: 0.6 },
  // Upper zone (dark red/maroon)
  { x: 40, y: 42, w: 1, h: 1, color: '#3d2020', opacity: 0.6 },
  { x: 55, y: 38, w: 1.5, h: 1, color: '#401a1a', opacity: 0.5 },
  { x: 45, y: 35, w: 1, h: 1.5, color: '#421818', opacity: 0.6 },
  { x: 50, y: 28, w: 1.5, h: 1, color: '#451515', opacity: 0.5 },
  { x: 48, y: 22, w: 1, h: 1, color: '#481212', opacity: 0.6 },
  { x: 52, y: 18, w: 1, h: 1, color: '#4a1010', opacity: 0.5 },
  // Extra scattered
  { x: 18, y: 72, w: 1, h: 1, color: '#222244', opacity: 0.4 },
  { x: 75, y: 68, w: 1, h: 1, color: '#252540', opacity: 0.4 },
  { x: 50, y: 75, w: 2, h: 1, color: '#202042', opacity: 0.5 },
  { x: 38, y: 45, w: 1, h: 1, color: '#3b2228', opacity: 0.4 },
  { x: 62, y: 42, w: 1.5, h: 1, color: '#3e2020', opacity: 0.4 },
  { x: 43, y: 30, w: 1, h: 1, color: '#461414', opacity: 0.5 },
  { x: 57, y: 25, w: 1, h: 1, color: '#471313', opacity: 0.4 },
  { x: 33, y: 72, w: 1.5, h: 1, color: '#282848', opacity: 0.5 },
  { x: 68, y: 58, w: 1, h: 1.5, color: '#322640', opacity: 0.4 },
  { x: 22, y: 55, w: 1, h: 1, color: '#2e2a4a', opacity: 0.5 },
];

/** Horizontal strata/geological layer lines */
export const STRATA: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [
  { x1: 15, y1: 80, x2: 85, y2: 80, color: '#1a1a35' },
  { x1: 20, y1: 70, x2: 80, y2: 70, color: '#222245' },
  { x1: 25, y1: 60, x2: 75, y2: 60, color: '#2a2240' },
  { x1: 30, y1: 50, x2: 70, y2: 50, color: '#322035' },
  { x1: 35, y1: 40, x2: 65, y2: 40, color: '#3a1e2a' },
  { x1: 40, y1: 30, x2: 60, y2: 30, color: '#421a20' },
  { x1: 44, y1: 20, x2: 56, y2: 20, color: '#4a1515' },
];

/** Left lava stream rects (flowing down left face from crater) */
export const LEFT_LAVA: { x: number; y: number; w: number; h: number; delay: number }[] = [
  { x: 46, y: 6, w: 1.5, h: 1.5, delay: 0 },
  { x: 44.5, y: 9, w: 1.2, h: 1.5, delay: 0.3 },
  { x: 43, y: 12, w: 1, h: 1.5, delay: 0.5 },
  { x: 41, y: 16, w: 1.2, h: 2, delay: 0.8 },
  { x: 39, y: 20, w: 1, h: 1.5, delay: 1.0 },
  { x: 37.5, y: 24, w: 0.8, h: 1.5, delay: 1.3 },
  { x: 36, y: 28, w: 1, h: 2, delay: 1.5 },
  { x: 34, y: 33, w: 0.8, h: 1.5, delay: 1.8 },
  { x: 32, y: 37, w: 0.6, h: 1, delay: 2.0 },
  { x: 30.5, y: 40, w: 0.5, h: 0.8, delay: 2.2 },
];

/** Right lava stream rects (flowing down right face from crater) */
export const RIGHT_LAVA: { x: number; y: number; w: number; h: number; delay: number }[] = [
  { x: 52.5, y: 6, w: 1.5, h: 1.5, delay: 0.2 },
  { x: 54, y: 9, w: 1.2, h: 1.5, delay: 0.4 },
  { x: 56, y: 12, w: 1, h: 1.5, delay: 0.7 },
  { x: 58, y: 16, w: 1.2, h: 2, delay: 0.9 },
  { x: 60, y: 20, w: 1, h: 1.5, delay: 1.1 },
  { x: 61.5, y: 24, w: 0.8, h: 1.5, delay: 1.4 },
  { x: 63, y: 28, w: 1, h: 2, delay: 1.6 },
  { x: 65, y: 33, w: 0.8, h: 1.5, delay: 1.9 },
  { x: 67, y: 37, w: 0.6, h: 1, delay: 2.1 },
  { x: 68.5, y: 40, w: 0.5, h: 0.8, delay: 2.3 },
];

/** Ember/spark particles rising from crater */
export const EMBERS: { cx: number; cy: number; r: number; driftX: number; driftY: number; dur: number }[] = [
  { cx: 48, cy: 4, r: 0.4, driftX: -2, driftY: -5, dur: 3 },
  { cx: 50, cy: 3, r: 0.5, driftX: 1, driftY: -6, dur: 3.5 },
  { cx: 52, cy: 4, r: 0.3, driftX: 3, driftY: -4, dur: 2.8 },
  { cx: 49, cy: 5, r: 0.4, driftX: -1, driftY: -7, dur: 4 },
  { cx: 51, cy: 3.5, r: 0.35, driftX: 2, driftY: -5.5, dur: 3.2 },
  { cx: 50, cy: 4.5, r: 0.45, driftX: 0, driftY: -6, dur: 3.8 },
];

/** Base rock blocks at the foot of the volcano */
export const BASE_ROCKS: { x: number; y: number; w: number; h: number }[] = [
  { x: 12, y: 93, w: 3, h: 2 },
  { x: 25, y: 94, w: 2, h: 1.5 },
  { x: 40, y: 93.5, w: 2.5, h: 2 },
  { x: 58, y: 94, w: 2, h: 1.5 },
  { x: 75, y: 93, w: 3, h: 2 },
  { x: 85, y: 94, w: 2, h: 1.5 },
];
