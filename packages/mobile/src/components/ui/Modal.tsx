import React from 'react';
import {
  Modal as PaperModal,
  Portal,
  Text,
  Button as PaperButton,
} from 'react-native-paper';
import { View, ViewStyle, ScrollView } from 'react-native';
import { colors } from '../../theme';

interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: Array<{
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'text';
  }>;
  contentStyle?: ViewStyle;
  dismissable?: boolean;
  fullScreen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onDismiss,
  title,
  children,
  actions,
  contentStyle,
  dismissable = true,
  fullScreen = false,
}) => {
  const containerStyle: ViewStyle = fullScreen
    ? {
        backgroundColor: colors.background,
        flex: 1,
        margin: 0,
      }
    : {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 12,
        maxHeight: '80%',
      };

  return (
    <Portal>
      <PaperModal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[containerStyle, contentStyle]}
        dismissable={dismissable}
      >
        {title && (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.text,
              }}
            >
              {title}
            </Text>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {children}
        </ScrollView>

        {actions && actions.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: 16,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            {actions.map((action, index) => (
              <PaperButton
                key={index}
                mode={
                  action.variant === 'primary'
                    ? 'contained'
                    : action.variant === 'secondary'
                    ? 'contained-tonal'
                    : 'text'
                }
                onPress={action.onPress}
                style={{ marginLeft: index > 0 ? 8 : 0 }}
              >
                {action.label}
              </PaperButton>
            ))}
          </View>
        )}
      </PaperModal>
    </Portal>
  );
};