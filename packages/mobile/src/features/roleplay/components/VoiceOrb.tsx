import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../../../theme';

interface VoiceOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export function VoiceOrb({ isListening, isSpeaking }: VoiceOrbProps) {
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Determinar velocidad y amplitud según el estado
    const speed = isSpeaking ? 800 : 1500; // Speaking más rápido
    const scaleMax = isSpeaking ? 1.5 : 1.3; // Speaking más expansivo

    // Animación para cada aura con delays diferentes
    const createPulseAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(animValue, {
              toValue: 1,
              duration: speed,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Solo animar si está en conversación (listening o speaking)
    if (isListening || isSpeaking) {
      const anim1 = createPulseAnimation(pulseAnim1, 0);
      const anim2 = createPulseAnimation(pulseAnim2, speed * 0.33);
      const anim3 = createPulseAnimation(pulseAnim3, speed * 0.66);

      anim1.start();
      anim2.start();
      anim3.start();

      return () => {
        anim1.stop();
        anim2.stop();
        anim3.stop();
      };
    } else {
      // Reset animations cuando está idle
      pulseAnim1.setValue(0);
      pulseAnim2.setValue(0);
      pulseAnim3.setValue(0);
    }
  }, [isListening, isSpeaking, pulseAnim1, pulseAnim2, pulseAnim3]);

  // Color según estado
  const orbColor = isSpeaking
    ? colors.secondary // Azul cuando habla
    : isListening
    ? colors.success // Verde cuando escucha
    : colors.textSecondary; // Gris cuando idle

  // Interpolaciones para escala y opacidad
  const createAuraStyle = (animValue: Animated.Value, maxScale: number) => ({
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, maxScale],
        }),
      },
    ],
    opacity: animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.6, 0.3, 0],
    }),
  });

  const scaleMax = isSpeaking ? 1.6 : 1.4;

  return (
    <View style={styles.container}>
      {/* Aura 3 - Más externa */}
      <Animated.View
        style={[
          styles.aura,
          { backgroundColor: orbColor },
          createAuraStyle(pulseAnim3, scaleMax),
        ]}
      />

      {/* Aura 2 - Media */}
      <Animated.View
        style={[
          styles.aura,
          { backgroundColor: orbColor },
          createAuraStyle(pulseAnim2, scaleMax - 0.2),
        ]}
      />

      {/* Aura 1 - Más cercana */}
      <Animated.View
        style={[
          styles.aura,
          { backgroundColor: orbColor },
          createAuraStyle(pulseAnim1, scaleMax - 0.4),
        ]}
      />

      {/* Núcleo central - fijo */}
      <View
        style={[
          styles.core,
          {
            backgroundColor: orbColor,
            shadowColor: orbColor,
            shadowOpacity: isSpeaking ? 0.8 : isListening ? 0.6 : 0.3,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  core: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  aura: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'absolute',
  },
});
