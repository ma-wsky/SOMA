import { router, useLocalSearchParams } from "expo-router";
import { View, TextInput, StyleSheet, Text, Pressable } from "react-native";
import { useState } from "react";
import { TopBar } from "../../components/TopBar"
import ExerciseList from "../../components/ExerciseList";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useLoadExercises } from "../../hooks/useLoadExercises";


export default function AddExerciseToWorkoutScreen() {

    const [filter, setFilter] = useState("");
    const [breakTime, setBreakTime] = useState("30");
    const [selectedId, setSelectedId] = useState("");
    const { workoutEditId, returnTo } = useLocalSearchParams<{ workoutEditId?: string; returnTo?: string }>();  
    const { exercises, loading } = useLoadExercises();



    const addExercise = (exercise: any) => {
        const workoutId = workoutEditId;
        if (!workoutId) {return;}

        setSelectedId(exercise.id);

        if (returnTo === 'active'){
            router.push({ pathname: "/screens/workout/ActiveWorkoutScreen", params: { workoutEditId: workoutId, selectedExerciseId: exercise.id, selectedExerciseName: exercise.name, selectedBreakTime: breakTime } });
            return;
        } else if (returnTo === 'edit'){
            router.push({ pathname: "/screens/workout/SingleWorkoutInfoScreen", params: { workoutEditId: workoutId, selectedExerciseId: exercise.id, selectedExerciseName: exercise.name, selectedBreakTime: breakTime } });
            return;
        }
    };

    const goToInfo = (exercise: any) => {
        router.push({ pathname: "/screens/exercise/SingleExerciseInfoScreen", params: { id: exercise.id } });
    };

    return (
        <View style={styles.container}>

            {/* Top Bar */}
            <TopBar 
                leftButtonText={"Zurück"}
                titleText={"Übung hinzufügen"}
                onLeftPress={() => router.back()}
            />

            {/* Search Bar */}
            <TextInput 
                placeholder={"Übung suchen..."}
                placeholderTextColor='white'
                value={filter}
                onChangeText={setFilter}
                style={styles.search}
            />

            {/* Break Time Input */}
            <View style={styles.breakTimeContainer}>
                <Text style={styles.breakTimeLabel}>Pausenzeit zwischen Wiederholungen (Sekunden)</Text>
                <TextInput
                    value={breakTime}
                    onChangeText={setBreakTime}
                    placeholder="30"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    style={styles.breakTimeInput}
                />
            </View>

            <ExerciseList
                exercises={exercises}
                filter={filter}
                onItemPress={(exercise) => goToInfo(exercise)}
                onAddToWorkout={(exercise) => addExercise(exercise)}
                showAddButton={true}
            />

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
    breakTimeContainer: {
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    breakTimeLabel: {
        color: '#aaa',
        fontSize: 14,
        marginBottom: 6,
    },
    breakTimeInput: {
        backgroundColor: '#222',
        color: '#fff',
        padding: 10,
        borderRadius: 8,
        fontSize: 16,
    },
})