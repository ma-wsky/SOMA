import { styles } from "@/app/(tabs)/_layout";
import ExerciseList from "@/app/components/ExerciseList";
import { TopBar } from "@/app/components/TopBar";
import { workoutStyles } from "@/app/styles/workoutStyles";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router"
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebaseConfig";




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

export default function SingleWorkoutInfoScreen() {
    
    const [loading,setLoading] = useState<boolean>(false);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [isFavorite, setFavorite] = useState<boolean|null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);

        const fetchWorkout = async () => {
            try{
                const globalRef = doc(db, "workouts", id);
                const globalSnap = await getDoc(globalRef);
                if (globalSnap.exists()) {
                    setWorkout({ id: globalSnap.id, ...globalSnap.data() } as Workout);
                    return;
                }

                const user = auth.currentUser;
                if (!user) return;

                const userRef = doc(db, "users", user.uid, "workouts", id);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setWorkout({ id: userSnap.id, ...userSnap.data() } as Workout);
                    return;
                }

                setWorkout(null);
            } catch (e) {
                console.error("Fehler beim Laden des Workouts:", e);
                setWorkout(null);
            } finally {
                setLoading(false);
            }

        };

        fetchWorkout();
    }, [id]);

    

    return (
        <View style={workoutStyles.container}>

            <TopBar leftButtonText={"Zurück"}
            titleText={"Training Info"}
            onLeftPress={() => router.back()}
            ></TopBar>

            <ExerciseList exercises={workout?.exercises || []}/>
            
        </View>
    );
}


