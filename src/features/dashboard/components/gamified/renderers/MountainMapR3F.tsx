import { useMemo, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { MountainMapRendererProps, ENEMIES, NODE_COLORS, THEME, parseSVGPathToPoints } from '../mountain-map-types';
import { MountainNode } from '../../../hooks/useGamifiedDashboardData';
import {
  VOLCANO_PATH, CRATER_PATH, STARS, BG_MOUNTAINS, PIXEL_BLOCKS,
  STRATA, LEFT_LAVA, RIGHT_LAVA, EMBERS, BASE_ROCKS, SMOKE_CLOUDS, VOLCANIC_CRACKS,
} from '../mountain-data';
import { createGradientTexture, shapeFromPoints, polygonStringToShape, getQuadraticCurvePoints } from './r3f-helpers';

const VIEW = 100;

// --- Animated components ---

function CameraBreathing() {
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    camera.position.x = 50 + Math.sin(t * 0.3) * 0.5;
    camera.position.y = 50 + Math.cos(t * 0.2) * 0.3;
  });
  return null;
}

function AnimatedNodeRing({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.z += delta * 0.5;
  });
  return (
    <mesh ref={ref} position={[cx, cy, 2.7]}>
      <ringGeometry args={[r + 0.3, r + 0.6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </mesh>
  );
}

function AnimatedEmbers() {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    EMBERS.forEach((e, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      const phase = t / e.dur * Math.PI * 2;
      mesh.position.x = e.cx + Math.sin(phase) * e.driftX;
      mesh.position.y = VIEW - (e.cy + Math.sin(phase) * Math.abs(e.driftY));
      mesh.position.z = -1.5;
      (mesh.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(phase) * 0.4;
    });
  });

  return (
    <group ref={groupRef}>
      {EMBERS.map((e, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          position={[e.cx, VIEW - e.cy, -1.5]}
        >
          <circleGeometry args={[e.r, 12]} />
          <meshBasicMaterial color={THEME.emberColor} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// --- Static sub-components ---

function SkyBackground() {
  const texture = useMemo(() => createGradientTexture(256, 256, [
    { offset: 0, color: THEME.skyTop },
    { offset: 0.6, color: THEME.skyMid },
    { offset: 1, color: THEME.skyBottom },
  ]), []);
  return (
    <mesh position={[50, 50, -20]}>
      <planeGeometry args={[VIEW + 10, VIEW + 10]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function StarsLayer() {
  return (
    <group>
      {STARS.map((star, i) => (
        <mesh key={i} position={[star.x + star.size / 2, VIEW - star.y - star.size / 2, -18 + (i % 5) * 0.6]}>
          <planeGeometry args={[star.size, star.size]} />
          <meshBasicMaterial color={THEME.starColor} transparent opacity={star.opacity} />
        </mesh>
      ))}
    </group>
  );
}

function BgMountains() {
  return (
    <group>
      {BG_MOUNTAINS.map((mt, i) => {
        const shape = polygonStringToShape(mt.points);
        return (
          <mesh key={i} position={[0, 0, -15]}>
            <shapeGeometry args={[shape]} />
            <meshBasicMaterial color={mt.fill} transparent opacity={mt.opacity} />
          </mesh>
        );
      })}
    </group>
  );
}

function CraterInterior() {
  const pts = parseSVGPathToPoints(CRATER_PATH);
  const shape = shapeFromPoints(pts);
  const texture = useMemo(() => createGradientTexture(64, 64, [
    { offset: 0, color: THEME.craterDark },
    { offset: 0.5, color: THEME.craterMid },
    { offset: 1, color: THEME.craterWarm },
  ]), []);
  return (
    <group>
      <mesh position={[0, 0, -6]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {/* Lava pool - emissive */}
      <mesh position={[50, VIEW - 10.25, -5.5]}>
        <planeGeometry args={[6, 2.5]} />
        <meshStandardMaterial color={THEME.lavaYellow} emissive={THEME.lavaYellow} emissiveIntensity={0.8} transparent opacity={0.9} />
      </mesh>
      {/* Bubbles */}
      <mesh position={[48.5, VIEW - 10, -5.4]}>
        <circleGeometry args={[0.5, 16]} />
        <meshStandardMaterial color={THEME.bubbleColor} emissive={THEME.bubbleColor} emissiveIntensity={0.5} transparent opacity={0.7} />
      </mesh>
      <mesh position={[52, VIEW - 10.5, -5.4]}>
        <circleGeometry args={[0.4, 16]} />
        <meshStandardMaterial color={THEME.bubbleColor} emissive={THEME.bubbleColor} emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function VolcanoBody() {
  const pts = parseSVGPathToPoints(VOLCANO_PATH);
  const shape = shapeFromPoints(pts);
  const texture = useMemo(() => createGradientTexture(256, 256, [
    { offset: 0, color: THEME.mountainBottom },
    { offset: 0.6, color: THEME.mountainMid },
    { offset: 0.85, color: THEME.mountainUpper },
    { offset: 1, color: THEME.mountainTop },
  ]), []);
  return (
    <mesh position={[0, 0, -5]}>
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function StrataLines() {
  return (
    <group>
      {STRATA.map((s, i) => {
        const points = [
          new THREE.Vector3(s.x1, VIEW - s.y1, 0),
          new THREE.Vector3(s.x2, VIEW - s.y2, 0),
        ];
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={i} position={[0, 0, -4.5]} geometry={geom}>
            <lineBasicMaterial color={s.color} transparent opacity={0.4} />
          </line>
        );
      })}
    </group>
  );
}

function PixelBlocksLayer() {
  return (
    <group>
      {PIXEL_BLOCKS.map((b, i) => (
        <mesh key={i} position={[b.x + b.w / 2, VIEW - b.y - b.h / 2, -4]}>
          <planeGeometry args={[b.w, b.h]} />
          <meshBasicMaterial color={b.color} transparent opacity={b.opacity} />
        </mesh>
      ))}
    </group>
  );
}

function VolcanicCracksLayer() {
  return (
    <group>
      {VOLCANIC_CRACKS.map((crack, i) => {
        const pts = parseSVGPathToPoints(crack.d);
        if (pts.length < 2) return null;
        const points = pts.map(([x, y]) => new THREE.Vector3(x, VIEW - y, 0));
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={i} position={[0, 0, -3.5]} geometry={geom}>
            <lineBasicMaterial color={crack.color} transparent opacity={crack.opacity} />
          </line>
        );
      })}
    </group>
  );
}

function LavaSystem() {
  return (
    <group>
      {/* Crater rim highlights */}
      <mesh position={[41, VIEW - 5, -3]}>
        <planeGeometry args={[2, 1]} />
        <meshBasicMaterial color="#5a2a2a" transparent opacity={0.8} />
      </mesh>
      <mesh position={[59, VIEW - 5, -3]}>
        <planeGeometry args={[2, 1]} />
        <meshBasicMaterial color="#5a2a2a" transparent opacity={0.8} />
      </mesh>

      {/* Lava glow - emissive */}
      <mesh position={[50, VIEW - 5, -2.5]}>
        <circleGeometry args={[10, 32]} />
        <meshStandardMaterial color={THEME.lavaOrange} emissive={THEME.lavaOrange} emissiveIntensity={0.6} transparent opacity={0.3} />
      </mesh>

      {/* Lava streams - emissive */}
      {[...LEFT_LAVA, ...RIGHT_LAVA].map((lv, i) => (
        <mesh key={i} position={[lv.x + lv.w / 2, VIEW - lv.y - lv.h / 2, -2]}>
          <planeGeometry args={[lv.w, lv.h]} />
          <meshStandardMaterial color={THEME.lavaStreamTop} emissive={THEME.lavaStreamTop} emissiveIntensity={0.8} transparent opacity={0.8} />
        </mesh>
      ))}

      {/* Smoke clouds */}
      {SMOKE_CLOUDS.map((cloud, i) => (
        <mesh key={i} position={[cloud.cx, VIEW - cloud.cy, -1]}>
          <circleGeometry args={[cloud.rx, 16]} />
          <meshBasicMaterial color={THEME.smoke} transparent opacity={cloud.opacity} />
        </mesh>
      ))}
    </group>
  );
}

function GroundLayer() {
  const groundPts = [
    [5,96],[8,96],[8,95],[15,95],[15,96],[30,96],[30,95.5],[45,95.5],
    [45,96],[60,96],[60,95],[75,95],[75,96],[88,96],[88,95.5],[95,95.5],[95,96],
  ];
  const points = groundPts.map(([x, y]) => new THREE.Vector3(x, VIEW - y, 0));
  const geom = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group>
      <line position={[0, 0, -0.5]} geometry={geom}>
        <lineBasicMaterial color={THEME.ground} transparent opacity={0.6} />
      </line>
      {BASE_ROCKS.map((r, i) => (
        <mesh key={i} position={[r.x + r.w / 2, VIEW - r.y - r.h / 2, -0.3]}>
          <planeGeometry args={[r.w, r.h]} />
          <meshBasicMaterial color={THEME.baseRock} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* Base glow */}
      <mesh position={[50, VIEW - 96, -0.1]}>
        <circleGeometry args={[40, 32]} />
        <meshBasicMaterial color={THEME.lavaOrange} transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

function PathsLayer({ nodes }: { nodes: MountainNode[] }) {
  const skeletonGeom = useMemo(() => {
    const pts = getQuadraticCurvePoints(nodes);
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [nodes]);

  const completedNodes = useMemo(
    () => nodes.filter(n => n.status === 'completed' || n.status === 'current'),
    [nodes]
  );
  const completedGeom = useMemo(() => {
    const pts = getQuadraticCurvePoints(completedNodes);
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [completedNodes]);

  return (
    <group>
      {nodes.length >= 2 && (
        <line position={[0, 0, 1]} geometry={skeletonGeom}>
          <lineBasicMaterial color={THEME.pathSkeleton} transparent opacity={0.4} />
        </line>
      )}
      {completedNodes.length >= 2 && (
        <line position={[0, 0, 1.5]} geometry={completedGeom}>
          <lineBasicMaterial color={NODE_COLORS.completed} transparent opacity={0.7} />
        </line>
      )}
    </group>
  );
}

function NodesLayer({ nodes }: { nodes: MountainNode[] }) {
  return (
    <group>
      {nodes.map(node => {
        const cx = node.x;
        const cy = VIEW - node.y;
        const r = 1.8;
        const fillColor = node.status === 'completed'
          ? NODE_COLORS.completed
          : node.status === 'current'
            ? NODE_COLORS.current
            : '#1a1a2e';

        return (
          <group key={node.index}>
            {/* Current pulse */}
            {node.status === 'current' && (
              <mesh position={[cx, cy, 2]}>
                <circleGeometry args={[3.5, 24]} />
                <meshBasicMaterial color={NODE_COLORS.current} transparent opacity={0.15} />
              </mesh>
            )}
            {/* Animated hex ring for completed/current */}
            {node.status !== 'locked' && (
              <AnimatedNodeRing cx={cx} cy={cy} r={r} color={NODE_COLORS[node.status]} />
            )}
            {/* Glow */}
            {node.status !== 'locked' && (
              <mesh position={[cx, cy, 2.1]}>
                <circleGeometry args={[r * 1.6, 24]} />
                <meshBasicMaterial color={NODE_COLORS[node.status]} transparent opacity={0.2} />
              </mesh>
            )}
            {/* Main circle */}
            <mesh position={[cx, cy, 2.5]}>
              <circleGeometry args={[r, 24]} />
              <meshBasicMaterial color={fillColor} />
            </mesh>
            {/* Ring */}
            <mesh position={[cx, cy, 2.6]}>
              <ringGeometry args={[r - 0.2, r + 0.2, 24]} />
              <meshBasicMaterial color={NODE_COLORS[node.status]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function EnemiesLayer({ nodes }: { nodes: MountainNode[] }) {
  return (
    <group>
      {ENEMIES.map(enemy => {
        const node = nodes[enemy.nodeIndex];
        if (!node) return null;
        const xPos = node.x > 50 ? node.x - 8 : node.x + 5;
        const yPos = VIEW - node.y + 4;
        return (
          <Html key={enemy.name} position={[xPos, yPos, 4]} center style={{ pointerEvents: 'none' }}>
            <span style={{
              color: THEME.lavaOrange,
              fontWeight: 'bold',
              fontSize: '10px',
              whiteSpace: 'nowrap',
              textShadow: '0 0 6px rgba(255,107,53,0.6)',
            }}>
              {enemy.icon} {enemy.name}
            </span>
          </Html>
        );
      })}
    </group>
  );
}

function Scene({ nodes }: { nodes: MountainNode[] }) {
  const { camera } = useThree();

  return (
    <>
      <ambientLight intensity={0.2} />
      <CameraBreathing />
      <SkyBackground />
      <StarsLayer />
      <BgMountains />
      <CraterInterior />
      <VolcanoBody />
      <StrataLines />
      <PixelBlocksLayer />
      <VolcanicCracksLayer />
      <LavaSystem />
      <AnimatedEmbers />
      <GroundLayer />
      <PathsLayer nodes={nodes} />
      <EnemiesLayer nodes={nodes} />
      <NodesLayer nodes={nodes} />
    </>
  );
}

export default function MountainMapR3F({ nodes, completedNodes }: MountainMapRendererProps) {
  return (
    <div className="w-full h-full min-h-[400px]" style={{ background: 'transparent' }}>
      <Canvas
        orthographic
        camera={{
          position: [50, 50, 10],
          zoom: 1,
          left: 0,
          right: VIEW,
          top: VIEW,
          bottom: 0,
          near: -100,
          far: 100,
        }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <Scene nodes={nodes} />
      </Canvas>
    </div>
  );
}
