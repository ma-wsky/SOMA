import { router } from "expo-router";
import { View, TextInput, StyleSheet, Text, Pressable } from "react-native";
import { useState, useMemo } from "react";
import { TopBar } from "../../components/TopBar"
import ExerciseList from "../../components/ExerciseList";
import LoadingOverlay from "../../components/LoadingOverlay";
import {Colors} from "../../styles/theme";
import { useLoadExercises } from "../../hooks/useLoadExercises";


export default function ExerciseScreen() {

    const [filter, setFilter] = useState("");
    const { exercises, loading } = useLoadExercises();

    const filteredExercises = useMemo(() => {
        return exercises.filter(ex =>
            ex.name.toLowerCase().includes(filter.toLowerCase())
        );
    }, [exercises, filter]);


    return (
        <View style={styles.container}>

            {/* Top Bar */}
            <TopBar leftButtonText={"Zurück"}
                    titleText={"Übungen"}
                    rightButtonText={"Erstellen"}
                    onLeftPress={() => router.push("../..//(tabs)/HomeScreenProxy")}
                    onRightPress={() => router.push("./CreateExerciseScreen")}
            ></TopBar>

            {/* Search Bar */}
            <TextInput placeholder={"Übung suchen..."}
                       placeholderTextColor='white'
                       value={filter}
                       onChangeText={setFilter}
                       style={styles.search}/>

            <ExerciseList
                exercises={filteredExercises}
                filter={filter}
                onItemPress={(exercise) =>
                    router.push({
                        pathname: "/screens/workout/ExerciseInfoScreen",
                        params: { name: exercise.name }
                    })
                }
            />

            <Pressable
                style={{marginBottom:40, backgroundColor: Colors.primary, alignItems: "center"}}
                onPress={async () => router.push("../AdminAddExercise")}

            >
                <Text >Dev add exercise</Text>
            </Pressable>

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading} />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    search:{
        padding:10,
        color: 'white',
        fontSize:20,
        backgroundColor:'black',
        margin:20,
        borderRadius: 50,

    },
})