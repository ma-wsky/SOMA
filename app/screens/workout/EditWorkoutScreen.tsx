import { TopBar } from "@/app/components/TopBar";
import { workoutStyles } from "@/app/styles/workoutStyles";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
} from "react-native";
import { showAlert } from "@/app/utils/alertHelper";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { auth, db } from "@/app/firebaseConfig";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import Ionicons from "@expo/vector-icons/Ionicons";

// New Firebase structure
type ExerciseSet = {
  id?: string;
  exerciseId: string;
  exerciseName?: string;
  name?: string;
  weight: number;
  reps: number;
  isDone?: boolean;
};

type Workout = {
  id?: string;
  date: string;
  name?: string;
  exerciseSets: ExerciseSet[];
};

type Exercise = {
  id: string;
  name: string;
  muscleGroup?: string;
  equipment?: string;
  instructions?: string;
};

export default function EditWorkoutScreen() {
  const [loading, setLoading] = useState<boolean>(false);
  const { id, selectedExerciseId, selectedExerciseName, selectedExercises } = useLocalSearchParams<{ 
    id?: string;
    selectedExerciseId?: string;
    selectedExerciseName?: string;
    selectedExercises?: string;
  }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());

  // Load Workout on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          showAlert("Fehler", "Sie müssen angemeldet sein");
          return;
        }

        // Load all exercises for reference
        const exercisesMap = new Map<string, Exercise>();
        const exercisesSnapshot = await getDocs(collection(db, "exercises"));
        exercisesSnapshot.forEach((doc) => {
          exercisesMap.set(doc.id, { id: doc.id, ...doc.data() } as Exercise);
        });
        setExercises(exercisesMap);

        if (id) {
          // Load existing workout
          const workoutRef = doc(db, "users", user.uid, "workouts", id);
          const workoutSnap = await getDoc(workoutRef);
          if (workoutSnap.exists()) {
            const workoutData = workoutSnap.data() as Omit<Workout, 'id' | 'exerciseSets'>;
            
            // Load exercise sets from subcollection
            const setsSnapshot = await getDocs(collection(workoutRef, "exerciseSets"));
            const exerciseSets: ExerciseSet[] = [];
            setsSnapshot.forEach((setDoc) => {
              const setData = setDoc.data();
              exerciseSets.push({
                id: setDoc.id,
                exerciseId: setData.exerciseId,
                exerciseName: exercisesMap.get(setData.exerciseId)?.name,
                weight: setData.weight,
                reps: setData.reps,
                isDone: setData.isDone || false,
              });
            });

            setWorkout({ 
              id: workoutSnap.id, 
              ...workoutData, 
              exerciseSets 
            });
            return;
          }
        } else {
          // Create new workout
          setWorkout({
            date: new Date().toISOString(),
            exerciseSets: [],
          });
        }
      } catch (e) {
        console.error("Fehler beim Laden:", e);
        showAlert("Fehler", "Workout konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Handle returning from AddExerciseToWorkoutScreen with selected exercise(s)
  useEffect(() => {
    const buildNewSet = (baseWorkout: Workout, exerciseId: string, exerciseName?: string) => {
      const name = exerciseName || exercises.get(exerciseId)?.name || 'Übung';
      const existingCount = baseWorkout.exerciseSets.filter(s => s.exerciseId === exerciseId).length || 0;
      const newSet: ExerciseSet = {
        exerciseId,
        exerciseName: name,
        name: `${name}Set${existingCount + 1}`,
        weight: 20,
        reps: 5,
        isDone: false,
      };
      return newSet;
    };

    // Single selection (legacy)
    if (selectedExerciseId) {
      setWorkout((prev) => {
        const base = prev ?? { date: new Date().toISOString(), exerciseSets: [] };
        const newSet = buildNewSet(base, selectedExerciseId, selectedExerciseName);
        return { ...base, exerciseSets: [...(base.exerciseSets || []), newSet] };
      });

      // Clear params to prevent duplicate additions
      router.setParams({
        selectedExerciseId: undefined,
        selectedExerciseName: undefined,
      });
      return;
    }

    // Multiple selection
    if (selectedExercises) {
      try {
        const parsed = JSON.parse(selectedExercises) as Array<{ id: string; name: string }>;
        setWorkout((prev) => {
          const base = prev ?? { date: new Date().toISOString(), exerciseSets: [] };
          const newSets: ExerciseSet[] = [];
          parsed.forEach((ex) => {
            newSets.push(buildNewSet(base, ex.id, ex.name));
          });
          return { ...base, exerciseSets: [...(base.exerciseSets || []), ...newSets] };
        });
      } catch (e) {
        console.error('Failed to parse selectedExercises', e);
      }

      router.setParams({ selectedExercises: undefined });
    }
  }, [selectedExerciseId, selectedExerciseName, selectedExercises, exercises]);

  // Save/Update Workout
  const handleSaveWorkout = async () => {
    if (!workout) return;

    if (workout.exerciseSets.length === 0) {
      showAlert("Fehler", "Fügen Sie mindestens einen Satz hinzu");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        showAlert("Fehler", "Sie müssen angemeldet sein");
        return;
      }

      const workoutId = id || Date.now().toString();
      const workoutRef = doc(db, "users", user.uid, "workouts", workoutId);
      
      // Prepare workout data (without exerciseSets, those go in subcollection)
      const workoutData = {
        date: workout.date,
        name: workout.name || null,
      };

      // Use batch write for atomicity
      const batch = writeBatch(db);
      
      // Set main workout document
      batch.set(workoutRef, workoutData);

      // Add/update exercise sets in subcollection
      const setsRef = collection(workoutRef, "exerciseSets");
      
      // Clear existing sets and add new ones
      const existingSets = await getDocs(setsRef);
      existingSets.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Add new sets
      workout.exerciseSets.forEach((set, index) => {
        const setRef = doc(setsRef, `set_${index}`);
        batch.set(setRef, {
          exerciseId: set.exerciseId,
          exerciseName: set.exerciseName || null,
          name: set.name || null,
          weight: set.weight,
          reps: set.reps,
          isDone: set.isDone || false,
        });
      });

      await batch.commit();
      
      showAlert("Erfolg", id ? "Training aktualisiert" : "Training erstellt");
      router.back();
    } catch (e) {
      console.error("Fehler beim Speichern:", e);
      showAlert("Fehler", "Training konnte nicht gespeichert werden");
    } finally {
      setLoading(false);
    }
  };

  // Remove exercise set
  const handleRemoveSet = (index: number) => {
    setWorkout((prev) => ({
      ...prev!,
      exerciseSets: prev!.exerciseSets.filter((_, i) => i !== index),
    }));
  };

  // Update set
  const handleUpdateSet = (index: number, key: 'weight' | 'reps', value: string) => {
    if (!workout) return;
    const updatedSets = [...workout.exerciseSets];
    const numValue = parseInt(value) || 0;
    updatedSets[index][key] = numValue;
    setWorkout({ ...workout, exerciseSets: updatedSets });
  };

  // Add a set for a given exercise
  const handleAddSet = (exerciseId: string, exerciseName?: string) => {
    if (!workout) return;
    const existingCount = workout.exerciseSets.filter(s => s.exerciseId === exerciseId).length;
    const newSet: ExerciseSet = {
      exerciseId,
      exerciseName: exerciseName || exercises.get(exerciseId)?.name,
      name: `${exerciseName || exercises.get(exerciseId)?.name}Set${existingCount + 1}`,
      weight: 20,
      reps: 5,
      isDone: false,
    };
    setWorkout((prev) => ({
      ...prev!,
      exerciseSets: [...(prev?.exerciseSets || []), newSet],
    }));
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

      {/* Name field */}
      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <Text style={{ color: '#fff', marginBottom: 6 }}>Name des Trainings</Text>
        <TextInput
          value={workout.name || ''}
          onChangeText={(t) => setWorkout(prev => ({ ...(prev ?? { date: new Date().toISOString(), exerciseSets: [] }), name: t }))}
          placeholder="z. B. Oberkörper-Programm"
          placeholderTextColor="#666"
          style={{ backgroundColor: '#111', color: '#fff', padding: 10, borderRadius: 8 }}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Workout Date */}
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 8 }}>
          Datum
        </Text>
        <Text style={{ color: "#aaa", fontSize: 14, marginBottom: 20 }}>
          {new Date(workout.date).toLocaleDateString('de-DE')}
        </Text>

        {/* Exercise Sets Section */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            Sätze ({workout.exerciseSets.length})
          </Text>

          {workout.exerciseSets && workout.exerciseSets.length > 0 ? (
          // Group sets by exercise
          Array.from(
            workout.exerciseSets.reduce((map, set) => {
              const arr = map.get(set.exerciseId) || [];
              arr.push(set);
              map.set(set.exerciseId, arr);
              return map;
            }, new Map<string, ExerciseSet[]>())
          ).map(([exerciseId, sets]) => (
            <View key={exerciseId} style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                  {sets[0].exerciseName || exerciseId} ({sets.length})
                </Text>
                <Pressable onPress={() => handleAddSet(exerciseId, sets[0].exerciseName)} style={{ padding: 8 }}>
                  <Text style={{ color: '#fff' }}>+ Satz hinzufügen</Text>
                </Pressable>
              </View>

              {sets.map((set, idx) => {
                const index = workout.exerciseSets.indexOf(set);
                return (
                  <View key={idx} style={{ backgroundColor: "#222", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>{set.name || `Satz ${idx+1}`}</Text>
                      <Pressable onPress={() => handleRemoveSet(index)} style={{ padding: 8 }}>
                        <Ionicons name="trash" size={20} color="#ff6b6b" />
                      </Pressable>
                    </View>

                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#aaa", fontSize: 12, marginBottom: 4 }}>Wiederholungen</Text>
                        <TextInput
                          value={set.reps.toString()}
                          onChangeText={(val) => handleUpdateSet(index, 'reps', val)}
                          keyboardType="numeric"
                          style={{ backgroundColor: "#111", color: "#fff", padding: 8, borderRadius: 4 }}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#aaa", fontSize: 12, marginBottom: 4 }}>Gewicht (kg)</Text>
                        <TextInput
                          value={set.weight.toString()}
                          onChangeText={(val) => handleUpdateSet(index, 'weight', val)}
                          keyboardType="numeric"
                          style={{ backgroundColor: "#111", color: "#fff", padding: 8, borderRadius: 4 }}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        ) : (
          <Text style={{ color: "#666", textAlign: "center", marginBottom: 16 }}>Noch keine Sätze hinzugefügt</Text>
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
