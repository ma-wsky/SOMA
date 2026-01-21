import React, {useEffect, useState } from "react";
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
import { Exercise } from  "@/types/Exercise"
import { ExerciseService } from "@/services/exerciseService";
import { auth } from "@/firebaseConfig";


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

    // Fallback während des Ladens
    const currentExercise = exercise || {
        id: exerciseId,
        name: sets[0]?.exerciseName || "Laden...",
        isOwn: false,
    };

    return (
        <View style={styles.exerciseCard}>
            {/* HEADER BEREICH */}
            <View style={styles.exerciseCardHeader}>
                <View style={styles.picContainer}>
                    <Image
                        source={currentExercise.image ? { uri: currentExercise.image } :
                            (currentExercise.isOwn ? USER_DEFAULT : ADMIN_DEFAULT)}
                        style={styles.itemPicture}
                    />
                </View>
                <Text style={styles.exerciseTitle}>{sets[0].exerciseName}</Text>

                {/* Pausenanzeige (klickbar außer im History Mode) */}
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
            </View>

            {/* TABELLEN HEADER */}
            <View style={styles.setRowHeader}>
                <Text style={styles.setTextHeader}>Satz</Text>
                <Text style={styles.setTextHeader}>Gewicht</Text>
                <Text style={styles.setTextHeader}>Wdh.</Text>
                {(mode === 'history' || (mode === 'active' && !isEditing)) && <Text style={styles.setTextHeader}>Erledigt</Text>}
                {isEditing && <View style={{ width: 50 }} />}
            </View>

            {/* SÄTZE LISTE */}
            {sets.map((set, index) => {
                const globalIndex = props.workout?.exerciseSets.indexOf(set);
                return (
                    <View key={index} style={isEditing ? styles.setEditRow : styles.setRow}>
                        <Text style={styles.setText}>{index + 1}</Text>
                        <Text style={styles.setText}>{set.weight}</Text>
                        <Text style={styles.setText}>{set.reps}</Text>

                        {/* Modus-abhängige Spalte am Ende */}
                        {mode === 'active' && !isEditing && (
                            <Pressable onPress={() => props.onSetCheck(globalIndex, set.breaktime || 30)} style={{ flex: 1 }}>
                                <Ionicons name={set.isDone ? "checkbox" : "checkbox-outline"} size={28} color={set.isDone ? Colors.primary : Colors.black} />
                            </Pressable>
                        )}

                        {mode === 'history' && (
                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                <Ionicons name={set.isDone ? "checkmark-circle" : "ellipse-outline"} size={24} color={set.isDone ? Colors.primary : "#999"} />
                            </View>
                        )}

                        {isEditing && (
                            <View style={{ flexDirection: "row", gap: 15 }}>
                                <Pressable onPress={() => props.onOpenEditSet(globalIndex, set)}>
                                    <Ionicons name="pencil" size={22} color={Colors.black} />
                                </Pressable>
                                <Pressable onPress={() => props.onRemoveSet(globalIndex)}>
                                    <Ionicons name="trash" size={22} color={Colors.black} />
                                </Pressable>
                            </View>
                        )}
                    </View>
                );
            })}

            {/* SATZ HINZUFÜGEN BUTTON */}
            {isEditing && (
                <Pressable onPress={() => props.onOpenAddSet(exerciseId, sets[0].exerciseName)} style={styles.addSetButton}>
                    <Text style={styles.addSetButtonText}>Satz hinzufügen +</Text>
                </Pressable>
            )}
        </View>
    );
};