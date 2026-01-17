import { TopBar } from "@/app/components/TopBar";
import { workoutStyles } from "@/app/styles/workoutStyles";
import { View, Text, FlatList, TextInput, Pressable, ScrollView, Modal } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { doc, getDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { auth, db } from "@/app/firebaseConfig";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import Ionicons from "@expo/vector-icons/Ionicons";
import { showAlert, showConfirm } from "@/app/utils/alertHelper";
import { workoutStyles as styles } from "@/app/styles/workoutStyles";
import { Colors } from "@/app/styles/theme";
import { NumberStepper, newStyles, secondsToMinSec, minSecToSeconds } from "@/app/components/NumberStepper";

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


export default function SingleWorkoutInfoScreen() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { id, workoutEditId, selectedExerciseId, selectedExerciseName, selectedBreakTime } = useLocalSearchParams();//<{id?: string;workoutEditId?: string;selectedExerciseId?: string;selectedExerciseName?: string;selectedBreakTime?: string;}>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercisesMap, setExercisesMap] = useState<Map<string, Exercise>>(new Map());
  //const editIdRef = useRef<string | null>(null);
  const editIdRef = useRef<string | string[]>(null);
  const isCreateMode = !id && !!workoutEditId;
  
  
  //TODO WHY !! ?


  // Overlay State
    const [activeOverlay, setActiveOverlay] = useState<OverlayTypes>("none");
    const [targetSetIndex, setTargetSetIndex] = useState<number | null>(null);
    const [targetExerciseId, setTargetExerciseId] = useState<string | null>(null);
    const [targetExerciseName, setTargetExerciseName] = useState<string | null>(null);
    //TempData for Overlay
    const [tempSetData, setTempSetData] = useState({weight:0,reps:0});
    const [tempBreakTime, setTempBreakTime] =useState({ mins: 0, secs: 0 });


  // Initialize edit key and start
  useEffect(() => {
    if (!editIdRef.current) {
      editIdRef.current = workoutEditId || (id ? `workout_${id}` : null);
    }
    if (isCreateMode && !isEditMode) {
      setIsEditMode(true);
    }
  }, [isCreateMode]);
    

  //Loading
  useEffect(() => {
    //if (!id && !isCreateMode) return;

    const fetchWorkout = async () => {
      setLoading(true);
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

        const userRef = doc(db, "users", user.uid, "workouts", id as string);
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
  }, [id]);

  // Persist draft when workout changes (edit mode)
  useEffect(() => {
    if (isEditMode && editIdRef.current && workout) {
      require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, workout);
    }
  }, [workout, isEditMode]);


  // Handle Return from AddExercise
  useEffect(() => {
    if (selectedExerciseId && workout) {
      const newSet: ExerciseSet = {
        id: `set_${Date.now()}`, exerciseId: selectedExerciseId as string, exerciseName: selectedExerciseName as string,
        weight: 20, reps: 10, breaktime: Number(selectedBreakTime) || 30, isDone: false
      };
      setWorkout({ ...workout, exerciseSets: [...workout.exerciseSets, newSet] });
      router.setParams({ selectedExerciseId: undefined });
    }
  }, [selectedExerciseId]);


  const groupSetsByExercise = (sets: ExerciseSet[]) => {
    const map: { [key: string]: ExerciseSet[] } = {};
    sets.forEach(s => { if (!map[s.exerciseId]) map[s.exerciseId] = []; map[s.exerciseId].push(s); });
    return map;
  };

  const openBreaktime = (exerciseId: string, secs: number) => {
    setTargetExerciseId(exerciseId);
    setTempBreakTime(secondsToMinSec(secs));
    setActiveOverlay('breaktime');
  };

  const openEditSet = (index: number, set: ExerciseSet) => {
    setTargetSetIndex(index);
    setTempSetData({ weight: set.weight, reps: set.reps });
    setActiveOverlay('editSet');
  };

  const openAddSet = (exerciseId: string, name: string) => {
    setTargetExerciseId(exerciseId);
    setTargetExerciseName(name);
    setTempSetData({ weight: 20, reps: 10 });
    setActiveOverlay('addSet');
  };

  const saveModalChanges = () => {
    if(!workout) return;
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
    
    setWorkout({ ...workout, exerciseSets: newSets });
    setActiveOverlay('none');
  };

  const handleRemoveSet = (index: number) => {
     if(!workout) return;
     const newSets = workout.exerciseSets.filter((_, i) => i !== index);
     setWorkout({ ...workout, exerciseSets: newSets });
  };

  // --- Render Functions ---
  const renderCard = (exerciseId: string, sets: ExerciseSet[]) => (
    <View key={exerciseId} style={styles.exerciseCard}>
      <View style={styles.exerciseCardHeader}>

        <Text style={{fontSize: 22,fontWeight: "bold",color: "white", marginRight:8}}>Pic </Text>

        <Text style={styles.exerciseTitle}>{sets[0].exerciseName}</Text>

        <Pressable onPress={() => openBreaktime(exerciseId, sets[0].breaktime || 30)}>
          <View style={{flexDirection: 'row', alignItems: 'center',padding:8}}>
             <Ionicons name="alarm-outline" size={20} color={Colors.primary} />
             <Text style={{color: Colors.primary, marginLeft: 4, fontSize: 12}}>{sets[0].breaktime || 30}s</Text>
          </View>
        </Pressable>
      </View>

      {sets.map((set) => {
        const idx = workout!.exerciseSets.indexOf(set);
        return (
          <View key={idx} style={isEditMode ? styles.setEditRow : styles.setRow}>
            <Text style={styles.setText}>Satz {sets.indexOf(set) + 1}</Text>
            <Text style={[styles.setText, {color: '#aaa'}]}>{set.weight}kg x {set.reps}</Text>
            
            {isEditMode && (
              <View style={{flexDirection: 'row', gap: 15}}>
                 {/* Pen Icon */}
                 <Pressable onPress={() => openEditSet(idx, set)}>
                    <Ionicons name="pencil" size={22} color="#007AFF" />
                 </Pressable>
                 {/* Trash */}
                 <Pressable onPress={() => handleRemoveSet(idx)}>
                    <Ionicons name="trash" size={22} color="#ff4444" />
                 </Pressable>
              </View>
            )}
          </View>
        );
      })}

      {isEditMode && (
         <Pressable onPress={() => openAddSet(exerciseId, sets[0].exerciseName || "")} style={styles.addSetButton}>
           <Text style={styles.addSetButtonText}>+ Satz hinzufügen</Text>
         </Pressable>
      )}
    </View>
  );

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
                 <NumberStepper label="Gewicht (kg)" value={tempSetData.weight} onChange={v => setTempSetData({...tempSetData, weight: v})} step={2.5} />
                 <NumberStepper label="Wiederholungen" value={tempSetData.reps} onChange={v => setTempSetData({...tempSetData, reps: v})} step={1} />
                 {/* Keine 'Erledigt' Checkbox hier, da dies nur der Info Screen ist */}
               </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };






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

  /*
  const handleRemoveSet = (index: number) => {
    setWorkout((prev) => {
      const newW = { ...prev!, exerciseSets: prev!.exerciseSets.filter((_, i) => i !== index) };
      if (editIdRef.current) require("@/app/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
      return newW;
    });
  };
  */

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
        const workoutRef = doc(db, "users", user.uid, "workouts", workoutId as string);

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
/*
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
  */

  if (!workout) {
    return (
    <View style={styles.itemContainer}>
      <TopBar leftButtonText="Zurück" onLeftPress={()=>router.back()}/>
      <LoadingOverlay visible={true}/>
    </View>
    );
  }
    

  const canSave = isEditMode && !!workout?.name && (workout.exerciseSets?.length ?? 0) > 0;

  return (
    <View style={styles.container}>
      <TopBar
        leftButtonText={isEditMode ? "Abbrechen" : "Zurück"}
        titleText={workout.name || "Training Info"}
        rightButtonText={isEditMode ? "Speichern" : "Bearbeiten"}
        onLeftPress={() => isEditMode ? setIsEditMode(false) : router.back()}
        onRightPress={() => isEditMode ? handleSaveWorkout() : setIsEditMode(true)}
      />
      
      <ScrollView contentContainerStyle={{padding: 16, paddingBottom: 100}}>
        {isEditMode && (
           <View style={{marginBottom: 16}}>
             <Text style={{color: '#FFFFFF', marginBottom: 4}}>Name</Text>
             <TextInput value={workout.name || ""} onChangeText={t => setWorkout({...workout, name: t})} style={{backgroundColor: '#222', color: 'white', padding: 10, borderRadius: 8}} />
           </View>
        )}

        {Object.entries(groupSetsByExercise(workout.exerciseSets)).map(([id, sets]) => renderCard(id, sets))}

        {isEditMode && (
           <Pressable onPress={() => router.push({pathname: "/screens/exercise/AddExerciseToWorkoutScreen", params: {returnTo: "info"}})} style={[styles.addExerciseButton, {marginTop: 20}]}>
             <Text style={styles.addExerciseButtonText}>+ Übung hinzufügen</Text>
           </Pressable>
        )}
      </ScrollView>

      {renderOverlays()}
      <LoadingOverlay visible={loading} />
    </View>
  );
}
