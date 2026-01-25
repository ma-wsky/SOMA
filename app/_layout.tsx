import {Slot, usePathname} from "expo-router";
import React, {useEffect} from "react";
import {Platform, View} from "react-native";
import Toast from 'react-native-toast-message'
import {useNetworkMonitor} from "@/utils/useNetworkMonitor";
import {setAudioModeAsync} from 'expo-audio';
import {requestNotificationPermissions} from "@/utils/helper/notificationHelper";
import {StatusBar} from 'expo-status-bar';
import {useAutoBrightness} from '@/hooks/useAutoBrightness';
import {ActiveWorkoutFloatingBar} from "@/components/ActiveWorkoutFloatingBar";
import {networkToastConfig} from "@/components/networkToast/networkToastConfig"
import {Righteous_400Regular, useFonts} from '@expo-google-fonts/righteous';
import {Colors} from "@/styles/theme";


export default function Layout() {
    // global hooks
    usePathname();
    useNetworkMonitor();
    useAutoBrightness();
    const [fontsLoaded] = useFonts({"SomaLogo": Righteous_400Regular});

    // audio and notification
    useEffect(() => {
        setAudioModeAsync({
            playsInSilentMode: true,
            shouldPlayInBackground: true,
            interruptionMode: 'duckOthers',
        }).catch((err) => console.warn('Failed to set audio mode', err));

        requestNotificationPermissions();
    }, []);

    // SOM bug
    if (!fontsLoaded) return null;

    return (
        <View style={{flex: 1}} >
            <StatusBar
                style="dark"
                {...(Platform.OS === 'android' && {
                    navigationBarStyle: "dark",
                    navigationBarBackgroundColor: Colors.black
                })}
            />
            <Slot/>
            <ActiveWorkoutFloatingBar/>
            <Toast config={networkToastConfig}/>
        </View>
    );
}
