import { Pressable, Text, StyleSheet, View } from "react-native";
import { Colors } from "../styles/theme"
import Ionicons from '@expo/vector-icons/Ionicons';


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

export default function ExerciseItem({ exercise, onPress, onAddToWorkout }: Props) {
    return (
        <Pressable
            onPress={() => onPress?.(exercise)}
            style={({pressed}) => [styles.button, pressed && styles.selected]}
        >
            <View style={styles.row}>
              <View style={styles.meta}>
                <Text style={styles.name}>{exercise.name}</Text>
                <Text style={styles.muscle}>{exercise.muscleGroup}</Text>
              </View>

              {onAddToWorkout ? (
                <Pressable onPress={() => onAddToWorkout?.(exercise)} style={styles.addButton}>
                  <Ionicons name="add" size={20} color={Colors.primary} />
                </Pressable>
              ) : null}
            </View>
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
    selected: {
        backgroundColor: '#333',
        borderColor: Colors.primary,
        borderWidth: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    meta: {
      flex: 1,
      marginRight: 8,
    },
    addButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#111',
      alignItems: 'center',
      justifyContent: 'center'
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
