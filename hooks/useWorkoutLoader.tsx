/**
 * 1. useWorkoutLoader - Für ActiveWorkoutScreen
 *    - Lädt existierende Workouts ODER erstellt neue
 *    - Stellt Entwürfe aus workoutEditingStore wieder her
 *    - Setzt isDone auf false bei templates
 *    - Erhält startTime aus activeWorkoutStore
 *
 * 2. useSingleWorkoutLoader - Für SingleWorkoutInfoScreen
 *    - Lädt existierende Templates zur Bearbeitung
 *    - Erstellt leere Workouts für "Neues Training"
 *    - Stellt Entwürfe wieder her
 *    - Kein startTime-Handling (nicht für aktive Workouts)
 * 
 * TODO: 3 verschiedene Files
 * - Die gemeinsame Logik (Exercise-Loading, Set-Loading)
 *   in separate Utility-Funktionen extrahiert werden. (Alle identischen funktionen in useBaseWorkoutLoader)
 * - useWorkoutLoader -> useActiveWorkoutLoader
 * - useSingleWorkoutLoader -> uSeSingleWorkoutLoader
 */

import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";
import { showAlert } from "@/utils/helper/alertHelper";
import type { Workout, Exercise, ExerciseSet } from "@/types/workoutTypes";

interface LoadWorkoutParams {
  id?: string | string[];
  workoutEditId?: string | string[];
  setWorkout: Dispatch<SetStateAction<Workout | null>>;
  setOriginalWorkout?: Dispatch<SetStateAction<Workout | null>>;
  setExercises?: Dispatch<SetStateAction<Map<string, Exercise>>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setEditIdRef?: (id: string) => void;
}


export const useWorkoutLoader = ({
  id,
  workoutEditId,
  setWorkout,
  setOriginalWorkout,
  setExercises,
  setLoading,
  setEditIdRef,
}: LoadWorkoutParams) => {
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

        if (setExercises) {
          setExercises(exercisesMap);
        }

        const currentEditId = (workoutEditId || id || `temp_${Date.now()}`) as string;
        if (setEditIdRef) {
          setEditIdRef(currentEditId);
        }

        // Case 1: Existing Workout
        if (id != null) {
          const userRef = doc(db, "users", user.uid, "workouts", id as string);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const workoutData = userSnap.data() as Omit<Workout, "id" | "exerciseSets">;

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

            // Try to restore draft first
            const draft = require("@/utils/store/workoutEditingStore").getEditingWorkout(currentEditId);
            
            // Try to get active start time
            const activeStore = require("@/utils/store/activeWorkoutStore").getActiveWorkout();
            const preservedStartTime = (activeStore?.id === id) ? activeStore.startTime : undefined;

            if (draft) {
              setWorkout(draft);
              if (setOriginalWorkout) setOriginalWorkout({
                id: userSnap.id,
                ...workoutData,
                exerciseSets,
                startTime: preservedStartTime || draft.startTime || Date.now(),
              });
            } else {
              // Reset isDone when starting fresh from a template
              const cleanSets = exerciseSets.map(s => ({ ...s, isDone: false }));
              
              const loadedW = {
                id: userSnap.id,
                ...workoutData,
                date: new Date().toISOString(), // Aktuelles Datum beim Start, nicht Template-Datum
                exerciseSets: cleanSets,
                startTime: preservedStartTime || Date.now(),
              };
              setWorkout(loadedW);
              if (setOriginalWorkout) setOriginalWorkout(loadedW);
            }
            return;
          }
        }

        const draft = require("@/utils/store/workoutEditingStore").getEditingWorkout(currentEditId);
        
        const activeStore = require("@/utils/store/activeWorkoutStore").getActiveWorkout();
        const preservedStartTime = activeStore ? activeStore.startTime : undefined;

        if (draft) {
          setWorkout((currentWorkout) => {
            if (JSON.stringify(currentWorkout) !== JSON.stringify(draft)) {
              return draft;
            }
            return currentWorkout;
          });
          if (setOriginalWorkout) setOriginalWorkout({
             ...draft,
             startTime: preservedStartTime || draft.startTime || Date.now(),
          } as Workout);
        } else {
          const newW = {
            id: currentEditId,
            date: new Date().toISOString(),
            exerciseSets: [],
            startTime: preservedStartTime || Date.now(),
          };
          setWorkout(newW);
          if (setOriginalWorkout) setOriginalWorkout(newW);
        }
      } catch (e) {
        console.error("Fehler beim Laden des Workouts:", e);
        showAlert("Fehler", "Workout konnte nicht geladen werden");
      } finally {
        setLoading(false);
      }
    };

    loadWorkoutData();
  }, [id, workoutEditId]);
};


export const useSingleWorkoutLoader = ({
  id,
  workoutEditId,
  setWorkout,
  setOriginalWorkout,
  setExercises,
  setLoading,
  setEditIdRef,
  isCreateMode,
}: LoadWorkoutParams & { isCreateMode?: boolean }) => {
  useEffect(() => {
    const fetchWorkout = async () => {
      setLoading(true);
      try {
        // Load exercises first
        const exercisesMap = new Map<string, Exercise>();
        const exercisesSnapshot = await getDocs(collection(db, "exercises"));
        exercisesSnapshot.forEach((doc) => {
          exercisesMap.set(doc.id, { id: doc.id, ...doc.data() } as Exercise);
        });

        if (setExercises) {
          setExercises(exercisesMap);
        }

        // Set edit ref
        const normalizedEditId = Array.isArray(workoutEditId) ? workoutEditId[0] : workoutEditId;
        const editId = normalizedEditId || (id ? `workout_${id}` : `new_${Date.now()}`);
        if (setEditIdRef) {
          setEditIdRef(editId);
        }

        // New workout, initialize only if no draft exists
        if (!id) {
          const emptyWorkout: Workout = {
            date: new Date().toISOString(),
            exerciseSets: [],
            name: "",
          };

          if (setOriginalWorkout) {
            setOriginalWorkout(emptyWorkout);
          }

          const draft = editId ? require("@/utils/store/workoutEditingStore").getEditingWorkout(editId) : null;
          if (draft) {
            // Prevent infinite loop by checking if draft is different from current state
            setWorkout((currentWorkout) => {
              if (JSON.stringify(currentWorkout) !== JSON.stringify(draft)) {
                return draft;
              }
              return currentWorkout;
            });
          } else {
            // Only set initial empty workout if no draft exists
            setWorkout(emptyWorkout);
          }
          return;
        }

        // Existing Workout
        const user = auth.currentUser;
        if (!user) {
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
            });
          });

          const loadedWorkout = {
            id: userSnap.id,
            name: userSnap.data().name || "",
            date: userSnap.data().date,
            exerciseSets: sets,
          };

          setWorkout(loadedWorkout);
          if (setOriginalWorkout) {
            setOriginalWorkout(loadedWorkout);
          }

          // Check if there is a draft overlaying the existing workout
          const draft = editId ? require("@/utils/store/workoutEditingStore").getEditingWorkout(editId) : null;
          if (draft) {
             setWorkout(draft);
          }
        }
      } catch (e) {
        console.error("Fehler beim Laden des Workouts:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, workoutEditId]); // Nur id und workoutEditId als Dependencies - Setter sind stabil
};
