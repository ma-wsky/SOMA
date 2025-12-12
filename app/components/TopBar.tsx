import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import {Colors} from "../styles/theme";
import { useRouter } from "expo-router";

export default function TopBar(){
    const router = useRouter();

    return(
        <View style={{flexDirection:"row",justifyContent:"space-around",alignItems: "center"}}>

            <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                    styles.button,
                    {backgroundColor: pressed ? Colors.secondary : Colors.primary},
                    {borderColor: pressed ? Colors.secondary : Colors.primary}
                ]}
            >
                <Text style={styles.buttonText}>Zurück</Text>
            </Pressable>

            <Text style={styles.text}>Benutzer</Text>

            <Pressable
                //onPress={handleLogin}
                style={({ pressed }) => [
                    styles.button,
                    {backgroundColor: pressed ? Colors.secondary : Colors.primary},
                    {borderColor: pressed ? Colors.secondary : Colors.primary}
                ]}
            >
                <Text style={styles.buttonText}>Speichern</Text>
            </Pressable>





        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 100,
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    text:{
        fontWeight: "600",
        fontSize: 18,
    },
});