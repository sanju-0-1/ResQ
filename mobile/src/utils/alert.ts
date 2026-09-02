import { Alert, Platform } from 'react-native';

export interface ConfirmOption {
  text: string;
  onPress?: () => void | Promise<void>;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Cross-platform confirmation popup supporting web (window.confirm) and mobile (Alert.alert)
 */
export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  confirmText: string = 'Confirm',
  cancelText: string = 'Cancel'
) => {
  if (Platform.OS === 'web') {
    const fullMessage = `${title}\n\n${message}`;
    if (window.confirm(fullMessage)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]);
  }
};

/**
 * Cross-platform alert popup supporting web (window.alert) and mobile (Alert.alert)
 */
export const showAlert = (title: string, message: string, onPress?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    if (onPress) onPress();
  } else {
    Alert.alert(title, message, onPress ? [{ text: 'OK', onPress }] : undefined);
  }
};
