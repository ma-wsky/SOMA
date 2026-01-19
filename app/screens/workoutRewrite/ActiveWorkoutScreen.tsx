import { View, Text, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { workoutStyles } from "@/styles/workoutStyles";
import { WorkoutService } from "@/services/WorkoutService";
import { ExerciseSet } from "@/types/ExerciseSet";
import LoadingOverlay from "@/components/LoadingOverlay";
import { groupSetsByExercise } from "@/utils/workoutHelpers";
import { auth, db } from "@/firebaseConfig";
import { ExerciseCard } from "@/components/workout/ExerciseCard";


export default function ActiveWorkoutScreen() {
    const router = useRouter();
    const { templateId } = useLocalSearchParams<{ templateId: string }>();
    const [loading, setLoading] = useState(true);
    const [workoutName, setWorkoutName] = useState("");
    const [activeSets, setActiveSets] = useState<ExerciseSet[]>([]);

    useEffect(() => {
        if (templateId && auth.currentUser) {
            setLoading(true);
            WorkoutService.fetchTemplate(auth.currentUser.uid, templateId)
                .then((template) => {
                    if (template && template.exerciseSets) {
                        setWorkoutName(template.name);
                        const initializedSets = template.exerciseSets.map(set => ({
                            ...set,
                            isDone: false
                        }));
                        setActiveSets(initializedSets);
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [templateId]);

    const toggleSet = (setId: string) => {
        setActiveSets(prev => prev.map(set =>
            set.id === setId ? { ...set, isDone: !set.isDone } : set
        ));
    };

    const handleFinishWorkout = async () => {
        if (!auth.currentUser) return;

        try {
            setLoading(true);

            await WorkoutService.saveWorkoutHistory(
                auth.currentUser.uid,
                templateId,
                workoutName,
                activeSets,
            );

            Alert.alert("Erfolg", "Workout wurde in deiner Historie gespeichert!");
            router.replace("/(tabs)/WorkoutScreenProxy");
        } catch (error) {
            console.error("Fehler beim Speichern:", error);
            Alert.alert("Fehler", "Workout konnte nicht gespeichert werden.");
        } finally {
            setLoading(false);
        }
    };

    if (!activeSets.length && !loading) return <Text>Keine Übungen gefunden</Text>;

    const groupedExercises = groupSetsByExercise(activeSets);

    return (
        <View style={workoutStyles.container}>
            <TopBar
                titleText={workoutName}
                leftButtonText={"Abbrechen"}
                onLeftPress={() => {
                    Alert.alert("Abbrechen?", "Dein Fortschritt geht verloren.", [
                        { text: "Weiter trainieren", style: "cancel" },
                        { text: "Abbrechen", style: "destructive", onPress: () => router.back() }
                    ]);
                }}
                rightButtonText={"Fertig"}
                onRightPress={handleFinishWorkout}
            />

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                {Object.entries(groupedExercises).map(([exId, sets]) => (
                    <ExerciseCard
                        key={exId}
                        exerciseId={exId}
                        sets={sets}
                        isActiveMode={true}
                        onToggleComplete={(setId) => toggleSet(setId)}
                    />
                ))}
            </ScrollView>

            <LoadingOverlay visible={loading} />
        </View>
    );
}