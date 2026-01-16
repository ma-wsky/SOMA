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
    },
    input: {
        flex: 1,
    },

    // ExerciseItem
    itemButton: {
        padding: 12,
        marginVertical: 4,
        borderRadius: 10,
        backgroundColor: Colors.black,
    },
    name: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.white,
    },
    muscle: {
        color: Colors.gray,
        marginTop: 2
    },
    itemPicture: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 20,
    },
    textContainer:{
        flex: 1,
        marginLeft: 20,
    },

    // exercise info
    infoNameFavIconWrapper: {
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 30,
    },
    infoName: {
        fontSize: 26,
        fontWeight: "bold",
        color: Colors.black,
        flex: 1,
    },
    infoMuscleWrapper: {
        alignSelf: "flex-start",
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginLeft: 30,
        borderRadius: 20,
        backgroundColor: Colors.iconInactive,
    },
    infoMuscle: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.white,
    },
    instructionWrapper: {
        flex: 1,
        marginTop: 25,
        paddingHorizontal: 30,
        marginBottom: 30,
    },
    instructionBox: {
        flex: 1,
        borderWidth: 2,
        borderColor: Colors.gray,
        borderRadius: 20,
        paddingHorizontal: 5,
        paddingVertical: 10,
    },
    instructionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.black,
        marginBottom: 8,
    },
    instructionText: {
        fontSize: 16,
        lineHeight: 24,
        color: "#444",
        marginLeft: 15,
    },
})