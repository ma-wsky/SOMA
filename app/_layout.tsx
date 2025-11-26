import { Slot, usePathname } from "expo-router";
import { Text, View, Button } from 'react-native';
import MenuBar from "./MenuBar";


export default function Layout() {
    const path = usePathname();

    const showMenu = !path.includes("/screens/LoginScreen");

    return (
        <>
            <Slot />
            {showMenu && <MenuBar />}
        </>
    );
}
