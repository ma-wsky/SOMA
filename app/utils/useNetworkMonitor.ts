import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

export function useNetworkMonitor() {
    const isFirst = useRef(true);
    const wasOffline = useRef(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (isFirst.current) {
                isFirst.current = false;
                if (state.isConnected === false) {
                    wasOffline.current = true;
                    showOfflineToast();
                }
                return;
            }

            if (state.isConnected === false) {
                wasOffline.current = true;
                showOfflineToast();

            } else if (state.isConnected === true && wasOffline.current === true) {
                showOnlineToast();
            }
        });

        return () => unsubscribe();
    }, []);
}

const showOfflineToast = () => {
    Toast.show({
        type: 'error',
        text1: 'Offline',
        text2: 'Du hast die Internetverbindung verloren.',
        autoHide: false,
    });
}

const showOnlineToast = () => {
    Toast.show({
        type: 'success',
        text1: 'Wieder online',
        text2: 'Deine Verbindung wurde wiederhergestellt.',
        visibilityTime: 2000,
        autoHide: true,
    });
}