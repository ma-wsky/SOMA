import { StyleSheet } from 'react-native';
import { Colors } from "./theme";


export const exerciseStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    text: {
        fontSize: 18,
        fontWeight: "bold",
    },
    fieldWrapper: {
        flexDirection: "row",
        borderWidth: 2,
        borderRadius: 10,
        borderColor: Colors.iconInactive,
        //width: 250,
    },
    wrapper: {
        alignItems: "flex-start",
        marginHorizontal: 30,
    },
    input: {
        flex: 1,
    },
    layout: {
        marginTop: 20,
        flex: 1,
        gap: 25,
        backgroundColor: Colors.background,
    },
    picture: {
        height: 130,
        width: 130,
        borderRadius: 20,
        backgroundColor: Colors.black,
        alignItems: "center",
        justifyContent: "center",
    },
    picWrapper: {
        marginTop: 40,
        alignItems: "center",
    },
    picText: {
        color: "white",
    }
})