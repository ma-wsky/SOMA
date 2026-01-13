import { router, useLocalSearchParams } from "expo-router";
import { View, TextInput, StyleSheet, Text, Pressable } from "react-native";
import { useState } from "react";
import { TopBar } from "../../components/TopBar"
import ExerciseList from "../../components/ExerciseList";
import LoadingOverlay from "../../components/LoadingOverlay";
import {Colors} from "../../styles/theme";
import { useLoadExercises } from "../../hooks/useLoadExercises";


export default function AddExerciseToWorkoutScreen() {

    const [filter, setFilter] = useState("");
    const [breakTime, setBreakTime] = useState("30");
    const { workoutEditId, workoutEditKey, returnTo } = useLocalSearchParams<{ workoutEditId?: string; workoutEditKey?: string; returnTo?: string }>();
    const { exercises, loading } = useLoadExercises();

    // Single-select behavior: navigate immediately when an exercise is tapped
    const handleSelectExercise = (exercise: any) => {
        const key = workoutEditKey || workoutEditId;
        // If returnTo === 'active' we return to ActiveWorkoutScreen
        if (returnTo === 'active' && key) {
            router.push({ pathname: "/screens/workout/ActiveWorkoutScreen", params: { workoutEditKey: key, selectedExerciseId: exercise.id, selectedExerciseName: exercise.name } });
            return;
        }

        // Default: go to EditWorkoutScreen
        router.push({ pathname: "/screens/workout/EditWorkoutScreen", params: { workoutEditKey: key, selectedExerciseId: exercise.id, selectedExerciseName: exercise.name, breakTime } });
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
                <Text style={styles.breakTimeLabel}>Pausenzeit (Sekunden)</Text>
                <TextInput
                    value={breakTime}
                    onChangeText={setBreakTime}
                    placeholder="z.B. 30"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    style={styles.breakTimeInput}
                />
            </View>

            <ExerciseList
                exercises={exercises}
                filter={filter}
                onItemPress={(exercise) => handleSelectExercise(exercise)}
            />

            {/* Note: single-select; tapping an exercise returns immediately */}

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