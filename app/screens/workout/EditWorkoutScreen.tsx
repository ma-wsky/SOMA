import { TopBar } from "@/app/components/TopBar";
import { workoutStyles } from "@/app/styles/workoutStyles";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  FlatList,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebaseConfig";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import Ionicons from "@expo/vector-icons/Ionicons";

type Workout = {
  id: string;
  name: string;
  duration: number;
  exercises: WorkoutExercise[];
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


export default function EditWorkoutScreen() {
  const [loading, setLoading] = useState<boolean>(false);
  const { id, selectedExerciseId, breakTime: selectedBreakTime } = useLocalSearchParams<{ 
    id: string;
    selectedExerciseId?: string;
    breakTime?: string;
  }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [workoutName, setWorkoutName] = useState("");

  // Load Workout on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (id) {
          const globalRef = doc(db, "workouts", id);
          const globalSnap = await getDoc(globalRef);
          if (globalSnap.exists()) {
            const data = globalSnap.data() as Workout;
            setWorkout({ ...data, id: globalSnap.id });
            setWorkoutName(data.name);
            return;
          }

          const user = auth.currentUser;
          if (user) {
            const userRef = doc(db, "users", user.uid, "workouts", id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const data = userSnap.data() as Workout;
              setWorkout({ ...data, id: userSnap.id });
              setWorkoutName(data.name);
              return;
            }
          }
        } else {
          // Create new workout
          setWorkout({
            id: Date.now().toString(),
            name: "Neues Training",
            duration: 0,
            exercises: [],
          });
          setWorkoutName("Neues Training");
        }
      } catch (e) {
        console.error("Fehler beim Laden:", e);
        Alert.alert("Fehler", "Workout konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Handle returning from AddExerciseToWorkoutScreen with selected exercise
  useEffect(() => {
    if (selectedExerciseId && workout) {
      const newWorkoutExercise: WorkoutExercise = {
        id: selectedExerciseId,
        breakTime: parseInt(selectedBreakTime || "30") || 30,
        sets: [{ reps: 10, weight: 0, isDone: false }],
      };

      setWorkout((prev) => ({
        ...prev!,
        exercises: [...(prev?.exercises || []), newWorkoutExercise],
      }));

      // Clear params to prevent duplicate additions
      router.setParams({
        selectedExerciseId: undefined,
        breakTime: undefined,
      });
    }
  }, [selectedExerciseId]);

  // Save/Update Workout
  const handleSaveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert("Fehler", "Geben Sie einen Namen für das Training ein");
      return;
    }

    if (!workout) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Fehler", "Sie müssen angemeldet sein");
        return;
      }

      const workoutData = {
        name: workoutName,
        duration: workout.duration || 0,
        exercises: workout.exercises || [],
      };

      if (id && id !== workout.id) {
        // Update existing workout
        const userRef = doc(db, "users", user.uid, "workouts", id);
        await updateDoc(userRef, workoutData);
        Alert.alert("Erfolg", "Training aktualisiert");
      } else {
        // Create new workout
        const newId = Date.now().toString();
        const userRef = doc(db, "users", user.uid, "workouts", newId);
        await setDoc(userRef, workoutData);
        Alert.alert("Erfolg", "Training erstellt");
      }

      router.back();
    } catch (e) {
      console.error("Fehler beim Speichern:", e);
      Alert.alert("Fehler", "Training konnte nicht gespeichert werden");
    } finally {
      setLoading(false);
    }
  };

  // Remove exercise
  const handleRemoveExercise = (index: number) => {
    setWorkout((prev) => ({
      ...prev!,
      exercises: prev!.exercises.filter((_, i) => i !== index),
    }));
  };

  // Update set for exercise
  const handleUpdateSet = (exerciseIndex: number, setIndex: number, key: 'reps' | 'weight', value: string) => {
    if (!workout) return;
    const updatedExercises = [...workout.exercises];
    const numValue = parseInt(value) || 0;
    updatedExercises[exerciseIndex].sets[setIndex][key] = numValue;
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  // Remove set from exercise
  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    if (!workout) return;
    const updatedExercises = [...workout.exercises];
    updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  // Add set to exercise
  const handleAddSet = (exerciseIndex: number) => {
    if (!workout) return;
    const updatedExercises = [...workout.exercises];
    updatedExercises[exerciseIndex].sets.push({ reps: 10, weight: 0, isDone: false });
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  // Update break time for exercise
  const handleUpdateBreakTime = (exerciseIndex: number, value: string) => {
    if (!workout) return;
    const updatedExercises = [...workout.exercises];
    updatedExercises[exerciseIndex].breakTime = parseInt(value) || 30;
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  if (!workout) {
    return (
      <View style={workoutStyles.container}>
        <LoadingOverlay visible={loading} />
      </View>
    );
  }

  return (
    <View style={workoutStyles.container}>
      <TopBar
        leftButtonText="Zurück"
        titleText={id ? "Training bearbeiten" : "Training erstellen"}
        rightButtonText="Speichern"
        onLeftPress={() => router.back()}
        onRightPress={handleSaveWorkout}
      />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Workout Name */}
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 8 }}>
          Training Name
        </Text>
        <TextInput
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="z.B. Push Day"
          placeholderTextColor="#666"
          style={{
            backgroundColor: "#222",
            color: "#fff",
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 16,
          }}
        />

        {/* Exercises Section */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            Übungen ({workout.exercises.length})
          </Text>

          {workout.exercises && workout.exercises.length > 0 ? (
            <FlatList
              data={workout.exercises}
              scrollEnabled={false}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item: exercise, index: exerciseIndex }) => (
                <View
                  key={exerciseIndex}
                  style={{
                    backgroundColor: "#222",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "600",
                        fontSize: 16,
                      }}
                    >
                      Übung: {exercise.id}
                    </Text>
                    <Pressable
                      onPress={() => handleRemoveExercise(exerciseIndex)}
                      style={{ padding: 8 }}
                    >
                      <Ionicons name="trash" size={20} color="#ff6b6b" />
                    </Pressable>
                  </View>

                  {/* Break Time Input */}
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: "#aaa", fontSize: 14, marginBottom: 4 }}>
                      Pausenzeit (Sekunden)
                    </Text>
                    <TextInput
                      value={exercise.breakTime.toString()}
                      onChangeText={(val) => handleUpdateBreakTime(exerciseIndex, val)}
                      keyboardType="numeric"
                      style={{
                        backgroundColor: "#111",
                        color: "#fff",
                        padding: 8,
                        borderRadius: 4,
                      }}
                    />
                  </View>

                  {/* Sets */}
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: "#aaa", fontSize: 14, marginBottom: 8 }}>
                      Sätze ({exercise.sets.length})
                    </Text>
                    {exercise.sets.map((set, setIndex) => (
                      <View
                        key={setIndex}
                        style={{
                          backgroundColor: "#111",
                          padding: 10,
                          borderRadius: 6,
                          marginBottom: 8,
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <View style={{ flexDirection: "row", gap: 8, flex: 1 }}>
                          <View>
                            <Text style={{ color: "#aaa", fontSize: 12 }}>Reps</Text>
                            <TextInput
                              value={set.reps.toString()}
                              onChangeText={(val) => handleUpdateSet(exerciseIndex, setIndex, 'reps', val)}
                              keyboardType="numeric"
                              style={{
                                backgroundColor: "#000",
                                color: "#fff",
                                width: 60,
                                padding: 6,
                                borderRadius: 4,
                                marginTop: 4,
                              }}
                            />
                          </View>
                          <View>
                            <Text style={{ color: "#aaa", fontSize: 12 }}>Weight (kg)</Text>
                            <TextInput
                              value={set.weight.toString()}
                              onChangeText={(val) => handleUpdateSet(exerciseIndex, setIndex, 'weight', val)}
                              keyboardType="numeric"
                              style={{
                                backgroundColor: "#000",
                                color: "#fff",
                                width: 60,
                                padding: 6,
                                borderRadius: 4,
                                marginTop: 4,
                              }}
                            />
                          </View>
                        </View>
                        <Pressable
                          onPress={() => handleRemoveSet(exerciseIndex, setIndex)}
                          style={{ padding: 8 }}
                        >
                          <Ionicons name="trash" size={16} color="#ff6b6b" />
                        </Pressable>
                      </View>
                    ))}
                    <Pressable
                      onPress={() => handleAddSet(exerciseIndex)}
                      style={{
                        backgroundColor: "#333",
                        padding: 8,
                        borderRadius: 4,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 12 }}>+ Satz hinzufügen</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text
              style={{ color: "#666", textAlign: "center", marginBottom: 16 }}
            >
              Noch keine Übungen hinzugefügt
            </Text>
          )}

          {/* Add Exercise Button */}
          <Pressable
            onPress={() => router.push({
              pathname: "/screens/exercise/AddExerciseToWorkoutScreen",
              params: { workoutEditId: id }
            })}
            style={{
              backgroundColor: "#333",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              + Übung hinzufügen
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <LoadingOverlay visible={loading} />
    </View>
  );
}
