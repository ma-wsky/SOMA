import { StyleSheet } from 'react-native';
import { Colors } from "./theme";

export const workoutStyles = StyleSheet.create({
    itemContainer: {
        gap: 10,
        padding:12,
        backgroundColor: "black",
        marginVertical: 5,
        marginHorizontal: 20,
        borderRadius: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "white",
    },
    search:{
        padding:10,
        color: 'white',
        fontSize:20,
        backgroundColor:'black',
        margin:20,
        borderRadius: 50,

    },
    button: {
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 20,
    },
    bigButton: {
        paddingVertical: 16,
        borderRadius: 10,
        marginBottom: 20,
    },
    bigButtonTextWrapper: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginLeft: 30,
        gap: 80,
    },
    itemButton: {
        paddingVertical: 8,
        marginHorizontal: 30,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    container: {
        marginTop: 30,
        flex: 1,
        backgroundColor: Colors.background,
    },
})