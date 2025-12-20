import { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

type Exercise = {
    id: string;
    name: string;
    muscleGroup?: string;
    isFavorite: boolean;
};
export function useLoadExercises() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadExercises = async () => {
            setLoading(true);
            const user = auth.currentUser;
            if (!user) {
                console.error("Kein User angemeldet.");
                setLoading(false);
                return;
            }

            try {
                // Globale Übungen
                const qGlobal = query(
                    collection(db, "exercises"),
                    where("isGlobal", "==", true)
                );

                // User-Übungen
                const qUser = collection(db, "users", user.uid, "exercises");

                // Favoriten
                const qFav = collection(db, "users", user.uid, "favorites");

                const [snapshotG, snapshotU, snapshotF] = await Promise.all([
                    getDocs(qGlobal),
                    getDocs(qUser),
                    getDocs(qFav),
                ]);

                const favoriteIds = new Set(snapshotF.docs.map(d => d.id));

                const globalExercises = snapshotG.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || "unnamed",
                    ...doc.data(),
                    isFavorite: favoriteIds.has(doc.id),
                }));

                const userExercises = snapshotU.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || "unnamed",
                    ...doc.data(),
                    isFavorite: favoriteIds.has(doc.id),
                }));

                setExercises([...globalExercises, ...userExercises]);
            } catch (e) {
                console.error("Fehler beim Laden:", e);
            } finally {
                setLoading(false);
            }
        };

        loadExercises();
    }, []);

    return { exercises, setExercises, loading };
}
