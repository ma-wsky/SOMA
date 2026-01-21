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
    line: {
        borderBottomColor: Colors.gray,
        borderBottomWidth: 1,
        marginHorizontal: 20,
        marginTop: 20,
    },
})