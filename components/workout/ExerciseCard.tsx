import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { workoutStyles } from '@/styles/workoutStyles';
import { Colors } from '@/styles/theme';
import { ExerciseSet } from '@/types/ExerciseSet';

interface ExerciseCardProps {
    exerciseId: string;
    sets: ExerciseSet[];
    isEditMode?: boolean;
    isActiveMode?: boolean;
    onAddSet?: (exerciseId: string) => void;
    onRemoveSet?: (index: number) => void;
    onEditSet?: (index: number) => void;
    onToggleComplete?: (setId: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
                                                              exerciseId,
                                                              sets,
                                                              isEditMode,
                                                              isActiveMode,
                                                              onAddSet,
                                                              onRemoveSet,
                                                              onEditSet,
                                                              onToggleComplete
                                                          }) => {
    const firstSet = sets[0];

    return (
        <View style={workoutStyles.exerciseCard}>
            <View style={workoutStyles.exerciseCardHeader}>
                <View style={workoutStyles.picWrapper}>
                    <Image
                        source={firstSet.image ? { uri: firstSet.image } : require('@/assets/default-exercise-picture/default-exercise-picture.jpg')}
                        style={workoutStyles.picture}
                    />
                </View>
                <Text style={workoutStyles.exerciseTitle} numberOfLines={1}>
                    {firstSet.exerciseName}
                </Text>

                <View style={workoutStyles.breakTimeBadge}>
                    <Ionicons name="timer-outline" size={14} color={Colors.primary} />
                    <Text style={workoutStyles.breakTimeText}>{firstSet.breaktime || 60}s</Text>
                </View>
            </View>

            <View style={workoutStyles.setRowHeader}>
                <Text style={[workoutStyles.setTextHeader, { flex: 1 }]}>Satz</Text>
                <Text style={[workoutStyles.setTextHeader, { flex: 2 }]}>Gewicht</Text>
                <Text style={[workoutStyles.setTextHeader, { flex: 2 }]}>Wiederh.</Text>
                {isEditMode && <View style={{ width: 30 }} />}
            </View>

            {sets.map((set, index) => (
                <Pressable
                    key={set.id || index}
                    onPress={() => isEditMode && onEditSet?.(index)} // Klick öffnet Modal
                    style={({ pressed }) => [
                        workoutStyles.setRow,
                        pressed && { opacity: 0.7, backgroundColor: '#2c2c2e' } // Optisches Feedback
                    ]}
                >
                    <Text style={[workoutStyles.setText, { flex: 1 }]}>{index + 1}</Text>

                    {/* Diese Texte sind jetzt quasi die Buttons zum Editieren */}
                    <Text style={[workoutStyles.setText, { flex: 2 }]}>{set.weight} kg</Text>
                    <Text style={[workoutStyles.setText, { flex: 2 }]}>{set.reps} Reps</Text>

                    {isEditMode && (
                        <Pressable
                            onPress={() => onRemoveSet?.(index)}
                            style={{ padding: 5 }}
                        >
                            <Ionicons name="trash-outline" size={18} color="#ff4444" />
                        </Pressable>
                    )}

                    {isActiveMode && (
                        <Pressable
                            onPress={() => onToggleComplete?.(set.id)}
                            style={{ width: 40, alignItems: 'center' }}
                            hitSlop={15}
                        >
                            <Ionicons
                                name={set.isDone ? "checkbox" : "square-outline"}
                                size={24}
                                color={set.isDone ? Colors.primary : Colors.secondary}
                            />
                        </Pressable>
                    )}
                </Pressable>
            ))}

            {isEditMode && (
                <Pressable
                    style={workoutStyles.addSetButton}
                    onPress={() => onAddSet?.(exerciseId)}
                >
                    <Text style={workoutStyles.addSetButtonText}>Satz hinzufügen</Text>
                </Pressable>
            )}
        </View>
    );
};