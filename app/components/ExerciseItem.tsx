import { Pressable, Text, StyleSheet } from "react-native";
import { Colors } from "../styles/theme"


interface Props {
    exercise: Exercise;
    onPress?: (exercise: Exercise) => void;
    onAddToWorkout?: (exercise: Exercise) => void;
}

type Exercise = {
    id: string;
    name: string;
    muscleGroup?: string;
    ownerId?: string | null;
    isGlobal?: boolean;
};

export default function ExerciseItem({ exercise, onPress }: Props) {
    return (
        <Pressable
            onPress={() => onPress?.(exercise)}
            style={styles.button}>

            <Text style={styles.name}>{exercise.name}</Text>

            <Text style={styles.muscle}>{exercise.muscleGroup}</Text>




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
})
