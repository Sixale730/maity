import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '../../../theme';

interface VoiceParticleOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
}

interface Particle {
  angle: number;
  baseAngle: number;
  speed: number;
  baseDistance: number;
  distance: number;
  size: number;
  phaseOffset: number;
  opacity: number;
}

const PARTICLE_COUNT = 25;
const ORB_SIZE = 200;
const CORE_SIZE = 80;

export function VoiceParticleOrb({ isListening, isSpeaking }: VoiceParticleOrbProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const coreScaleAnim = useRef(new Animated.Value(1)).current;
  const coreOpacityAnim = useRef(new Animated.Value(0.8)).current;
  const timeRef = useRef(0);
  const animationFrameRef = useRef<number>();

  // Inicializar partículas solo una vez
  useEffect(() => {
    const initialParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      angle: (i / PARTICLE_COUNT) * Math.PI * 2,
      baseAngle: (i / PARTICLE_COUNT) * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5,
      baseDistance: 45 + Math.random() * 25,
      distance: 45 + Math.random() * 25,
      size: 3 + Math.random() * 4,
      phaseOffset: Math.random() * Math.PI * 2,
      opacity: 0.6 + Math.random() * 0.4,
    }));
    setParticles(initialParticles);
  }, []);

  // Animaciones del núcleo
  useEffect(() => {
    let coreAnimation: Animated.CompositeAnimation;

    if (isSpeaking) {
      // Núcleo pulsante rápido cuando habla
      coreAnimation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(coreScaleAnim, {
              toValue: 1.15,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(coreOpacityAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(coreScaleAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(coreOpacityAnim, {
              toValue: 0.7,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    } else if (isListening) {
      // Núcleo pulsante suave cuando escucha
      coreAnimation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(coreScaleAnim, {
              toValue: 1.08,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(coreOpacityAnim, {
              toValue: 0.95,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(coreScaleAnim, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(coreOpacityAnim, {
              toValue: 0.75,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    } else {
      // Núcleo estático cuando está idle
      coreAnimation = Animated.parallel([
        Animated.timing(coreScaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(coreOpacityAnim, {
          toValue: 0.6,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
    }

    coreAnimation.start();

    return () => {
      coreAnimation.stop();
    };
  }, [isListening, isSpeaking, coreScaleAnim, coreOpacityAnim]);

  // Animación de partículas con requestAnimationFrame
  useEffect(() => {
    if (particles.length === 0) return;

    const animate = () => {
      timeRef.current += 1;

      setParticles((prevParticles) =>
        prevParticles.map((particle) => {
          // Velocidad de rotación según estado
          const rotationSpeed = isSpeaking ? 0.015 : isListening ? 0.01 : 0.005;

          // Pulso de distancia según estado
          const distancePulse = isSpeaking ? 12 : isListening ? 6 : 2;
          const distanceWave = Math.sin(timeRef.current * 0.02 + particle.phaseOffset) * distancePulse;

          // Pulso de opacidad
          const opacityWave = Math.sin(timeRef.current * 0.03 + particle.phaseOffset) * 0.3;

          return {
            ...particle,
            angle: particle.angle + rotationSpeed * particle.speed,
            distance: particle.baseDistance + distanceWave,
            opacity: Math.max(0.3, Math.min(1, 0.7 + opacityWave)),
          };
        })
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

  // Color según estado
  const coreColor = isSpeaking
    ? colors.secondary // Azul cuando habla
    : isListening
    ? colors.success // Verde cuando escucha
    : colors.textSecondary; // Gris cuando idle

  const particleColor = isSpeaking
    ? colors.secondary
    : isListening
    ? colors.success
    : colors.textSecondary;

  const centerX = ORB_SIZE / 2;
  const centerY = ORB_SIZE / 2;

  return (
    <View style={styles.container}>
      {/* Glow effect de fondo */}
      <Animated.View
        style={[
          styles.glowBackground,
          {
            backgroundColor: coreColor,
            opacity: isSpeaking ? 0.3 : isListening ? 0.2 : 0.1,
            transform: [{ scale: coreScaleAnim }],
          },
        ]}
      />

      <Svg height={ORB_SIZE} width={ORB_SIZE} viewBox={`0 0 ${ORB_SIZE} ${ORB_SIZE}`}>
        <Defs>
          {/* Gradiente radial para el núcleo */}
          <RadialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={coreColor} stopOpacity="1" />
            <Stop offset="70%" stopColor={coreColor} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={coreColor} stopOpacity="0.3" />
          </RadialGradient>

          {/* Gradiente para partículas */}
          <RadialGradient id="particleGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={particleColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={particleColor} stopOpacity="0.5" />
          </RadialGradient>
        </Defs>

        {/* Aura externa del núcleo (más lejana) */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={CORE_SIZE / 2 + 15}
          fill={coreColor}
          opacity={0.1}
        />

        {/* Aura media del núcleo */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={CORE_SIZE / 2 + 8}
          fill={coreColor}
          opacity={0.2}
        />

        {/* Renderizar partículas orbitando */}
        {particles.map((particle, index) => {
          const x = centerX + particle.distance * Math.cos(particle.angle);
          const y = centerY + particle.distance * Math.sin(particle.angle);

          // Calcular profundidad simulada (partículas más lejanas son más pequeñas y tenues)
          const depth = Math.cos(particle.angle + Math.PI / 2);
          const depthScale = 0.7 + (depth + 1) / 4; // Entre 0.7 y 1.2
          const finalSize = particle.size * depthScale;
          const finalOpacity = particle.opacity * (0.6 + (depth + 1) / 5);

          return (
            <Circle
              key={`particle-${index}`}
              cx={x}
              cy={y}
              r={finalSize}
              fill="url(#particleGradient)"
              opacity={finalOpacity}
            />
          );
        })}

        {/* Núcleo central con gradiente */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={CORE_SIZE / 2}
          fill="url(#coreGradient)"
        />
      </Svg>

      {/* Wrapper animado para el núcleo - efecto adicional */}
      <Animated.View
        style={[
          styles.coreAnimatedOverlay,
          {
            transform: [{ scale: coreScaleAnim }],
            opacity: coreOpacityAnim.interpolate({
              inputRange: [0.6, 1],
              outputRange: [0, 0.15],
            }),
            backgroundColor: coreColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowBackground: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
  },
  coreAnimatedOverlay: {
    position: 'absolute',
    width: CORE_SIZE,
    height: CORE_SIZE,
    borderRadius: CORE_SIZE / 2,
  },
});
