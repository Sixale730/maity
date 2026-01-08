import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import type { ShowcaseCanvasProps } from '../types/showcase.types';

/**
 * Shared Canvas wrapper with Crossy Road style lighting
 * Reuses lighting configuration from VoxelAvatar.tsx
 */
export function ShowcaseCanvas({
  children,
  enableRotation = true,
  enableZoom = false,
  autoRotate = true,
  className = '',
}: ShowcaseCanvasProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{
          position: [0, 0.5, 3],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
        shadows
        frameloop="demand"
      >
        <Suspense fallback={null}>
          {/* Crossy Road style lighting - bright and cheerful */}
          <ambientLight intensity={0.85} />

          {/* Main light - front top right */}
          <directionalLight
            position={[3, 4, 5]}
            intensity={0.7}
            castShadow
            shadow-mapSize={[512, 512]}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
            shadow-camera-near={0.1}
            shadow-camera-far={20}
          />

          {/* Fill light - left side */}
          <directionalLight position={[-3, 2, 3]} intensity={0.4} />

          {/* Rim light - from behind for cartoon pop */}
          <directionalLight position={[0, 2, -4]} intensity={0.3} />

          {/* Bottom fill - lighten shadows */}
          <directionalLight position={[0, -2, 2]} intensity={0.15} />

          {/* Content */}
          {children}

          {/* Controls */}
          <OrbitControls
            enableZoom={enableZoom}
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={1.5}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.8}
            enableRotate={enableRotation}
            target={[0, 0.3, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default ShowcaseCanvas;
