import { Slot, usePathname } from "expo-router";
import React, { useEffect } from "react";
import Toast from 'react-native-toast-message'
import { useNetworkMonitor } from "@/utils/useNetworkMonitor";
import { setAudioModeAsync } from 'expo-audio';
import { requestNotificationPermissions } from "@/utils/helper/notificationHelper";
import { StatusBar } from 'expo-status-bar';
import { useAutoBrightness } from '@/hooks/useAutoBrightness';
import { ActiveWorkoutFloatingBar } from "@/components/ActiveWorkoutFloatingBar";

import { useFonts, Righteous_400Regular } from '@expo-google-fonts/righteous';

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
    // Font laden
    const [fontsLoaded, fontError] = useFonts({
        'SomaLogo': Righteous_400Regular,
    });

    return (
        <>
            <StatusBar
                style="dark"
            />
            <Slot />
            <ActiveWorkoutFloatingBar />
            <Toast/>
        </>
    );
}
