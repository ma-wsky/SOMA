import { router } from "expo-router";
import { View,Text, Pressable, Animated, PanResponder } from "react-native";
import { workoutStyles as styles } from "../styles/workoutStyles"
import { Colors } from "../styles/theme"
import { useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { showConfirm } from "@/app/utils/alertHelper";


interface Props {
    workout: Workout;
    onPress?: (workout: Workout) => void;
    onDelete?: (workoutId: string) => void;
}

type Workout = {
    id?: string;
    name?: string;
    date: string;
    duration?: number;
    exerciseSets: ExerciseSet[];
};

type ExerciseSet = {
    id: string;
    name?: string;
    exerciseName?: string;
    exerciseId: string;
    breaktime?: number;
    weight?: number;
    reps?: number;
    isDone?: boolean;
};

export default function WorkoutItem({workout, onPress, onDelete}: Props) {
    const pan = useRef(new Animated.ValueXY()).current;
    const [isDeleting, setIsDeleting] = useState(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
            onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx < -100) {
                    // Swiped left - show delete
                    Animated.spring(pan, {
                        toValue: { x: -100, y: 0 },
                        useNativeDriver: false,
                    }).start();
                    setIsDeleting(true);
                } else {
                    // Snap back
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false,
                    }).start();
                    setIsDeleting(false);
                }
            }
        })
    ).current;

    const handleDelete = () => {
        showConfirm(
            "Training löschen",
            "Möchten Sie dieses Training wirklich löschen?",
            () => {
                if (onDelete && workout.id) {
                    onDelete(workout.id);
                }
            },
            { confirmText: "Löschen", cancelText: "Abbrechen" }
        );
    };

    return (
        <View style={{...styles.itemContainer, overflow: 'hidden', position: 'relative'}}>
            {/* Delete Background */}
            <View style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: 100, backgroundColor: '#ff4444', justifyContent: 'center', alignItems: 'center'}}>
                <Pressable onPress={handleDelete}>
                    <Ionicons name="trash" size={28} color="white" />
                </Pressable>
            </View>

            {/* Swipeable Content */}
            <Animated.View 
                style={[{ transform: [{ translateX: pan.x }] }]} 
                {...panResponder.panHandlers}
            >

            <Pressable
                onPress={() => {router.push({pathname: "/screens/workout/SingleWorkoutInfoScreen", params: {id: workout.id}})}}
            >
                <Text style={styles.itemTitle}>{workout.name}</Text>
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
                <Text style={styles.itemButtonText}>Training starten</Text>
            </Pressable>
            </Animated.View>
        </View>
    );
}
