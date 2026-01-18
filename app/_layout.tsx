import { Slot, usePathname } from "expo-router";
import React from "react";
import Toast from 'react-native-toast-message'
import { useNetworkMonitor } from "@/utils/useNetworkMonitor";


export default function Layout() {
    usePathname();
    useNetworkMonitor();

    return (
        <>
            <Slot />
            <Toast/>
        </>
    );
}
