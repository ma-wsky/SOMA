import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  FlatList
} from "react-native";
import { showAlert, showConfirm } from "@/app/utils/alertHelper";
import { setActiveWorkout, clearActiveWorkout } from "@/app/utils/activeWorkoutStore";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { auth, db } from "@/app/firebaseConfig";
import { workoutStyles as styles } from "@/app/styles/workoutStyles";
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
  breaktime?: number;
  restStartedAt?: number;
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
  const editIdRef = useRef<string | null>(null);  
  const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());
  const [isEditMode, setIsEditMode] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  
  

  const groupSetsByExercise = (sets: ExerciseSet[]) => {
    const map: { [exerciseId: string]: ExerciseSet[] } = {};
    sets.forEach((set) => {
      if (!map[set.exerciseId]) {
        map[set.exerciseId] = [];
      }
      map[set.exerciseId].push(set);
    });
    return map;
  };


  const renderViewMode = () => {
    const groupedSets = groupSetsByExercise(workout!.exerciseSets);

    return(
      <ScrollView contentContainerStyle={{paddingBottom: 120}}>
        <View>
        {Object.entries(groupedSets).map(([exerciseId, sets]) => 
          renderExerciseViewCard(exerciseId, sets))}

        <View style={{alignItems: "center"}}>
        <Pressable
          onPress={() => {setIsEditMode(true);}}
          style={styles.topBarLikeButton}
        >

          <Text style={styles.topBarButtonText}>Bearbeiten</Text>
        </Pressable>
        </View>
      


</View>
      </ScrollView>
    );
  };

  const renderEditMode =() => {
    const groupedSets = groupSetsByExercise(workout!.exerciseSets);

    return(
      <ScrollView contentContainerStyle={{paddingBottom: 120}}>
        <View>
        {Object.entries(groupedSets).map(([exerciseId, sets]) =>
          renderExerciseEditCard(exerciseId, sets))}

        <Pressable
          onPress={() => addExercise("", undefined, 30)}
          style={styles.addExerciseButton}
        >

          <Text style={styles.addExerciseButtonText}>+ Übung hinzufügen</Text>
        </Pressable>

        </View>
      </ScrollView>
    );
  };


  const renderSetEditMode = (set: ExerciseSet, index: number) => (
    <View key={index} style={styles.setEditRow}>
      <Text style={styles.setText}>Satz {index + 1}</Text>

      <TextInput
      value={set.weight.toString()}
      onChangeText={(text) => handleUpdateSet(index, "weight", text)}
      style={styles.input}
      keyboardType="numeric"
      />

      <TextInput
      value={set.reps.toString()}
      onChangeText={(text) => handleUpdateSet(index,"reps", text)}
      style={styles.input}
      keyboardType="numeric"
      />

      <TextInput
        value={(set.breaktime ?? 30).toString()}
        keyboardType="numeric"
        onChangeText={(v) => {
          const secs = parseInt(v) || 0;
          handleUpdateSet(index, "breaktime" as any, secs.toString());
        }}
        style={styles.input}
        placeholder="Pause"
      />

      <Pressable onPress={() => handleRemoveSet(index)}>
        <Ionicons name="trash" size={20} color="#ff4444" />
      </Pressable>

    </View>
  );



  const renderSetViewRow = (set: ExerciseSet, index: number) => {
    
    return(
      <Pressable
      key={index}
      onPress={()=> handleSetCheck(index)}
      style={styles.setRow}
      >

      <Text style={styles.setText}>{set.id}</Text>
      <Text style={styles.setText}>{set.weight}</Text>
      <Text style={styles.setText}>{set.reps}</Text>

      <View style={[styles.checkbox, set.isDone && styles.checkboxDone]}>
        {set.isDone && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>

      </Pressable>
    );
  };


  const renderExerciseViewCard = (exerciseId: string, sets: ExerciseSet[]) => (
    <View key={exerciseId} style={styles.exerciseCard}>
      <Text style={styles.exerciseTitle}>
        {sets[0].exerciseName}
      </Text>

      {sets.map((set, idx) => renderSetViewRow(set, workout!.exerciseSets.indexOf(set)))}

    </View>
  );

  const renderExerciseEditCard = (exerciseId: string, sets: ExerciseSet[]) => (
    <View key={exerciseId} style={styles.exerciseCard}> 
      <Text style={styles.exerciseTitle}>
        {sets[0].exerciseName}
      </Text>

      {sets.map((set)=>
      renderSetEditMode(set, workout!.exerciseSets.indexOf(set)))}

      <Pressable
        onPress={() => handleAddSet(exerciseId, sets[0].exerciseName)}
        style={styles.addSetButton}
      >

        <Text style={styles.addSetButtonText}>+ Satz hinzufügen</Text>
      </Pressable>
    </View>
  );
  


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
          editIdRef.current = workoutEditId || id;

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
                exerciseName: setData.exerciseName,
                name: setData.name,
                weight: setData.weight,
                reps: setData.reps,
                isDone: setData.isDone || false,
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

  const getRemainingRestTime = (set: ExerciseSet) => {
    if(!set.isDone || !set.restStartedAt || !set.breaktime) return null;

    const rest = set.breaktime;
    const elapsed = (Date.now() - set.restStartedAt) / 1000;
    const remaining = rest - elapsed;

    return remaining > 0 ? remaining : 0;
  };

  // Handle Set Checkbox   
  const handleSetCheck = (setIndex: number) => {
    if (!workout) {return;}

    const sets = [...workout.exerciseSets];
    const set = sets[setIndex];

    const newDoneStatus = !set.isDone;

    sets[setIndex] = {
      ...set,
      isDone: newDoneStatus,
      restStartedAt: newDoneStatus ? Date.now() : undefined,
    };
    setWorkout({ ...workout, exerciseSets: sets });
  };


  //new Add Exercise in hope that multiple exercises can be added
  const addExercise = (exerciseId: string, exerciseName?: string, breaktime?: number) => {
  if (!workout) return;

  router.push({pathname: "/screens/exercise/AddExerciseToWorkoutScreen",
    params: { workoutEditId: editIdRef.current, returnTo: "active" }})

  const newSet: ExerciseSet = {
    id: `set_${Date.now()}`,
    exerciseId,
    exerciseName,
    weight: 20,
    reps: 5,
    breaktime: breaktime ?? 30,
    isDone: false,
  };

  const newWorkout = {
    ...workout,
    exerciseSets: [...workout.exerciseSets, newSet],
  };

  setWorkout(newWorkout);
};


  // Add a set for a given exercise in active workout
  const handleAddSet = (exerciseId: string, exerciseName?: string) => {
  if (!workout) return;

  const newSet: ExerciseSet = {
    id: `set_${Date.now()}`,
    exerciseId,
    exerciseName,
    weight: 20,
    reps: 5,
    breaktime: 30,
    isDone: false,
  };

  setWorkout({
    ...workout,
    exerciseSets: [...workout.exerciseSets, newSet],
  });
};

  // Discard Workout
  const handleDiscardWorkout = () => {
    showConfirm("Training verwerfen", "Möchten Sie dieses Training wirklich verwerfen?", () => {
      clearActiveWorkout();
      if (editIdRef.current) require("@/app/utils/workoutEditingStore").clearEditingWorkout(editIdRef.current);
        router.push("../..//(tabs)/WorkoutScreenProxy")
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
            reps: set.reps,
            isDone: set.isDone || false,
          });
        });

        await batch.commit();

        showAlert("Erfolg", "Training gespeichert");
        clearActiveWorkout();
        if (editIdRef.current) require("@/app/utils/workoutEditingStore").clearEditingWorkout(editIdRef.current);
        router.push("../..//(tabs)/WorkoutScreenProxy")

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
    if (!selectedExerciseId) return;


    addExercise(selectedExerciseId, selectedExerciseName, Number(selectedBreakTime));

    router.setParams({ selectedExerciseId: undefined, selectedExerciseName: undefined, selectedBreakTime: undefined });
  },[selectedExerciseId, selectedExerciseName, selectedBreakTime]);


  /*useEffect(() => {

  //Old AddExercise/Set
    if (selectedExerciseId) {
      handleAddSet(selectedExerciseId, selectedExerciseName, Number(selectedBreakTime));
      // clear params to avoid duplicates
      router.setParams({ selectedExerciseId: undefined, selectedExerciseName: undefined, selectedBreakTime: undefined });
    }
  }, [selectedExerciseId, selectedExerciseName, selectedBreakTime]);
  */
  
  
  
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

  const snapPoints = ['99%'];

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


  //TODO Meh lösung: Leerzeichen
  const timerString = `Aktives Training \n      ${formatTime(elapsedTime)}`;

  return (
    <GestureHandlerRootView style={styles.sheetContainer}>
      <BottomSheet index={1} snapPoints={snapPoints} ref={bottomSheetRef} onChange={handlesSheetChanges} enablePanDownToClose={true}>
      <BottomSheetView style={styles.sheetContainerContent}>
      <TopBar
        leftButtonText={isEditMode ? "Abbrechen" : "Verwerfen"}

        titleText={isEditMode ? "Training bearbeiten" : timerString}
        rightButtonText={isEditMode ? "Speichern" : "Fertig"}
        onLeftPress={isEditMode ? () => setIsEditMode(false) : handleDiscardWorkout}
        onRightPress={isEditMode ? handleSaveChanges : handleFinishWorkout}
      />

      {isEditMode ? renderEditMode() : renderViewMode()}

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
};
