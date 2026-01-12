import { Pressable, Text, StyleSheet, View } from "react-native";
import { Colors } from "../styles/theme"
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
    data: Exercise | WorkoutExercise;
    type?: 'exercise' | 'workoutExercise';
    onPress?: (data: Exercise | WorkoutExercise) => void;
    onAdd?: (data: Exercise | WorkoutExercise) => void;
}

type Exercise = {
    id: string;
    name: string;
    muscleGroup?: string;
    ownerId?: string | null;
    isGlobal?: boolean;
    isFavorite?: boolean;
    isOwn?: boolean;
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

export default function ExerciseItem({ data, type = 'exercise', onPress, onAdd }: Props) {
    const isWorkoutExercise = type === 'workoutExercise' || 'breakTime' in data;
    
    return (
        <Pressable
            onPress={() => onPress?.(data)}
            style={styles.button}>

            {isWorkoutExercise ? (
                <>
                    <Text style={styles.name}>Übung: {(data as WorkoutExercise).id}</Text>
                    <Text style={styles.detail}>Pausenzeit: {(data as WorkoutExercise).breakTime}s</Text>
                    <Text style={styles.detail}>Sätze: {(data as WorkoutExercise).sets.length}</Text>
                </>
            ) : (
                <>
                    <Text style={styles.name}>{(data as Exercise).name}</Text>
                    {(data as Exercise).muscleGroup && (
                        <Text style={styles.muscle}>{(data as Exercise).muscleGroup}</Text>
                    )}
                </>
            )}

            {onAdd && (
                <Pressable
                    onPress={() => onAdd?.(data)}
                    hitSlop={10}
                    style={{ padding: 8 }}
                >
                    <Feather name="plus" size={22} color="white" />
                </Pressable>
            )}

        </Pressable>

    );
}


const styles = StyleSheet.create({
    button: {
        padding: 12,
        marginVertical: 4,
        borderRadius: 10,
        backgroundColor: Colors.black,
    },
    name: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff"
    },
    muscle: {
        color: "#aaa",
        marginTop: 2
    },
    detail: {
        color: "#aaa",
        marginTop: 2,
        fontSize: 14,
    },
})
