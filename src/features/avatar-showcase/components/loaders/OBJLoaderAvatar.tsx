import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import type { Group } from 'three';
import type { LoaderAvatarProps } from '../../types/showcase.types';

/**
 * OBJ file loader for Wavefront models
 * Uses Three.js OBJLoader
 */
export function OBJLoaderAvatar({
  url = '/avatar-showcase/obj/robot.obj',
  scale = 0.5,
  position = [0, 0, 0],
}: LoaderAvatarProps) {
  const groupRef = useRef<Group>(null);
  const obj = useLoader(OBJLoader, url);

  // Animate: gentle bounce
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(time * 2) * 0.02;
    }
  });

  // Clone to avoid mutation issues
  const clonedObj = obj.clone();

  // Apply material to all meshes
  clonedObj.traverse((child) => {
    if ((child as any).isMesh) {
      (child as any).material = (child as any).material.clone();
      (child as any).material.flatShading = true;
      (child as any).castShadow = true;
      (child as any).receiveShadow = true;
    }
  });

  return (
    <group ref={groupRef} scale={scale} position={position}>
      <primitive object={clonedObj} position={[0, 0, 0]} />

      {/* Ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

/**
 * Fallback component when OBJ file is not available
 * Shows a simple robot-style voxel character
 */
export function OBJLoaderFallback({
  scale = 1,
  position = [0, 0, 0],
}: LoaderAvatarProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.rotation.y = time * 0.5;
      groupRef.current.position.y = Math.sin(time * 2) * 0.02;
    }
  });

  const colors = {
    body: '#607D8B',
    accent: '#4CAF50',
    dark: '#37474F',
    eye: '#FFEB3B',
  };

  return (
    <group ref={groupRef} scale={scale} position={position}>
      {/* Head */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.45, 0.4, 0.35]} />
        <meshStandardMaterial color={colors.body} flatShading />
      </mesh>

      {/* Antenna */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.05, 0.15, 0.05]} />
        <meshStandardMaterial color={colors.dark} flatShading />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color={colors.accent} flatShading />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.12, 0.78, 0.18]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshBasicMaterial color={colors.eye} />
      </mesh>
      <mesh position={[0.12, 0.78, 0.18]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshBasicMaterial color={colors.eye} />
      </mesh>

      {/* Mouth */}
      <mesh position={[0, 0.62, 0.18]}>
        <boxGeometry args={[0.2, 0.04, 0.02]} />
        <meshBasicMaterial color={colors.dark} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.5, 0.45, 0.35]} />
        <meshStandardMaterial color={colors.body} flatShading />
      </mesh>

      {/* Chest light */}
      <mesh position={[0, 0.4, 0.18]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshStandardMaterial color={colors.accent} flatShading emissive={colors.accent} emissiveIntensity={0.3} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.35, 0.35, 0]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.15]} />
        <meshStandardMaterial color={colors.dark} flatShading />
      </mesh>
      <mesh position={[0.35, 0.35, 0]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.15]} />
        <meshStandardMaterial color={colors.dark} flatShading />
      </mesh>

      {/* Hands */}
      <mesh position={[-0.35, 0.1, 0]} castShadow>
        <boxGeometry args={[0.12, 0.1, 0.12]} />
        <meshStandardMaterial color={colors.body} flatShading />
      </mesh>
      <mesh position={[0.35, 0.1, 0]} castShadow>
        <boxGeometry args={[0.12, 0.1, 0.12]} />
        <meshStandardMaterial color={colors.body} flatShading />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.12, 0.02, 0]} castShadow>
        <boxGeometry args={[0.15, 0.2, 0.18]} />
        <meshStandardMaterial color={colors.dark} flatShading />
      </mesh>
      <mesh position={[0.12, 0.02, 0]} castShadow>
        <boxGeometry args={[0.15, 0.2, 0.18]} />
        <meshStandardMaterial color={colors.dark} flatShading />
      </mesh>

      {/* Feet */}
      <mesh position={[-0.12, -0.1, 0.03]} castShadow>
        <boxGeometry args={[0.18, 0.06, 0.22]} />
        <meshStandardMaterial color={colors.body} flatShading />
      </mesh>
      <mesh position={[0.12, -0.1, 0.03]} castShadow>
        <boxGeometry args={[0.18, 0.06, 0.22]} />
        <meshStandardMaterial color={colors.body} flatShading />
      </mesh>

      {/* Ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.13, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

export default OBJLoaderAvatar;
