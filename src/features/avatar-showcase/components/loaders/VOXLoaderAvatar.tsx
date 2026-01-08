import { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { VOXLoader } from 'three/examples/jsm/loaders/VOXLoader.js';
import type { Group, Mesh } from 'three';
import type { LoaderAvatarProps } from '../../types/showcase.types';

/**
 * VOX file loader for MagicaVoxel models
 * Uses Three.js official VOXLoader
 */
export function VOXLoaderAvatar({
  url = '/avatar-showcase/vox/chr_knight.vox',
  scale = 0.05,
  position = [0, 0, 0],
}: LoaderAvatarProps) {
  const groupRef = useRef<Group>(null);

  // Animate: gentle rotation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(time * 2) * 0.02;
    }
  });

  // Load VOX file
  const chunks = useLoader(VOXLoader, url);

  return (
    <group ref={groupRef} scale={scale} position={position}>
      {chunks.map((chunk, index) => {
        const mesh = chunk.buildMesh();
        // Center the mesh
        mesh.geometry.center();
        return (
          <primitive
            key={index}
            object={mesh}
            position={[0, 0.5, 0]}
            castShadow
            receiveShadow
          />
        );
      })}

      {/* Ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <circleGeometry args={[8, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

/**
 * Fallback component when VOX file is not available
 */
export function VOXLoaderFallback({
  scale = 1,
  position = [0, 0, 0],
}: LoaderAvatarProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.rotation.y = time * 0.5;
    }
  });

  // Simple voxel cube representation
  return (
    <group ref={groupRef} scale={scale} position={position}>
      {/* Main body - knight style */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.3]} />
        <meshStandardMaterial color="#4A90D9" flatShading />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.35, 0.35, 0.3]} />
        <meshStandardMaterial color="#C0C0C0" flatShading />
      </mesh>

      {/* Helmet visor */}
      <mesh position={[0, 0.75, 0.16]} castShadow>
        <boxGeometry args={[0.25, 0.1, 0.02]} />
        <meshStandardMaterial color="#1A1A2E" flatShading />
      </mesh>

      {/* Sword */}
      <mesh position={[0.35, 0.3, 0]} castShadow>
        <boxGeometry args={[0.08, 0.6, 0.04]} />
        <meshStandardMaterial color="#C0C0C0" flatShading metalness={0.5} />
      </mesh>

      {/* Sword handle */}
      <mesh position={[0.35, 0.05, 0]} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.06]} />
        <meshStandardMaterial color="#8B4513" flatShading />
      </mesh>

      {/* Shield */}
      <mesh position={[-0.3, 0.35, 0.05]} castShadow>
        <boxGeometry args={[0.08, 0.4, 0.3]} />
        <meshStandardMaterial color="#DC2626" flatShading />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.1, 0.08, 0]} castShadow>
        <boxGeometry args={[0.12, 0.25, 0.15]} />
        <meshStandardMaterial color="#4A90D9" flatShading />
      </mesh>
      <mesh position={[0.1, 0.08, 0]} castShadow>
        <boxGeometry args={[0.12, 0.25, 0.15]} />
        <meshStandardMaterial color="#4A90D9" flatShading />
      </mesh>

      {/* Ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

export default VOXLoaderAvatar;
