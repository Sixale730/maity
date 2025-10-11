import React from 'react';
import { Card as PaperCard, Title, Paragraph } from 'react-native-paper';
import { View, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  onPress?: () => void;
  elevation?: number;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  style,
  titleStyle,
  subtitleStyle,
  onPress,
  elevation = 2,
}) => {
  return (
    <PaperCard
      style={[
        {
          borderRadius: 12,
          marginVertical: 8,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
      elevation={elevation}
      onPress={onPress}
    >
      {(title || subtitle) && (
        <PaperCard.Content style={{ paddingTop: 16 }}>
          {title && (
            <Title
              style={[
                {
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.text,
                },
                titleStyle,
              ]}
            >
              {title}
            </Title>
          )}
          {subtitle && (
            <Paragraph
              style={[
                {
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 4,
                },
                subtitleStyle,
              ]}
            >
              {subtitle}
            </Paragraph>
          )}
        </PaperCard.Content>
      )}
      {children && (
        <PaperCard.Content style={{ paddingTop: title ? 12 : 16, paddingBottom: 16 }}>
          {children}
        </PaperCard.Content>
      )}
    </PaperCard>
  );
};