import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
  StyleSheet,
} from "react-native";
import { showAlert, showConfirm } from "@/app/utils/alertHelper";
import { setActiveWorkout, clearActiveWorkout } from "@/app/utils/activeWorkoutStore";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { auth, db } from "@/app/firebaseConfig";
import { workoutStyles } from "@/app/styles/workoutStyles";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TopBar } from "@/app/components/TopBar";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from "react-native-gesture-handler";

// New Firebase structure
type ExerciseSet = {
  id?: string;
  exerciseId: string;
  exerciseName?: string;
  name?: string;
  breaktime?: number;
  weight: number;
  reps: number;
  isDone?: boolean;
};

type Workout = {
  id?: string;
  date: string;
  name?: string;
  exerciseSets: ExerciseSet[];
  startTime?: number;
};

type Exercise = {
  id: string;
  name: string;
  muscleGroup?: string;
};

export default function ActiveWorkoutScreen() {
  const { id, selectedExerciseId, selectedExerciseName, workoutEditId, selectedBreakTime } = useLocalSearchParams<{ id?: string; selectedExerciseId?: string; selectedExerciseName?: string; workoutEditId?: string; selectedBreakTime?: string }>();
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const editIdRef = useRef<string | null>(null);  const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());
  const [isEditMode, setIsEditMode] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Lade Workout beim Start
  useEffect(() => {
    const loadWorkout = async () => {
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
          // Wenn ID vorhanden, lade gespeichertes Workout
          editIdRef.current = workoutEditId || `workout_${id}`;

          const userRef = doc(db, "users", user.uid, "workouts", id);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const workoutData = userSnap.data() as Omit<Workout, 'id' | 'exerciseSets'>;
            
            // Load exercise sets from subcollection
            const setsSnapshot = await getDocs(collection(userRef, "exerciseSets"));
            const exerciseSets: ExerciseSet[] = [];
            setsSnapshot.forEach((setDoc) => {
              const setData = setDoc.data();
              exerciseSets.push({
                id: setDoc.id,
                exerciseId: setData.exerciseId,
                exerciseName: setData.exerciseName || exercisesMap.get(setData.exerciseId)?.name,
                name: setData.name || undefined,
                weight: setData.weight,
                reps: setData.reps,
                isDone: setData.isDone || false,
                // prefer stored breaktime, fallback to default 30
                breaktime: setData.breaktime ?? 30,
              });
            });

            const draft = require("@/app/utils/workoutEditingStore").getEditingWorkout(editIdRef.current!);
            if (draft) {
              setWorkout(draft);
            } else {
              setWorkout({ 
                id: userSnap.id, 
                ...workoutData, 
                exerciseSets,
                startTime: Date.now()
              });
            }
            return;
          }
        } else {
          // Leeres Workout (freies Training)
          editIdRef.current = workoutEditId || `temp_${Date.now()}`;

          const draft = require("@/app/utils/workoutEditingStore").getEditingWorkout(editIdRef.current);
          if (draft) {
            setWorkout(draft as Workout);
          } else {
            setWorkout({
              date: new Date().toISOString(),
              exerciseSets: [],
              startTime: Date.now(),
            });
          }
        }
      } catch (e) {
        console.error("Fehler beim Laden des Workouts:", e);
        showAlert("Fehler", "Workout konnte nicht geladen werden");
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

  // Handle Set Checkbox - toggle isDone for a specific set
  const handleSetCheck = (setIndex: number) => {
    if (!workout) return;

    const updatedSets = [...workout.exerciseSets];
    updatedSets[setIndex].isDone = !updatedSets[setIndex].isDone;

    setWorkout({
      ...workout,
      exerciseSets: updatedSets,
    });
  };

  // Add a set for a given exercise in active workout
  const handleAddSet = (exerciseId: string, exerciseName?: string, breaktime?: number) => {
      if (!workout) return;
    const existingCount = workout.exerciseSets.filter(s => s.exerciseId === exerciseId).length;
    const newSet: ExerciseSet = {
      id: `set_${Date.now()}`,
      exerciseId,
      exerciseName: exerciseName || exercises.get(exerciseId)?.name,
      name: `${exerciseName || exercises.get(exerciseId)?.name}Set${existingCount + 1}`,
      breaktime: breaktime ?? 30,
      weight: 20,
      reps: 5,
      isDone: false,
    };
    const newW = { ...workout, exerciseSets: [...(workout?.exerciseSets || []), newSet] };
    setWorkout(newW);
    if (editIdRef.current) require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
  }; 

  // Discard Workout
  const handleDiscardWorkout = () => {
    showConfirm("Training verwerfen", "Möchten Sie dieses Training wirklich verwerfen?", () => {
      clearActiveWorkout();
      if (editIdRef.current) require("@/app/utils/workoutEditingStore").clearEditingWorkout(editIdRef.current);
      router.back();
    }, { confirmText: "Verwerfen", cancelText: "Abbrechen" });
  };

  // Finish Workout (speichern)
  const handleFinishWorkout = async () => {
    showConfirm("Training beenden", "Möchten Sie dieses Training speichern?", async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user || !workout) return;

        // Ensure we have an id (generate for new workouts)
        const workoutId = workout.id || Date.now().toString();
        const workoutRef = doc(db, "users", user.uid, "workouts", workoutId);

        // Use batch write to atomically replace sets and set main doc
        const batch = writeBatch(db);
        batch.set(workoutRef, {
          date: workout.date,
          name: workout.name || null,
        });

        const setsRef = collection(workoutRef, "exerciseSets");
        // Delete existing sets if any
        const existingSets = await getDocs(setsRef);
        existingSets.forEach((d) => batch.delete(d.ref));

        // Add current sets
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

        showAlert("Erfolg", "Training gespeichert");
        clearActiveWorkout();
        if (editIdRef.current) require("@/app/utils/workoutEditingStore").clearEditingWorkout(editIdRef.current);
        router.back();
      } catch (e) {
        console.error("Fehler beim Speichern:", e);
        showAlert("Fehler", "Training konnte nicht gespeichert werden");
      } finally {
        setLoading(false);
      }
    }, { confirmText: "Speichern", cancelText: "Abbrechen" });
  };

  // Remove a set
  const handleRemoveSet = (index: number) => {
    const newW = { ...workout!, exerciseSets: workout!.exerciseSets.filter((_, i) => i !== index) };
    setWorkout(newW);
    if (editIdRef.current) require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
  };

  // Persist draft when workout changes
  useEffect(() => {
    if (editIdRef.current && workout) {
      require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, workout);
    }
  }, [workout]);

  // Handle exercise returned from AddExercise (single-select)
  useEffect(() => {
    if (selectedExerciseId) {
      handleAddSet(selectedExerciseId, selectedExerciseName, Number(selectedBreakTime));
      // clear params to avoid duplicates
      router.setParams({ selectedExerciseId: undefined, selectedExerciseName: undefined, selectedBreakTime: undefined });
    }
  }, [selectedExerciseId, selectedExerciseName, selectedBreakTime]);
  // Update a set value
  const handleUpdateSet = (index: number, key: 'weight' | 'reps', value: string) => {
    if (!workout) return;
    const updatedSets = [...workout.exerciseSets];
    const numValue = parseInt(value) || 0;
    updatedSets[index][key] = numValue;
    const newW = { ...workout, exerciseSets: updatedSets };
    setWorkout(newW);
    if (editIdRef.current) require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
  };

  // Edit mode - save changes (persist full sets)
  const handleSaveChanges = async () => {
    if (!workout) return;
    if (!workout.name || workout.exerciseSets.length === 0) {
      showAlert("Fehler", "Bitte geben Sie einen Namen ein und fügen Sie mindestens einen Satz hinzu");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const workoutId = workout.id || Date.now().toString();
      const workoutRef = doc(db, "users", user.uid, "workouts", workoutId);

      const batch = writeBatch(db);
      batch.set(workoutRef, { date: workout.date, name: workout.name || null });

      const setsRef = collection(workoutRef, "exerciseSets");
      const existingSets = await getDocs(setsRef);
      existingSets.forEach((d) => batch.delete(d.ref));

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

      setIsEditMode(false);
      showAlert("Erfolg", "Änderungen gespeichert");

      // Clear draft
      if (editIdRef.current) require("@/app/utils/workoutEditingStore").clearEditingWorkout(editIdRef.current);
    } catch (e) {
      console.error("Fehler beim Speichern:", e);
      showAlert("Fehler", "Änderungen konnten nicht gespeichert werden");
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

  const snapPoints = ['98%'];

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const handlesSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
    if (index !== 1) {
      setIsMinimized(true);
      try {
        // keep the home overlay for UI
        router.push({
          pathname: '/(tabs)/HomeScreenProxy',
          params: {
            activeOverlayWorkout: JSON.stringify({ id: workout?.id ?? null, setsCount: workout?.exerciseSets.length ?? 0, startTime: workout?.startTime ?? Date.now() })
          }
        });
      } catch (e) {
        console.warn('Navigation to home failed', e);
      }

      // Store active workout in-memory so Workout tab can detect and open it
      setActiveWorkout({ id: workout?.id ?? null, startTime: workout?.startTime ?? Date.now(), setsCount: workout?.exerciseSets.length ?? 0 });
    } else {
      setIsMinimized(false);
      /*try {
        router.replace({ pathname: '/(tabs)/HomeScreenProxy' });
      } catch (e) {
        console.warn('Failed to clear home overlay param', e);
      }*/
      clearActiveWorkout();
    }
  }, [workout]);

  if (!workout) {
    return (
      <GestureHandlerRootView style={styles.sheetContainer}>
      <BottomSheet index={1} snapPoints={snapPoints} ref={bottomSheetRef} onChange={handlesSheetChanges} enablePanDownToClose={true}>
      <BottomSheetView style={styles.sheetContainerContent}>
        <Text>Workout wird geladen...</Text>
        <LoadingOverlay visible={loading} />
      </BottomSheetView>
      </BottomSheet>
      </GestureHandlerRootView>
    );
  }

  const canSaveActive = isEditMode && !!workout?.name && (workout.exerciseSets?.length ?? 0) > 0;

  return (
    <GestureHandlerRootView style={styles.sheetContainer}>
      <BottomSheet index={1} snapPoints={snapPoints} ref={bottomSheetRef} onChange={handlesSheetChanges} enablePanDownToClose={true}>
      <BottomSheetView style={styles.sheetContainerContent}>
      <TopBar
        leftButtonText={isEditMode ? "Abbrechen" : "Verwerfen"}
        titleText={isEditMode ? "Training bearbeiten" : "Aktives Training"}
        rightButtonText={isEditMode ? "Speichern" : "Fertig"}
        onLeftPress={isEditMode ? () => setIsEditMode(false) : handleDiscardWorkout}
        onRightPress={isEditMode ? handleSaveChanges : handleFinishWorkout}
      />

      {/* Name (editable in edit mode) */}
      {isEditMode ? (
        <View style={{ paddingHorizontal: 20, width: '100%', marginTop: 8 }}>
          <TextInput
            value={workout.name || ''}
            onChangeText={(t) => {
              const newW = { ...(workout ?? { date: new Date().toISOString(), exerciseSets: [] }), name: t } as Workout;
              setWorkout(newW);
              if (editIdRef.current) require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
            }}
            placeholder="Name des Trainings"
            placeholderTextColor="#666"
            style={{ backgroundColor: '#111', color: '#fff', padding: 8, borderRadius: 8 }}
          />
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, width: '100%', marginTop: 8 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{workout.name || 'Aktives Training'}</Text>
        </View>
      )}

      {/* Name (editable in edit mode) */}
      {isEditMode ? (
        <View style={{ paddingHorizontal: 20, width: '100%', marginTop: 8 }}>
          <TextInput
            value={workout.name || ''}
            onChangeText={(t) => setWorkout(prev => ({ ...(prev ?? { date: new Date().toISOString(), exerciseSets: [] }), name: t }))}
            placeholder="Name des Trainings"
            placeholderTextColor="#666"
            style={{ backgroundColor: '#111', color: '#fff', padding: 8, borderRadius: 8 }}
          />
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, width: '100%', marginTop: 8 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{workout.name || 'Aktives Training'}</Text>
        </View>
      )}

      {/* Timer */}
      <View style={styles.timerSection}>
        <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
      </View>

      {/* Exercise Sets List */}
      {workout.exerciseSets.length > 0 ? (
        isEditMode ? (
          // Group sets by exercise with edit controls (scrollable)
          <ScrollView style={{ maxHeight: 420, width: '100%' }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
            {Array.from(
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
            ))}

            {/* Add Exercise Button (edit mode) */}
            <View style={{ marginTop: 12 }}>
              <Pressable
                onPress={() => router.push({ pathname: "/screens/exercise/AddExerciseToWorkoutScreen", params: { workoutEditId: editIdRef.current, returnTo: 'active' } })}
                style={({ pressed }) => [
                  { backgroundColor: pressed ? '#444' : '#333', padding: 12, borderRadius: 8, alignItems: 'center' }
                ]}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Übung hinzufügen</Text>
              </Pressable>
            </View>
          </ScrollView>
        ) : (
          // non-edit simple list
          <FlatList
            data={workout.exerciseSets}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            renderItem={({ item: set, index: setIndex }) => (
              <Pressable
                key={setIndex}
                onPress={() => !isEditMode && handleSetCheck(setIndex)}
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
                  <Text style={styles.exerciseName}>
                    {set.exerciseName || set.exerciseId}
                  </Text>
                  <Text
                    style={[
                      styles.setText,
                      set.isDone && styles.setTextDone,
                    ]}
                  >
                    {set.reps} Wiederholungen @ {set.weight}kg
                  </Text>
                </View>
              </Pressable>
            )}
          />
        )
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 40 }}>
          <Text style={{ color: "#aaa", textAlign: "center", fontSize: 16 }}>
            Freies Training - Keine vordefinierten Übungen
          </Text>
        </ScrollView>
      )}

        {/* Add set button: show after last set of each exercise */}
        {workout.exerciseSets.map((set, i) => {
          const next = workout.exerciseSets[i+1];
          if (!next || next.exerciseId !== set.exerciseId) {
            return (
              <Pressable key={`add-${i}`} onPress={() => handleAddSet(set.exerciseId, set.exerciseName)} style={{ marginHorizontal: 16, marginBottom: 12, padding: 10, backgroundColor: '#2b2b2b', borderRadius: 8 }}>
                <Text style={{ color: '#fff' }}>+ Satz hinzufügen für {set.exerciseName || set.exerciseId}</Text>
              </Pressable>
            );
          }
          return null;
        })}

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
    </BottomSheetView>
      </BottomSheet>

      {/* Minimized overlay (shows above menubar) */}
      {isMinimized && (
        <Pressable
          onPress={() => (bottomSheetRef.current as any)?.snapToIndex?.(0)}
          style={{
            position: 'absolute',
            left: 20,
            right: 20,
            bottom: 60,
            backgroundColor: '#222',
            padding: 12,
            borderRadius: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#333'
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>{workout.exerciseSets.length} Sätze</Text>
          <Text style={{ color: '#aaa' }}>{formatTime(elapsedTime)}</Text>
        </Pressable>
      )}

      </GestureHandlerRootView>
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
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
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
  sheetContainer: {
    flex: 1,
    backgroundColor: 'grey',
  },
  sheetContainerContent: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
});
