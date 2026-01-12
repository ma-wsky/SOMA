import {
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebaseConfig";
import { workoutStyles } from "@/app/styles/workoutStyles";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TopBar } from "@/app/components/TopBar";

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

type Workout = {
  id?: string;
  name: string;
  duration: number;
  exercises: WorkoutExercise[];
  startTime?: number;
};

export default function ActiveWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Lade Workout beim Start
  useEffect(() => {
    const loadWorkout = async () => {
      setLoading(true);
      try {
        if (id) {
          // Wenn ID vorhanden, lade gespeichertes Workout
          const globalRef = doc(db, "workouts", id);
          const globalSnap = await getDoc(globalRef);
          if (globalSnap.exists()) {
            setWorkout(globalSnap.data() as Workout);
            return;
          }

          const user = auth.currentUser;
          if (user) {
            const userRef = doc(db, "users", user.uid, "workouts", id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setWorkout(userSnap.data() as Workout);
              return;
            }
          }
        } else {
          // Leeres Workout (freies Training)
          setWorkout({
            name: "Freies Training",
            duration: 0,
            exercises: [],
            startTime: Date.now(),
          });
        }
      } catch (e) {
        console.error("Fehler beim Laden des Workouts:", e);
        Alert.alert("Fehler", "Workout konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    };

    loadWorkout();
  }, [id]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000) as unknown as NodeJS.Timeout;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Break Time Timer
  useEffect(() => {
    if (isBreakTime && breakTime > 0) {
      const breakTimer = setTimeout(() => {
        setBreakTime((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(breakTimer);
    }

    if (isBreakTime && breakTime === 0 && workout) {
      setIsBreakTime(false);
    }
  }, [isBreakTime, breakTime, workout]);

  // Handle Set Checkbox
  const handleSetCheck = (exerciseIndex: number, setIndex: number) => {
    if (!workout) return;

    const updatedExercises = [...workout.exercises];
    updatedExercises[exerciseIndex].sets[setIndex].isDone =
      !updatedExercises[exerciseIndex].sets[setIndex].isDone;

    setWorkout({
      ...workout,
      exercises: updatedExercises,
    });
  };

  // Set Pausenzeit
  const handleSetBreakTime = (exerciseIndex: number) => {
    if (!workout) return;
    const breakDuration = workout.exercises[exerciseIndex].breakTime;
    setBreakTime(breakDuration);
    setIsBreakTime(true);
  };

  // Discard Workout
  const handleDiscardWorkout = () => {
    Alert.alert("Training verwerfen", "Möchten Sie dieses Training wirklich verwerfen?", [
      {
        text: "Abbrechen",
        style: "cancel",
      },
      {
        text: "Verwerfen",
        style: "destructive",
        onPress: () => {
          router.back();
        },
      },
    ]);
  };

  // Finish Workout (speichern)
  const handleFinishWorkout = async () => {
    Alert.alert("Training beenden", "Möchten Sie dieses Training speichern?", [
      {
        text: "Abbrechen",
        style: "cancel",
      },
      {
        text: "Speichern",
        onPress: async () => {
          setLoading(true);
          try {
            const user = auth.currentUser;
            if (!user || !workout) return;

            const workoutData = {
              ...workout,
              duration: elapsedTime,
              completedAt: new Date().toISOString(),
            };

            const userRef = doc(
              db,
              "users",
              user.uid,
              "workouts",
              workout.id || Date.now().toString(),
            );
            await setDoc(userRef, workoutData);

            Alert.alert("Erfolg", "Training gespeichert");
            router.back();
          } catch (e) {
            console.error("Fehler beim Speichern:", e);
            Alert.alert("Fehler", "Training konnte nicht gespeichert werden");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // Edit mode - save changes
  const handleSaveChanges = async () => {
    if (!workout) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const workoutData = {
        ...workout,
        duration: elapsedTime,
      };

      const userRef = doc(
        db,
        "users",
        user.uid,
        "workouts",
        workout.id || Date.now().toString(),
      );
      await setDoc(userRef, workoutData);
      setIsEditMode(false);
      Alert.alert("Erfolg", "Änderungen gespeichert");
    } catch (e) {
      console.error("Fehler beim Speichern:", e);
      Alert.alert("Fehler", "Änderungen konnten nicht gespeichert werden");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!workout) {
    return (
      <View style={workoutStyles.container}>
        <Text>Workout wird geladen...</Text>
        <LoadingOverlay visible={loading} />
      </View>
    );
  }

  return (
    <View style={workoutStyles.container}>
      <TopBar
        leftButtonText={isEditMode ? "Abbrechen" : "Verwerfen"}
        titleText={isEditMode ? "Training bearbeiten" : workout.name}
        rightButtonText={isEditMode ? "Speichern" : "Fertig"}
        onLeftPress={isEditMode ? () => setIsEditMode(false) : handleDiscardWorkout}
        onRightPress={isEditMode ? handleSaveChanges : handleFinishWorkout}
      />

      {/* Timer */}
      <View style={styles.timerSection}>
        <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        {isBreakTime && (
          <View style={styles.breakTimeIndicator}>
            <Text style={styles.breakTimeText}>Pausenzeit: {breakTime}s</Text>
          </View>
        )}
      </View>

      {/* Exercises List */}
      {workout.exercises.length > 0 ? (
        <FlatList
          data={workout.exercises}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item: exercise, index: exerciseIndex }) => (
            <View key={exerciseIndex} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>
                  {exerciseIndex + 1}. Übung: {exercise.id}
                </Text>
                {!isEditMode && (
                  <Pressable
                    onPress={() => handleSetBreakTime(exerciseIndex)}
                    style={styles.breakButton}
                  >
                    <Ionicons name="timer" size={20} color="#fff" />
                    <Text style={styles.breakButtonText}>
                      {exercise.breakTime}s
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Sets */}
              <View style={{ marginTop: 12 }}>
                {exercise.sets.map((set, setIndex) => (
                  <Pressable
                    key={setIndex}
                    onPress={() => !isEditMode && handleSetCheck(exerciseIndex, setIndex)}
                    disabled={isEditMode}
                    style={[styles.setItem, set.isDone && styles.setItemDone]}
                  >
                    {!isEditMode && (
                      <View
                        style={[
                          styles.checkbox,
                          set.isDone && styles.checkboxDone,
                        ]}
                      >
                        {set.isDone && (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.setText,
                          set.isDone && styles.setTextDone,
                        ]}
                      >
                        Satz {setIndex + 1}: {set.reps} Wiederholungen @{" "}
                        {set.weight}kg
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 40 }}>
          <Text style={{ color: "#aaa", textAlign: "center", fontSize: 16 }}>
            Freies Training - Keine vordefinierten Übungen
          </Text>
        </ScrollView>
      )}

      {/* Edit Button - only in normal mode */}
      {!isEditMode && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            left: 20,
          }}
        >
          <Pressable
            onPress={() => setIsEditMode(true)}
            style={{
              backgroundColor: "#333",
              padding: 14,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
              Bearbeiten
            </Text>
          </Pressable>
        </View>
      )}

      <LoadingOverlay visible={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  timerSection: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1a1a1a",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  timerText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Courier New",
  },
  breakTimeIndicator: {
    marginTop: 12,
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  breakTimeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  exerciseCard: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  breakButton: {
    backgroundColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  breakButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  setItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#111",
    borderRadius: 8,
    marginBottom: 8,
  },
  setItemDone: {
    backgroundColor: "#1a3a1a",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#666",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  setText: {
    fontSize: 14,
    color: "#aaa",
  },
  setTextDone: {
    color: "#4CAF50",
    textDecorationLine: "line-through",
  },
});
