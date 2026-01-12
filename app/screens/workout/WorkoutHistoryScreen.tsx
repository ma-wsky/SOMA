import { Text, View, Button, FlatList, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/app/firebaseConfig";
import { TopBar } from "@/app/components/TopBar";
import { workoutStyles } from "@/app/styles/workoutStyles";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import WExerciseList from "@/app/components/WExerciseList";
import Ionicons from "@expo/vector-icons/Ionicons";

type Workout = {
  id: string;
  name: string;
  duration: number;
  exercises: WorkoutExercise[];
  completedAt?: string;
};

type WorkoutExercise = {
  id: string;
  breakTime: number;
  sets: Set[];
};

type Set = {
  reps: number;
  weight: number;
  isDone: boolean;
};

export default function WorkoutHistoryScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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

        // Parse das Datum (format: YYYY-MM-DD)
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Query Workouts für diesen Tag
        const q = query(
          collection(db, "users", user.uid, "workouts"),
          where("completedAt", ">=", startOfDay.toISOString()),
          where("completedAt", "<=", endOfDay.toISOString()),
        );

        const snapshot = await getDocs(q);
        const loadedWorkouts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Workout[];

        setWorkouts(loadedWorkouts);
      } catch (e) {
        console.error("Fehler beim Laden der Workout-History:", e);
        Alert.alert("Fehler", "Workouts konnten nicht geladen werden");
      } finally {
        setLoading(false);
      }
    };

    loadWorkoutHistory();
  }, [date]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCompletionTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={workoutStyles.container}>
      <TopBar
        leftButtonText={"Zurück"}
        titleText={"Workout-Verlauf"}
        onLeftPress={() => router.back()}
      />

      {/* Date Header */}
      <View
        style={{
          backgroundColor: "#222",
          padding: 16,
          marginBottom: 12,
          marginHorizontal: 16,
          marginTop: 12,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#aaa", fontSize: 14, marginBottom: 4 }}>
          Trainingsverlauf für:
        </Text>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
          {date && formatDate(date)}
        </Text>
      </View>

      {/* Workouts List */}
      {workouts.length > 0 ? (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            paddingTop: 0,
            paddingBottom: 40,
          }}
          renderItem={({ item: workout, index }) => (
            <View key={index}>
              <Pressable
                onPress={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
                style={{
                  backgroundColor: "#222",
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 12,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 4,
                    }}
                  >
                    {workout.name}
                  </Text>
                  <Text style={{ color: "#aaa", fontSize: 13 }}>
                    ⏱️ Dauer: {formatTime(workout.duration)}
                  </Text>
                  {workout.completedAt && (
                    <Text style={{ color: "#aaa", fontSize: 13 }}>
                      🕐 Zeit: {formatCompletionTime(workout.completedAt)}
                    </Text>
                  )}
                  <Text style={{ color: "#aaa", fontSize: 13 }}>
                    📝 Übungen: {workout.exercises.length}
                  </Text>
                </View>
                <Ionicons
                  name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#fff"
                />
              </Pressable>

              {/* Expanded Details */}
              {expandedIndex === index && (
                <View
                  style={{
                    backgroundColor: "#1a1a1a",
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 12,
                    marginTop: -8,
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                  }}
                >
                  {workout.exercises.length > 0 ? (
                    <View>
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          marginBottom: 12,
                        }}
                      >
                        Durchgeführte Übungen:
                      </Text>
                      {workout.exercises.map((exercise, exIdx) => (
                        <View
                          key={exIdx}
                          style={{
                            backgroundColor: "#111",
                            padding: 10,
                            borderRadius: 8,
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "600",
                              marginBottom: 6,
                            }}
                          >
                            {exIdx + 1}. Übung: {exercise.id}
                          </Text>
                          {exercise.sets.map((set, setIdx) => (
                            <View
                              key={setIdx}
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 4,
                                paddingHorizontal: 4,
                              }}
                            >
                              <Text
                                style={{
                                  color: "#aaa",
                                  fontSize: 13,
                                }}
                              >
                                Satz {setIdx + 1}: {set.reps} Reps @{" "}
                                {set.weight}kg
                              </Text>
                              <Ionicons
                                name={
                                  set.isDone
                                    ? "checkmark-circle"
                                    : "ellipse-outline"
                                }
                                size={18}
                                color={set.isDone ? "#4CAF50" : "#666"}
                              />
                            </View>
                          ))}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={{ color: "#aaa", textAlign: "center" }}>
                      Keine Übungen aufgezeichnet
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons name="calendar" size={48} color="#666" />
          <Text style={{ color: "#aaa", fontSize: 16, marginTop: 12 }}>
            Keine Workouts an diesem Tag\n
          </Text>
        </View>
      )}

      <LoadingOverlay visible={loading} />
    </View>
  );
}
