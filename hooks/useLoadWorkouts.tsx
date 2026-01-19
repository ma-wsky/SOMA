import { useState, useEffect, useCallback } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, doc } from "firebase/firestore";
import { Workout,Exercise, ExerciseSet } from "@/types/workoutTypes";


export function useLoadWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWorkouts = useCallback(async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      console.error("Kein User angemeldet.");
      setLoading(false);
      return;
    }

    try {
      // Load exercises first for enrichment
      const exercisesMap = new Map<string, Exercise>();
      const exercisesSnapshot = await getDocs(collection(db, "exercises"));
      exercisesSnapshot.forEach((doc) => {
        exercisesMap.set(doc.id, { id: doc.id, ...doc.data() } as Exercise);
      });

      // Load user's workouts
      const userWorkoutsRef = collection(db, "users", user.uid, "workouts");
      const snapshotU = await getDocs(userWorkoutsRef);

      const userWorkouts: Workout[] = [];
      for (const workoutDoc of snapshotU.docs) {
        const workoutData = workoutDoc.data();
        
        // Only include "template" workouts (skip "history" only ones)
        if (workoutData.type === "history") continue;
        
        // Load exercise sets from subcollection
        const setsSnapshot = await getDocs(collection(workoutDoc.ref, "exerciseSets"));
        const sets: ExerciseSet[] = [];
        setsSnapshot.forEach((setDoc) => {
          const data = setDoc.data();
          const exercise = exercisesMap.get(data.exerciseId);
          sets.push({
            id: setDoc.id,
            ...data,
            exerciseName: exercise?.name,
          } as ExerciseSet);
        });

        //TODO andere attribute nicht ??
        userWorkouts.push({
          id: workoutDoc.id,
          date: workoutData.date || "",
          name: workoutData.name || "Unnamed Workout",
          exerciseSets: sets,
          type: workoutData.type || "template",
        });
      }

      setWorkouts(userWorkouts);
    } catch (e) {
      console.error("Fehler beim Laden der Workouts:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  return { workouts, setWorkouts, loading, refetch: loadWorkouts };
}

