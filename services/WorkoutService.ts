import { db } from "@/firebaseConfig";
import {collection, collectionGroup, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { WorkoutTemplate } from "@/types/WorkoutTemplate"
import { ExerciseSet } from "@/types/ExerciseSet"

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
    }
}