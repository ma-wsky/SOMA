import { StyleSheet } from 'react-native';
import { Colors } from "./theme";


export const authStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:Colors.background,
        justifyContent: "flex-start",
        marginHorizontal: 40,
        paddingTop: 200,
    },

    titleWrapper: {
        marginBottom: 100,
        alignItems: "center",
    },
    titleText: {
        fontSize: 20,
        fontWeight: "bold",
        alignSelf: "center",
    },
    appnameText: {
        fontFamily: "SomaLogo",
        fontSize: 60,
        fontWeight: "400",
        alignSelf: "center",
    },

    authInputsWrapper: {
        marginBottom: 30,
    },
    authInputText: {
        flex: 1,
        height: 40,
        color: Colors.black,
    },
    authInputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.gray,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginVertical: 5,
    },

    authIcon: {
        marginRight: 10,
    },
    eyeIcon: {
        marginLeft: 8,
    },

    dividerWrapper: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginVertical: 10,
    },
    dividerLine: {
        flex: 1,
        borderBottomColor: Colors.gray,
        borderBottomWidth: 1,
        marginVertical: "5%",
        marginHorizontal:5
    },
    dividerText: {
        fontSize: 18,
    },

    buttonWrapper: {
        gap: 8,
    },
    button: {
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    buttonText: {
        color: Colors.white,
        fontWeight: "bold",
        fontSize: 16,
    },
    secondaryBotton: {
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'transparent',
        borderWidth: 2,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.primary,
    },
})