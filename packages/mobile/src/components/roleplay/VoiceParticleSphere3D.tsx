import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Fill,
  BlurMask,
} from '@shopify/react-native-skia';
import { colors } from '../../theme';

interface VoiceParticleSphere3DProps {
  isListening: boolean;
  isSpeaking: boolean;
}

interface Particle {
  theta: number;
  phi: number;
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  pulseOffset: number;
}

const CANVAS_SIZE = 250; // Tamaño optimizado para móvil
const PARTICLE_COUNT = 120; // Balance entre fidelidad y performance
const BASE_RADIUS = 80;

export function VoiceParticleSphere3D({ isListening, isSpeaking }: VoiceParticleSphere3DProps) {
  const timeRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const [particles, setParticles] = useState<Particle[]>([]);

  // Crear partículas una sola vez
  useEffect(() => {
    const initialParticles = Array.from({ length: PARTICLE_COUNT }, () => ({
      theta: Math.random() * Math.PI * 2,
      phi: Math.acos(Math.random() * 2 - 1),
      x: 0,
      y: 0,
      z: 0,
      baseRadius: BASE_RADIUS,
      pulseOffset: Math.random() * Math.PI * 2,
    }));
    setParticles(initialParticles);
  }, []);

  // Función para actualizar posición de partícula
  const updateParticlePosition = (particle: Particle, time: number): Particle => {
    let pulseFactor = 1;
    let newTheta = particle.theta;
    let newPhi = particle.phi;

    if (isSpeaking) {
      // Cuando habla: movimiento visible pero suave
      pulseFactor = 1 + Math.sin(time * 0.004 + particle.pulseOffset) * 0.2;
      newTheta += 0.003 + Math.sin(time * 0.002) * 0.002;
      newPhi += Math.sin(time * 0.0015 + particle.pulseOffset) * 0.004;
    } else if (isListening) {
      // Cuando escucha: animación suave de suspensión
      pulseFactor = 1 + Math.sin(time * 0.002 + particle.pulseOffset) * 0.08;
      newTheta += 0.0005;
      newPhi += Math.sin(time * 0.0008) * 0.002;
    } else {
      // Idle: movimiento muy lento
      newTheta += 0.0002;
    }

    const radius = particle.baseRadius * pulseFactor;

    // Limitar el radio al tamaño del contenedor para que no se salgan las partículas
    const maxRadius = BASE_RADIUS - 10; // 20px de margen dentro del borde para seguridad
    const clampedRadius = Math.min(radius, maxRadius);

    // Conversión de coordenadas esféricas a cartesianas
    const x = clampedRadius * Math.sin(newPhi) * Math.cos(newTheta);
    const y = clampedRadius * Math.sin(newPhi) * Math.sin(newTheta);
    const z = clampedRadius * Math.cos(newPhi);

    return {
      ...particle,
      theta: newTheta,
      phi: newPhi,
      x,
      y,
      z,
    };
  };

  // Animación continua con requestAnimationFrame
  useEffect(() => {
    if (particles.length === 0) return;

    const animate = () => {
      // Velocidad según estado
      const speed = isSpeaking ? 12 : isListening ? 8 : 4;
      timeRef.current += speed;

      setParticles((prevParticles) =>
        prevParticles.map((particle) =>
          updateParticlePosition(particle, timeRef.current)
        )
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles.length, isListening, isSpeaking]);

  // Ordenar partículas por profundidad z (más lejanas primero)
  const sortedParticles = useMemo(() => {
    return [...particles].sort((a, b) => a.z - b.z);
  }, [particles]);

  // Color según estado
  const primaryColor = colors.success; // Verde
  const secondaryColor = colors.secondary; // Azul
  const idleColor = colors.textSecondary; // Gris

  const currentColor = isSpeaking ? secondaryColor : isListening ? primaryColor : idleColor;

  // Convertir color hex a rgba con alpha
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const centerX = CANVAS_SIZE / 2;
  const centerY = CANVAS_SIZE / 2;

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {/* Fondo oscuro transparente */}
        <Fill color="rgba(0, 0, 0, 0.05)" />

        {/* Glow background principal */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={BASE_RADIUS + 40}
          color={hexToRgba(currentColor, isSpeaking ? 0.25 : isListening ? 0.2 : 0.08)}
        >
          <BlurMask blur={50} style="normal" />
        </Circle>

        {/* Partículas 3D ordenadas por profundidad */}
        {sortedParticles.map((particle, index) => {
          // Proyección 3D a 2D (perspectiva)
          const scale = 200 / (200 + particle.z);
          const x2d = centerX + particle.x * scale;
          const y2d = centerY + particle.y * scale;

          // Tamaño y opacidad basados en profundidad
          const size = Math.max(0.5, 3 * scale);
          const baseOpacity = Math.min(1, Math.max(0.2, scale));

          // Calcular color con pulse dinámico
          const pulse = Math.sin((timeRef.current + particle.pulseOffset) * 0.005) * 0.3;
          const opacity = isSpeaking
            ? baseOpacity * (0.8 + pulse)
            : isListening
            ? baseOpacity * (0.9 + pulse)
            : baseOpacity * 0.6;

          const particleColor = hexToRgba(currentColor, opacity);

          return (
            <Group key={`particle-${index}`}>
              {/* Efecto glow para partículas cercanas (en primer plano) */}
              {scale > 0.8 && (
                <Circle
                  cx={x2d}
                  cy={y2d}
                  r={size * 2.5}
                  color={hexToRgba(
                    currentColor,
                    isSpeaking ? 0.18 : isListening ? 0.22 : 0.1
                  )}
                >
                  <BlurMask blur={8} style="normal" />
                </Circle>
              )}

              {/* Partícula principal */}
              <Circle cx={x2d} cy={y2d} r={size} color={particleColor} />
            </Group>
          );
        })}

        {/* Círculo contenedor - borde grueso sin relleno */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={BASE_RADIUS + 10}
          color={hexToRgba(currentColor, isSpeaking ? 0.8 : isListening ? 0.9 : 0.5)}
          style="stroke"
          strokeWidth={5}
        />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },
});
