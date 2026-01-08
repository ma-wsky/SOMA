import { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

type Workout = {
    id: string;
    name: string;
    duration: number;
    exercises: WorkoutExercise[];
};

type WorkoutExercise = {
    id: string;
    breakTime: number;
    sets: Set[];
};

type Set = {
    reps: number;
    weight: number;
    isDone: boolean;
};

export function useLoadWorkout() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadWorkouts = async () => {
            setLoading(true);
            const user = auth.currentUser;
            if (!user) {
                console.error("Kein User angemeldet.");
                setLoading(false);
                return;
            }

            try {
                const qGlobal=collection(db, "workouts");
                const qUser=collection(db, "users", user.uid, "workouts");

                const [snapshotG, snapshotU] = await Promise.all([
                    getDocs(qGlobal),
                    getDocs(qUser),
                ]);

                const globalWorkouts = snapshotG.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || "unnamed",
                    duration: doc.data().duration || 0,
                    exercises: doc.data().exercises || [],
                }));

                const userWorkouts = snapshotU.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || "unnamed",
                    duration: doc.data().duration || 0,
                    exercises: doc.data().exercises || [],
                }));

                setWorkouts([...globalWorkouts, ...userWorkouts]);
            } catch (e) {
                console.error("Fehler beim Laden der Workouts:", e);
            } finally {
                setLoading(false);
            }
        };

        loadWorkouts();
    }, []);

    return { workouts, setWorkouts, loading };
}

