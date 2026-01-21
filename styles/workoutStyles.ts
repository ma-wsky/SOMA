import { StyleSheet } from 'react-native';
import { Colors } from "./theme";
import { topBarStyles } from './topBarStyles';

export const workoutStyles = StyleSheet.create({

    exerciseCard: {
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 10,
    },
    exerciseCardHeader:{
    backgroundColor: Colors.black,
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 0,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    },
    exerciseTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft:0,
    flex:1
    },

    setRowHeader: {
    flexDirection: "row",
    gap:15,
    justifyContent: 'flex-start',
    paddingVertical: 6,
    marginHorizontal: 10,

    },
    setTextHeader:{
        color: Colors.black,
        fontSize: 18,
        fontWeight: "700",
    },

    setRow: {
    flexDirection: "row",
    gap:15,
    justifyContent: 'flex-start',
    paddingVertical: 6,
    marginVertical: 4,
    borderColor: Colors.black,
    borderWidth: 1,
    padding: 8,

    },
    setEditRow: {
    flexDirection: "row",
    gap:15,
    justifyContent: 'flex-start',
    paddingVertical: 6,
    marginVertical: 4,
    borderColor: Colors.black,
    borderWidth: 1,
    padding:8,


    },
    setText: {
    color: Colors.black,
    width: 50,
    },

    input: {
    backgroundColor: Colors.black,
    color: Colors.white,
    padding: 6,
    borderRadius: 6,
    width: 60,
    textAlign: "center",
    },

    addSetButton: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: Colors.darkGray,
    alignItems: "center",
    },
    addSetButtonText: {
    color: Colors.white,
    fontWeight: "600",
    },

    addExerciseButton:{
        padding: 8,
        borderRadius: 6,
        backgroundColor: Colors.primary,
        alignItems: "center",

    },
    addExerciseButtonText:{
        color: Colors.white,
        fontWeight: "bold",
    },
    //Old Styles
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    itemContainer: {
        gap: 10,
        padding:12,
        backgroundColor: Colors.black,
        marginVertical: 5,
        marginHorizontal: 20,
        borderRadius: 10,
    },
    itemTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: Colors.white,
    },
    itemButton: {
        paddingVertical: 8,
        marginHorizontal: 30,
        borderRadius: 10,
        alignItems: "center",
    },
    itemButtonText: {
        color: Colors.white,
        fontWeight: "bold",
        fontSize: 16,
    },
    searchbar:{
        padding:10,
        color: Colors.white,
        fontSize:20,
        backgroundColor:Colors.black,
        marginHorizontal:20,
        marginTop:20,
        marginBottom: 20,
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
    },
    bigButtonTextWrapper: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginLeft: 30,
    },
    
    //Active Workout
    workoutName: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.black,
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
        backgroundColor: Colors.black,
        borderRadius: 8,
        marginBottom: 8,
    },
    setButton:{
        backgroundColor: Colors.gray,
        padding: 8,
        borderRadius: 6,
        marginLeft: 8,
    },
    setButtonText:{
        color: Colors.black,
        fontWeight: "bold",
    },

    topBarLikeButton: {
        minWidth: 100,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: Colors.primary,
    },

    topBarButton: topBarStyles.button,
    topBarButtonText: topBarStyles.buttonText,

    topBarText: topBarStyles.text,
    topBarContainer:topBarStyles.container,

    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.darkGray,
        marginRight: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxDone: {
        backgroundColor: "#4CAF50",
        borderColor: "#4CAF50",
    },
    
    sheetContainer: {
        flex:1,
        backgroundColor: Colors.background,
    },
    sheetContainerContent: {
        flex: 1,
        paddingBottom: 20,
        backgroundColor: Colors.gray,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        flexDirection: "column",
        height: "100%",
        gap: 10,
    },

    //picture
    picContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 20,
    },
    itemPicture: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
})