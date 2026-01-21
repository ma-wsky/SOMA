import { StyleSheet,Dimensions } from 'react-native';
import { Colors } from "./theme";


const { width } = Dimensions.get('window');

export const userStyles = StyleSheet.create({
    editUserContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    userContainer: {
        flex: 1,
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
        borderColor: Colors.gray,
        borderRadius: 10,
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    field: {
        color:Colors.black,
        fontSize: 18,
        marginLeft: 20,
    },
    input: {
        flex: 1,
        textAlignVertical: "center",
    },

    line: {
        borderBottomColor: Colors.gray,
        borderBottomWidth: 1,
        marginHorizontal: 20,
    },

    profilePictureWrapper: {
        marginTop: 60,
        alignItems: "center",
    },
    profilePictureWrapperEdit: {
        alignItems: "center",
    },
    profilePicture: {
        width:150,
        height:150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: Colors.black,
        resizeMode: 'cover',
    },
    //SettingsOverlay
    settingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    rowWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    menu: {
        width: width * 0.75,
        maxWidth: 320,
        backgroundColor: Colors.background,
        shadowColor: Colors.black,
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    //edit user
    picText: {
        color: Colors.black,
        borderRadius:5,
        fontWeight: "bold",
        paddingHorizontal:5,
        fontSize: 16,
        backgroundColor:Colors.whiteTransparent,
        alignSelf:'auto'
    },
    textOverlay: {
        top:65,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    picWrapper: {
        alignItems: "center",
    },
})