import { Text, View, ScrollView, Pressable, Share } from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/app/firebaseConfig";
import { TopBar } from "@/app/components/TopBar";
import { workoutStyles } from "@/app/styles/workoutStyles";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import Ionicons from "@expo/vector-icons/Ionicons";

type ExerciseSet = {
  id?: string;
  exerciseId: string;
  exerciseName?: string;
  weight: number;
  reps: number;
  isDone?: boolean;
};

type Workout = {
  id: string;
  name?: string;
  date: string;
  duration?: number;
  type?: "template" | "history";
  exerciseSets: ExerciseSet[];
};

type GroupedExercises = {
  [key: string]: {
    exerciseName: string;
    sets: ExerciseSet[];
  };
};

export default function WorkoutHistoryScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

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

        // Query Workouts für diesen Tag
        const workoutsRef = collection(db, "users", user.uid, "workouts");
        const snapshot = await getDocs(workoutsRef);

        const loadedWorkouts: Workout[] = [];

        for (const workoutDoc of snapshot.docs) {
          const workoutData = workoutDoc.data();
          // Filter by date and type !== "template" (only show history)
          if (
            workoutData.date &&
            workoutData.date.startsWith(date) &&
            workoutData.type !== "template"
          ) {
            // Load exercise sets from subcollection
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

        // Sort by date descending
        loadedWorkouts.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
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

  const groupSetsByExercise = (sets: ExerciseSet[]): GroupedExercises => {
    const grouped: GroupedExercises = {};

    sets.forEach((set) => {
      const exerciseId = set.exerciseId;
      if (!grouped[exerciseId]) {
        grouped[exerciseId] = {
          exerciseName: set.exerciseName || exerciseId,
          sets: [],
        };
      }
      grouped[exerciseId].sets.push(set);
    });

    return grouped;
  };

  const handleDownloadPDF = async () => {
    try {
      const message = `Workout History für ${formatDate(date || "")}`;
      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error("Fehler beim Download:", error);
    }
  };

  const renderExerciseCard = (
    exerciseName: string,
    sets: ExerciseSet[]
  ) => {
    const completedSets = sets.filter((s) => s.isDone).length;

    return (
      <View
        key={exerciseName}
        style={{
          backgroundColor: "#222",
          borderRadius: 12,
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        {/* Exercise Header */}
        <View
          style={{
            backgroundColor: "#AB8FFF",
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "#000",
                fontSize: 16,
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              {exerciseName}
            </Text>
            <Text style={{ color: "rgba(0,0,0,0.6)", fontSize: 12 }}>
              {completedSets}/{sets.length} Sätze abgeschlossen
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.2)",
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "#000", fontSize: 12, fontWeight: "600" }}>
              {sets.length}
            </Text>
          </View>
        </View>

        {/* Sets List */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          {sets.map((set, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 10,
                paddingHorizontal: 12,
                backgroundColor: "#1a1a1a",
                borderRadius: 8,
                marginBottom: index < sets.length - 1 ? 8 : 0,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                >
                  Satz {index + 1}
                </Text>
                <Text
                  style={{
                    color: "#aaa",
                    fontSize: 12,
                  }}
                >
                  {set.reps} × {set.weight} kg
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {set.isDone ? (
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                ) : (
                  <Ionicons
                    name="ellipse-outline"
                    size={20}
                    color="#666"
                  />
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1a1a1a" }}>
      <TopBar
        leftButtonText="Zurück"
        titleText="Verlauf"
        rightButtonText="PDF"
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

          {/* Workouts */}
          {workouts.map((workout) => {
            const groupedExercises = groupSetsByExercise(workout.exerciseSets);
            const exerciseIds = Object.keys(groupedExercises);

            return (
              <View key={workout.id}>
                {/* Workout Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: "600",
                        marginBottom: 2,
                      }}
                    >
                      {workout.name || "Training"}
                    </Text>
                    <Text
                      style={{
                        color: "#aaa",
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
                      }}
                    >
                      <Text
                        style={{
                          color: "#000",
                          fontSize: 12,
                          fontWeight: "700",
                        }}
                      >
                        ⏱ {formatTime(workout.duration)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Exercise Cards */}
                {exerciseIds.map((exerciseId) => {
                  const exercise = groupedExercises[exerciseId];
                  return renderExerciseCard(exercise.exerciseName, exercise.sets);
                })}

                {/* Spacing between workouts */}
                <View style={{ height: 16 }} />
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
