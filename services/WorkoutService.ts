import { db } from "@/firebaseConfig";
import {addDoc, collection, collectionGroup, deleteDoc, doc, getDoc, getDocs, query,
    serverTimestamp, setDoc, where, writeBatch } from "firebase/firestore";
import { WorkoutTemplate } from "@/types/WorkoutTemplate"
import { ExerciseSet } from "@/types/ExerciseSet"
import { Workout } from "@/types/Workout"

export const WorkoutService = {

    async fetchAllTemplates(userId: string): Promise<WorkoutTemplate[] | null> {

        const templatesRef = collection(db, "users", userId, "templates");
        const snapshot = await getDocs(templatesRef);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || "kein Name"
        }));
    },

    async fetchTemplate(userId: string, templateId: string): Promise<WorkoutTemplate | null> {

        const templateRef = doc(db, "users", userId, "templates", templateId);
        const templateSnap = await getDoc(templateRef);

        if (!templateSnap.exists()) return null;

        const data = templateSnap.data();

        const setsRef = collection(db, "users", userId, "templates", templateId, "sets");
        const setsSnap = await getDocs(setsRef);

        const exerciseSets = setsSnap.docs
            .map(s => ({ id: s.id, ...s.data() } as ExerciseSet))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        return {
            id: templateSnap.id,
            name: data.name || "kein Name",
            exerciseSets: exerciseSets,
        };
    },

    async deleteWorkout(userId: string, workoutId: string) {
        const workoutRef = doc(db, "users", userId, "workouts", workoutId);
        await deleteDoc(workoutRef);
        //TODO subcollections löschen
    },

    async createTemplate(userId: string, name: string, exerciseSets: ExerciseSet[]) {
        try {
            const batch = writeBatch(db);

            // 1. Referenz für das Template-Dokument erstellen (ID wird automatisch generiert)
            const templateRef = doc(collection(db, "users", userId, "templates"));

            // 2. Das Haupt-Dokument vorbereiten
            batch.set(templateRef, {
                name: name,
                createdAt: serverTimestamp(),
            });

            // 3. Für jeden Satz ein Dokument in der Subcollection "sets" erstellen
            exerciseSets.forEach((set) => {
                // Wir erstellen eine neue Referenz in der Subcollection
                const setRef = doc(collection(db, "users", userId, "templates", templateRef.id, "sets"));

                // Wir kopieren die Daten, entfernen aber die temporäre ID,
                // damit Firestore eine eigene ID nutzt (oder wir behalten sie, falls gewünscht)
                const { id, ...setData } = set;
                const cleanData = {
                    exerciseId: setData.exerciseId || "",
                    exerciseName: setData.exerciseName || "Unbekannte Übung",
                    image: setData.image || null,
                    weight: setData.weight ?? 0,
                    reps: setData.reps ?? 0,
                    breaktime: setData.breaktime ?? 60,
                    order: setData.order ?? 0,
                    isDone: false
                };

                batch.set(setRef, {
                    ...setData,
                    order: setData.order ?? 0
                });
            });

            // 4. Alles gleichzeitig absenden
            await batch.commit();
            return templateRef.id;

        } catch (error) {
            console.error("Fehler beim Erstellen des Templates:", error);
            throw error;
        }
    },

    async saveWorkoutHistory(userId: string, templateId: string, workoutName: string, activeSets: ExerciseSet[]) {
        try {
            const batch = writeBatch(db);

            // 1. Referenz für das History-Hauptdokument
            const historyRef = doc(collection(db, "users", userId, "history"));

            batch.set(historyRef, {
                templateId: templateId,
                name: workoutName,
                finishedAt: serverTimestamp(),
            });

            // 2. Alle Sets in die Subcollection schreiben
            activeSets.forEach((set) => {
                const setRef = doc(collection(db, "users", userId, "history", historyRef.id, "sets"));

                // Wir speichern das Set und markieren, ob es abgeschlossen wurde
                batch.set(setRef, {
                    ...set,
                    finishedAt: serverTimestamp()
                    // isDone ist bereits im set-Objekt enthalten, da wir es im State halten
                });
            });

            await batch.commit();
            return historyRef.id;
        } catch (error) {
            console.error("Fehler im WorkoutService beim Speichern der History:", error);
            throw error;
        }
    }
}