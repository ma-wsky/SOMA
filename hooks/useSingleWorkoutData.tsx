import { useCallback } from "react";
import { writeBatch, doc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";
import { showAlert, showConfirm } from "@/utils/helper/alertHelper";
import type { Workout } from "@/types/workoutTypes";
import { useBaseWorkoutData } from "@/hooks/useBaseWorkoutData";
import { useLoadWorkouts } from "./useLoadWorkouts";
import { Alert } from "react-native";

export const useSingleWorkoutData = (initialWorkout?: Workout | null) => {

  const baseData = useBaseWorkoutData(initialWorkout);
  const { 
    workout, 
    setWorkout,
    originalWorkout,
    setOriginalWorkout,
    setLoading
  } = baseData;

  const { workouts, loading: workoutsLoading, refetch } = useLoadWorkouts();
    const checkNameExists = (nameToCheck: string) => {
        if (!nameToCheck || workouts.length === 0) return false;

        return workouts.some((w) => {
            const isSameName = w.name.trim().toLowerCase() === nameToCheck.trim().toLowerCase();
            // Falls wir editieren, darf er das eigene Workout nicht als "bereits existierend" zählen
            const isDifferentWorkout = w.id !== workout?.id;
            return isSameName && isDifferentWorkout;
        });
    };


  const editIdRef = { current: null as string | string[] | null };
  const setEditIdRefWrapped = useCallback((id: string | string[]) => {
    editIdRef.current = id;
    baseData.setEditIdRef(id as string);
  }, [baseData]);

  const handleSaveWorkout = useCallback(
    async (id?: string | string[], onSuccess?: (newId: string) => void) => {
      if (!workout) return;


        if (!workout.name || workout.exerciseSets.length === 0) {
            showAlert(
                "Fehler",
                "Bitte geben Sie einen Trainingsnamen ein und fügen Sie mindestens einen Satz hinzu."
            );
            return;
        }

        if (workoutsLoading) {
            showAlert("Bitte warten", "Daten werden noch geladen...");
            return;
        }


      if (checkNameExists(workout.name)){
          Alert.alert("Fehler", "Ein Workout mit diesem Namen existiert bereits.");
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
              showAlert("Fehler", "Sie müssen angemeldet sein.");
              return;
            }

            const workoutId = (id || workout.id || Date.now().toString()) as string;
            const workoutRef = doc(db, "users", user.uid, "workouts", workoutId);

            const batch = writeBatch(db);

            const savedWorkoutData = {
              date: workout.date,
              name: workout.name,
              type: "template",
            };

            batch.set(workoutRef, savedWorkoutData);

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
                isDone: false,
              });
            });

            await batch.commit();

            if (editIdRef.current) {
              require("@/utils/store/workoutEditingStore").clearEditingWorkout(editIdRef.current);
            }

            const updatedWorkout = { ...workout, id: workoutId };
            setWorkout(updatedWorkout);
            setOriginalWorkout(updatedWorkout);

            showAlert("Erfolg", "Training gespeichert");
            if (onSuccess) onSuccess(workoutId);
          } catch (e) {
            console.error("Fehler beim Speichern:", e);
            showAlert("Fehler", "Training konnte nicht gespeichert werden.");
          } finally {
            setLoading(false);
          }
        }
      );
    },
      [workout, workouts, workoutsLoading, setLoading, setWorkout, setOriginalWorkout]
  );

  return {
    ...baseData,
    exercisesMap: baseData.exercises,
    setExercisesMap: baseData.setExercises,
    setEditIdRef: setEditIdRefWrapped,
    editIdRef,
    handleSaveWorkout,
  };
};
