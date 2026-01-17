import { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Exercise } from "@/app/types/Exercise"


export function useLoadExercises() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const loadExercises = async () => {

            const user = auth.currentUser;
            if (!user) {
                setLoading(false);
                setExercises([]);
                return;
            }
            setLoading(true);

            try {
                const globalRef = collection(db, "exercises");
                const userRef = collection(db, "users", user.uid, "exercises");
                const favRef = collection(db, "users", user.uid, "favorites");

                const [snapshotG, snapshotU, snapshotF] = await Promise.all([
                    getDocs(globalRef),
                    getDocs(userRef),
                    getDocs(favRef),
                ]);

                const favoriteIds = new Set(snapshotF.docs.map(doc => doc.id));

                const mapDoc = (doc: any, isOwn: boolean): Exercise => ({
                    id: doc.id,
                    name: doc.data().name || "Unbenannte Übung",
                    ...doc.data(),
                    isFavorite: favoriteIds.has(doc.id),
                    isOwn: isOwn,
                    isGlobal: !isOwn,
                });
                const globalList = snapshotG.docs.map(doc => mapDoc(doc, false));
                const userList = snapshotU.docs.map(doc => mapDoc(doc, true));

                setExercises([...globalList, ...userList]);
            } catch (e) {
                console.error("Fehler im useLoadExercises Hook:", e);
            } finally {
                setLoading(false);
            }
        };
        loadExercises();
    }, []);

    return { exercises, setExercises, loading };
}
