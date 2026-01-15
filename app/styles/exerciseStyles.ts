import { StyleSheet } from 'react-native';
import { Colors } from "./theme";


export const exerciseStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    searchBar:{
        padding:10,
        color: 'white',
        fontSize:20,
        backgroundColor:'black',
        marginTop:20,
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 50,
    },

    filterTagContainer: {
        height: 50,
    },
    filterTagList: {
        paddingHorizontal: 20,
        marginBottom: 10,
        alignItems: 'center',
        gap: 10,
    },
    filterTag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.iconInactive,
    },
    filterTagActive: {
        backgroundColor: Colors.primary,
    },
    filterTagText: {
        color: Colors.white,
        fontWeight: '500',
    },
    filterTagTextActive: {
        fontWeight: 'bold',
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
        color: "black",
    },
    image: {
        width:150,
        height:150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: 'black',
        resizeMode: 'cover',
    },
    textOverlay: {
        // Positioniert den Text absolut über dem Bild
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
})