import {router} from "expo-router";
import {Animated, PanResponder, Pressable, Text, View} from "react-native";
import {workoutStyles as styles} from "../styles/workoutStyles"
import {Colors} from "../styles/theme"
import {useRef} from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {showConfirm} from "@/utils/helper/alertHelper";
import {Workout} from "@/types/workoutTypes";


interface Props {
    workout: Workout;
    onPress?: (workout: Workout) => void;
    onDelete?: (workoutId: string) => void;
}


export default function WorkoutItem({workout, onDelete}: Props) {
    const pan = useRef(new Animated.ValueXY()).current;

    // swiping
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
            onPanResponderMove: (_, gestureState) => {
                //begrenzen der bewegung
                const clampedX = Math.max(-150, Math.min(0, gestureState.dx));
                pan.setValue({x: clampedX, y: 0});
            },
            onPanResponderRelease: (_, gestureState) => {
                const clampedX = Math.max(-150, Math.min(0, gestureState.dx));

                if (clampedX < -100) {
                    //links -> delete
                    Animated.spring(pan, {
                        toValue: {x: -100, y: 0},
                        useNativeDriver: false,
                    }).start();
                } else {
                    //snap back
                    Animated.spring(pan, {
                        toValue: {x: 0, y: 0},
                        useNativeDriver: false,
                    }).start();
                }
            }
        })
    ).current;

    const exerciseCount = new Set(workout.exerciseSets.map(set => set.exerciseId)).size;

    const handleDelete = () => {
        showConfirm(
            "Training löschen",
            "Möchten Sie dieses Training wirklich löschen?",
            () => {
                if (onDelete && workout.id) {
                    onDelete(workout.id);
                }
            },
            {confirmText: "Löschen", cancelText: "Abbrechen"}
        );
    };

    return (
        <View>
            {/* schaltfläche löschen */}
            <Pressable
                onPress={handleDelete}
                style={{
                    position: 'absolute',
                    borderRadius: 10,
                    right: 20,
                    top: 5,
                    bottom: 5,
                    width: 100,
                    backgroundColor: '#ff4444',
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <Ionicons name="trash" size={28} color={Colors.white}/>
            </Pressable>

            <Animated.View
                style={[{transform: [{translateX: pan.x}]}]}
                {...panResponder.panHandlers}
            >
                <View style={{...styles.itemContainer, overflow: 'hidden', position: 'relative'}}>

                    <View style={{backgroundColor: Colors.black}}>

                        {/* card */}
                        <Pressable
                            onPress={() => {
                                router.push({
                                    pathname: "/screens/workout/SingleWorkoutInfoScreen",
                                    params: {id: workout.id}
                                })
                            }}
                        >
                            <View style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "100%",
                                marginBottom: 10,
                            }}>
                                <Text style={styles.itemTitle}>{workout.name}</Text>

                                <Text style={{color: Colors.white, fontSize: 14}}>
                                    {exerciseCount} {exerciseCount === 1 ? 'Übung' : 'Übungen'}
                                </Text>
                            </View>

                        </Pressable>

                        {/* workout starten button */}
                        <Pressable
                            onPress={() => {
                                router.push({
                                    pathname: "/screens/workout/ActiveWorkoutScreen",
                                    params: {id: workout.id}
                                })
                            }}
                            style={({pressed}) => [
                                styles.itemButton,
                                {backgroundColor: pressed ? Colors.secondary : Colors.primary},
                                {borderColor: pressed ? Colors.secondary : Colors.primary}
                            ]}
                        >
                            <Text style={styles.itemButtonText}>Training starten</Text>
                        </Pressable>

                    </View>
                </View>
            </Animated.View>
        </View>
    );
}
