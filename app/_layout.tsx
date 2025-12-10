import { Slot, usePathname } from "expo-router";
import React from "react";
import { Text, View, Button } from 'react-native';
import MenuBar from "./components/MenuBar";


export default function Layout() {
    const path = usePathname();

    // pages where menu bar should not be shown
    const showMenu =
        //!path.includes("/screens/LoginScreen") &&
        !path.includes("/screens/RegisterScreen") &&
        !path.includes("/screens/ClickerScreen");

    return (
        <>
            <Slot />

        </>
    );
}
