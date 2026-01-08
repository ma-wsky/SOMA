import { router } from "expo-router";
import { View,Text, Pressable } from "react-native";
import { workoutStyles as styles } from "../styles/workoutStyles"
import { Colors } from "../styles/theme"


interface Props {
    workout: Workout;
    onPress?: (workout: Workout) => void;
}

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

export default function WorkoutItem({workout, onPress}: Props) {
    return (
        <View style={styles.itemContainer}>

            <View>
                <Text style={styles.title}>{workout.name}</Text>
            </View>

            <Pressable
                onPress={() => {router.push("/screens/workout/ActiveWorkoutScreen")}}
                style={({ pressed }) => [
                    styles.itemButton,
                    {backgroundColor: pressed ? Colors.secondary : Colors.primary},
                    {borderColor: pressed ? Colors.secondary : Colors.primary}
                ]}
            >
                <Text style={styles.buttonText}>Training starten</Text>
            </Pressable>
        </View>
    );
}
