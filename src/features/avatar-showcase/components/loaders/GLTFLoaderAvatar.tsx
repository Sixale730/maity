import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import type { Group } from 'three';
import type { LoaderAvatarProps } from '../../types/showcase.types';

/**
 * GLTF/GLB file loader using drei's optimized loader
 * Supports animations and PBR materials
 */
export function GLTFLoaderAvatar({
  url = '/avatar-showcase/gltf/character.glb',
  scale = 0.5,
  position = [0, 0, 0],
}: LoaderAvatarProps) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(url);

  // Animate: gentle bounce
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(time * 2) * 0.02;
    }
  });

  // Clone scene to avoid mutation
  const clonedScene = scene.clone();

  return (
    <group ref={groupRef} scale={scale} position={position}>
      <primitive object={clonedScene} position={[0, 0, 0]} />

      {/* Ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

/**
 * Fallback component when GLTF file is not available
 * Shows a Kenney-style mini character
 */
export function GLTFLoaderFallback({
  scale = 1,
  position = [0, 0, 0],
}: LoaderAvatarProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.rotation.y = time * 0.5;
      groupRef.current.position.y = Math.sin(time * 2.5) * 0.03;
    }
  });

  const colors = {
    skin: '#FFD7C4',
    hair: '#3D2314',
    shirt: '#E91E63',
    pants: '#1A237E',
    shoes: '#212121',
  };

  return (
    <group ref={groupRef} scale={scale} position={position}>
      {/* Head */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.35]} />
        <meshStandardMaterial color={colors.skin} flatShading />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 0.98, -0.02]} castShadow>
        <boxGeometry args={[0.42, 0.12, 0.38]} />
        <meshStandardMaterial color={colors.hair} flatShading />
      </mesh>
      <mesh position={[0, 0.88, -0.15]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.1]} />
        <meshStandardMaterial color={colors.hair} flatShading />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.1, 0.78, 0.18]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.1, 0.78, 0.18]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-0.1, 0.78, 0.19]}>
        <boxGeometry args={[0.04, 0.04, 0.02]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.1, 0.78, 0.19]}>
        <boxGeometry args={[0.04, 0.04, 0.02]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Smile */}
      <mesh position={[0, 0.65, 0.18]}>
        <boxGeometry args={[0.12, 0.03, 0.02]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Body/Shirt */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[0.45, 0.4, 0.3]} />
        <meshStandardMaterial color={colors.shirt} flatShading />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.3, 0.4, 0]} castShadow>
        <boxGeometry args={[0.12, 0.35, 0.12]} />
        <meshStandardMaterial color={colors.shirt} flatShading />
      </mesh>
      <mesh position={[0.3, 0.4, 0]} castShadow>
        <boxGeometry args={[0.12, 0.35, 0.12]} />
        <meshStandardMaterial color={colors.shirt} flatShading />
      </mesh>

      {/* Hands */}
      <mesh position={[-0.3, 0.18, 0]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color={colors.skin} flatShading />
      </mesh>
      <mesh position={[0.3, 0.18, 0]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color={colors.skin} flatShading />
      </mesh>

      {/* Pants */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.4, 0.15, 0.28]} />
        <meshStandardMaterial color={colors.pants} flatShading />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.1, -0.02, 0]} castShadow>
        <boxGeometry args={[0.14, 0.18, 0.14]} />
        <meshStandardMaterial color={colors.pants} flatShading />
      </mesh>
      <mesh position={[0.1, -0.02, 0]} castShadow>
        <boxGeometry args={[0.14, 0.18, 0.14]} />
        <meshStandardMaterial color={colors.pants} flatShading />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.1, -0.13, 0.02]} castShadow>
        <boxGeometry args={[0.15, 0.06, 0.18]} />
        <meshStandardMaterial color={colors.shoes} flatShading />
      </mesh>
      <mesh position={[0.1, -0.13, 0.02]} castShadow>
        <boxGeometry args={[0.15, 0.06, 0.18]} />
        <meshStandardMaterial color={colors.shoes} flatShading />
      </mesh>

      {/* Ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.16, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

export default GLTFLoaderAvatar;
