import { Slot, usePathname } from "expo-router";
import React, { useEffect } from "react";
import Toast from 'react-native-toast-message'
import { useNetworkMonitor } from "@/utils/useNetworkMonitor";
import { setAudioModeAsync } from 'expo-audio';
import { requestNotificationPermissions } from "@/utils/notificationHelper";
import { StatusBar } from 'expo-status-bar';
import { useAutoBrightness } from '@/hooks/useAutoBrightness';


export default function Layout() {
    usePathname();
    useNetworkMonitor();
    useAutoBrightness();

    useEffect(() => {
        setAudioModeAsync({
            playsInSilentMode: true,
            shouldPlayInBackground: true,
            interruptionMode: 'duckOthers',
        }).catch((err) => console.warn('Failed to set audio mode', err));

        requestNotificationPermissions();
    }, []);

    return (
        <>
            <StatusBar
                style="dark"
            />
            <Slot />
            <Toast/>
        </>
    );
}
