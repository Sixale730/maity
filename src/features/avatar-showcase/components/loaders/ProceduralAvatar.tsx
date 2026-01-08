import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { LoaderAvatarProps } from '../../types/showcase.types';

/**
 * Procedural voxel avatar - similar to VoxelChicken
 * Uses pure BoxGeometry without external assets
 */
export function ProceduralAvatar({
  scale = 1,
  position = [0, 0, 0],
}: LoaderAvatarProps) {
  const groupRef = useRef<Group>(null);

  // Animate: gentle bounce and rotation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(time * 2.5) * 0.03;
      groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    }
  });

  const colors = {
    body: '#FFFFFF',
    crest: '#DC2626',
    beak: '#F97316',
    legs: '#F97316',
  };

  return (
    <group ref={groupRef} scale={scale} position={position}>
      {/* Body - main */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.5, 0.45, 0.4]} />
        <meshStandardMaterial color={colors.body} flatShading />
      </mesh>

      {/* Body - top */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.4, 0.15, 0.35]} />
        <meshStandardMaterial color={colors.body} flatShading />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.7, 0.05]} castShadow>
        <boxGeometry args={[0.35, 0.3, 0.3]} />
        <meshStandardMaterial color={colors.body} flatShading />
      </mesh>

      {/* Crest - 3 bumps */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.08, 0.12, 0.08]} />
        <meshStandardMaterial color={colors.crest} flatShading />
      </mesh>
      <mesh position={[-0.08, 0.87, 0]} castShadow>
        <boxGeometry args={[0.06, 0.08, 0.06]} />
        <meshStandardMaterial color={colors.crest} flatShading />
      </mesh>
      <mesh position={[0.08, 0.87, 0]} castShadow>
        <boxGeometry args={[0.06, 0.08, 0.06]} />
        <meshStandardMaterial color={colors.crest} flatShading />
      </mesh>

      {/* Beak */}
      <mesh position={[0, 0.65, 0.22]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.1]} />
        <meshStandardMaterial color={colors.beak} flatShading />
      </mesh>
      <mesh position={[0, 0.63, 0.28]} castShadow>
        <boxGeometry args={[0.08, 0.05, 0.06]} />
        <meshStandardMaterial color={colors.beak} flatShading />
      </mesh>

      {/* Wattle (red thing under beak) */}
      <mesh position={[0, 0.58, 0.18]} castShadow>
        <boxGeometry args={[0.06, 0.08, 0.04]} />
        <meshStandardMaterial color={colors.crest} flatShading />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.08, 0.72, 0.16]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.08, 0.72, 0.16]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Wings */}
      <mesh position={[-0.3, 0.3, 0]} castShadow>
        <boxGeometry args={[0.1, 0.25, 0.2]} />
        <meshStandardMaterial color={colors.body} flatShading />
      </mesh>
      <mesh position={[0.3, 0.3, 0]} castShadow>
        <boxGeometry args={[0.1, 0.25, 0.2]} />
        <meshStandardMaterial color={colors.body} flatShading />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.35, -0.25]} castShadow>
        <boxGeometry args={[0.15, 0.2, 0.1]} />
        <meshStandardMaterial color={colors.body} flatShading />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.1, 0.02, 0]} castShadow>
        <boxGeometry args={[0.06, 0.12, 0.06]} />
        <meshStandardMaterial color={colors.legs} flatShading />
      </mesh>
      <mesh position={[0.1, 0.02, 0]} castShadow>
        <boxGeometry args={[0.06, 0.12, 0.06]} />
        <meshStandardMaterial color={colors.legs} flatShading />
      </mesh>

      {/* Feet */}
      <mesh position={[-0.1, -0.05, 0.03]} castShadow>
        <boxGeometry args={[0.1, 0.02, 0.12]} />
        <meshStandardMaterial color={colors.legs} flatShading />
      </mesh>
      <mesh position={[0.1, -0.05, 0.03]} castShadow>
        <boxGeometry args={[0.1, 0.02, 0.12]} />
        <meshStandardMaterial color={colors.legs} flatShading />
      </mesh>

      {/* Ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

export default ProceduralAvatar;
