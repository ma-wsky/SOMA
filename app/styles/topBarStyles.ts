import { StyleSheet } from 'react-native';
import { Colors } from "./theme";

export const topBarStyles = StyleSheet.create({
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