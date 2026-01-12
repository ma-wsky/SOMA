import { Pressable, Text, StyleSheet } from "react-native";

interface Props {
    wExercise: WorkoutExercise;
    onPress?: (wExercise: WorkoutExercise) => void;
}

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


export default function WorkoutExerciseItem({ wExercise, onPress }: Props) {
    return (
        <Pressable
            onPress={() => onPress?.(wExercise)}
            style={styles.button}>
            <Text style={styles.name}>Übung ID: {wExercise.id}</Text>
            <Text style={styles.detail}>Pausenzeit: {wExercise.breakTime} Sekunden</Text>
            <Text style={styles.detail}>Anzahl der Sätze: {wExercise.sets.length}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 12,
        marginVertical: 4,
        borderRadius: 10,
        backgroundColor: "#222",
    },
    name: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff"
    },
    detail: {
        color: "#aaa",
        marginTop: 2
    },
}   )

