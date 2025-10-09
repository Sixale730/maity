import React, { useState } from 'react';
import { TextInput, HelperText } from 'react-native-paper';
import { View, ViewStyle } from 'react-native';
import { colors } from '../../theme';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: any;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  style,
  containerStyle,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={containerStyle}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        error={!!error}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        mode="outlined"
        outlineColor={`${colors.primary}33`} // Color con transparencia
        activeOutlineColor={colors.primary}
        textColor={colors.text}
        placeholderTextColor={colors.textSecondary}
        style={[
          {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 12,
          },
          style,
        ]}
        right={
          secureTextEntry ? (
            <TextInput.Icon
              icon={isPasswordVisible ? 'eye-off' : 'eye'}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            />
          ) : null
        }
      />
      {error && (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      )}
    </View>
  );
};