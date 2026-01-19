import { StyleSheet } from 'react-native';
import { Colors, DarkColors } from "./theme";
import { topBarStyles } from './topBarStyles';

export const workoutStyles = StyleSheet.create({
    // new implementation:
    container: {
        flex: 1,
    },

    //workoutscreen:
    itemTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "white",
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
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 20,
    },

    //workoutlist:
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

    noFound: {
        marginTop: 40,
        alignItems: 'center',
    },
    noFoundText: {
        color: "#666",
        fontSize: 16,
    },
    itemPicturePlaceholder: {
        width: 60, // Gleiche Größe wie exerciseStyles.itemPicture
        height: 60,
        borderRadius: 8,
        backgroundColor: '#1a1a1a', // Dunkler Hintergrund für den Kontrast
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    actionButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#1a1a1a', // Passend zum restlichen Dark-Design
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 'auto', // Schiebt den Button ganz nach rechts
        borderWidth: 1,
        borderColor: '#333',
    },

    // workoutItem
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
        flexDirection: 'column',
        paddingRight: 20,
    },
    textContainer:{
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
    },

    startButtonWrapper: {
        alignItems: "center",
    },
    startButton: {
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: Colors.primary,
    },
    startButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    deleteBackground: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 80, // Breite des sichtbaren roten Bereichs beim Swipen
        backgroundColor: '#ff4444',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12, // Sollte dem Radius von styles.itemButton entsprechen
    },
    deleteButton: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    //info screen
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1a1a1a', // Dunkler Kreis
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    breakTimeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a', // Hintergrund für den Badge
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#333',
        marginLeft: 'auto', // Schiebt den Badge nach ganz rechts im Header
    },
    breakTimeText: {
        color: Colors.primary, // Nutzt dein Theme-Grün/Blau
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    picWrapper: {
        alignItems: "center",
        marginRight: 10,
    },
    picture: {
        width:50,
        height:50,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: 'black',
        resizeMode: 'cover',
    },




    //New experimental :/
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft:0,
    flex:1
    },

    setRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    justifyContent: "space-between",
    paddingVertical: 6,
    marginHorizontal: 12,
    marginVertical: 4,
    borderColor: Colors.black,
    borderWidth: 1,
    padding: 6,

    },
    setEditRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    marginHorizontal: 12,
    marginVertical: 4,
    borderColor: Colors.black,
    borderWidth: 1,
    padding: 6,


    },
    setText: {
    color: Colors.black,
    width: 50,
    },

    input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 6,
    borderRadius: 6,
    width: 60,
    textAlign: "center",
    },

    addSetButton: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#2b2b2b",
    alignItems: "center",
    },
    addSetButtonText: {
    color: "#fff",
    fontWeight: "600",
    },

    addExerciseButton:{
        padding: 8,
        borderRadius: 6,
        backgroundColor: Colors.primary,
        alignItems: "center",

    },
    addExerciseButtonText:{
        color: Colors.black,
        fontWeight: "bold",
    },
    //Old Styles


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
    workoutName: {
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

    topBarLikeButton: {
        width: 100,
        paddingVertical: 8,
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
        backgroundColor: Colors.background,
    },
    sheetContainerContent: {
        flex: 1,
        padding: 10,
        backgroundColor: Colors.darkBackground,
        flexDirection: "column",

        height: "100%",
        gap: 20,
    },


    
})