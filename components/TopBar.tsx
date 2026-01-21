import React from "react";
import { View, Text, Pressable } from "react-native";
import {Colors} from "../styles/theme";
import { topBarStyles as styles } from "@/styles/topBarStyles";


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

            <View style={{flex: 1, paddingHorizontal: 4, justifyContent: 'center', alignItems: 'center'}}>
                <Text 
                    style={[styles.text, {textAlign: 'center'}]} 
                    numberOfLines={2} 
                    ellipsizeMode="tail"
                >
                    {titleText}
                </Text>
            </View>

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
