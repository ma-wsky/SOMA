import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal
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
import { NumberStepper, newStyles, secondsToMinSec, minSecToSeconds } from "@/app/components/NumberStepper";
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

type OverlayTypes = "none" | "breaktime" | "editSet" | "addSet";

export default function ActiveWorkoutScreen() {
  const { id, selectedExerciseId, selectedExerciseName, workoutEditId, selectedBreakTime } = useLocalSearchParams();//<{ id?: string; selectedExerciseId?: string; selectedExerciseName?: string; workoutEditId?: string; selectedBreakTime?: string }>();
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const editIdRef = useRef<string | string[]>(null);  
  const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());
  const [isEditMode, setIsEditMode] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Overlay State
  const [activeOverlay, setActiveOverlay] = useState<OverlayTypes>("none");
  const [targetSetIndex, setTargetSetIndex] = useState<number | null>(null);
  const [targetExerciseId, setTargetExerciseId] = useState<string | null>(null);
  const [targetExerciseName, setTargetExerciseName] = useState<string | null>(null);


  //TempData for Overlay
  const [tempSetData, setTempSetData] = useState({weight:0,reps:0,isDone:false});
  const [tempBreakTime, setTempBreakTime] =useState({ mins: 0, secs: 0 });
  

  const updateWorkoutState = (newW: Workout) => {
    setWorkout(newW);
    if (editIdRef.current) require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
  };

  //Overlays
  const openBreakTimeOverlay = (exerciseId: string, currentSeconds: number) => {
    setTargetExerciseId(exerciseId);
    setTempBreakTime(secondsToMinSec(currentSeconds));
    setActiveOverlay("breaktime");
  };

  const saveBreakTime = () => {
    if (!workout || !targetExerciseId) return;
    const newSeconds = minSecToSeconds(tempBreakTime.mins, tempBreakTime.secs);
    
    const newSets = workout.exerciseSets.map(s => 
      s.exerciseId === targetExerciseId ? { ...s, breaktime: newSeconds } : s
    );
    
    updateWorkoutState({ ...workout, exerciseSets: newSets });
    setActiveOverlay("none");
  };

  const openEditSetOverlay = (index: number, set: ExerciseSet) => {
    setTargetSetIndex(index);
    setTempSetData({ weight: set.weight, reps: set.reps, isDone: set.isDone || false });
    setActiveOverlay("editSet");
  };

  const openAddSetOverlay = (exerciseId: string, exerciseName: string) => {
    setTargetExerciseId(exerciseId);
    setTargetExerciseName(exerciseName);
    setTempSetData({ weight: 20, reps: 10, isDone: false });
    setActiveOverlay("addSet");
  };

  const saveSetData = () => {
    if (!workout) return;
    let newSets = [...workout.exerciseSets];

    if (activeOverlay === "editSet" && targetSetIndex !== null) {
      newSets[targetSetIndex] = {
        ...newSets[targetSetIndex],
        weight: tempSetData.weight,
        reps: tempSetData.reps,
        isDone: tempSetData.isDone
      };
    } else if (activeOverlay === "addSet" && targetExerciseId) {
      newSets.push({
        id: 'set_${Date.now()}',
        exerciseId: targetExerciseId,
        exerciseName: targetExerciseName || "Unbekannt",
        weight: tempSetData.weight,
        reps: tempSetData.reps,
        breaktime: 30,
        isDone: tempSetData.isDone
      });
    }

    updateWorkoutState({ ...workout, exerciseSets: newSets });
    setActiveOverlay("none");
  };


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
          renderExerciseCard(exerciseId, sets, false))}

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
          renderExerciseCard(exerciseId, sets, true))}

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
      <Text style={[styles.setText, {color: '#aaa'}]}>{set.weight}kg x {set.reps}</Text>
      
      <View style={{flexDirection: 'row', gap: 15}}>
        {/* Stift Icon -> Öffnet Overlay */}
        <Pressable onPress={() => openEditSetOverlay(index, set)}>
          <Ionicons name="pencil" size={22} color="#007AFF" />
        </Pressable>
        {/* Trash Icon */}
        <Pressable onPress={() => handleRemoveSet(index)}>
          <Ionicons name="trash" size={22} color="#ff4444" />
        </Pressable>
      </View>
    </View>
  );



  const renderSetViewMode = (set: ExerciseSet, index: number) => {
    
    return(
      <Pressable key={index} onPress={() => handleSetCheck(index)} style={styles.setRow}>
      <Text style={styles.setText}>{index + 1}</Text>
      <Text style={styles.setText}>{set.weight} kg</Text>
      <Text style={styles.setText}>{set.reps} Wdh</Text>
      <View style={[styles.checkbox, set.isDone && styles.checkboxDone]}>
        {set.isDone && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
    </Pressable>
    );
  };


  /*const renderExerciseViewCard = (exerciseId: string, sets: ExerciseSet[]) => (
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
  );*/

  const renderExerciseCard = (exerciseId: string, sets: ExerciseSet[], isEditing: boolean) => (
    <View key={exerciseId} style={styles.exerciseCard}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
        <Text style={styles.exerciseTitle}>{sets[0].exerciseName}</Text>
        {/* Wecker Icon */}
        <Pressable onPress={() => openBreakTimeOverlay(exerciseId, sets[0].breaktime || 30)}>
          <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', padding: 6, borderRadius: 6}}>
             <Ionicons name="alarm-outline" size={20} color="#fff" />
             <Text style={{color: '#ccc', marginLeft: 4, fontSize: 12}}>{sets[0].breaktime || 30}s</Text>
          </View>
        </Pressable>
      </View>

      {sets.map((set) => {
         const globalIndex = workout!.exerciseSets.indexOf(set);
         return isEditing 
            ? renderSetEditMode(set, globalIndex) 
            : renderSetViewMode(set, globalIndex);
      })}

      {isEditing && (
        <Pressable onPress={() => openAddSetOverlay(exerciseId, sets[0].exerciseName || "")} style={styles.addSetButton}>
          <Text style={styles.addSetButtonText}>+ Satz hinzufügen</Text>
        </Pressable>
      )}
    </View>
  );

  const renderActiveOverlay = () => {
    if (activeOverlay === 'none') return null;

    const isBreaktime = activeOverlay === 'breaktime';
    const isEdit = activeOverlay === 'editSet';
    const isAdd = activeOverlay === 'addSet';

    return (
      <Modal visible={true} transparent animationType="fade" onRequestClose={() => setActiveOverlay('none')}>
        <View style={newStyles.overlay}>
          <View style={newStyles.content}>
            {/* Header */}
            <View style={newStyles.header}>
              <Pressable onPress={() => setActiveOverlay('none')}>
                 <Text style={{color: '#ff4444', fontSize: 16}}>Abbrechen</Text>
              </Pressable>
              <Text style={newStyles.headerTitle}>
                {isBreaktime ? "Pause" : (isEdit ? "Satz bearbeiten" : "Satz hinzufügen")}
              </Text>
              <Pressable style={newStyles.saveButton} onPress={isBreaktime ? saveBreakTime : saveSetData}>
                <Text style={newStyles.saveText}>{isAdd ? "Hinzufügen" : "Speichern"}</Text>
              </Pressable>
            </View>

            {/* Content */}
            {isBreaktime ? (
              <View>
                 <View style={newStyles.timeInputContainer}>
                    <TextInput 
                      style={newStyles.timeInput} 
                      keyboardType="numeric" 
                      value={tempBreakTime.mins.toString()} 
                      onChangeText={(v) => setTempBreakTime({...tempBreakTime, mins: Number(v)})} 
                    />
                    <Text style={newStyles.label}>Min</Text>
                    <TextInput 
                      style={newStyles.timeInput} 
                      keyboardType="numeric" 
                      value={tempBreakTime.secs.toString()} 
                      onChangeText={(v) => setTempBreakTime({...tempBreakTime, secs: Number(v)})} 
                    />
                    <Text style={newStyles.label}>Sek</Text>
                 </View>
              </View>
            ) : (
              <View>
                <NumberStepper label="Gewicht (kg)" value={tempSetData.weight} onChange={(v) => setTempSetData({...tempSetData, weight: v})} step={2.5} />
                <NumberStepper label="Wiederholungen" value={tempSetData.reps} onChange={(v) => setTempSetData({...tempSetData, reps: v})} step={1} />
                
                {/* Checkbox "Erledigt" nur für Active Workout */}
                <Pressable style={newStyles.checkboxRow} onPress={() => setTempSetData({...tempSetData, isDone: !tempSetData.isDone})}>
                  <Ionicons name={tempSetData.isDone ? "checkbox" : "square-outline"} size={24} color={tempSetData.isDone ? "#4CAF50" : "white"} />
                  <Text style={{color: 'white', marginLeft: 10, fontSize: 16}}>Satz erledigt</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };
  
  //Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsedTime((prev) => prev + 1), 1000) as unknown as NodeJS.Timeout;
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Set Checkbox (Main View)
  const handleSetCheck = (setIndex: number) => {
    if (!workout) return;
    const sets = [...workout.exerciseSets];
    const newDone = !sets[setIndex].isDone;
    sets[setIndex] = { ...sets[setIndex], isDone: newDone, restStartedAt: newDone ? Date.now() : undefined };
    updateWorkoutState({ ...workout, exerciseSets: sets });
  };

  // Remove Set
  const handleRemoveSet = (index: number) => {
    if (!workout) return;
    const newSets = workout.exerciseSets.filter((_, i) => i !== index);
    updateWorkoutState({ ...workout, exerciseSets: newSets });
  };

  // Router for Adding Exercise
  const addExerciseRouter = () => {
    router.push({
      pathname: "/screens/exercise/AddExerciseToWorkoutScreen",
      params: { workoutEditId: editIdRef.current, returnTo: "active" }
    });
  };

  // Handle Return from AddExercise
  useEffect(() => {
    if (!selectedExerciseId) return;
    if (!workout) return;
    // Hinzufügen eines Initialsatzes
    const newSet: ExerciseSet = {
      id: `set_${Date.now()}`,
      exerciseId: selectedExerciseId as string,
      exerciseName: selectedExerciseName as string,
      weight: 20, reps: 10, breaktime: Number(selectedBreakTime) || 30, isDone: false
    };
    updateWorkoutState({ ...workout, exerciseSets: [...workout.exerciseSets, newSet] });
    router.setParams({ selectedExerciseId: undefined });
  }, [selectedExerciseId]);

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

        if (id != null) {
          // Wenn ID vorhanden, lade gespeichertes Workout
          editIdRef.current = workoutEditId || id;

          const userRef = doc(db, "users", user.uid, "workouts", id as string);
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


  /*
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


// Handle exercise returned from AddExercise (single-select)
  useEffect(() => {
    if (!selectedExerciseId) return;


    addExercise(selectedExerciseId, selectedExerciseName, Number(selectedBreakTime));

    router.setParams({ selectedExerciseId: undefined, selectedExerciseName: undefined, selectedBreakTime: undefined });
  },[selectedExerciseId, selectedExerciseName, selectedBreakTime]);


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

// Remove a set
  const handleRemoveSet = (index: number) => {
    const newW = { ...workout!, exerciseSets: workout!.exerciseSets.filter((_, i) => i !== index) };
    setWorkout(newW);
    if (editIdRef.current) require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
  };

*/

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

  

  // Persist draft when workout changes
  useEffect(() => {
    if (editIdRef.current && workout) {
      require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, workout);
    }
  }, [workout]);

  

  /*useEffect(() => {

  //Old AddExercise/Set
    if (selectedExerciseId) {
      handleAddSet(selectedExerciseId, selectedExerciseName, Number(selectedBreakTime));
      // clear params to avoid duplicates
      router.setParams({ selectedExerciseId: undefined, selectedExerciseName: undefined, selectedBreakTime: undefined });
    }
  }, [selectedExerciseId, selectedExerciseName, selectedBreakTime]);
  */
  
  
  
  

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
            titleText={isEditMode ? "Training bearbeiten" : `Aktives Training \n ${formatTime(elapsedTime)}`}
            rightButtonText={isEditMode ? "Speichern" : "Fertig"}
            onLeftPress={isEditMode ? () => setIsEditMode(false) : handleDiscardWorkout}
            onRightPress={isEditMode ? handleSaveChanges : handleFinishWorkout}
          />
          {isEditMode ? renderEditMode() : renderViewMode()}
          <LoadingOverlay visible={loading} />
          {renderActiveOverlay()}
        </BottomSheetView>
      </BottomSheet>
      {isMinimized && ( <View /> /* Dein Minimized View Code */ )}
    </GestureHandlerRootView>
  );
};
