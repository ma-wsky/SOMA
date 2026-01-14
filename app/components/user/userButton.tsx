import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import { Colors } from "../../styles/theme";
import { userStyles } from "../../styles/userStyles";

interface UserButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    style?: ViewStyle;
}

export const UserButton = ({ title, onPress, disabled, style }: UserButtonProps) => {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => {
                const baseStyle = userStyles.userButton;

                const interactionStyle: ViewStyle = {
                        backgroundColor: pressed ? Colors.secondary : Colors.primary,
                        borderColor: pressed ? Colors.secondary : Colors.primary,
                    };

                return [baseStyle, interactionStyle, style];
            }}
        >
            <Text style={ userStyles.userButtonText }>{title}</Text>

        </Pressable>
    );
};