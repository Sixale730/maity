import React from 'react';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import { ViewStyle, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';

interface ButtonProps extends Omit<PaperButtonProps, 'children'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'gradient';
  fullWidth?: boolean;
  style?: ViewStyle;
  gradient?: boolean;
  gradientColors?: string[];
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  fullWidth = false,
  style,
  mode,
  gradient = false,
  gradientColors,
  disabled,
  onPress,
  ...props
}) => {
  // Si es un botón con gradiente, renderizar componente personalizado
  if (gradient || variant === 'gradient') {
    const finalGradientColors = gradientColors || [colors.gradient1, colors.gradient2];

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          {
            borderRadius: 12,
            overflow: 'hidden',
            ...(fullWidth && { width: '100%' }),
          },
          style,
        ]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={finalGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 24,
            alignItems: 'center',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '600',
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Lógica original para botones sin gradiente
  const getMode = () => {
    switch (variant) {
      case 'primary':
        return 'contained';
      case 'secondary':
        return 'contained';
      case 'outline':
        return 'outlined';
      case 'text':
        return 'text';
      default:
        return 'contained';
    }
  };

  const getStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      ...(fullWidth && { width: '100%' }),
    };

    if (variant === 'primary') {
      return {
        ...baseStyle,
        backgroundColor: colors.primary,
        ...(style as ViewStyle),
      };
    }

    if (variant === 'secondary') {
      return {
        ...baseStyle,
        backgroundColor: colors.secondary,
        ...(style as ViewStyle),
      };
    }

    if (variant === 'outline') {
      return {
        ...baseStyle,
        borderColor: colors.primary,
        borderWidth: 1,
        ...(style as ViewStyle),
      };
    }

    return {
      ...baseStyle,
      ...(style as ViewStyle),
    };
  };

  return (
    <PaperButton
      mode={mode || getMode()}
      style={getStyle()}
      labelStyle={{
        fontSize: 16,
        fontWeight: '600',
        paddingVertical: 4,
        color: variant === 'outline' ? colors.primary : '#FFFFFF',
      }}
      contentStyle={{
        paddingVertical: 8,
      }}
      disabled={disabled}
      onPress={onPress}
      {...props}
    >
      {title}
    </PaperButton>
  );
};