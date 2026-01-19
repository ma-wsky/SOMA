import { db } from "@/firebaseConfig";
import {collectionGroup, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { Exercise } from "@/types/Exercise";

export const ExerciseService = {
    // 1. Übung inkl. Favoriten-Status laden
    async fetchExercise(id: string, userId: string): Promise<Exercise | null> {
        // Zuerst Global prüfen
        const globalRef = doc(db, "exercises", id);
        const globalSnap = await getDoc(globalRef);

        let exercise: Exercise | null = null;

        if (globalSnap.exists()) {
            exercise = { id: globalSnap.id, ...globalSnap.data() } as Exercise;
            exercise.isGlobal = true;
            exercise.isOwn = false;
        } else {
            // Dann User-spezifisch prüfen
            const userRef = doc(db, "users", userId, "exercises", id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                exercise = { id: userSnap.id, ...userSnap.data() } as Exercise;
                exercise.isGlobal = false;
                exercise.isOwn = true;
            }
        }

        if (exercise) {
            const favRef = doc(db, "users", userId, "favorites", id);
            const favSnap = await getDoc(favRef);
            exercise.isFavorite = favSnap.exists();
        }

        return exercise;
    },

    fetchHistory: async (exerciseId: string) => {
        if (!exerciseId) return [];

        try {
            const q = query(
                collectionGroup(db, "exerciseSets"),
                where("exerciseId", "==", exerciseId)
            );

            const qSnapshot = await getDocs(q);

            const data = qSnapshot.docs.map(doc => {
                const setData = doc.data();
                const workoutId = doc.ref.parent.parent?.id;

                const timestamp = workoutId ? parseInt(workoutId) : 0;

                return {
                    weight: setData.weight,
                    timestamp: timestamp,
                    date: timestamp > 0 ? new Date(timestamp) : new Date()
                };
            });

            return data.sort((a, b) => a.timestamp - b.timestamp);
        } catch (error) {
            console.error("Fehler im HistoryService:", error);
            return [];
        }
    },

    async toggleFavorite(exercise: Exercise, uid: string): Promise<boolean> {

        const favRef = doc(
            db,
            "users",
            uid,
            "favorites",
            exercise.id,
        );

        try {
            if (exercise.isFavorite) {
                await deleteDoc(favRef);
                return false;
            } else {
                await setDoc(favRef, {
                    name: exercise.name,
                    muscleGroup: exercise.muscleGroup,
                    equipment: exercise.equipment,
                    instructions: exercise.instructions,
                });
                return true;
            }
        } catch (e) {
            throw e;
        }
    }
}