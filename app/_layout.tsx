import { Slot, usePathname } from "expo-router";
import React from "react";
import Toast from 'react-native-toast-message'
import { useNetworkMonitor } from "@/utils/useNetworkMonitor";
import { StatusBar } from 'expo-status-bar';
import { useAutoBrightness } from '@/hooks/useAutoBrightness';


export default function Layout() {
    usePathname();
    useNetworkMonitor();
    useAutoBrightness();

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
