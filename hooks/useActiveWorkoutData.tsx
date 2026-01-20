// Custom hook for managing ActiveWorkoutScreen data and operations
// Handles workout state, exercise management, and database operations

import { useState, useEffect, useRef, useCallback } from "react";
import { writeBatch, doc, collection, getDocs } from "firebase/firestore";
import { router } from "expo-router";
import { db, auth } from "@/firebaseConfig";
import { setActiveWorkout, clearActiveWorkout } from "@/utils/activeWorkoutStore";
import { showAlert, showConfirm, showChoice } from "@/utils/alertHelper";
import type { Workout, Exercise, ExerciseSet } from "@/types/workoutTypes";
import { minSecToSeconds } from "@/components/NumberStepper";
import Toast from 'react-native-toast-message';
import { playSound } from "@/utils/soundHelper";

export const useActiveWorkoutData = (initialWorkout?: Workout | null) => {
  const [workout, setWorkout] = useState<Workout | null>(initialWorkout || null);
  const [originalWorkout, setOriginalWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const editIdRef = useRef<string>(null);

  const updateWorkoutState = useCallback((newW: Workout) => {
    setWorkout(newW);
    if (editIdRef.current) {
      require("@/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
    }
  }, []);

  const setEditIdRef = useCallback((id: string) => {
    editIdRef.current = id;
  }, []);

  const handleCancel = useCallback(() => {
    if (originalWorkout) {
      setWorkout(originalWorkout);
      if (editIdRef.current) {
        require("@/utils/workoutEditingStore").setEditingWorkout(editIdRef.current, originalWorkout);
      }
    }
    setIsEditMode(false);
  }, [originalWorkout]);

  // Handle Set Check (marks set as done and starts rest timer)
  const handleSetCheck = useCallback(
    (setIndex: number) => {
      if (!workout) return;
      const sets = [...workout.exerciseSets];
      sets[setIndex] = { ...sets[setIndex], isDone: !sets[setIndex].isDone };
      updateWorkoutState({ ...workout, exerciseSets: sets });
    },
    [workout, updateWorkoutState]
  );

  // Handle Remove Set
  const handleRemoveSet = useCallback(
    (index: number) => {
      if (!workout) return;
      const newSets = workout.exerciseSets.filter((_, i) => i !== index);
      updateWorkoutState({ ...workout, exerciseSets: newSets });
    },
    [workout, updateWorkoutState]
  );

  // Handle Discard Workout
  const handleDiscardWorkout = useCallback(() => {
    showConfirm(
      "Training verwerfen",
      "Möchten Sie dieses Training wirklich verwerfen?",
      () => {
        clearActiveWorkout();
        if (editIdRef.current) require("@/utils/workoutEditingStore").clearEditingWorkout(editIdRef.current);
        router.dismissAll();
        router.replace("/(tabs)/WorkoutScreenProxy");
      },
      { confirmText: "Verwerfen", cancelText: "Abbrechen" }
    );
  }, []);

  // Handle Finish Workout
  const handleFinishWorkout = useCallback(() => {
    if (!workout || !workout.name || workout.exerciseSets.length === 0) {
      showAlert(
        "Fehler",
        "Bitte geben Sie einen Trainingsnamen ein und fügen Sie mindestens einen Satz hinzu."
      );
      return;
    }

    showChoice(
      "Workout speichern",
      "Soll dieses Workout als Vorlage gespeichert werden?",
      [
        { text: "Nur Protokoll", onPress: () => saveWorkoutToDatabase("history"), style: "default" },
        { text: "Als Vorlage", onPress: () => saveWorkoutToDatabase("template"), style: "default" },
      ]
    );
  }, [workout]);

  // Save Workout to Database
  const saveWorkoutToDatabase = useCallback(
    async (type: "template" | "history") => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user || !workout) return;

        const batch = writeBatch(db);
        const duration = workout.startTime ? Math.floor((Date.now() - workout.startTime)/1000) : 0;

        // 1. ALWAYS save as History Log
        const historyId = `workout_${Date.now()}_his`;
        const historyRef = doc(db, "users", user.uid, "workouts", historyId);
        
        batch.set(historyRef, {
          date: workout.date,
          name: workout.name,
          duration: duration,
          type: "history",
        });

        // Sets for History
        const setsRef = collection(historyRef, "exerciseSets");
        workout.exerciseSets.forEach((set, index) => {
           const setDocName = `set_${index.toString().padStart(3, "0")}`;
           batch.set(doc(setsRef, setDocName), {
            exerciseId: set.exerciseId,
            exerciseName: set.exerciseName || null,
            name: set.name || null,
            breaktime: set.breaktime ?? 30,
            weight: set.weight,
            reps: set.reps,
            isDone: set.isDone || false,
           });
        });

        // 2. IF Template selected, save AS ALSO as Template
        if (type === "template") {
            const templateId = `workout_${Date.now()}_tpl`;
            const templateRef = doc(db, "users", user.uid, "workouts", templateId);
            
            // Templates shouldn't have specific duration or date usually, but we keep the date of creation
            batch.set(templateRef, {
              date: new Date().toISOString(), 
              name: workout.name, 
              type: "template",
            });

             const tplSetsRef = collection(templateRef, "exerciseSets");
             workout.exerciseSets.forEach((set, index) => {
               const setDocName = `set_${index.toString().padStart(3, "0")}`;
               batch.set(doc(tplSetsRef, setDocName), {
                exerciseId: set.exerciseId,
                exerciseName: set.exerciseName || null,
                name: set.name || null,
                breaktime: set.breaktime ?? 30,
                weight: set.weight,
                reps: set.reps,
                isDone: false, // Reset done state for template
               });
            });
        }

        await batch.commit();

        // Sound & Toast instead of Alert
        try {
           playSound(require('@/assets/sounds/success.mp3'));
        } catch (e) {}

        Toast.show({
          type: 'success',
          text1: 'Herzlichen Glückwunsch! 🎉',
          text2: 'Training erfolgreich gespeichert.'
        });

        /*Toast.show({
            type: 'success',
            text1: '',
            text2: '',
            position: 'top',
            visibilityTime: 4000,
        });*/

        clearActiveWorkout();
        require("@/utils/workoutTimerStore").clearWorkoutTimer();
        if (editIdRef.current) require("@/utils/workoutEditingStore").clearEditingWorkout(editIdRef.current);

        router.dismissAll();
        router.navigate("/(tabs)/WorkoutScreenProxy");
      } catch (e) {
        console.error("Fehler beim Speichern:", e);
        showAlert("Fehler", "Training konnte nicht gespeichert werden");
      } finally {
        setLoading(false);
      }
    },
    [workout]
  );

  // Handle Save Changes (edit mode)
  const handleSaveChanges = useCallback(
    async (elapsedTime: number) => {
      // Logic for active workout: "Saving" in edit mode just applies changes locally.
      // Database persistence only happens on "Finish".
      if (!workout) return;
      
      setIsEditMode(false);
      
      // Update the workout state with current timer/details if needed
      // Note: workout state is already updated by set checks etc.
      // Ensuring it's in the editing store is handled by the useEffect in the screen.
      
      showAlert("Info", "Änderungen für aktuelles Training übernommen.");
    },
    [workout]
  );

  // Save Breaktime Change
  const saveBreakTime = useCallback(
    (exerciseId: string, newSeconds: number) => {
      if (!workout) return;
      const newSets = workout.exerciseSets.map((s) =>
        s.exerciseId === exerciseId ? { ...s, breaktime: newSeconds } : s
      );
      updateWorkoutState({ ...workout, exerciseSets: newSets });
    },
    [workout, updateWorkoutState]
  );

  // Save Set Data from Modal
  const saveSetData = useCallback(
    (
      tempSetData: { weight: number; reps: number; isDone?: boolean },
      activeOverlay: string,
      targetSetIndex: number | null,
      targetExerciseId: string | null,
      targetExerciseName: string | null
    ) => {
      if (!workout) return;
      let newSets = [...workout.exerciseSets];

      if (activeOverlay === "editSet" && targetSetIndex !== null) {
        newSets[targetSetIndex] = { ...newSets[targetSetIndex], ...tempSetData };
      } else if (activeOverlay === "addSet" && targetExerciseId) {
        newSets.push({
          id: `set_${Date.now()}`,
          exerciseId: targetExerciseId,
          exerciseName: targetExerciseName || "Unbekannt",
          ...tempSetData,
          breaktime: 30,
        });
      }

      updateWorkoutState({ ...workout, exerciseSets: newSets });
    },
    [workout, updateWorkoutState]
  );

  return {
    // State
    workout,
    originalWorkout,
    exercises,
    isEditMode,
    loading,
    // Setters
    setWorkout,
    setOriginalWorkout,
    setExercises,
    setIsEditMode,
    setLoading,
    setEditIdRef,
    // Handlers
    handleSetCheck,
    handleRemoveSet,
    handleDiscardWorkout,
    handleFinishWorkout,
    saveWorkoutToDatabase,
    handleSaveChanges,
    saveBreakTime,
    saveSetData,
    handleCancel,
  };
};
