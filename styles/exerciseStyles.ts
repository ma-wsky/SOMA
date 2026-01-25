import {StyleSheet} from 'react-native';
import {Colors} from "@/styles/theme";


export const exerciseStyles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        flex: 1,
        justifyContent: 'flex-start',
    },
    searchBar: {
        padding: 10,
        color: Colors.white,
        fontSize: 20,
        backgroundColor: Colors.black,
        marginTop: 20,
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
        backgroundColor: Colors.black,
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
        color: Colors.darkGray
    },
    line: {
        flex: 1,
        borderBottomColor: Colors.gray,
        borderBottomWidth: 2,
        height: 1,
        backgroundColor: Colors.background,
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
        color: Colors.darkGray,
        fontSize: 16,
    },

    picWrapper: {
        marginTop: 40,
        alignItems: "center",
    },
    picture: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: Colors.black,
        resizeMode: 'cover',
    },
    picText: {
        color: Colors.black,
        borderRadius: 5,
        fontWeight: "bold",
        paddingHorizontal: 5,
        fontSize: 16,
        backgroundColor: Colors.whiteTransparent,
        alignSelf: 'auto'
    },
    textOverlay: {
        top: 65,
        left: 30,
        position: 'absolute',
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
        borderColor: Colors.black,
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
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 20,
    },
    textContainer: {
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
        marginHorizontal: 30,
        borderRadius: 20,
        backgroundColor: Colors.black,
    },
    infoMuscle: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.white,
    },
    equipWrapper: {
        flex: 1,
        marginTop: 25,
        paddingHorizontal: 30,
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
        color: Colors.darkGray,
        marginLeft: 15,
    },

    //searchbar
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.black,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginHorizontal: 16,
        height: 50,
        marginTop: 20,
        marginBottom: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: Colors.white,
        fontSize: 16,
        height: '100%',
    },
    deleteButton: {
        padding: 5,
    },
})