import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Line, Path, Ellipse, Text, Group } from 'react-konva';
import Konva from 'konva';
import { MountainMapRendererProps, ENEMIES, NODE_COLORS, THEME, parseSVGPathToPoints, getPathD } from '../mountain-map-types';
import { MountainNode } from '../../../hooks/useGamifiedDashboardData';
import {
  VOLCANO_PATH, CRATER_PATH, STARS, BG_MOUNTAINS, PIXEL_BLOCKS,
  STRATA, LEFT_LAVA, RIGHT_LAVA, EMBERS, BASE_ROCKS, SMOKE_CLOUDS, VOLCANIC_CRACKS,
} from '../mountain-data';

const VIEW = 100;

function flatPoints(pts: number[][], sx: number, sy: number): number[] {
  const result: number[] = [];
  for (const [x, y] of pts) {
    result.push(x * sx, y * sy);
  }
  return result;
}

function parsePolygonPoints(pointsStr: string): number[][] {
  return pointsStr.split(' ').map(p => {
    const [x, y] = p.split(',').map(Number);
    return [x, y];
  });
}

function getQuadraticPathPoints(nodes: MountainNode[], sx: number, sy: number): number[] {
  const result: number[] = [];
  if (nodes.length < 2) return result;
  result.push(nodes[0].x * sx, nodes[0].y * sy);
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    const cpX = ((prev.x + curr.x) / 2) * sx;
    const steps = 10;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const x = (1-t)*(1-t)*(prev.x * sx) + 2*(1-t)*t*cpX + t*t*(curr.x * sx);
      const y = (1-t)*(1-t)*(prev.y * sy) + 2*(1-t)*t*(prev.y * sy) + t*t*(curr.y * sy);
      result.push(x, y);
    }
  }
  return result;
}

// --- Animated sub-components ---

function AnimatedCurrentNode({ cx, cy, r, sx, fillColor, status }: {
  cx: number; cy: number; r: number; sx: number; fillColor: string; status: string;
}) {
  const pulseRef = useRef<Konva.Circle>(null);

  useEffect(() => {
    if (!pulseRef.current) return;
    const tween = new Konva.Tween({
      node: pulseRef.current,
      duration: 1.5,
      scaleX: 1.3,
      scaleY: 1.3,
      opacity: 0.1,
      easing: Konva.Easings.EaseInOut,
      yoyo: true,
      onFinish() { tween.reset(); tween.play(); },
    });
    tween.play();
    return () => { tween.destroy(); };
  }, []);

  return (
    <Group>
      {/* Animated pulse ring */}
      <Circle
        ref={pulseRef}
        x={cx} y={cy} radius={3.5 * sx}
        fill={NODE_COLORS.current} opacity={0.3}
        shadowColor={NODE_COLORS.current} shadowBlur={6 * sx} shadowOpacity={0.5}
      />
      {/* Glow ring */}
      <Circle
        x={cx} y={cy} radius={r * 1.6}
        fill={NODE_COLORS[status as keyof typeof NODE_COLORS]} opacity={0.2}
        shadowColor={NODE_COLORS[status as keyof typeof NODE_COLORS]} shadowBlur={4 * sx} shadowOpacity={0.4}
      />
      {/* Node circle */}
      <Circle
        x={cx} y={cy} radius={r}
        fill={fillColor}
        stroke={NODE_COLORS[status as keyof typeof NODE_COLORS]}
        strokeWidth={0.4 * sx}
        shadowColor={fillColor} shadowBlur={3 * sx} shadowOpacity={0.6}
      />
    </Group>
  );
}

function AnimatedEmber({ e, sx, sy }: {
  e: typeof EMBERS[number]; sx: number; sy: number;
}) {
  const ref = useRef<Konva.Circle>(null);

  useEffect(() => {
    if (!ref.current) return;
    const tween = new Konva.Tween({
      node: ref.current,
      duration: e.dur,
      x: (e.cx + e.driftX) * sx,
      y: (e.cy + e.driftY) * sy,
      opacity: 0.1,
      easing: Konva.Easings.EaseInOut,
      yoyo: true,
      onFinish() { tween.reset(); tween.play(); },
    });
    tween.play();
    return () => { tween.destroy(); };
  }, [e, sx, sy]);

  return (
    <Circle
      ref={ref}
      x={e.cx * sx} y={e.cy * sy}
      radius={e.r * sx} fill={THEME.emberColor} opacity={0.9}
      shadowColor={THEME.emberColor} shadowBlur={3 * sx} shadowOpacity={0.8}
    />
  );
}

