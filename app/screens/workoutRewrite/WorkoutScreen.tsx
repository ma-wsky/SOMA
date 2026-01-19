import { Text, TextInput, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

// Eigene Komponenten & Styles
import WorkoutList from "@/components/workout/WorkoutListNew";
import { workoutStyles } from "@/styles/workoutStyles";
import LoadingOverlay from "@/components/LoadingOverlay";

// Logik & Firebase
import { WorkoutService } from "@/services/WorkoutService";
import { auth } from "@/firebaseConfig";
import { showAlert } from "@/utils/alertHelper";
import { Workout } from "@/types/Workout";
import { useLoadTemplates } from "@/hooks/useLoadTemplates";

export default function WorkoutScreen() {
    const router = useRouter();
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const {templates, loading: templatesLoading, refetch} = useLoadTemplates();


    const handleDeleteWorkout = async (workoutId: string) => {
        const user = auth.currentUser;
        if (!user) return;

        setLoading(true);
        try {
            await WorkoutService.deleteWorkout(user.uid, workoutId);
            showAlert("Erfolg", "Training gelöscht");
            refetch?.(); // Liste neu laden
        } catch (e) {
            console.error(e);
            showAlert("Fehler", "Löschen fehlgeschlagen");
        } finally {
            setLoading(false);
        }
    };

    const handleStartWorkout = (workout: Workout) => {
        router.push({
            pathname: "/screens/workoutRewrite/ActiveWorkoutScreen",
            params: {templateId: workout.id}
        });
    };

    return (
        <View style={workoutStyles.container}>

            {/* empty workout */}
            <View style={{marginHorizontal: 20,}}>
                <Pressable
                    onPress={() => {
                        router.push({
                            pathname: "/screens/workout/SingleWorkoutInfoScreen",
                            params: { workoutEditId: `new_temp_${Date.now()}` },
                        });
                    }}
                    style={({ pressed }) => [
                        workoutStyles.bigButton,
                        {backgroundColor: pressed ? "#333" : "#000"},
                    ]}
                >
                    <View style={workoutStyles.bigButtonTextWrapper}>
                        <Text style={workoutStyles.buttonText}>leeres Training starten</Text>
                        <Ionicons
                            name={"barbell-outline"}
                            size={28}
                            color="#fff"
                        />
                    </View>

                </Pressable>
            </View>

            {/* Search Bar */}
            <TextInput placeholder={"Übung suchen..."}
                       placeholderTextColor='white'
                       value={filter}
                       onChangeText={setFilter}
                       style={workoutStyles.searchBar}
            />

            <WorkoutList
                workouts={templates}
                filter={filter}
                onItemPress={(workout) =>
                    router.push({
                        pathname: "/screens/workoutRewrite/SingleWorkoutInfoScreen",
                        params: { id: workout.id },
                    })
                }
                onStartWorkout={handleStartWorkout}
                onDelete={handleDeleteWorkout}
            />

            {/* new template */}
            <View style={{marginHorizontal: 20, marginTop: 80,}}>
                <Pressable
                    onPress={() => {
                        router.push({
                            pathname: "/screens/workoutRewrite/CreateTemplateScreen",
                        });
                    }}
                    style={({ pressed }) => [
                        workoutStyles.bigButton,
                        {backgroundColor: pressed ? "#333" : "#000"},
                    ]}
                >
                    <View style={workoutStyles.bigButtonTextWrapper}>
                        <Text style={workoutStyles.buttonText}>neuen Plan erstellen</Text>
                        <Ionicons
                            name={"barbell-outline"}
                            size={28}
                            color="#fff"
                        />
                    </View>

                </Pressable>
            </View>

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading}/>

        </View>
    );
}