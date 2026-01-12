import { Text, View, Button, FlatList, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/app/firebaseConfig";
import { TopBar } from "@/app/components/TopBar";
import { workoutStyles } from "@/app/styles/workoutStyles";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import Ionicons from "@expo/vector-icons/Ionicons";
import { doc } from "firebase/firestore";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  instructions: string;
};

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
  date: string;
  exerciseSets: ExerciseSet[];
};

export default function WorkoutHistoryScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [exercisesMap, setExercisesMap] = useState<Map<string, Exercise>>(new Map());

  useEffect(() => {
    const loadWorkoutHistory = async () => {
      setLoading(true);
      try {
        // Load exercises first
        const exercisesMap = new Map<string, Exercise>();
        const exercisesSnapshot = await getDocs(collection(db, "exercises"));
        exercisesSnapshot.forEach((doc) => {
          exercisesMap.set(doc.id, { id: doc.id, ...doc.data() } as Exercise);
        });
        setExercisesMap(exercisesMap);

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
          // Filter by date if it matches
          if (workoutData.date && workoutData.date.startsWith(date)) {
            // Load exercise sets from subcollection
            const setsSnapshot = await getDocs(collection(workoutDoc.ref, "exerciseSets"));
            const sets: ExerciseSet[] = [];
            setsSnapshot.forEach((setDoc) => {
              const data = setDoc.data();
              const exercise = exercisesMap.get(data.exerciseId);
              sets.push({
                id: setDoc.id,
                ...data,
                exerciseName: exercise?.name,
              } as ExerciseSet);
            });

            loadedWorkouts.push({
              id: workoutDoc.id,
              date: workoutData.date,
              exerciseSets: sets,
            });
          }
        }

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
                    Training vom {workout.date}
                  </Text>
                  <Text style={{ color: "#aaa", fontSize: 13 }}>
                    📝 Sätze: {workout.exerciseSets.length}
                  </Text>
                  <Text style={{ color: "#aaa", fontSize: 13 }}>
                    ✓ Abgeschlossen: {workout.exerciseSets.filter(s => s.isDone).length}/{workout.exerciseSets.length}
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
                  {workout.exerciseSets.length > 0 ? (
                    <View>
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          marginBottom: 12,
                        }}
                      >
                        Durchgeführte Sätze:
                      </Text>
                      {workout.exerciseSets.map((set, setIdx) => (
                        <View
                          key={setIdx}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: "#111",
                            padding: 10,
                            borderRadius: 8,
                            marginBottom: 8,
                          }}
                        >
                          <View style={{flex: 1}}>
                            <Text
                              style={{
                                color: "#fff",
                                fontWeight: "600",
                                marginBottom: 4,
                              }}
                            >
                              {set.exerciseName || set.exerciseId}
                            </Text>
                            <Text
                              style={{
                                color: "#aaa",
                                fontSize: 13,
                              }}
                            >
                              {set.reps} Wiederholungen @ {set.weight}kg
                            </Text>
                          </View>
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
                  ) : (
                    <Text style={{ color: "#aaa", textAlign: "center" }}>
                      Keine Sätze aufgezeichnet
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
