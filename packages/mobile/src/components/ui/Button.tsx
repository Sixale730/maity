import React from 'react';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import { ViewStyle } from 'react-native';

interface ButtonProps extends Omit<PaperButtonProps, 'children'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  fullWidth = false,
  style,
  mode,
  ...props
}) => {
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
      borderRadius: 8,
      ...(fullWidth && { width: '100%' }),
    };

    if (variant === 'secondary') {
      return {
        ...baseStyle,
        backgroundColor: '#F97316', // Orange color
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
      }}
      contentStyle={{
        paddingVertical: 8,
      }}
      {...props}
    >
      {title}
    </PaperButton>
  );
};