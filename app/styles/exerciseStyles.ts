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

    exerciseListContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        marginTop: 20,
    },
    divider: {
        marginVertical: 12,
    },
    dividerText: {
        fontWeight: "600",
        color: "#666"
    },
    line: {
        flex: 1,
        borderBottomColor: 'gray',
        borderBottomWidth: 2,
        height: 1,
        backgroundColor: "#ccc",
        marginTop: 4
    },
    listContent: {
        marginHorizontal: 16,
    },


    noExFound: {
        marginTop: 40,
        alignItems: 'center',
    },
    noExFoundText: {
        color: "#666",
        fontSize: 16,
    },

    picWrapper: {
        marginTop: 40,
        alignItems: "center",
    },
    picture: {
        width:150,
        height:150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: 'black',
        resizeMode: 'cover',
    },
    picText: {
        color: "black",
        fontWeight: "bold",
        fontSize: 16,
    },
    textOverlay: {
        position: 'absolute',
        top: 0,
        left: 32,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },

    layout: {
        marginTop: 20,
        flex: 1,
        gap: 25,
        backgroundColor: Colors.background,
    },
    wrapper: {
        alignItems: "flex-start",
        marginHorizontal: 30,
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
    input: {
        flex: 1,
    },
})