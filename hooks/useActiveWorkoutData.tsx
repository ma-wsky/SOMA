// Custom hook for managing ActiveWorkoutScreen data and operations
// Handles workout state, exercise management, and database operations

import { useState, useEffect, useRef, useCallback } from "react";
import { writeBatch, doc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";
import { setActiveWorkout, clearActiveWorkout } from "@/utils/activeWorkoutStore";
import { showAlert, showConfirm, showChoice } from "@/utils/alertHelper";
import type { Workout, Exercise, ExerciseSet } from "@/types/workoutTypes";
import { minSecToSeconds } from "@/components/NumberStepper";

export const useActiveWorkoutData = (initialWorkout?: Workout | null) => {
  const [workout, setWorkout] = useState<Workout | null>(initialWorkout || null);
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
        // Navigation handled by parent
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

        const workoutId = workout.id || Date.now().toString();
        const workoutRef = doc(db, "users", user.uid, "workouts", workoutId);

        const batch = writeBatch(db);
        batch.set(workoutRef, {
          date: workout.date,
          name: workout.name,
          duration: 0, // Should be calculated from timer
          type: type,
        });

        const setsRef = collection(workoutRef, "exerciseSets");
        const existingSets = await getDocs(setsRef);
        existingSets.forEach((d) => batch.delete(d.ref));

        workout.exerciseSets.forEach((set, index) => {
          const setDocName = `set_${index.toString().padStart(3, "0")}`;
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
        // Navigation handled by parent
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
      if (!workout) return;
      if (!workout.name || workout.exerciseSets.length === 0) {
        showAlert(
          "Fehler",
          "Bitte geben Sie einen Trainingsnamen ein und fügen Sie mindestens einen Satz hinzu."
        );
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

        if (editIdRef.current) require("@/utils/workoutEditingStore").clearEditingWorkout(editIdRef.current);
      } catch (e) {
        console.error("Fehler beim Speichern:", e);
        showAlert("Fehler", "Änderungen konnten nicht gespeichert werden");
      } finally {
        setLoading(false);
      }
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
    exercises,
    isEditMode,
    loading,
    // Setters
    setWorkout,
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
  };
};
