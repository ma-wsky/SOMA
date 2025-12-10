import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { db } from "./firebaseConfig";
import { collection, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

type Workout = { id: string; name: string; duration: number };

export default function Index() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "workouts"), snapshot => {
            const data: Workout[] = snapshot.docs.map(doc => {
                const docData = doc.data() as { name: string; duration: number };
                return { id: doc.id, ...docData };
            });
            setWorkouts(data);
        });

        return () => unsubscribe();
    }, []);

    const addWorkout = async () => {
        await addDoc(collection(db, "workouts"), {
            name: "Pushups",
            duration: 15,
            createdAt: serverTimestamp(),
        });
    };

    return (
        <View style={{ padding: 20 }}>
            <Button title="Workout hinzufügen" onPress={addWorkout} />
            {workouts.map(w => (
                <Text key={w.id}>{w.name} – {w.duration} min</Text>
            ))}
        </View>
    );
}