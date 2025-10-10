import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

interface LogoProps {
  width?: number;
  height?: number;
  style?: any;
}

export const Logo: React.FC<LogoProps> = ({
  width = 120,
  height = 120,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../assets/maity-logo.png')}
        style={[
          styles.logo,
          { width, height }
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Shadow effect for iOS
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    // Elevation for Android
    elevation: 20,
  },
});