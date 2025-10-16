/// <reference types="vite/client" />

// Type declarations for @react-three/fiber JSX elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Geometry primitives
      bufferGeometry: any;
      bufferAttribute: any;
      sphereGeometry: any;
      boxGeometry: any;
      planeGeometry: any;
      cylinderGeometry: any;

      // Materials
      meshBasicMaterial: any;
      meshStandardMaterial: any;
      meshPhysicalMaterial: any;
      pointsMaterial: any;
      lineBasicMaterial: any;

      // Objects
      mesh: any;
      points: any;
      line: any;
      group: any;

      // Lights
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      spotLight: any;
      hemisphereLight: any;
    }
  }
}
