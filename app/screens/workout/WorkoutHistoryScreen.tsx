import { Text, View, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { TopBar } from "@/components/TopBar";
import LoadingOverlay from "@/components/LoadingOverlay";
import Ionicons from "@expo/vector-icons/Ionicons";
import { renderHistoryCard } from "@/utils/renderWorkout";
import { exportWorkoutsToPDF } from "@/utils/helper/exportHelper";
import { ExerciseSet, Workout } from "@/types/workoutTypes";
import { Exercise } from "@/types/Exercise"
import { groupSetsByExercise } from "@/utils/helper/workoutExerciseHelper";
import { formatTimeDynamic } from "@/utils/helper/formatTimeHelper";
import { ExerciseService } from "@/services/exerciseService";

export default function WorkoutHistoryScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    const loadWorkoutHistory = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user || !date) {
          setWorkouts([]);
          setLoading(false);
          return;
        }

        // Query Workouts
        const workoutsRef = collection(db, "users", user.uid, "workouts");
        const snapshot = await getDocs(workoutsRef);

        const loadedWorkouts: Workout[] = [];

        for (const workoutDoc of snapshot.docs) {
          const workoutData = workoutDoc.data();
          if (
            workoutData.date &&
            workoutData.date.startsWith(date) &&
            workoutData.type !== "template"
          ) {
            // Load from subcollection
            const setsSnapshot = await getDocs(
              collection(workoutDoc.ref, "exerciseSets")
            );
            const sets: ExerciseSet[] = [];
            setsSnapshot.forEach((setDoc) => {
              const data = setDoc.data();
              sets.push({
                id: setDoc.id,
                ...data,
              } as ExerciseSet);
            });

            loadedWorkouts.push({
              id: workoutDoc.id,
              name: workoutData.name,
              date: workoutData.date,
              duration: workoutData.duration,
              type: workoutData.type,
              exerciseSets: sets,
            });
          }
        }

        loadedWorkouts.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        //
        const allExerciseIds = loadedWorkouts.flatMap(workout =>
            workout.exerciseSets.map(set => set.exerciseId)
        );

        const uniqueExerciseIds = [...new Set(allExerciseIds)];

        if (uniqueExerciseIds.length > 0 && auth.currentUser){
            const uid = auth.currentUser.uid;
            const exercisePromises = uniqueExerciseIds.map(id =>
                ExerciseService.fetchExercise(id, uid)
            );
            const fetchedExercises = await Promise.all(exercisePromises);

            setExercises(fetchedExercises.filter(ex => ex != null) as Exercise[]);
        }

        setWorkouts(loadedWorkouts);
      } catch (e) {
        console.error("Fehler beim Laden der Workout-History:", e);
      } finally {
        setLoading(false);
      }
    };

    loadWorkoutHistory();
  }, [date]);

  const formatTime = (seconds?: number) => {
    if (!seconds) return "0:00";
    return formatTimeDynamic(seconds);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownloadPDF = async () => {
    if (!date) return;
    await exportWorkoutsToPDF(workouts, date);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TopBar
        leftButtonText="Zurück"
        titleText="Verlauf"
        rightButtonText="Export"
        onLeftPress={() => router.back()}
        onRightPress={handleDownloadPDF}
      />

      {loading ? (
        <LoadingOverlay visible={loading} />
      ) : workouts.length > 0 ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            paddingBottom: 40,
          }}
        >
          {/* Date Header */}
          <View
            style={{
              backgroundColor: "#222",
              padding: 16,
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                color: "#aaa",
                fontSize: 12,
                marginBottom: 4,
                fontWeight: "600",
              }}
            >
              TRAININGSVERLAUF
            </Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 12,
              }}
            >
              {date && formatDate(date)}
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 16,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: "#333",
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#aaa",
                    fontSize: 11,
                    marginBottom: 2,
                  }}
                >
                  Workouts
                </Text>
                <Text
                  style={{
                    color: "#AB8FFF",
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  {workouts.length}
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    color: "#aaa",
                    fontSize: 11,
                    marginBottom: 2,
                  }}
                >
                  Gesamtdauer
                </Text>
                <Text
                  style={{
                    color: "#AB8FFF",
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  {formatTime(
                    workouts.reduce((sum, w) => sum + (w.duration || 0), 0)
                  )}
                </Text>
              </View>
            </View>
          </View>

          {workouts.map((workout) => {
            const groupedExercises = groupSetsByExercise(workout.exerciseSets);
            const exerciseIds = Object.keys(groupedExercises);

            return (
              <View key={workout.id} style={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: '#ddd'
              }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    marginLeft: 5
                  }}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text
                      style={{
                        color: "#000",
                        fontSize: 24,
                        fontWeight: "bold",
                        marginBottom: 2,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {workout.name || "Training"}
                    </Text>
                    <Text
                      style={{
                        color: "#666",
                        fontSize: 12,
                      }}
                    >
                      {new Date(workout.date).toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  {workout.duration && (
                    <View
                      style={{
                        backgroundColor: "#AB8FFF",
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 20,
                        flexShrink: 0,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: "700",
                        }}
                      >
                        Time: {formatTime(workout.duration)}
                      </Text>
                    </View>
                  )}
                </View>

                {exerciseIds.map((exerciseId) => {
                  const sets = groupedExercises[exerciseId];
                  const exerciseDetails = exercises.find(e => e.id === exerciseId);
                  if (exerciseDetails) return renderHistoryCard(exerciseId, sets, exerciseDetails);
                })}

              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Ionicons name="calendar" size={48} color="#666" />
          <Text
            style={{
              color: "#aaa",
              fontSize: 16,
              textAlign: "center",
            }}
          >
            Keine Workouts an diesem Tag
          </Text>
        </View>
      )}
    </View>
  );
}

