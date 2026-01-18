import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

export function useNetworkMonitor() {
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected === false) {
                Toast.show({
                    type: 'error',
                    text1: 'Offline',
                    text2: 'Du hast die Internetverbindung verloren.',
                    autoHide: false,
                });
            } else if (state.isConnected === true) {
                Toast.show({
                    type: 'success',
                    text1: 'Wieder online',
                    text2: 'Deine Verbindung wurde wiederhergestellt.',
                    visibilityTime: 3000,
                    autoHide: true,
                });
            }
        });

        return () => unsubscribe();
    }, []);
}