import React from 'react';
import {Pressable, Text, ViewStyle} from 'react-native';
import {Colors} from "@/styles/theme";
import {authStyles} from "@/styles/authStyles";

type ButtonVariant = 'primary' | 'secondary';

interface AuthButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    disabled?: boolean;
    style?: ViewStyle;
}

export const AuthButton = ({title, onPress, variant = 'primary', disabled, style}: AuthButtonProps) => {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({pressed}) => {
                const baseStyle = variant === 'secondary'
                    ? authStyles.secondaryBotton
                    : authStyles.button;

                const interactionStyle: ViewStyle = variant === 'secondary'
                    ? {
                        backgroundColor: pressed ? "#eee" : 'transparent',
                        borderColor: pressed ? Colors.secondary : Colors.primary,
                    }
                    : {
                        backgroundColor: pressed ? Colors.secondary : Colors.primary,
                        borderColor: pressed ? Colors.secondary : Colors.primary,
                    };

                return [baseStyle, interactionStyle, style];
            }}
        >
            <Text style={[variant === 'secondary'
                ? authStyles.secondaryButtonText
                : authStyles.buttonText,
            ]}>
                {title}
            </Text>

        </Pressable>
    );
};