import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import {Colors} from "../styles/theme";

interface TopBarProps {
    leftButtonText?: string,
    titleText?: string,
    rightButtonText?: string,
    onLeftPress?: () => void,
    onRightPress?: () => void,
}

export function TopBar({ leftButtonText, titleText, rightButtonText, onLeftPress, onRightPress }: TopBarProps){

    return(
        <View style={styles.container}>

            {leftButtonText ? (
                <Pressable
                    onPress={onLeftPress}
                    style={({ pressed }) => [
                        styles.button,
                        {backgroundColor: pressed ? Colors.secondary : Colors.primary},
                        {borderColor: pressed ? Colors.secondary : Colors.primary}
                    ]}
                >
                    <Text style={styles.buttonText}>{leftButtonText}</Text>
                </Pressable>
            ) : (
                <View style={styles.placeholder}></View>
            )}

            <Text style={styles.text}>{titleText}</Text>

            {rightButtonText ? (
                <Pressable
                    onPress={onRightPress}
                    style={({ pressed }) => [
                        styles.button,
                        {backgroundColor: pressed ? Colors.secondary : Colors.primary},
                        {borderColor: pressed ? Colors.secondary : Colors.primary}
                    ]}
                >
                    <Text style={styles.buttonText}>{rightButtonText}</Text>
                </Pressable>
            ) : (
                <View style={styles.placeholder}></View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection:"row",
        justifyContent:"space-around",
        alignItems: "center",
        marginTop: 40,
    },
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
        fontWeight: "bold",
        fontSize: 24,
    },
    placeholder: {
        width: 100,
        paddingVertical: 8,
    },
});