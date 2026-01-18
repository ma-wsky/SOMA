import { Alert, Platform } from 'react-native';

export const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    // keep it simple on web
    window.alert(`${title}${message ? `\n\n${message}` : ''}`);
    return;
  }
  Alert.alert(title, message);
};

export const showConfirm = (
  title: string,
  message: string | undefined,
  onConfirm: () => void,
  options?: { confirmText?: string; cancelText?: string }
) => {
  if (Platform.OS === 'web') {
    const ok = window.confirm(`${title}${message ? `\n\n${message}` : ''}`);
    if (ok) onConfirm();
    return;
  }

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
  if (Platform.OS === 'web') {
    // For web, use simple confirm with first two options
    if (options.length >= 2) {
      const ok = window.confirm(`${title}${message ? `\n\n${message}` : ''}`);
      if (ok) options[1].onPress();
      else options[0].onPress();
    }
    return;
  }

  Alert.alert(title, message, options, { cancelable: true });
};
