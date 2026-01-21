import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from "react-native";
import { StyleSheet } from "react-native";
import { Colors } from "@/styles/theme";

export default function TabLayout() {
    const iconMap: Record<string, string> = {
        HomeScreenProxy: "home-outline",
        WorkoutScreenProxy: "barbell-outline",
        StatisticScreenProxy: "stats-chart-outline",
        UserScreenProxy: "person-outline",
    };

    return (
        <View style={{flex: 1, backgroundColor: Colors.background}}>

            <View style={styles.backdrop}/>

            <Tabs
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarActiveTintColor: Colors.primary,
                    tabBarInactiveTintColor: Colors.white,
                    tabBarStyle: styles.tabBar,
                    tabBarItemStyle: styles.tabBarItem,
                    tabBarLabelStyle: styles.tabBarLabel,
                    tabBarIcon: ({ focused }) => (
                        <View
                            style={[
                                styles.tabBarIconOval,
                                { backgroundColor: focused ? Colors.primary : "transparent"},
                            ]}
                        >
                            <Ionicons
                                name={iconMap[route.name as keyof typeof iconMap] as any}
                                size={24}
                                color={focused ? Colors.iconActive : Colors.iconInactive}
                            />
                        </View>
                    ),
                })}
            >
                <Tabs.Screen name="HomeScreenProxy" options={{ title: "Startseite" }} />
                <Tabs.Screen name="WorkoutScreenProxy" options={{ title: "Training" }} />
                <Tabs.Screen name="StatisticScreenProxy" options={{ title: "Statistik" }} />
                <Tabs.Screen name="UserScreenProxy" options={{ title: "Benutzer" }} />
            </Tabs>

            <SafeAreaView style={{backgroundColor: Colors.black}}
                        edges={["bottom"]}>
            </SafeAreaView>

        </View>

    );
}

export const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: Colors.black,
        borderRadius: 20,
        height: 70,
    },
    tabBarItem: {
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 8,
    },
    tabBarLabel: {
        fontSize: 12,
    },
    tabBarIconOval: {
        justifyContent: "center",
        alignItems: "center",
        width: 50,
        height: 30,
        borderRadius: 15,
    },
    backdrop: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 65,
        backgroundColor: Colors.black
    },
});