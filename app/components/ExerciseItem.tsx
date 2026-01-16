import { Pressable, Text, Image, View } from "react-native";
import { exerciseStyles } from "@/app/styles/exerciseStyles"
import { Exercise } from "@/app/types/Exercise"

interface Props {
    exercise: Exercise;
    onPress?: (exercise: Exercise) => void;
}

export default function ExerciseItem({ exercise, onPress }: Props) {
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
            </View>
        </Pressable>
    );
}