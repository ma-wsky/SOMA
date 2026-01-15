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
    itemTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "white",
    },
    itemButton: {
        paddingVertical: 8,
        marginHorizontal: 30,
        borderRadius: 10,
        alignItems: "center",
    },
    itemButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    searchbar:{
        padding:10,
        color: 'white',
        fontSize:20,
        backgroundColor:'black',
        margin:20,
        borderRadius: 50,

    },
    startButton: {
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
    
    //Active Workout
    exerciseName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#222",
    },
    setTitles:{
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
    },
    setItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#111",
        borderRadius: 8,
        marginBottom: 8,
    },
    setText: {
        fontSize: 14,
        color: "#aaa",
    },
    setButton:{
        backgroundColor: "#aaa",
        padding: 8,
        borderRadius: 6,
        marginLeft: 8,
    },
    setButtonText:{
        color: Colors.black,
        fontWeight: "bold",
    },

    topBarButton: {
        width: 100,
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    topBarButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },

    exerciseButton:{
        padding: 8,
        borderRadius: 6,
        backgroundColor: Colors.primary,
    },
    exerciseButtonText:{
        color: Colors.black,
        fontWeight: "bold",
    },
    
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#666",
        marginRight: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxDone: {
        backgroundColor: "#4CAF50",
        borderColor: "#4CAF50",
    },
    
    sheetContainer: {
        flex: 1,
        backgroundColor: 'grey',
    },
    sheetContainerContent: {
        flex: 1,
        padding: 36,
        alignItems: 'center',
    },


    
})