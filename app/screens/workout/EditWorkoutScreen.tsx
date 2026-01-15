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
import { showAlert, showConfirm } from "@/app/utils/alertHelper";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { auth, db } from "@/app/firebaseConfig";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import Ionicons from "@expo/vector-icons/Ionicons";

type Workout = {
    id?: string;
    name?: string | null;
    date: string;
    duration?: number;
    exerciseSets: ExerciseSet[];
};

type ExerciseSet = {
  id?: string;
  name?: string;
  exerciseName?: string;
  exerciseId: string;
  breaktime?: number;
  weight: number;
  reps: number;
  isDone: boolean;
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
  const { id, selectedExerciseId, workoutEditId, selectedExerciseName, selectedBreakTime } = useLocalSearchParams<{ 
    id?: string;
    selectedExerciseId?: string;
    workoutEditId?: string;
    selectedExerciseName?: string;
    selectedBreakTime?: string;
  }>();
  const editIdRef = useRef<string | null>(null);
  // Initialize edit key synchronously so drafts persist immediately when adding sets
  if (!editIdRef.current) editIdRef.current = workoutEditId || (id ? `workout_${id}` : `temp_${Date.now()}`);

  // Keep a local workout immediately so adding sets works even before async load finishes
  const [workout, setWorkout] = useState<Workout>({ date: new Date().toISOString(), exerciseSets: [] } as Workout);
  const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());

  // Load Workout on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) return;
      

        // Load all exercises for reference
        const exercisesMap = new Map<string, Exercise>();
        const exercisesSnapshot = await getDocs(collection(db, "exercises"));
        exercisesSnapshot.forEach((doc) => {
          exercisesMap.set(doc.id, { id: doc.id, ...doc.data() } as Exercise);
        });
        setExercises(exercisesMap);

        if (id) {
          editIdRef.current = `workout_${id}`;

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
                exerciseName: setData.exerciseName || exercisesMap.get(setData.exerciseId)?.name,
                name: setData.name || undefined,
                breaktime: setData.breaktime ?? 30,
                weight: setData.weight,
                reps: setData.reps,
                isDone: setData.isDone || false,
              });
            });

                    // See if there is a draft saved in editing store
            const draft = require("@/app/utils/workoutEditingStore").getEditingWorkout(editIdRef.current!);
            if (draft) {
              setWorkout(draft);
            } else {
              // If the user already added sets locally, don't overwrite; otherwise use loaded workout
              setWorkout(prev => {
                if (prev && prev.exerciseSets && prev.exerciseSets.length > 0) {
                  // keep local changes (user-added sets) intact
                  return prev;
                }
                return { id: workoutSnap.id, ...workoutData, exerciseSets } as Workout;
              });
            }
            return;
          }
        }

        // For new workout, pick an edit key (either passed or generated)
        editIdRef.current = workoutEditId || `temp_${Date.now()}`;

        // Restore draft if present
        const draft = require("@/app/utils/workoutEditingStore").getEditingWorkout(editIdRef.current);
        if (draft) {
          setWorkout(draft);
        } else {
          // Create new workout only if there isn't already one in-memory (preserve additions made while loading)
          setWorkout(prev => prev ?? ({
            date: new Date().toISOString(),
            exerciseSets: [],
            startTime: Date.now(),
          } as Workout));
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
    console.log('EditWorkoutScreen useEffect fired:', { selectedExerciseId, selectedExerciseName, selectedBreakTime, exercisesSize: exercises.size });
    const buildNewSet = (baseWorkout: Workout, exerciseId: string, exerciseName?: string, breaktime?: number) => {
      const name = exerciseName || exercises.get(exerciseId)?.name || 'Übung';
      const existingCount = baseWorkout.exerciseSets.filter(s => s.exerciseId === exerciseId).length || 0;
      const newSet: ExerciseSet = {
        id: `set_${Date.now()}`,
        exerciseId,
        exerciseName: name,
        name: `${name}Set${existingCount + 1}`,
        breaktime: breaktime ?? 30,
        weight: 20,
        reps: 5,
        isDone: false,
      };
      return newSet;
    };

    // Single selection (legacy) or returned from AddExercise screen
    if (selectedExerciseId) {
      console.log('Adding new set from selectedExerciseId:', selectedExerciseId);
      // Use the shared add method; ensure it accepts breaktime
      handleAddSet(selectedExerciseId, selectedExerciseName, Number(selectedBreakTime));

      // Clear params to prevent duplicate additions
      router.setParams({
        selectedExerciseId: undefined,
        selectedExerciseName: undefined,
        selectedBreakTime: undefined,
      });
      return;
    }

    
  }, [selectedExerciseId, exercises]);

  // Save/Update Workout
  const handleSaveWorkout = async () => {
    if (!workout) return;

    if (!workout.name || workout.exerciseSets.length === 0) {
      showAlert("Fehler", "Bitte geben Sie einen Namen ein und fügen Sie mindestens einen Satz hinzu");
      return;
    }

    // Confirm before saving
    showConfirm("Training speichern", "Möchten Sie dieses Training speichern?", async () => {
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
            breaktime: set.breaktime ?? 30,
            weight: set.weight,
            reps: set.reps,
            isDone: set.isDone || false,
          });
        });

        await batch.commit();
        
        // Clear draft
        if (editIdRef.current) require("@/app/utils/workoutEditingStore").clearEditingWorkout(editIdRef.current);

        showAlert("Erfolg", id ? "Training aktualisiert" : "Training erstellt");
        router.back();
      } catch (e) {
        console.error("Fehler beim Speichern:", e);
        showAlert("Fehler", "Training konnte nicht gespeichert werden");
      } finally {
        setLoading(false);
      }
    }, { confirmText: "Speichern", cancelText: "Abbrechen" });
  };

  // Remove exercise set
  const handleRemoveSet = (index: number) => {
    setWorkout((prev) => {
      const newW = { ...prev!, exerciseSets: prev!.exerciseSets.filter((_, i) => i !== index) };
      if (editIdRef.current) require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
      return newW;
    });
  };

  // Persist draft when workout changes
  useEffect(() => {
    if (editIdRef.current && workout) {
      require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, workout);
    }
  }, [workout]);
  // Update set
  const handleUpdateSet = (index: number, key: 'weight' | 'reps', value: string) => {
    if (!workout) return;
    const updatedSets = [...workout.exerciseSets];
    const numValue = parseInt(value) || 0;
    updatedSets[index][key] = numValue;
    const newW = { ...workout, exerciseSets: updatedSets };
    if (editIdRef.current) require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
    setWorkout(newW);
  };

  // Add a set for a given exercise
  const handleAddSet = (exerciseId: string, exerciseName?: string, breaktime?: number) => {
    const newSetBase: ExerciseSet = {
      id: `set_${Date.now()}`,
      exerciseId,
      exerciseName: exerciseName || exercises.get(exerciseId)?.name,
      name: `${exerciseName || exercises.get(exerciseId)?.name}Set`,
      breaktime: breaktime ?? 30,
      weight: 20,
      reps: 5,
      isDone: false,
    };

    // Use functional update to avoid races and ensure append semantics
    setWorkout((prev) => {
      const base = prev ?? ({ date: new Date().toISOString(), exerciseSets: [] } as Workout);
      const count = base.exerciseSets.filter(s => s.exerciseId === exerciseId).length;
      const newSet = { ...newSetBase, name: `${newSetBase.exerciseName}Set${count + 1}` } as ExerciseSet;
      const newW = { ...base, exerciseSets: [...(base.exerciseSets || []), newSet] } as Workout;
      if (editIdRef.current) require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
      return newW;
    });
  };

  if (!workout) {
    return (
      <View style={workoutStyles.container}>
        <LoadingOverlay visible={loading} />
      </View>
    );
  }

  const canSave = !!workout?.name && (workout.exerciseSets?.length ?? 0) > 0;

  return (
    <View style={workoutStyles.container}>
      <TopBar
        leftButtonText="Abbrechen"
        titleText={id ? "Training bearbeiten" : "Training erstellen"}
        rightButtonText={canSave ? "Speichern" : undefined}
        onLeftPress={() => router.push("../..//(tabs)/WorkoutScreenProxy")}
        onRightPress={canSave ? handleSaveWorkout : undefined}
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
              params: { workoutEditId: editIdRef.current, returnTo: 'edit' }
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
