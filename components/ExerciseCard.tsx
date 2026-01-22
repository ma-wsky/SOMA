import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Pressable,
    Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ExerciseSet } from "@/types/workoutTypes";
import { workoutStyles as styles } from "@/styles/workoutStyles";
import { Colors } from "@/styles/theme";
import { Exercise } from "@/types/Exercise";
import { ExerciseService } from "@/services/exerciseService";
import { auth } from "@/firebaseConfig";
import { router } from "expo-router";

type CardMode = 'active' | 'single' | 'history';

interface UniversalCardProps {
    exerciseId: string;
    sets: ExerciseSet[];
    mode: CardMode;
    isEditing?: boolean;
    props: any;
}

export const ExerciseCard = ({ exerciseId, sets, mode, isEditing, props }: UniversalCardProps) => {
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const ADMIN_DEFAULT = require("@/assets/default-exercise-picture/admin.png");
    const USER_DEFAULT = require("@/assets/default-exercise-picture/users.png");

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;
            const data = await ExerciseService.fetchExercise(exerciseId, uid);
            if (isMounted) setExercise(data);
        };
        load();
        return () => { isMounted = false; };
    }, [exerciseId]);

    const currentExercise = exercise || {
        id: exerciseId,
        name: sets[0]?.exerciseName || "Laden...",
        isOwn: false,
        image: undefined,
    };

    const hasAction = (mode === 'history' || mode === 'active' || isEditing);

    const colStyles = {
        satz: { flex: 1, minWidth: 30, textAlign: 'center' as const },
        gewicht: { flex: 2, minWidth: 25, textAlign: 'center' as const },
        reps: { flex: 1.5, minWidth: 25, textAlign: 'center' as const },
        action: { flex: isEditing ? 2.5 : 1.5, minWidth: hasAction ? 60 : 0, alignItems: 'center' as const, justifyContent: 'center' as const }
    };

    const headerTextStyle = [styles.setTextHeader, { fontSize: 13 }];

    return (
        <View style={styles.exerciseCard}>
            {/* header */}
            <Pressable
                style={styles.exerciseCardHeader}
                onPress={() => router.push({
                    pathname: "/screens/exercise/SingleExerciseInfoScreen",
                    params: { id: currentExercise.id }
                })}
            >
                <View style={styles.picContainer}>
                    <Image
                        source={currentExercise.image? { uri: currentExercise.image } :
                            (currentExercise.isOwn ? USER_DEFAULT : ADMIN_DEFAULT)}
                        style={styles.itemPicture}
                    />
                </View>
                <Text style={styles.exerciseTitle}>{sets[0].exerciseName}</Text>

                <Pressable
                    onPress={() => mode !== 'history' && props.onOpenBreakTime?.(exerciseId, sets[0].breaktime || 30)}
                    disabled={mode === 'history' || (mode === 'single' && !isEditing)}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", padding: 8 }}>
                        <Ionicons name="alarm-outline" size={20} color={Colors.primary} />
                        <Text style={{ color: Colors.primary, marginLeft: 4, fontSize: 12 }}>
                            {sets[0].breaktime || 30}s
                        </Text>
                    </View>
                </Pressable>
            </Pressable>

            {/* tabellen header */}
            <View style={[styles.setRowHeader, { flexDirection: 'row', paddingHorizontal: 10 }]}>
                <Text numberOfLines={1} style={[headerTextStyle, colStyles.satz, {textAlign: "left"}]}>Satz</Text>
                <Text numberOfLines={1} style={[headerTextStyle, colStyles.gewicht]}>Gew.</Text>
                <Text numberOfLines={1} style={[headerTextStyle, colStyles.reps]}>Wdh.</Text>
                {hasAction && (
                    <Text numberOfLines={1}
                        style={[headerTextStyle, colStyles.action, { textAlign: "right", paddingRight: 15 }]}>
                        {isEditing ? "Aktion" : "Status"}
                    </Text>
                )}
            </View>

            {/* sets */}
            {sets.map((set, index) => {
                const globalIndex = props.workout?.exerciseSets.indexOf(set);
                return (
                    <View
                        key={index}
                        style={[
                            isEditing ? styles.setEditRow : styles.setRow,
                            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }
                        ]}
                    >
                        <Text style={[styles.setText, colStyles.satz]}>{index + 1}</Text>
                        <Text style={[styles.setText, colStyles.gewicht]}>{set.weight}</Text>
                        <Text style={[styles.setText, colStyles.reps]}>{set.reps}</Text>

                        {hasAction && (
                            <View style={colStyles.action}>
                                {mode === 'active' && !isEditing && (
                                    <Pressable onPress={() => props.onSetCheck(globalIndex, set.breaktime || 30)}>
                                        <Ionicons
                                            name={set.isDone ? "checkbox" : "checkbox-outline"}
                                            size={28}
                                            color={set.isDone ? Colors.primary : Colors.black}
                                        />
                                    </Pressable>
                                )}

                                {mode === 'history' && (
                                    <Ionicons
                                        name={set.isDone ? "checkmark-circle" : "ellipse-outline"}
                                        size={24}
                                        color={set.isDone ? Colors.primary : "#999"}
                                    />
                                )}

                                {isEditing && (
                                    <View style={{ flexDirection: "row", gap: 15, justifyContent: 'center', width: '100%' }}>
                                        <Pressable onPress={() => props.onOpenEditSet(globalIndex, set)}>
                                            <Ionicons name="pencil" size={22} color={Colors.black} />
                                        </Pressable>
                                        <Pressable onPress={() => props.onRemoveSet(globalIndex)}>
                                            <Ionicons name="trash" size={22} color={Colors.black} />
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                );
            })}

            {isEditing && (
                <Pressable onPress={() => props.onOpenAddSet(exerciseId, sets[0].exerciseName)} style={styles.addSetButton}>
                    <Text style={styles.addSetButtonText}>Satz hinzufügen +</Text>
                </Pressable>
            )}
        </View>
    );
};