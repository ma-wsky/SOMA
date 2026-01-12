import { TopBar } from "@/app/components/TopBar";
import { workoutStyles } from "@/app/styles/workoutStyles";
import { View, Text, FlatList } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/app/firebaseConfig";
import LoadingOverlay from "@/app/components/LoadingOverlay";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  instructions: string;
};

type ExerciseSet = {
  id?: string;
  exerciseId: string;
  exerciseName?: string;
  weight: number;
  reps: number;
  isDone?: boolean;
};

type Workout = {
  id: string;
  date: string;
  exerciseSets: ExerciseSet[];
};

export default function SingleWorkoutInfoScreen() {
  const [loading, setLoading] = useState<boolean>(false);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercisesMap, setExercisesMap] = useState<Map<string, Exercise>>(new Map());

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const fetchWorkout = async () => {
      try {
        // Load exercises first
        const exercisesMap = new Map<string, Exercise>();
        const exercisesSnapshot = await getDocs(collection(db, "exercises"));
        exercisesSnapshot.forEach((doc) => {
          exercisesMap.set(doc.id, { id: doc.id, ...doc.data() } as Exercise);
        });
        setExercisesMap(exercisesMap);

        const user = auth.currentUser;
        if (!user) {
          setWorkout(null);
          return;
        }

        const userRef = doc(db, "users", user.uid, "workouts", id);
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
              ...data,
              exerciseName: exercise?.name,
            } as ExerciseSet);
          });

          setWorkout({
            id: userSnap.id,
            date: userSnap.data().date,
            exerciseSets: sets,
          });
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

  if (!workout) {
    return (
      <View style={workoutStyles.container}>
        <TopBar
          leftButtonText={"Zurück"}
          titleText={"Training Info"}
          onLeftPress={() => router.back()}
        />
        <Text>Workout nicht gefunden</Text>
        <LoadingOverlay visible={loading} />
      </View>
    );
  }

  return (
    <View style={workoutStyles.container}>
      <TopBar
        leftButtonText={"Zurück"}
        titleText={"Training Info"}
        onLeftPress={() => router.back()}
      />

      <Text style={workoutStyles.title}>Training vom {workout.date}</Text>

      <FlatList
        data={workout.exerciseSets}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item: set }) => (
          <View style={{ backgroundColor: "#222", borderRadius: 10, padding: 14, marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
              {set.exerciseName || set.exerciseId}
            </Text>
            <Text style={{ fontSize: 14, color: "#aaa", marginTop: 8 }}>
              {set.reps} Wiederholungen @ {set.weight}kg
            </Text>
            {set.isDone && (
              <Text style={{ fontSize: 12, color: "#4CAF50", marginTop: 4 }}>✓ Abgeschlossen</Text>
            )}
          </View>
        )}
      />

      <LoadingOverlay visible={loading} />
    </View>
  );
}
