import { Alert } from 'react-native';

export const showAlert = (title: string, message?: string) => {
  Alert.alert(title, message);
};

export const showConfirm = (
  title: string,
  message: string | undefined,
  onConfirm: () => void,
  options?: { confirmText?: string; cancelText?: string }
) => {

  const buttons = [
    { text: options?.cancelText || 'Abbrechen', style: 'cancel' as const },
    { text: options?.confirmText || 'OK', onPress: onConfirm },
  ];

  Alert.alert(title, message, buttons, { cancelable: true });
};

export const showChoice = (
  title: string,
  message: string | undefined,
  options: Array<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }>
) => {

  Alert.alert(title, message, options, { cancelable: true });
};
