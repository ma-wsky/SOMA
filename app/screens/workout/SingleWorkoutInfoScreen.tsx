import { TopBar } from "@/app/components/TopBar";
import { workoutStyles } from "@/app/styles/workoutStyles";
import { View, Text, FlatList, TextInput, Pressable, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { doc, getDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { auth, db } from "@/app/firebaseConfig";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import Ionicons from "@expo/vector-icons/Ionicons";
import { showAlert, showConfirm } from "@/app/utils/alertHelper";

type Exercise = {
  id: string;
  name: string;
  muscleGroup?: string;
  equipment?: string;
  instructions?: string;
};

type ExerciseSet = {
  id?: string;
  name?: string;
  exerciseName?: string;
  exerciseId: string;
  breaktime?: number;
  weight: number;
  reps: number;
  isDone?: boolean;
};

type Workout = {
  id?: string;
  name?: string | null;
  date: string;
  duration?: number;
  exerciseSets: ExerciseSet[];
};

export default function SingleWorkoutInfoScreen() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { id, workoutEditId, selectedExerciseId, selectedExerciseName, selectedBreakTime } = useLocalSearchParams<{ 
    id?: string;
    workoutEditId?: string;
    selectedExerciseId?: string;
    selectedExerciseName?: string;
    selectedBreakTime?: string;
  }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercisesMap, setExercisesMap] = useState<Map<string, Exercise>>(new Map());
  const editIdRef = useRef<string | null>(null);
  const isCreateMode = !id && !!workoutEditId;

  // Initialize edit key synchronously
  if (!editIdRef.current) {
    editIdRef.current = workoutEditId || (id ? `workout_${id}` : null);
  }
  
  // In create mode, start in edit mode immediately
  useEffect(() => {
    if (isCreateMode && !isEditMode) {
      setIsEditMode(true);
    }
  }, [isCreateMode]);

  useEffect(() => {
    if (!id && !isCreateMode) return;
    setLoading(true);

    const fetchWorkout = async () => {
      try {
        // Load exercises first
        const exercisesMap = new Map<string, Exercise>();
        const exercisesSnapshot = await getDocs(collection(db, "exercises"));
        exercisesSnapshot.forEach((doc) => {
          exercisesMap.set(doc.id, { id: doc.id, ...doc.data() } as Exercise);
        });
        setExercisesMap(exercisesMap);

        // If creating new workout, initialize empty
        if (!id) {
          const draft = editIdRef.current ? require("@/app/utils/workoutEditingStore").getEditingWorkout(editIdRef.current) : null;
          if (draft) {
            setWorkout(draft);
          } else {
            setWorkout({
              date: new Date().toISOString(),
              exerciseSets: [],
            } as Workout);
          }
          setLoading(false);
          return;
        }

        const user = auth.currentUser;
        if (!user) {
          setWorkout(null);
          return;
        }

        const userRef = doc(db, "users", user.uid, "workouts", id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          // Load exercise sets from subcollection
          const setsSnapshot = await getDocs(collection(userRef, "exerciseSets"));
          const sets: ExerciseSet[] = [];
          setsSnapshot.forEach((doc) => {
            const data = doc.data();
            const exercise = exercisesMap.get(data.exerciseId);
            sets.push({
              id: doc.id,
              exerciseId: data.exerciseId,
              exerciseName: data.exerciseName || exercise?.name,
              name: data.name || undefined,
              breaktime: data.breaktime ?? 30,
              weight: data.weight,
              reps: data.reps,
              isDone: data.isDone || false,
            } as ExerciseSet);
          });

          setWorkout({
            id: userSnap.id,
            name: userSnap.data().name || null,
            date: userSnap.data().date,
            exerciseSets: sets,
          });
          return;
        }

        setWorkout(null);
      } catch (e) {
        console.error("Fehler beim Laden des Workouts:", e);
        setWorkout(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [id, isCreateMode]);

  // Persist draft when workout changes (edit mode)
  useEffect(() => {
    if (isEditMode && editIdRef.current && workout) {
      require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, workout);
    }
  }, [workout, isEditMode]);

  const handleAddSet = (exerciseId: string, exerciseName?: string, breaktime?: number) => {
    const newSetBase: ExerciseSet = {
      id: `set_${Date.now()}`,
      exerciseId,
      exerciseName: exerciseName || exercisesMap.get(exerciseId)?.name,
      name: `${exerciseName || exercisesMap.get(exerciseId)?.name}Set`,
      breaktime: breaktime ?? 30,
      weight: 20,
      reps: 5,
      isDone: false,
    };

    setWorkout((prev) => {
      const base = prev ?? ({ date: new Date().toISOString(), exerciseSets: [] } as Workout);
      const count = base.exerciseSets.filter((s) => s.exerciseId === exerciseId).length;
      const newSet = { ...newSetBase, name: `${newSetBase.exerciseName}Set${count + 1}` } as ExerciseSet;
      const newW = { ...base, exerciseSets: [...(base.exerciseSets || []), newSet] } as Workout;
      if (editIdRef.current) require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
      return newW;
    });
  };

  const handleRemoveSet = (index: number) => {
    setWorkout((prev) => {
      const newW = { ...prev!, exerciseSets: prev!.exerciseSets.filter((_, i) => i !== index) };
      if (editIdRef.current) require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
      return newW;
    });
  };

  const handleUpdateSet = (index: number, key: "weight" | "reps", value: string) => {
    if (!workout) return;
    const updatedSets = [...workout.exerciseSets];
    const numValue = parseInt(value) || 0;
    updatedSets[index][key] = numValue;
    const newW = { ...workout, exerciseSets: updatedSets };
    if (editIdRef.current) require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
    setWorkout(newW);
  };

  const handleSaveWorkout = async () => {
    if (!workout) return;

    if (!workout.name || workout.exerciseSets.length === 0) {
      showAlert("Fehler", "Bitte geben Sie einen Namen ein und fügen Sie mindestens einen Satz hinzu");
      return;
    }

    showConfirm("Training speichern", isCreateMode ? "Möchten Sie dieses Training speichern?" : "Möchten Sie die Änderungen speichern?", async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          showAlert("Fehler", "Sie müssen angemeldet sein");
          return;
        }

        const workoutId = id || Date.now().toString();
        const workoutRef = doc(db, "users", user.uid, "workouts", workoutId);

        const workoutData = {
          date: workout.date,
          name: workout.name || null,
        };

        const batch = writeBatch(db);
        batch.set(workoutRef, workoutData);

        const setsRef = collection(workoutRef, "exerciseSets");
        const existingSets = await getDocs(setsRef);
        existingSets.forEach((doc) => {
          batch.delete(doc.ref);
        });

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

        if (editIdRef.current) require("@/app/utils/workoutEditingStore").clearEditingWorkout(editIdRef.current);

        showAlert("Erfolg", isCreateMode ? "Training erstellt" : "Training aktualisiert");
        router.push("../..//(tabs)/WorkoutScreenProxy");
      } catch (e) {
        console.error("Fehler beim Speichern:", e);
        showAlert("Fehler", "Training konnte nicht gespeichert werden");
      } finally {
        setLoading(false);
      }
    }, { confirmText: "Speichern", cancelText: "Abbrechen" });
  };

  // Handle returning from AddExerciseToWorkoutScreen with selected exercise(s)
  useEffect(() => {
    if (selectedExerciseId) {
      handleAddSet(selectedExerciseId, selectedExerciseName, Number(selectedBreakTime));
      router.setParams({
        selectedExerciseId: undefined,
        selectedExerciseName: undefined,
        selectedBreakTime: undefined,
      });
      return;
    }
  }, [selectedExerciseId]);

  if (!workout) {
    return (
      <View style={workoutStyles.itemContainer}>
        <TopBar
          leftButtonText={"Zurück"}
          titleText={"Training Info"}
          onLeftPress={() => router.push("../..//(tabs)/WorkoutScreenProxy")}
        />
        <Text>Workout nicht gefunden</Text>
        <LoadingOverlay visible={loading} />
      </View>
    );
  }

  const canSave = isEditMode && !!workout?.name && (workout.exerciseSets?.length ?? 0) > 0;

  return (
    <View style={workoutStyles.itemContainer}>
      <TopBar
        leftButtonText={isEditMode ? "Abbrechen" : "Zurück"}
        titleText={isEditMode ? "Training bearbeiten" : "Training Info"}
        rightButtonText={isEditMode ? (canSave ? "Speichern" : undefined) : "Bearbeiten"}
        onLeftPress={() => (isEditMode ? setIsEditMode(false) : router.push("../..//(tabs)/WorkoutScreenProxy"))}
        onRightPress={() => (isEditMode ? (canSave ? handleSaveWorkout : undefined) : () => setIsEditMode(true))}
      />

      {isEditMode ? (
        // EDIT MODE: Full edit UI
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {/* Name field */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "#fff", marginBottom: 6 }}>Name des Trainings</Text>
            <TextInput
              value={workout.name || ""}
              onChangeText={(t) => setWorkout((prev) => ({ ...(prev ?? { date: new Date().toISOString(), exerciseSets: [] }), name: t }))}
              placeholder="z. B. Oberkörper-Programm"
              placeholderTextColor="#666"
              style={{ backgroundColor: "#111", color: "#fff", padding: 10, borderRadius: 8 }}
            />
          </View>

          {/* Workout Date */}
          <Text style={{ color: "#fff", fontSize: 16, marginBottom: 8 }}>Datum</Text>
          <Text style={{ color: "#aaa", fontSize: 14, marginBottom: 20 }}>
            {new Date(workout.date).toLocaleDateString("de-DE")}
          </Text>

          {/* Exercise Sets Section */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
              Sätze ({workout.exerciseSets.length})
            </Text>

            {workout.exerciseSets && workout.exerciseSets.length > 0 ? (
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
                      <Text style={{ color: "#fff" }}>+ Satz hinzufügen</Text>
                    </Pressable>
                  </View>

                  {sets.map((set, idx) => {
                    const index = workout.exerciseSets.indexOf(set);
                    return (
                      <View key={idx} style={{ backgroundColor: "#222", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>{set.name || `Satz ${idx + 1}`}</Text>
                          <Pressable onPress={() => handleRemoveSet(index)} style={{ padding: 8 }}>
                            <Ionicons name="trash" size={20} color="#ff6b6b" />
                          </Pressable>
                        </View>

                        <View style={{ flexDirection: "row", gap: 12 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: "#aaa", fontSize: 12, marginBottom: 4 }}>Wiederholungen</Text>
                            <TextInput
                              value={set.reps.toString()}
                              onChangeText={(val) => handleUpdateSet(index, "reps", val)}
                              keyboardType="numeric"
                              style={{ backgroundColor: "#111", color: "#fff", padding: 8, borderRadius: 4 }}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: "#aaa", fontSize: 12, marginBottom: 4 }}>Gewicht (kg)</Text>
                            <TextInput
                              value={set.weight.toString()}
                              onChangeText={(val) => handleUpdateSet(index, "weight", val)}
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
              onPress={() =>
                router.push({
                  pathname: "/screens/exercise/AddExerciseToWorkoutScreen",
                  params: { workoutEditId: editIdRef.current, returnTo: "edit" },
                })
              }
              style={{ backgroundColor: "#333", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 12 }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>+ Übung hinzufügen</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        // VIEW MODE: Read-only list
        <FlatList
          data={workout.exerciseSets}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item: set }) => (
            <View style={{ backgroundColor: "#222", borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
                {set.exerciseName || set.exerciseId}
              </Text>
              <Text style={{ fontSize: 14, color: "#aaa", marginTop: 8 }}>
                {set.reps} Wiederholungen @ {set.weight}kg
              </Text>
              {set.isDone && (
                <Text style={{ fontSize: 12, color: "#4CAF50", marginTop: 4 }}>✓ Abgeschlossen</Text>
              )}
            </View>
          )}
        />
      )}

      <LoadingOverlay visible={loading} />
    </View>
  );
}
