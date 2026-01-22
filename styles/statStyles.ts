import { StyleSheet } from 'react-native';
import { Colors } from "./theme";


export const statStyles = StyleSheet.create({
    //single
    container: {
        backgroundColor:Colors.background,
        flex: 1,
        justifyContent: 'flex-start',
    },
    content: {
        alignItems: 'center',
        paddingTop: 20,
    },
    graphWrapper:{
        marginRight: 40,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    emptyText: {
        marginTop: 50,
        color: Colors.gray,
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
        borderColor: Colors.black,
        resizeMode: 'cover',
    },
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
        backgroundColor: Colors.black,
    },
    infoMuscle: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.white,
    },
    singleLine: {
        borderBottomColor: Colors.gray,
        borderBottomWidth: 1,
        marginHorizontal: 20,
        marginTop: 20,
    },

    //screen
    search:{
        padding:10,
        color: Colors.white,
        fontSize:20,
        backgroundColor:Colors.black,
        margin:20,
        borderRadius: 50,
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
        borderBottomColor: 'gray',
        borderBottomWidth: 2,
        height: 1,
        backgroundColor: Colors.gray,
        marginTop: 4
    },
    listContent: {
        marginHorizontal: 16,
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

    // search bar
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
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
        color: 'white',
        fontSize: 16,
        height: '100%',
    },
    deleteButton: {
        padding: 5,
    },
})