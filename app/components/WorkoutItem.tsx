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
    date: string;
    duration: number;
    exerciseSets: ExerciseSet[];
};

type ExerciseSet = {
    id: string;
    exerciseName: string;
    exerciseId: string;
    weight: number;
    reps: number;
    isDone: boolean;
};

export default function WorkoutItem({workout, onPress}: Props) {
    return (
        <View style={styles.itemContainer}>

            <Pressable
                onPress={() => {router.push({pathname: "/screens/workout/SingleWorkoutInfoScreen", params: {id: workout.id}})}}
            >
                <Text style={styles.title}>{workout.name}</Text>
                <Text style={{color: "#aaa", fontSize: 12, marginTop: 4}}>
                    {workout.exerciseSets.length} Sets
                </Text>
            </Pressable>

            <Pressable
                onPress={() => {router.push({pathname: "/screens/workout/ActiveWorkoutScreen", params: {id: workout.id}})}}
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
