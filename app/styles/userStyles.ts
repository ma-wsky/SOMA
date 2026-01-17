import { StyleSheet } from 'react-native';
import { Colors } from "./theme";

export const userStyles = StyleSheet.create({
    editUserContainer: {
        marginTop: 30,
        flex: 1,
        backgroundColor: Colors.background,
    },
    userContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    scrollView: {
        backgroundColor: Colors.background,
    },

    layout: {
        marginTop: 20,
        flex: 1,
        gap: 25,
        backgroundColor: Colors.background,
    },

    buttonWrapper: {
        marginTop: 20,
        marginLeft: 250,
        marginRight: 20,
    },
    userButton: {
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    userButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },

    rowWrapper: {
        alignItems: "flex-start",
        marginLeft: 30,
    },
    text: {
        fontSize: 18,
        fontWeight: "bold",
    },
    fieldWrapper: {
        flexDirection: "row",
        width: 250,
    },
    EditFieldWrapper:{
        flexDirection: "row",
        width: 250,
        height: 45,
        borderWidth: 2,
        borderColor: 'gray',
        borderRadius: 10,
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    field: {
        fontSize: 18,
        marginLeft: 20,
    },
    input: {
        flex: 1,
        textAlignVertical: "center",
    },

    line: {
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        marginHorizontal: 20,
    },

    profilePictureWrapper: {
        marginTop: 40,
        alignItems: "center",
    },
    profilePicture: {
        width:150,
        height:150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: 'black',
        resizeMode: 'cover',
    },
})