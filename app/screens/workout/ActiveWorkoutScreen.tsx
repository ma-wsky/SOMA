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
  weight: number;
  reps: number;
  isDone?: boolean;
};

type Workout = {
  id?: string;
  date: string;
  exerciseSets: ExerciseSet[];
  startTime?: number;
};

type Exercise = {
  id: string;
  name: string;
  muscleGroup?: string;
};

export default function ActiveWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());
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
                exerciseName: exercisesMap.get(setData.exerciseId)?.name,
                weight: setData.weight,
                reps: setData.reps,
                isDone: setData.isDone || false,
              });
            });

            setWorkout({ 
              id: userSnap.id, 
              ...workoutData, 
              exerciseSets,
              startTime: Date.now()
            });
            return;
          }
        } else {
          // Leeres Workout (freies Training)
          setWorkout({
            date: new Date().toISOString(),
            exerciseSets: [],
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

            // Save main workout document
            const workoutRef = doc(db, "users", user.uid, "workouts", workout.id!);
            await setDoc(workoutRef, {
              date: workout.date,
            });

            // Update all sets with isDone status using batch
            const batch = writeBatch(db);
            const setsRef = collection(workoutRef, "exerciseSets");
            workout.exerciseSets.forEach((set) => {
              if (set.id) {
                const setRef = doc(workoutRef, "exerciseSets", set.id);
                batch.update(setRef, { isDone: set.isDone });
              } else {
                const newRef = doc(setsRef);
                batch.set(newRef, {
                  exerciseId: set.exerciseId,
                  exerciseName: set.exerciseName || null,
                  name: set.name || null,
                  weight: set.weight,
                  reps: set.reps,
                  isDone: set.isDone || false,
                });
              }
            });
            await batch.commit();

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

      // Save main workout document
      const workoutRef = doc(db, "users", user.uid, "workouts", workout.id!);
      await setDoc(workoutRef, {
        date: workout.date,
      });

      // Update all sets with isDone status using batch
      const batch = writeBatch(db);
      workout.exerciseSets.forEach((set) => {
        const setRef = doc(workoutRef, "exerciseSets", set.id!);
        batch.update(setRef, { isDone: set.isDone });
      });
      await batch.commit();

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

  const snapPoints = ['98%'];

  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const handlesSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
    if (index !== 1) {
      setIsMinimized(true);
      try {
        router.push({
          pathname: '/(tabs)/HomeScreenProxy',
          params: {
            activeOverlayWorkout: JSON.stringify({ id: workout?.id ?? null, setsCount: workout?.exerciseSets.length ?? 0, elapsed: elapsedTime })
          }
        });
      } catch (e) {
        console.warn('Navigation to home failed', e);
      }
    } else {
      setIsMinimized(false);
    }
  }, [workout, elapsedTime]);

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

      {/* Timer */}
      <View style={styles.timerSection}>
        <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
      </View>

      {/* Exercise Sets List */}
      {workout.exerciseSets.length > 0 ? (
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
