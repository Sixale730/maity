import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AgentState } from './CoachPage';

interface CosmosEnvironmentProps {
  agentState: AgentState;
}

function Stars({ count = 2000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Random position in sphere
      const radius = Math.random() * 15 + 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // White/blue colors
      colors[i3] = 0.8 + Math.random() * 0.2;     // Red
      colors[i3 + 1] = 0.8 + Math.random() * 0.2; // Green
      colors[i3 + 2] = 0.9 + Math.random() * 0.1; // Blue
    }

    return [positions, colors];
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.02;
      ref.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation={false}
      />
    </points>
  );
}

function CentralOrb({ agentState }: { agentState: AgentState }) {
  const ref = useRef<THREE.Mesh>(null);

  const getColor = () => {
    switch (agentState) {
      case 'listening': return '#00ff88';
      case 'thinking': return '#ffaa00';
      case 'speaking': return '#ff6600';
      default: return '#4466ff';
    }
  };

  useFrame((state) => {
    if (ref.current) {
      const baseScale = agentState === 'listening' ? 1.5 :
                       agentState === 'thinking' ? 1.2 :
                       agentState === 'speaking' ? 1.8 : 1.0;
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 1;
      ref.current.scale.setScalar(baseScale * pulse);
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -5]}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial
        color={getColor()}
        transparent
        opacity={0.3}
        wireframe
      />
    </mesh>
  );
}

function FloatingParticles() {
  const count = 100;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 20;
      pos[i3 + 1] = (Math.random() - 0.5) * 20;
      pos[i3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.01;
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={3}
        color="#6699ff"
        transparent
        opacity={0.6}
        sizeAttenuation={false}
      />
    </points>
  );
}

export function CosmosEnvironment({ agentState }: CosmosEnvironmentProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />

      {/* Star field background */}
      <Stars count={1500} />

      {/* Central reactive orb */}
      <CentralOrb agentState={agentState} />

      {/* Floating particles */}
      <FloatingParticles />
    </>
  );
}