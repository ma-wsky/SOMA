import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardTypeOptions } from 'react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "../../styles/theme";
import { authStyles } from "../../styles/authStyles";

interface AuthInputProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    iconName: keyof typeof Ionicons.glyphMap;
    keyboardType?: KeyboardTypeOptions;
    isPassword?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const AuthInput = ({
                              placeholder,
                              value,
                              onChangeText,
                              iconName,
                              keyboardType = "default",
                              isPassword = false,
                              autoCapitalize = "none"
                          }: AuthInputProps) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);

    return (
        <View style={authStyles.authInputRow}>
            <Ionicons
                name={iconName}
                size={28}
                color={Colors.icon}
                style={authStyles.authIcon}
            />

            <TextInput
                style={authStyles.authInputText}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                secureTextEntry={isPassword && !isPasswordVisible}
                autoCapitalize={autoCapitalize}
                autoCorrect={false}
            />

            {isPassword && (
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                    <Ionicons
                        name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                        size={24}
                        color={Colors.icon}
                        style={authStyles.eyeIcon}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};