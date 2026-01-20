import { Slot, usePathname } from "expo-router";
import React from "react";
import Toast from 'react-native-toast-message'
import { useNetworkMonitor } from "@/utils/useNetworkMonitor";
import { StatusBar } from 'expo-status-bar';
import { useAutoBrightness } from '@/hooks/useAutoBrightness';
import { useFonts, Righteous_400Regular } from '@expo-google-fonts/righteous';

export default function Layout() {
    usePathname();
    useNetworkMonitor();
    useAutoBrightness();

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
            <Toast/>
        </>
    );
}
