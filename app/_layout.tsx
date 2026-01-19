import { Slot, usePathname } from "expo-router";
import React, { useEffect } from "react";
import Toast from 'react-native-toast-message'
import { useNetworkMonitor } from "@/utils/useNetworkMonitor";
import { setAudioModeAsync } from 'expo-audio';


export default function Layout() {
    usePathname();
    useNetworkMonitor();

    useEffect(() => {
        setAudioModeAsync({
            playsInSilentMode: true,
            shouldPlayInBackground: true,
            interruptionMode: 'duckOthers',
        }).catch((err) => console.warn('Failed to set audio mode', err));
    }, []);

    return (
        <>
            <Slot />
            <Toast/>
        </>
    );
}
