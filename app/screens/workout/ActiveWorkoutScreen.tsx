import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  Vibration
} from "react-native";
import { showAlert, showConfirm, showChoice } from "@/utils/alertHelper";
import { setActiveWorkout, clearActiveWorkout } from "@/utils/activeWorkoutStore";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { workoutStyles as styles } from "@/styles/workoutStyles";
import LoadingOverlay from "@/components/LoadingOverlay";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TopBar } from "@/components/TopBar";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NumberStepper, newStyles, secondsToMinSec, minSecToSeconds } from "@/components/NumberStepper";
import {Colors} from "@/styles/theme"

// New Firebase structure
type ExerciseSet = {
  id?: string;
  exerciseId: string;
  exerciseName: string;
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
  duration?: number;
  type?: "template" | "history"; // "template" für Vorlage, "history" für nur Protokoll
};

type Exercise = {
  id: string;
  name: string;
  muscleGroup?: string;
};

type OverlayTypes = "none" | "breaktime" | "editSet" | "addSet" | "restTimer";

export default function ActiveWorkoutScreen() {
  const { id, selectedExerciseId, selectedExerciseName, workoutEditId, selectedBreakTime } = useLocalSearchParams();//<{ id?: string; selectedExerciseId?: string; selectedExerciseName?: string; workoutEditId?: string; selectedBreakTime?: string }>();
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const editIdRef = useRef<string>(null);  
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
  
  // Rest Timer State
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  

  const updateWorkoutState = (newW: Workout) => {
    setWorkout(newW);
    if (editIdRef.current) require("@/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
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
    
    const newSets = workout.exerciseSets.map(s =>s.exerciseId === targetExerciseId ? { ...s, breaktime: newSeconds } : s);
    updateWorkoutState({ ...workout, exerciseSets: newSets });
    setActiveOverlay("none");
  };

  const openEditSetOverlay = (index: number, set: ExerciseSet) => {
    setTargetSetIndex(index);
    setTempSetData({ weight: set.weight, reps: set.reps, isDone: !!set.isDone });
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
        ...newSets[targetSetIndex],...tempSetData};
    } else if (activeOverlay === "addSet" && targetExerciseId) {
      newSets.push({
        id: 'set_${Date.now()}',
        exerciseId: targetExerciseId,
        exerciseName: targetExerciseName || "Unbekannt",
        ...tempSetData,
        breaktime: 30
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


  // Handle Return from AddExercise
  useEffect(() => {
    if (selectedExerciseId &&workout) {

      const foundName = selectedExerciseName || exercises.get(selectedExerciseId as string)?.name || "Unbekannte Übung";

      // New Set
      const newSet: ExerciseSet = {
      id: `set_${Date.now()}`,
      exerciseId: selectedExerciseId as string,
      exerciseName: foundName as string,
      weight: 20, reps: 10, breaktime: Number(selectedBreakTime) || 30, isDone: false
    };

    const newWorkout = {...workout, exerciseSets: [...workout.exerciseSets,newSet]};
    updateWorkoutState(newWorkout);


    //TODO Wieso hier - geht eig. auch ohne??
    setWorkout(newWorkout);
    if(editIdRef.current){
      require("@/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newWorkout);
    }

    router.setParams({ selectedExerciseId: undefined,
      selectedExerciseName: undefined,
      selectedBreakTime: undefined
     });

     setIsEditMode(true);
    }
  }, [selectedExerciseId, workout, exercises]);



  // Lade Workout beim Start
  useEffect(() => {
    const loadWorkoutData = async () => {
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

        const currentEditId = (workoutEditId|| id|| `temp_${Date.now()}`) as string;
        editIdRef.current=currentEditId;

        if (id != null) {
          // Wenn ID vorhanden, lade gespeichertes Workout
          editIdRef.current = workoutEditId as string|| id as string;

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

            const draft = require("@/utils/workoutEditingStore").getEditingWorkout(editIdRef.current!);
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
          editIdRef.current = workoutEditId as string || `temp_${Date.now()}`;

          const draft = require("@/utils/workoutEditingStore").getEditingWorkout(editIdRef.current);
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

    loadWorkoutData();
  }, [id]);


  
  //Timer - persist elapsed time
  useEffect(() => {
    // Restore previous elapsed time if resuming
    const savedTimer = require("@/utils/workoutTimerStore").getWorkoutTimer();
    if (savedTimer && workout?.id === savedTimer?.workoutId) {
      const elapsed = Math.floor((Date.now() - savedTimer.startTime) / 1000);
      setElapsedTime(Math.max(0, elapsed));
    }
    
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => {
        const newVal = prev + 1;
        // Update global store
        if (workout?.startTime) {
          require("@/utils/workoutTimerStore").setWorkoutTimer({
            startTime: workout.startTime,
            elapsedTime: newVal,
            workoutId: workout.id || 'temp'
          });
        }
        return newVal;
      });
    }, 1000) as unknown as NodeJS.Timeout;
    
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [workout?.id, workout?.startTime]);

  // Set Checkbox (Main View) - startet Rest Timer
  const handleSetCheck = (setIndex: number, breaktime: number) => {
    if (!workout) return;
    const sets = [...workout.exerciseSets];
    const newDone = !sets[setIndex].isDone;
    sets[setIndex] = { ...sets[setIndex], isDone: newDone, restStartedAt: newDone ? Date.now() : undefined };
    updateWorkoutState({ ...workout, exerciseSets: sets });
    
    // Wenn Satz erledigt wird, starte Rest-Timer
    if (newDone && breaktime > 0) {
      Vibration.vibrate(200);
      startRestTimer(breaktime);
    }
  };

  const startRestTimer = (seconds: number) => {
    setRestTimeRemaining(seconds);
    setActiveOverlay("restTimer");
    require("@/utils/restTimerStore").setRestTimer({ timeRemaining: seconds, isActive: true });
    
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    
    restTimerRef.current = setInterval(() => {
      setRestTimeRemaining((prev) => {
        const newVal = prev <= 1 ? 0 : prev - 1;
        require("@/utils/restTimerStore").setRestTimer({ timeRemaining: newVal, isActive: newVal > 0 });
        
        if (newVal <= 0) {
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          Vibration.vibrate([0, 200, 100, 200]);
        }
        return newVal;
      });
    }, 1000) as unknown as NodeJS.Timeout;
  };

  // Remove Set
  const handleRemoveSet = (index: number) => {
    if (!workout) return;
    const newSets = workout.exerciseSets.filter((_, i) => i !== index);
    updateWorkoutState({ ...workout, exerciseSets: newSets });
  };

  // Discard Workout
  const handleDiscardWorkout = () => {
    showConfirm("Training verwerfen", "Möchten Sie dieses Training wirklich verwerfen?", () => {
      clearActiveWorkout();
      if (editIdRef.current) require("@/utils/workoutEditingStore").clearEditingWorkout(editIdRef.current);
        router.navigate("../..//(tabs)/WorkoutScreenProxy")
    }, { confirmText: "Verwerfen", cancelText: "Abbrechen" });
  };

  // Finish Workout (speichern)
  const handleFinishWorkout = async () => {
    if (!workout || !workout.name || workout.exerciseSets.length === 0) {
      showAlert("Fehler", "Bitte geben Sie einen Trainingsnamen ein und fügen Sie mindestens einen Satz hinzu.");
      return;
    }
    
    // Ask user if this should be saved as template or just as history
    showChoice(
      "Workout speichern",
      "Soll dieses Workout als Vorlage gespeichert werden?",
      [
        { text: "Nur Protokoll", onPress: () => saveWorkoutToDatabase("history"), style: 'default' },
        { text: "Als Vorlage", onPress: () => saveWorkoutToDatabase("template"), style: 'default' },
      ]
    );
  };

  const saveWorkoutToDatabase = async (type: "template" | "history") => {
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
        name: workout.name,
        duration: elapsedTime,
        type: type,
      });

        const setsRef = collection(workoutRef, "exerciseSets");
        // Delete existing sets if any
        const existingSets = await getDocs(setsRef);
        existingSets.forEach((d) => batch.delete(d.ref));

        // Add current sets
        workout.exerciseSets.forEach((set, index) => {
          const setDocName = `set_${index.toString().padStart(3,'0')}`;
          const setRef = doc(setsRef, setDocName);
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
        require("@/utils/workoutTimerStore").clearWorkoutTimer();
        if (editIdRef.current) require("@/utils/workoutEditingStore").clearEditingWorkout(editIdRef.current);
        router.push("../..//(tabs)/WorkoutScreenProxy")

      } catch (e) {
        console.error("Fehler beim Speichern:", e);
        showAlert("Fehler", "Training konnte nicht gespeichert werden");
      } finally {
        setLoading(false);
      }
  };

  

  // Persist draft when workout changes
  useEffect(() => {
    if (editIdRef.current && workout) {
      require("@/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, workout);
    }
  }, [workout]);


  // Edit mode - save changes (persist full sets)
  const handleSaveChanges = async () => {
    if (!workout) return;
    if (!workout.name || workout.exerciseSets.length === 0) {
      showAlert("Fehler", "Bitte geben Sie einen Trainingsnamen ein und fügen Sie mindestens einen Satz hinzu.");
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
      batch.set(workoutRef, { date: workout.date, name: workout.name || null, duration: elapsedTime });

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
      if (editIdRef.current) require("@/utils/workoutEditingStore").clearEditingWorkout(editIdRef.current);
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

  //Bottom Sheet stuff
  const snapPoints = ['99%'];
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const handlesSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
    if (index === -1) {
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

  const renderViewMode = () => {
    const groupedSets = groupSetsByExercise(workout!.exerciseSets);

    return(
      <ScrollView contentContainerStyle={{paddingBottom: 120}}>
        <Text style={{color: Colors.black, width:800, marginBottom:10,fontSize:24, marginLeft: 30,}}>{workout?.name}</Text>

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
      
      </ScrollView>
    );
  };

  const renderEditMode =() => {
    const groupedSets = groupSetsByExercise(workout!.exerciseSets);

    return(
      <ScrollView contentContainerStyle={{paddingBottom: 120}}>
        <View style={{padding:16}}>
          <Text style={{color: Colors.black, width:800, marginBottom: 4,fontSize:24}}>Trainingsname:</Text>
          <TextInput 
            value={workout?.name ||""} 
            onChangeText={t => setWorkout(prev => prev ? {...prev, name:t} : null)} 
            style={{backgroundColor: Colors.background, color: Colors.black, padding: 10, borderRadius: 8,borderColor:Colors.black,borderWidth:1}} />
        </View>
        {Object.entries(groupedSets).map(([exerciseId, sets]) =>
          renderExerciseCard(exerciseId, sets, true))}

        <Pressable
          onPress={() => router.push({ pathname: "/screens/exercise/AddExerciseToWorkoutScreen", params: { returnTo: "active", workoutEditId: editIdRef.current } })}
          style={styles.addExerciseButton}
        >

          <Text style={styles.addExerciseButtonText}>Übung hinzufügen +</Text>
        </Pressable>
      </ScrollView>
    );
  };

  const renderExerciseCard = (exerciseId: string, sets: ExerciseSet[], isEditing: boolean) => (
    <View key={exerciseId} style={styles.exerciseCard}>
      <View style={styles.exerciseCardHeader}>

        <Text style={{fontSize: 22,fontWeight: "bold",color: "white", marginRight:8}}>Pic </Text>


        <Text style={styles.exerciseTitle}>{sets[0].exerciseName}</Text>

        <Pressable onPress={() => openBreakTimeOverlay(exerciseId, sets[0].breaktime || 30)}>
          <View style={{flexDirection: 'row', alignItems: 'center',padding:8}}>
            <Ionicons name="alarm-outline" size={20} color={Colors.primary} />
            <Text style={{color: Colors.primary, marginLeft: 4, fontSize: 12}}>{sets[0].breaktime || 30}s</Text>
          </View>
        </Pressable>
      </View>


      <View style={styles.setRowHeader}>
          <Text style={styles.setTextHeader}>Satz</Text>
          <Text style={styles.setTextHeader}>Gewicht (kg)</Text>
          <Text style={styles.setTextHeader}>Wdh.</Text>
          <Text style={styles.setTextHeader}>Erledigt</Text>

          {isEditMode && <View style={{width: 50}}/>}
          </View>

      {sets.map((set) => {
        const globalIndex = workout!.exerciseSets.indexOf(set);
        return (
          <View key={globalIndex} style={isEditMode ? styles.setEditRow : styles.setRow}>
            <Text style={styles.setText}>{sets.indexOf(set) + 1}</Text>
            <Text style={styles.setText}>{set.weight}</Text>
            <Text style={styles.setText}>{set.reps}</Text>
            
            {!isEditMode ? (
              <Pressable 
                onPress={() => handleSetCheck(globalIndex, set.breaktime || 30)}
                style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
              >
                <Ionicons 
                  name={set.isDone ? "checkbox" : "checkbox-outline"} 
                  size={28} 
                  color={set.isDone ? Colors.primary : Colors.black} 
                />
              </Pressable>
            ) : (
              <Text style={styles.setText}>-</Text>
            )}

            {isEditMode && (
              <View style={{flexDirection: 'row', gap: 15, flexGrow:0}}>
                <Pressable onPress={() => openEditSetOverlay(globalIndex, set)}>
                    <Ionicons name="pencil" size={22} color={Colors.black} />
                </Pressable>
                <Pressable onPress={() => handleRemoveSet(globalIndex)}>
                    <Ionicons name="trash" size={22} color={Colors.black} />
                </Pressable>
              </View>
            )}

          </View>
        );
      })}

      {isEditing && (
        <Pressable onPress={() => openAddSetOverlay(exerciseId, sets[0].exerciseName)} style={styles.addSetButton}>
          <Text style={styles.addSetButtonText}>Satz hinzufügen +</Text>
        </Pressable>
      )}
    </View>
  );

  //TODO STILL LOOKING AT IT
  const renderOverlays = () => {
    if (activeOverlay === 'none') return null;
    const isBreaktime = activeOverlay === 'breaktime';
    const isEdit = activeOverlay === 'editSet';
    const isAdd = activeOverlay === 'addSet';

    return (
      <Modal visible={true} transparent animationType="fade" onRequestClose={() => setActiveOverlay('none')}>
        <View style={newStyles.overlay}>
          <View style={newStyles.content}>
            <View style={newStyles.header}>
              <Pressable onPress={() => setActiveOverlay('none')}><Text style={{color: '#ff4444'}}>Abbrechen</Text></Pressable>
              <Text style={newStyles.headerTitle}>{isBreaktime ? "Pausenzeit" : (isEdit ? "Satz bearbeiten" : "Satz hinzufügen")}</Text>
              <Pressable style={newStyles.saveButton} onPress={saveModalChanges}><Text style={newStyles.saveText}>{isAdd ? "Hinzufügen" : "Speichern"}</Text></Pressable>
            </View>

            {isBreaktime ? (
              <View style={newStyles.timeInputContainer}>
                  <TextInput style={newStyles.timeInput} keyboardType="numeric" value={tempBreakTime.mins.toString()} onChangeText={v => setTempBreakTime({...tempBreakTime, mins: Number(v)})} />
                  <Text style={newStyles.label}>Min</Text>
                  <TextInput style={newStyles.timeInput} keyboardType="numeric" value={tempBreakTime.secs.toString()} onChangeText={v => setTempBreakTime({...tempBreakTime, secs: Number(v)})} />
                  <Text style={newStyles.label}>Sek</Text>
              </View>
            ) : (
              <View>
                <NumberStepper label="Gewicht (kg)" value={tempSetData.weight} onChange={v => setTempSetData({...tempSetData, weight: v})} step={0.5} />
                <NumberStepper label="Wiederholungen" value={tempSetData.reps} onChange={v => setTempSetData({...tempSetData, reps: v})} step={1} />
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  // Rest Timer Bar - render as fixed bottom bar
  const renderRestTimerBar = () => {
    if (activeOverlay !== 'restTimer') return null;
    
    return (
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.primary,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        <View>
          <Text style={{color: Colors.white, fontSize: 12, fontWeight: '600'}}>Pausenzeit</Text>
          <Text style={{color: Colors.white, fontSize: 24, fontWeight: 'bold', marginTop: 4}}>
            {Math.floor(restTimeRemaining / 60)}:{(restTimeRemaining % 60).toString().padStart(2, '0')}
          </Text>
        </View>
        <Pressable 
          style={{paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.black, borderRadius: 6}}
          onPress={() => {
            if (restTimerRef.current) clearInterval(restTimerRef.current);
            require("@/utils/restTimerStore").clearRestTimer();
            setActiveOverlay('none');
          }}
        >
          <Text style={{color: Colors.white, fontSize: 14, fontWeight: '600'}}>Fertig</Text>
        </Pressable>
      </View>
    );
  };

  const saveModalChanges = () => {
    if(!workout) return;

    setWorkout(prev => {
      if(!prev)return null;

      let newSets = [...workout.exerciseSets];

      if (activeOverlay === 'breaktime' && targetExerciseId) {
      const secs = minSecToSeconds(tempBreakTime.mins, tempBreakTime.secs);
      newSets = newSets.map(s => s.exerciseId === targetExerciseId ? {...s, breaktime: secs} : s);
      }
      else if (activeOverlay === 'editSet' && targetSetIndex !== null) {
        newSets[targetSetIndex] = { ...newSets[targetSetIndex], weight: tempSetData.weight, reps: tempSetData.reps };
      }
      else if (activeOverlay === 'addSet' && targetExerciseId) {
        newSets.push({
            id: `set_${Date.now()}`, exerciseId: targetExerciseId, exerciseName: targetExerciseName || "",
            weight: tempSetData.weight, reps: tempSetData.reps, breaktime: 30, isDone: false
        });
      }
      return {...prev, exerciseSets:newSets};
    });
    setActiveOverlay('none');
  };

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

  //TODO Meh lösung: Leerzeichen
  const timerString = activeOverlay === 'restTimer' 
    ? `  Pausenzeit\n${Math.floor(restTimeRemaining / 60)}:${(restTimeRemaining % 60).toString().padStart(2, '0')}`
    : `  Dauer\n${formatTime(elapsedTime)}`;

  return (
    <GestureHandlerRootView style={styles.sheetContainer}>
      <BottomSheet index={1} snapPoints={snapPoints} ref={bottomSheetRef} onChange={handlesSheetChanges} enablePanDownToClose={true}>
        <BottomSheetView style={styles.sheetContainerContent}>
          <TopBar
            leftButtonText={isEditMode ? "Abbrechen" : "Verwerfen"}
            titleText={isEditMode ? "Training bearbeiten" : timerString}
            rightButtonText={isEditMode ? "Speichern" : "Fertig"}
            onLeftPress={() => isEditMode ? setIsEditMode(false) : handleDiscardWorkout()}
            onRightPress={() =>isEditMode ? handleSaveChanges() : handleFinishWorkout()}
          />

          {isEditMode ? renderEditMode() : renderViewMode()}
          <LoadingOverlay visible={loading} />
          {renderOverlays()}
          {renderRestTimerBar()}
        
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );

};
