import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface MicrosoftIconProps {
  width?: number;
  height?: number;
}

export const MicrosoftIcon: React.FC<MicrosoftIconProps> = ({
  width = 20,
  height = 20
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path d="M11.4 24H0V12.6L11.4 24z" fill="#00BCF2" />
      <Path d="M24 24H11.4V12.6L24 24z" fill="#0078D4" />
      <Path d="M11.4 0v11.4L0 0h11.4z" fill="#40E0D0" />
      <Path d="M24 11.4V0H12.6L24 11.4z" fill="#0078D4" />
    </Svg>
  );
};