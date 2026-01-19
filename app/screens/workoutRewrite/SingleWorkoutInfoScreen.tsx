import { View, Text, ScrollView, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { workoutStyles } from "@/styles/workoutStyles";
import { Colors } from "@/styles/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { WorkoutService } from "@/services/WorkoutService";
import { WorkoutTemplate } from "@/types/WorkoutTemplate";
import LoadingOverlay from "@/components/LoadingOverlay";
import { groupSetsByExercise } from "@/utils/workoutHelpers";
import { auth } from "@/firebaseConfig";

export default function SingleWorkoutInfoScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [workout, setWorkout] = useState<WorkoutTemplate | null>(null);

    useEffect(() => {
        if (id && auth.currentUser) {
            setLoading(true);
            WorkoutService.fetchTemplate(auth.currentUser.uid, id)
                .then(setWorkout)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (!workout) return <Text>Workout nicht gefunden</Text>;

    return (
        <View style={workoutStyles.container}>
            <TopBar
                titleText={workout?.name}
                leftButtonText={"Zurück"}
                onLeftPress={() => router.replace("/(tabs)/WorkoutScreenProxy")}
                rightButtonText={"Bearbeiten"}
                onRightPress={() =>
                    router.push({
                        pathname: "/screens/workoutRewrite/SingleWorkoutEditScreen",
                        params: { id: workout.id }
                    })
                }
            />

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

                {/* Die Übungs-Karten */}
                {workout && Object.entries(groupSetsByExercise(workout.exerciseSets)).map(([exId, sets]) => (
                    <View key={exId} style={workoutStyles.exerciseCard}>
                        <View style={workoutStyles.exerciseCardHeader}>
                            <View style={workoutStyles.picWrapper}>
                                <Image
                                    source={
                                        sets[0].image
                                            ? { uri: sets[0].image }
                                            : require('@/assets/default-exercise-picture/default-exercise-picture.jpg')
                                    }
                                    style={workoutStyles.picture}
                                />
                            </View>
                            <Text style={workoutStyles.exerciseTitle}>{sets[0].exerciseName}</Text>

                            <View style={workoutStyles.breakTimeBadge}>
                                <Ionicons name="timer-outline" size={14} color={Colors.primary} />
                                <Text style={workoutStyles.breakTimeText}>{sets[0].breaktime}s</Text>
                            </View>
                        </View>

                        {/* Tabellen-Header */}
                        <View style={workoutStyles.setRowHeader}>
                            <Text style={[workoutStyles.setTextHeader, { flex: 1 }]}>Satz</Text>
                            <Text style={[workoutStyles.setTextHeader, { flex: 2 }]}>Gewicht</Text>
                            <Text style={[workoutStyles.setTextHeader, { flex: 2 }]}>Wiederh.</Text>
                        </View>

                        {sets.map((set, index) => (
                            <View key={index} style={workoutStyles.setRow}>
                                <Text style={[workoutStyles.setText, { flex: 1 }]}>{index + 1}</Text>
                                <Text style={[workoutStyles.setText, { flex: 2 }]}>{set.weight} kg</Text>
                                <Text style={[workoutStyles.setText, { flex: 2 }]}>{set.reps}</Text>

                            </View>
                        ))}

                    </View>
                ))}

            </ScrollView>

            {/* loading overlay */}
            <LoadingOverlay visible={loading} />

        </View>
    );
}