import { Pressable, Text, Image, View, Animated, PanResponder } from "react-native";
import { workoutStyles } from "@/styles/workoutStyles";
import { Workout } from "@/types/Workout";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from "@/styles/theme";
import { useRef, useState } from "react";
import { showConfirm } from "@/utils/alertHelper";

interface Props {
    workout: Workout;
    onPress?: (workout: Workout) => void;
    onStartWorkout?: (workout: Workout) => void;
    onDelete?: (workoutId: string) => void;
}

export default function WorkoutItem({ workout, onPress, onStartWorkout, onDelete }: Props) {
    const pan = useRef(new Animated.ValueXY()).current;
    const [isDeleting, setIsDeleting] = useState(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
            onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx < -80) {
                    Animated.spring(pan, { toValue: { x: -80, y: 0 }, useNativeDriver: false }).start();
                    setIsDeleting(true);
                } else {
                    Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
                    setIsDeleting(false);
                }
            }
        })
    ).current;

    const handleDelete = () => {
        showConfirm(
            "Plan löschen",
            "Möchtest du diesen Plan wirklich löschen?",
            () => onDelete?.(workout.id),
            { confirmText: "Löschen", cancelText: "Abbrechen" }
        );
    };

    return (
        <View style={{ position: 'relative', overflow: 'hidden', marginBottom: 12 }}>
            {/* Delete Background Layer */}
            <View style={workoutStyles.deleteBackground}>
                <Pressable onPress={handleDelete} style={workoutStyles.deleteButton}>
                    <Ionicons name="trash" size={24} color="white" />
                </Pressable>
            </View>

            <Animated.View
                style={[{ transform: [{ translateX: pan.x }] }]}
                {...panResponder.panHandlers}
            >
                <Pressable
                    onPress={() => onPress?.(workout)}
                    style={({ pressed }) => [
                        workoutStyles.itemButton,
                        { opacity: pressed ? 0.7 : 1.0 }
                    ]}
                >
                    <View style={workoutStyles.itemContainer}>

                        <View style={workoutStyles.textContainer}>
                            <Text style={workoutStyles.name}>{workout.name}</Text>
                        </View>

                        {/* START BUTTON */}
                        <View style={workoutStyles.startButtonWrapper}>
                            {onStartWorkout && (
                                <Pressable
                                    onPress={() => onStartWorkout(workout)}
                                    style={({ pressed }) => [
                                        workoutStyles.startButton,
                                        { opacity: pressed ? 0.7 : 1.0 }
                                    ]}
                                >
                                    <Text style={workoutStyles.startButtonText}>Training starten</Text>
                                </Pressable>
                            )}
                        </View>


                    </View>
                </Pressable>
            </Animated.View>
        </View>
    );
}