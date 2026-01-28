import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MountainNode } from '../../hooks/useGamifiedDashboardData';
import {
  VOLCANO_PATH,
  STARS,
  BG_MOUNTAINS,
  PIXEL_BLOCKS,
  STRATA,
  LEFT_LAVA,
  RIGHT_LAVA,
  EMBERS,
  BASE_ROCKS,
} from './mountain-data';

interface MountainMapProps {
  nodes: MountainNode[];
  completedNodes: number;
}

const ENEMIES = [
  { name: 'EL REGATEADOR', nodeIndex: 4, icon: '\uD83D\uDC79' },
  { name: 'PICO DE PIEDRA', nodeIndex: 9, icon: '\uD83D\uDDFF' },
  { name: 'CASCO DE LAVA', nodeIndex: 14, icon: '\uD83C\uDF0B' },
];

const NODE_COLORS = {
  completed: '#00f5d4',
  current: '#f15bb5',
  locked: '#4a5568',
};

function getPathD(nodes: MountainNode[]): string {
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

export function MountainMap({ nodes, completedNodes }: MountainMapProps) {
  const { t } = useLanguage();

  const pathD = useMemo(() => getPathD(nodes), [nodes]);

  const completedPathD = useMemo(() => {
    const completed = nodes.filter(n => n.status === 'completed' || n.status === 'current');
    return getPathD(completed);
  }, [nodes]);

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col">
      {/* Title */}
      <div className="text-center mb-2">
        <h2 className="text-lg font-bold text-white tracking-wider">
          {t('gamified.mountain_title')}
        </h2>
      </div>

      {/* SVG Mountain */}
      <div className="flex-1 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* ===== 1. DEFS ===== */}
          <defs>
            {/* Sky gradient */}
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#05051a" />
              <stop offset="60%" stopColor="#0a0a2e" />
              <stop offset="100%" stopColor="#0f0f22" />
            </linearGradient>

            {/* Mountain body gradient */}
            <linearGradient id="mountainGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#1a1a2e" />
              <stop offset="60%" stopColor="#2a2a4e" />
              <stop offset="85%" stopColor="#4a1a1a" />
              <stop offset="100%" stopColor="#6a2a2a" />
            </linearGradient>

            {/* Lava glow gradient */}
            <radialGradient id="lavaGlow" cx="50%" cy="0%" r="30%">
              <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ff4500" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
            </radialGradient>

            {/* Crater glow */}
            <radialGradient id="craterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffaa00" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#ff6b35" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ff4500" stopOpacity="0.2" />
            </radialGradient>

            {/* Summit ambient glow */}
            <radialGradient id="summitAmbient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#ff4500" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
            </radialGradient>

            {/* Lava stream gradient */}
            <linearGradient id="lavaStreamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffaa00" />
              <stop offset="50%" stopColor="#ff6b35" />
              <stop offset="100%" stopColor="#cc3300" />
            </linearGradient>

            {/* Base glow */}
            <radialGradient id="baseGlow" cx="50%" cy="0%" r="80%">
              <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
            </radialGradient>

            {/* Node glow */}
            <filter id="nodeGlow">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Pulse animation for current node */}
            <filter id="pulseGlow">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Mountain clip path for grid overlay */}
            <clipPath id="mountainClip">
              <path d={VOLCANO_PATH} />
            </clipPath>

            {/* Pixel grid pattern */}
            <pattern id="pixelGrid" width="2" height="2" patternUnits="userSpaceOnUse">
              <rect width="2" height="2" fill="transparent" />
              <rect width="1.8" height="1.8" fill="transparent" stroke="#ffffff" strokeWidth="0.05" opacity="0.03" />
            </pattern>
          </defs>

          {/* ===== 2. BACKGROUND ===== */}
          {/* Sky */}
          <rect x="0" y="0" width="100" height="100" fill="url(#skyGrad)" />

          {/* Stars */}
          {STARS.map((star, i) => (
            <rect
              key={`star-${i}`}
              x={star.x}
              y={star.y}
              width={star.size}
              height={star.size}
              fill="#ffffff"
              opacity={star.opacity}
            >
              {star.twinkle && (
                <animate
                  attributeName="opacity"
                  values={`${star.opacity};${star.opacity * 0.2};${star.opacity}`}
                  dur={`${2 + (i % 3)}s`}
                  repeatCount="indefinite"
                />
              )}
            </rect>
          ))}

          {/* Background mountain silhouettes */}
          {BG_MOUNTAINS.map((mt, i) => (
            <polygon
              key={`bg-mt-${i}`}
              points={mt.points}
              fill={mt.fill}
              opacity={mt.opacity}
            />
          ))}

          {/* Summit ambient orange glow */}
          <ellipse cx="50" cy="5" rx="18" ry="12" fill="url(#summitAmbient)" />

          {/* ===== 3. VOLCANO BODY ===== */}
          <path
            d={VOLCANO_PATH}
            fill="url(#mountainGrad)"
            stroke="#2a2a4e"
            strokeWidth="0.3"
          />

          {/* Pixel grid overlay on mountain */}
          <rect
            x="0" y="0" width="100" height="100"
            fill="url(#pixelGrid)"
            clipPath="url(#mountainClip)"
          />

          {/* ===== 4. TEXTURES ===== */}
          {/* Strata lines */}
          {STRATA.map((s, i) => (
            <line
              key={`strata-${i}`}
              x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
              stroke={s.color}
              strokeWidth="0.3"
              opacity="0.4"
              strokeDasharray="2,1"
            />
          ))}

          {/* Pixel texture blocks */}
          {PIXEL_BLOCKS.map((b, i) => (
            <rect
              key={`pxb-${i}`}
              x={b.x} y={b.y} width={b.w} height={b.h}
              fill={b.color}
              opacity={b.opacity}
            />
          ))}

          {/* ===== 5. LAVA SYSTEM ===== */}
          {/* Crater basin */}
          <rect x="45" y="3" width="10" height="3" rx="0.5" fill="#2a0a0a" stroke="#4a1a1a" strokeWidth="0.2" />
          {/* Lava pool inside crater */}
          <rect x="46" y="3.5" width="8" height="2" fill="url(#craterGlow)">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
          </rect>
          {/* Crater rim pixel highlights */}
          <rect x="44.5" y="2.5" width="1.5" height="0.8" fill="#5a2a2a" opacity="0.8" />
          <rect x="54" y="2.5" width="1.5" height="0.8" fill="#5a2a2a" opacity="0.8" />
          <rect x="46" y="2" width="2" height="0.6" fill="#4a2020" opacity="0.6" />
          <rect x="52" y="2" width="2" height="0.6" fill="#4a2020" opacity="0.6" />

          {/* Lava glow above crater */}
          <ellipse cx="50" cy="4" rx="8" ry="5" fill="url(#lavaGlow)">
            <animate attributeName="ry" values="4;6;4" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
          </ellipse>

          {/* Left lava stream */}
          {LEFT_LAVA.map((lv, i) => (
            <rect
              key={`llava-${i}`}
              x={lv.x} y={lv.y} width={lv.w} height={lv.h}
              fill="url(#lavaStreamGrad)"
              opacity="0.8"
            >
              <animate
                attributeName="opacity"
                values="0.5;0.9;0.5"
                dur="2.5s"
                begin={`${lv.delay}s`}
                repeatCount="indefinite"
              />
            </rect>
          ))}

          {/* Right lava stream */}
          {RIGHT_LAVA.map((lv, i) => (
            <rect
              key={`rlava-${i}`}
              x={lv.x} y={lv.y} width={lv.w} height={lv.h}
              fill="url(#lavaStreamGrad)"
              opacity="0.8"
            >
              <animate
                attributeName="opacity"
                values="0.5;0.9;0.5"
                dur="2.5s"
                begin={`${lv.delay}s`}
                repeatCount="indefinite"
              />
            </rect>
          ))}

          {/* Embers rising from crater */}
          {EMBERS.map((e, i) => (
            <circle
              key={`ember-${i}`}
              cx={e.cx}
              cy={e.cy}
              r={e.r}
              fill="#ffaa00"
              opacity="0.9"
            >
              <animate
                attributeName="cy"
                values={`${e.cy};${e.cy + e.driftY};${e.cy}`}
                dur={`${e.dur}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cx"
                values={`${e.cx};${e.cx + e.driftX};${e.cx}`}
                dur={`${e.dur}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.9;0;0.9"
                dur={`${e.dur}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}

          {/* ===== 6. GROUND ===== */}
          {/* Stepped ground line */}
          <path
            d="M 5,96 L 8,96 L 8,95 L 15,95 L 15,96 L 30,96 L 30,95.5 L 45,95.5 L 45,96 L 60,96 L 60,95 L 75,95 L 75,96 L 88,96 L 88,95.5 L 95,95.5 L 95,96"
            fill="none"
            stroke="#1a1a35"
            strokeWidth="0.3"
            opacity="0.6"
          />

          {/* Base rocks */}
          {BASE_ROCKS.map((r, i) => (
            <rect
              key={`rock-${i}`}
              x={r.x} y={r.y} width={r.w} height={r.h}
              fill="#151530"
              stroke="#1a1a40"
              strokeWidth="0.15"
              opacity="0.7"
            />
          ))}

          {/* Base glow */}
          <ellipse cx="50" cy="96" rx="40" ry="6" fill="url(#baseGlow)" />

          {/* ===== 7. PATHS ===== */}
          {/* Path connecting all nodes (background) */}
          <path
            d={pathD}
            fill="none"
            stroke="#4a5568"
            strokeWidth="0.4"
            strokeDasharray="1,1"
            opacity="0.4"
          />

          {/* Completed path */}
          {completedPathD && (
            <path
              d={completedPathD}
              fill="none"
              stroke="#00f5d4"
              strokeWidth="0.5"
              opacity="0.7"
            />
          )}

          {/* ===== 8. ENEMIES ===== */}
          {ENEMIES.map(enemy => {
            const node = nodes[enemy.nodeIndex];
            if (!node) return null;
            return (
              <g key={enemy.name}>
                <text
                  x={node.x > 50 ? node.x - 12 : node.x + 5}
                  y={node.y - 4}
                  fontSize="2"
                  fill="#ff6b35"
                  fontWeight="bold"
                  opacity="0.9"
                >
                  {enemy.icon} {enemy.name}
                </text>
              </g>
            );
          })}

          {/* ===== 9. NODES ===== */}
          {nodes.map(node => (
            <g key={node.index}>
              {/* Node outer ring */}
              {node.status === 'current' && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="2.5"
                  fill="none"
                  stroke={NODE_COLORS.current}
                  strokeWidth="0.3"
                  opacity="0.5"
                  filter="url(#pulseGlow)"
                >
                  <animate
                    attributeName="r"
                    values="2.5;3.5;2.5"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0.1;0.5"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r="1.8"
                fill={
                  node.status === 'completed'
                    ? NODE_COLORS.completed
                    : node.status === 'current'
                      ? NODE_COLORS.current
                      : '#1a1a2e'
                }
                stroke={NODE_COLORS[node.status]}
                strokeWidth="0.4"
                filter={node.status !== 'locked' ? 'url(#nodeGlow)' : undefined}
              />

              {/* Node number */}
              <text
                x={node.x}
                y={node.y + 0.7}
                textAnchor="middle"
                fontSize="1.8"
                fill={node.status === 'locked' ? '#666' : '#fff'}
                fontWeight="bold"
              >
                {node.index + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Progress indicators */}
      <div className="flex justify-center gap-6 mt-2 text-xs">
        <ProgressIndicator
          label={t('gamified.progress_listen')}
          value={Math.round((completedNodes / 15) * 100)}
        />
        <ProgressIndicator
          label={t('gamified.progress_security')}
          value={Math.round((completedNodes / 15) * 100 * 0.7)}
        />
        <ProgressIndicator
          label={t('gamified.progress_speak')}
          value={Math.round((completedNodes / 15) * 100 * 0.5)}
        />
      </div>
    </div>
  );
}

function ProgressIndicator({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[#a0a0b0]">{label}</span>
      <span className="text-white font-semibold">{value}%</span>
    </div>
  );
}
