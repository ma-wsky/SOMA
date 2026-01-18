import { StyleSheet } from 'react-native';
import { Colors } from "./theme";

export const homeStyles = StyleSheet.create({
    bigButton: {
        paddingVertical: 16,
        borderRadius: 10,
        marginBottom: 20,
    },
    bigButtonTextWrapper: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginLeft: 30,
        gap: 160,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 20,
    },
});