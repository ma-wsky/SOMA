// Custom hook for managing SingleWorkoutInfoScreen data and operations
// Handles template/workout editing and database operations

import { useState, useRef, useCallback } from "react";
import { writeBatch, doc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";
import { showAlert, showConfirm } from "@/utils/alertHelper";
import type { Workout, Exercise, ExerciseSet } from "@/types/workoutTypes";

export const useSingleWorkoutData = (initialWorkout?: Workout | null) => {
  const [workout, setWorkout] = useState<Workout | null>(initialWorkout || null);
  const [exercisesMap, setExercisesMap] = useState<Map<string, Exercise>>(new Map());
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const editIdRef = useRef<string | string[]>(null);

  // Handle Remove Set
  const handleRemoveSet = useCallback((index: number) => {
    setWorkout((prev: Workout | null) => {
      if (!prev) return null;
      return { ...prev, exerciseSets: prev.exerciseSets.filter((_: ExerciseSet, i: number) => i !== index) };
    });
  }, []);

  // Handle Save Workout
  const handleSaveWorkout = useCallback(
    async (id?: string | string[]) => {
      if (!workout) return;

      if (!workout.name || workout.exerciseSets.length === 0) {
        showAlert(
          "Fehler",
          "Bitte geben Sie einen Trainingsnamen ein und fügen Sie mindestens einen Satz hinzu."
        );
        return;
      }

      showConfirm(
        "Training speichern",
        "Änderungen speichern?",
        async () => {
          setLoading(true);
          try {
            const user = auth.currentUser;
            if (!user) {
              showAlert("Fehler", "Sie müssen angemeldet sein");
              return;
            }

            const workoutId = (id || Date.now().toString()) as string;
            const workoutRef = doc(db, "users", user.uid, "workouts", workoutId);

            const batch = writeBatch(db);

            batch.set(workoutRef, {
              date: workout.date,
              name: workout.name,
              type: "template",
            });

            const setsRef = collection(workoutRef, "exerciseSets");
            const existingSets = await getDocs(setsRef);
            existingSets.forEach((doc) => {
              batch.delete(doc.ref);
            });

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

            if (editIdRef.current) {
              require("@/utils/workoutEditingStore").clearEditingWorkout(editIdRef.current);
            }

            showAlert("Erfolg", "Training gespeichert");
            // Navigation handled by parent
          } catch (e) {
            console.error("Fehler beim Speichern:", e);
            showAlert("Fehler", "Training konnte nicht gespeichert werden.");
          } finally {
            setLoading(false);
          }
        }
      );
    },
    [workout]
  );

  // Save Breaktime Change
  const saveBreakTime = useCallback(
    (exerciseId: string, newSeconds: number) => {
      setWorkout((prev: Workout | null) => {
        if (!prev) return null;
        const newSets = prev.exerciseSets.map((s: ExerciseSet) =>
          s.exerciseId === exerciseId ? { ...s, breaktime: newSeconds } : s
        );
        return { ...prev, exerciseSets: newSets };
      });
    },
    []
  );

  // Save Set Data from Modal
  const saveSetData = useCallback(
    (
      tempSetData: { weight: number; reps: number },
      activeOverlay: string,
      targetSetIndex: number | null,
      targetExerciseId: string | null,
      targetExerciseName: string | null
    ) => {
      setWorkout((prev: Workout | null) => {
        if (!prev) return null;
        let newSets = [...prev.exerciseSets];

        if (activeOverlay === "breaktime" && targetExerciseId) {
          // Already handled by saveBreakTime
          return prev;
        } else if (activeOverlay === "editSet" && targetSetIndex !== null) {
          newSets[targetSetIndex] = { ...newSets[targetSetIndex], ...tempSetData };
        } else if (activeOverlay === "addSet" && targetExerciseId) {
          newSets.push({
            id: `set_${Date.now()}`,
            exerciseId: targetExerciseId,
            exerciseName: targetExerciseName || "",
            weight: tempSetData.weight,
            reps: tempSetData.reps,
            breaktime: 30,
            isDone: false,
          });
        }

        return { ...prev, exerciseSets: newSets };
      });
    },
    []
  );

  const setEditIdRef = useCallback((id: string | string[]) => {
    editIdRef.current = id;
  }, []);

  return {
    // State
    workout,
    exercisesMap,
    isEditMode,
    loading,
    editIdRef,
    // Setters
    setWorkout,
    setExercisesMap: setExercisesMap,
    setIsEditMode,
    setLoading,
    setEditIdRef,
    // Handlers
    handleRemoveSet,
    handleSaveWorkout,
    saveBreakTime,
    saveSetData,
  };
};