function AnimatedSmoke({ cloud, sx, sy }: {
  cloud: typeof SMOKE_CLOUDS[number]; sx: number; sy: number;
}) {
  const ref = useRef<Konva.Ellipse>(null);

  useEffect(() => {
    if (!ref.current) return;
    const tween = new Konva.Tween({
      node: ref.current,
      duration: 3,
      radiusX: cloud.rx * 1.3 * sx,
      opacity: cloud.opacity * 0.2,
      easing: Konva.Easings.EaseInOut,
      yoyo: true,
      onFinish() { tween.reset(); tween.play(); },
    });
    tween.play();
    return () => { tween.destroy(); };
  }, [cloud, sx, sy]);

  return (
    <Ellipse
      ref={ref}
      x={cloud.cx * sx} y={cloud.cy * sy}
      radiusX={cloud.rx * sx} radiusY={cloud.ry * sy}
      fill={THEME.smoke} opacity={cloud.opacity}
      shadowColor={THEME.smoke} shadowBlur={6 * sx} shadowOpacity={0.4}
    />
  );
}

export default function MountainMapKonva({ nodes, completedNodes }: MountainMapRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(600);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSize(Math.min(width, height) || 600);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const sx = size / VIEW;
  const sy = size / VIEW;

  const volcPts = parseSVGPathToPoints(VOLCANO_PATH);
  const craterPts = parseSVGPathToPoints(CRATER_PATH);
  const completedPath = nodes.filter(n => n.status === 'completed' || n.status === 'current');

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] flex items-center justify-center">
      <Stage width={size} height={size}>
        <Layer>
          {/* Sky gradient */}
          <Rect
            x={0} y={0} width={size} height={size}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 0, y: size }}
            fillLinearGradientColorStops={[0, THEME.skyTop, 0.6, THEME.skyMid, 1, THEME.skyBottom]}
          />

          {/* Stars with shadow glow */}
          {STARS.map((star, i) => (
            <Rect
              key={`star-${i}`}
              x={star.x * sx} y={star.y * sy}
              width={star.size * sx} height={star.size * sy}
              fill={THEME.starColor} opacity={star.opacity}
              shadowColor={THEME.starColor} shadowBlur={3 * sx} shadowOpacity={0.8}
            />
          ))}

          {/* Background mountains */}
          {BG_MOUNTAINS.map((mt, i) => {
            const pts = parsePolygonPoints(mt.points);
            return (
              <Line
                key={`bgmt-${i}`}
                points={flatPoints(pts, sx, sy)}
                closed fill={mt.fill} opacity={mt.opacity}
              />
            );
          })}

          {/* Summit ambient glow */}
          <Ellipse
            x={50 * sx} y={5 * sy}
            radiusX={18 * sx} radiusY={14 * sy}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndRadius={18 * sx}
            fillRadialGradientColorStops={[0, THEME.lavaOrange, 1, 'rgba(255,69,0,0)']}
            opacity={0.3}
          />

          {/* Crater interior */}
          <Line
            points={flatPoints(craterPts, sx, sy)}
            closed
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 0, y: 11 * sy }}
            fillLinearGradientColorStops={[0, THEME.craterDark, 0.5, THEME.craterMid, 1, THEME.craterWarm]}
          />
          {/* Lava pool */}
          <Rect
            x={47 * sx} y={9 * sy} width={6 * sx} height={2.5 * sy}
            cornerRadius={0.3 * sx}
            fillRadialGradientStartPoint={{ x: 3 * sx, y: 1.25 * sy }}
            fillRadialGradientEndPoint={{ x: 3 * sx, y: 1.25 * sy }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndRadius={3 * sx}
            fillRadialGradientColorStops={[0, THEME.lavaYellow, 0.4, THEME.lavaOrange, 1, THEME.lavaRed]}
          />
          {/* Lava bubbles */}
          <Circle x={48.5 * sx} y={10 * sy} radius={0.5 * sx} fill={THEME.bubbleColor} opacity={0.7} />
          <Circle x={52 * sx} y={10.5 * sy} radius={0.4 * sx} fill={THEME.bubbleColor} opacity={0.6} />

          {/* Volcano body with shadow softening */}
          <Line
            points={flatPoints(volcPts, sx, sy)}
            closed
            fillLinearGradientStartPoint={{ x: 0, y: size }}
            fillLinearGradientEndPoint={{ x: 0, y: 0 }}
            fillLinearGradientColorStops={[0, THEME.mountainBottom, 0.6, THEME.mountainMid, 0.85, THEME.mountainUpper, 1, THEME.mountainTop]}
            stroke="#2a2a4e" strokeWidth={0.3 * sx}
            shadowColor="#2a2a4e" shadowBlur={2 * sx}
          />

          {/* Strata lines (dashed) */}
          {STRATA.map((s, i) => (
            <Line
              key={`str-${i}`}
              points={[s.x1 * sx, s.y1 * sy, s.x2 * sx, s.y2 * sy]}
              stroke={s.color} strokeWidth={0.3 * sx}
              opacity={0.4} dash={[2 * sx, 1 * sx]}
            />
          ))}

          {/* Pixel blocks */}
          {PIXEL_BLOCKS.map((b, i) => (
            <Rect
              key={`pxb-${i}`}
              x={b.x * sx} y={b.y * sy}
              width={b.w * sx} height={b.h * sy}
              fill={b.color} opacity={b.opacity}
            />
          ))}

          {/* Volcanic cracks */}
          {VOLCANIC_CRACKS.map((crack, i) => (
            <Path
              key={`crack-${i}`}
              data={crack.d}
              stroke={crack.color} strokeWidth={0.3 * sx}
              opacity={crack.opacity}
              scaleX={sx} scaleY={sy}
            />
          ))}

          {/* Crater rim highlights */}
          <Rect x={40 * sx} y={4.5 * sy} width={2 * sx} height={1 * sy} fill="#5a2a2a" opacity={0.8} />
          <Rect x={58 * sx} y={4.5 * sy} width={2 * sx} height={1 * sy} fill="#5a2a2a" opacity={0.8} />

          {/* Lava glow ellipse */}
          <Ellipse
            x={50 * sx} y={5 * sy}
            radiusX={10 * sx} radiusY={8 * sy}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndRadius={10 * sx}
            fillRadialGradientColorStops={[0, THEME.lavaOrange, 0.4, THEME.lavaRed, 1, 'rgba(255,69,0,0)']}
            opacity={0.6}
          />

          {/* Lava streams with shadow glow */}
          {[...LEFT_LAVA, ...RIGHT_LAVA].map((lv, i) => (
            <Rect
              key={`lava-${i}`}
              x={lv.x * sx} y={lv.y * sy}
              width={lv.w * sx} height={lv.h * sy}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: 0, y: lv.h * sy }}
              fillLinearGradientColorStops={[0, THEME.lavaStreamTop, 0.5, THEME.lavaStreamMid, 1, THEME.lavaStreamBottom]}
              opacity={0.8}
              shadowColor={THEME.lavaStreamTop} shadowBlur={4 * sx} shadowOpacity={0.6}
            />
          ))}

          {/* Animated embers */}
          {EMBERS.map((e, i) => (
            <AnimatedEmber key={`ember-${i}`} e={e} sx={sx} sy={sy} />
          ))}

          {/* Animated smoke clouds */}
          {SMOKE_CLOUDS.map((cloud, i) => (
            <AnimatedSmoke key={`smoke-${i}`} cloud={cloud} sx={sx} sy={sy} />
          ))}

          {/* Ground fog gradient */}
          <Rect
            x={0} y={90 * sy} width={size} height={10 * sy}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 0, y: 10 * sy }}
            fillLinearGradientColorStops={[0, 'rgba(26,26,53,0)', 0.5, 'rgba(26,26,53,0.3)', 1, THEME.ground]}
          />

          {/* Ground line */}
          <Line
            points={[
              5*sx,96*sy, 8*sx,96*sy, 8*sx,95*sy, 15*sx,95*sy, 15*sx,96*sy,
              30*sx,96*sy, 30*sx,95.5*sy, 45*sx,95.5*sy, 45*sx,96*sy,
              60*sx,96*sy, 60*sx,95*sy, 75*sx,95*sy, 75*sx,96*sy,
              88*sx,96*sy, 88*sx,95.5*sy, 95*sx,95.5*sy, 95*sx,96*sy,
            ]}
            stroke={THEME.ground} strokeWidth={0.3 * sx} opacity={0.6}
          />

          {/* Base rocks */}
          {BASE_ROCKS.map((r, i) => (
            <Rect
              key={`rock-${i}`}
              x={r.x * sx} y={r.y * sy}
              width={r.w * sx} height={r.h * sy}
              fill={THEME.baseRock} stroke={THEME.baseRockStroke}
              strokeWidth={0.15 * sx} opacity={0.7}
            />
          ))}

          {/* Base glow */}
          <Ellipse
            x={50 * sx} y={96 * sy}
            radiusX={40 * sx} radiusY={6 * sy}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndRadius={40 * sx}
            fillRadialGradientColorStops={[0, THEME.lavaOrange, 1, 'rgba(255,69,0,0)']}
            opacity={0.08}
          />

          {/* Skeleton path */}
          {nodes.length >= 2 && (
            <Line
              points={getQuadraticPathPoints(nodes, sx, sy)}
              stroke={THEME.pathSkeleton} strokeWidth={0.4 * sx}
              opacity={0.4} dash={[1 * sx, 1 * sx]}
            />
          )}

          {/* Completed path */}
          {completedPath.length >= 2 && (
            <Line
              points={getQuadraticPathPoints(completedPath, sx, sy)}
              stroke={NODE_COLORS.completed} strokeWidth={0.5 * sx}
              opacity={0.7}
            />
          )}

          {/* Enemies */}
          {ENEMIES.map(enemy => {
            const node = nodes[enemy.nodeIndex];
            if (!node) return null;
            return (
              <Text
                key={enemy.name}
                x={node.x > 50 ? (node.x - 12) * sx : (node.x + 5) * sx}
                y={(node.y - 4) * sy}
                text={`${enemy.icon} ${enemy.name}`}
                fontSize={2 * sy}
                fill={THEME.lavaOrange}
                fontStyle="bold"
                opacity={0.9}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const cx = node.x * sx;
            const cy = node.y * sy;
            const r = 1.8 * sx;
            const fillColor = node.status === 'completed'
              ? NODE_COLORS.completed
              : node.status === 'current'
                ? NODE_COLORS.current
                : '#1a1a2e';

            return (
              <Group key={node.index}>
                {/* Current node - animated pulse */}
                {node.status === 'current' ? (
                  <AnimatedCurrentNode cx={cx} cy={cy} r={r} sx={sx} fillColor={fillColor} status={node.status} />
                ) : (
                  <>
                    {/* Glow ring */}
                    {node.status !== 'locked' && (
                      <Circle
                        x={cx} y={cy} radius={r * 1.6}
                        fill={NODE_COLORS[node.status]} opacity={0.2}
                        shadowColor={NODE_COLORS[node.status]} shadowBlur={4 * sx} shadowOpacity={0.4}
                      />
                    )}
                    {/* Node circle */}
                    <Circle
                      x={cx} y={cy} radius={r}
                      fill={fillColor}
                      stroke={NODE_COLORS[node.status]}
                      strokeWidth={0.4 * sx}
                      shadowColor={node.status !== 'locked' ? fillColor : undefined}
                      shadowBlur={node.status !== 'locked' ? 3 * sx : 0}
                      shadowOpacity={node.status !== 'locked' ? 0.5 : 0}
                    />
                  </>
                )}
                {/* Node number */}
                <Text
                  x={cx} y={cy}
                  text={`${node.index + 1}`}
                  fontSize={1.8 * sy}
                  fill={node.status === 'locked' ? '#666666' : '#ffffff'}
                  fontStyle="bold"
                  align="center" verticalAlign="middle"
                  offsetX={0.9 * sy}
                  offsetY={0.9 * sy}
                  width={1.8 * sy}
                  height={1.8 * sy}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
