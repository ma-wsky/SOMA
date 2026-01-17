import { Pressable, Text, Image, View, StyleSheet } from "react-native";
import { exerciseStyles } from "@/app/styles/exerciseStyles"
import { Exercise } from "@/app/types/Exercise"
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from "../styles/theme"


interface Props {
    exercise: Exercise;
    onPress?: (exercise: Exercise) => void;
    onAddToWorkout?: (exercise: Exercise) => void;
    showAddButton?: boolean;
}

export default function ExerciseItem({ exercise, onPress, onAddToWorkout, showAddButton = false }: Props) {
    return (
        <Pressable
            onPress={() => onPress?.(exercise)}
            style={({ pressed }) => [
                exerciseStyles.itemButton,
                { opacity: pressed ? 0.7 : 1.0 }
            ]}
        >
            <View style={exerciseStyles.itemContainer}>
                {/* picture */}
                <Image
                    source={
                        exercise.image
                            ? { uri: exercise.image }
                            : require('@/app/assets/default-exercise-picture/default-exercise-picture.jpg')
                    }
                    style={exerciseStyles.itemPicture}
                />

                <View style={exerciseStyles.textContainer}>
                    <Text style={exerciseStyles.name}>{exercise.name}</Text>

                    <Text style={exerciseStyles.muscle}>{exercise.muscleGroup || "k.A."}</Text>
                </View>
                {showAddButton && onAddToWorkout ? (
                <Pressable onPress={() => onAddToWorkout?.(exercise)} style={styles.addButton}>
                  <Ionicons name="add" size={20} color={Colors.primary} />
                </Pressable>
              ) : null}
            </View>
        </Pressable>
    );
}
const styles = StyleSheet.create({
    
    addButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#111',
      alignItems: 'center',
      justifyContent: 'center'
    },
})
