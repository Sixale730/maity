import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '../../theme';

interface VoiceOrbSVGProps {
  isListening: boolean;
  isSpeaking: boolean;
}

// Animated SVG Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function VoiceOrbSVG({ isListening, isSpeaking }: VoiceOrbSVGProps) {
  // Animation values for 3 wave circles
  const wave1Scale = useRef(new Animated.Value(1)).current;
  const wave1Opacity = useRef(new Animated.Value(0)).current;
  const wave2Scale = useRef(new Animated.Value(1)).current;
  const wave2Opacity = useRef(new Animated.Value(0)).current;
  const wave3Scale = useRef(new Animated.Value(1)).current;
  const wave3Opacity = useRef(new Animated.Value(0)).current;

  // Core pulse animation
  const corePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Determine animation speed and intensity
    const speed = isSpeaking ? 1000 : 1800;
    const maxScale = isSpeaking ? 2.5 : 2.0;

    // Core pulse animation
    const coreAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(corePulse, {
          toValue: isSpeaking ? 1.15 : 1.08,
          duration: speed / 2,
          useNativeDriver: true,
        }),
        Animated.timing(corePulse, {
          toValue: 1,
          duration: speed / 2,
          useNativeDriver: true,
        }),
      ])
    );

    // Wave animation creator
    const createWaveAnimation = (
      scaleAnim: Animated.Value,
      opacityAnim: Animated.Value,
      delay: number
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: maxScale,
              duration: speed,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: speed,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.7,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    };

    // Only animate if connected
    if (isListening || isSpeaking) {
      const wave1Anim = createWaveAnimation(wave1Scale, wave1Opacity, 0);
      const wave2Anim = createWaveAnimation(wave2Scale, wave2Opacity, speed * 0.33);
      const wave3Anim = createWaveAnimation(wave3Scale, wave3Opacity, speed * 0.66);

      coreAnimation.start();
      wave1Anim.start();
      wave2Anim.start();
      wave3Anim.start();

      // Initialize wave opacity
      wave1Opacity.setValue(0.7);
      wave2Opacity.setValue(0.7);
      wave3Opacity.setValue(0.7);

      return () => {
        coreAnimation.stop();
        wave1Anim.stop();
        wave2Anim.stop();
        wave3Anim.stop();
      };
    } else {
      // Reset animations when idle
      corePulse.setValue(1);
      wave1Scale.setValue(1);
      wave1Opacity.setValue(0);
      wave2Scale.setValue(1);
      wave2Opacity.setValue(0);
      wave3Scale.setValue(1);
      wave3Opacity.setValue(0);
    }
  }, [isListening, isSpeaking]);

  // Color based on state
  const color = isSpeaking
    ? colors.secondary // Azul cuando habla
    : isListening
    ? colors.success // Verde cuando escucha
    : colors.textSecondary; // Gris cuando idle

  const centerX = 100;
  const centerY = 100;
  const baseRadius = 35;

  return (
    <View style={styles.container}>
      <Svg height="200" width="200" viewBox="0 0 200 200">
        <Defs>
          {/* Gradiente radial para el núcleo */}
          <RadialGradient id="coreGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </RadialGradient>

          {/* Gradiente para las ondas */}
          <RadialGradient id="waveGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0" />
            <Stop offset="70%" stopColor={color} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Wave 3 - Más externa */}
        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          r={baseRadius}
          fill="url(#waveGradient)"
          stroke={color}
          strokeWidth="2"
          opacity={wave3Opacity}
          scale={wave3Scale}
          origin={`${centerX}, ${centerY}`}
        />

        {/* Wave 2 - Media */}
        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          r={baseRadius}
          fill="url(#waveGradient)"
          stroke={color}
          strokeWidth="2"
          opacity={wave2Opacity}
          scale={wave2Scale}
          origin={`${centerX}, ${centerY}`}
        />

        {/* Wave 1 - Más cercana */}
        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          r={baseRadius}
          fill="url(#waveGradient)"
          stroke={color}
          strokeWidth="2"
          opacity={wave1Opacity}
          scale={wave1Scale}
          origin={`${centerX}, ${centerY}`}
        />

        {/* Core - Núcleo central con pulso */}
        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          r={baseRadius}
          fill="url(#coreGradient)"
          stroke={color}
          strokeWidth="3"
          scale={corePulse}
          origin={`${centerX}, ${centerY}`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
