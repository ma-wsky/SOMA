import { Slot, usePathname } from "expo-router";
import { Text, View, Button } from 'react-native';
import MenuBar from "./components/MenuBar";


export default function Layout() {
    const path = usePathname();

    const showMenu = !path.includes("/screens/LoginScreen") && !path.includes("/screens/RegisterScreen");

    return (
        <>
            <Slot />
            {showMenu && <MenuBar />}
        </>
    );
}
