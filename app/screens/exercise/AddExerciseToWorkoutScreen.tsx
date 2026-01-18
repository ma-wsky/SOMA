import { router, useLocalSearchParams } from "expo-router";
import { View, TextInput, StyleSheet, Text, Alert } from "react-native";
import { useState } from "react";
import { TopBar } from "@/components/TopBar"
import ExerciseList from "@/components/ExerciseList";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useLoadExercises } from "@/hooks/useLoadExercises";
import { Colors } from "@/styles/theme";


export default function AddExerciseToWorkoutScreen() {

    const [filter, setFilter] = useState("");
    const [breakTime, setBreakTime] = useState("30");
    const { workoutEditId, returnTo } = useLocalSearchParams<{ workoutEditId?: string; returnTo?: "active"|"edit"; }>();  
    const { exercises, loading } = useLoadExercises();



    const addExercise = (exercise: {id:string; name:string}) => {
        if (!workoutEditId) {
            console.error("workoutEditId ist null");
            Alert.alert("Fehler", "Es konnte kein Trainings-Kontext gefunden werden.");
            return;
        }

        const params = {
            workoutEditId,
            selectedExerciseId: exercise.id,
            selectedExerciseName: exercise.name,
            selectedBreakTime: breakTime,
            _t: Date.now().toString() //zwingt router param als neu anzusehen
        }; 

        if (returnTo === 'active'){
            router.navigate({ pathname: "/screens/workout/ActiveWorkoutScreen", 
                params
            });
        } else if (returnTo === 'edit'){
            router.navigate({ pathname: "/screens/workout/SingleWorkoutInfoScreen", 
                params
            });
        }
    };

    const openInfo = (exercise: {id: string}) => {
        router.push({ pathname: "/screens/exercise/SingleExerciseInfoScreen", 
            params: { id: exercise.id } });
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
                placeholderTextColor={Colors.white}
                value={filter}
                onChangeText={setFilter}
                style={styles.search}
            />

            {/* Break Time Input */}
            <View style={styles.breakTimeContainer}>
                <Text style={styles.breakTimeLabel}>Pausenzeit nach einem Satz (Sekunden)</Text>
                <TextInput
                    value={breakTime}
                    onChangeText={setBreakTime}
                    placeholder="30"
                    placeholderTextColor={Colors.gray}
                    keyboardType="numeric"
                    style={styles.breakTimeInput}
                />
            </View>

            <ExerciseList
                exercises={exercises}
                filter={filter}
                showAddButton
                onItemPress={openInfo}
                onAddToWorkout={addExercise}
            />

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading} />

        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'flex-start',
    },
    search:{
        padding:10,
        fontSize:20,
        backgroundColor:Colors.black,
        margin:20,
        borderRadius: 50,
    },
    breakTimeContainer: {
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    breakTimeLabel: {
        color: Colors.black,
        fontSize: 14,
        marginBottom: 6,
    },
    breakTimeInput: {
        backgroundColor: Colors.black,
        color: Colors.white,
        padding: 10,
        borderRadius: 8,
        fontSize: 16,
    },
})