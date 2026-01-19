import React, {useEffect, useRef, useState } from 'react';
import { View, ScrollView, TextInput, Text, Pressable, Modal, Alert } from 'react-native';
import {useLocalSearchParams, useRouter } from 'expo-router';
import { TopBar } from '@/components/TopBar';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { workoutStyles } from '@/styles/workoutStyles';
import { groupSetsByExercise } from '@/utils/workoutHelpers';
import { Workout } from '@/types/Workout';
import { ExerciseSet } from '@/types/ExerciseSet';
import { Colors } from '@/styles/theme';
import { WorkoutTemplate } from "@/types/WorkoutTemplate";
import { WorkoutService } from "@/services/WorkoutService";
import { auth } from "@/firebaseConfig";
import LoadingOverlay from "@/components/LoadingOverlay";


let temporarySets: ExerciseSet[] = [];
let temporaryName: string = "";

export default function CreateTemplateScreen() {
    const router = useRouter();
    const [name, setName] = useState(temporaryName);
    const [exerciseSets, setExerciseSets] = useState<ExerciseSet[]>(temporarySets);
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState<boolean>(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSet, setEditingSet] = useState<ExerciseSet | null>(null);
    const [tempWeight, setTempWeight] = useState('');
    const [tempReps, setTempReps] = useState('');

    const weightInputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (params.selectedExId) {
            const newExerciseSet: ExerciseSet = {
                id: "temp-" + Date.now(),
                exerciseId: params.selectedExId as string,
                exerciseName: params.selectedExName as string,
                image: params.selectedExImage as string || null,
                weight: 0,
                reps: 0,
                breaktime: 60,
                order: 0,
                isDone: false,
            };

            temporarySets = [...temporarySets, newExerciseSet];
            setExerciseSets(temporarySets);

            //reset params
            router.setParams({
                selectedExId: undefined,
                selectedExName: undefined,
                selectedExImage: undefined
            });
        }
    }, [params.selectedExId]);

    // änderung wenn sich was ändert
    useEffect(() => {
        temporarySets = exerciseSets;
    }, [exerciseSets]);

    useEffect(() => {
        temporaryName = name;
    }, [name]);

    const handleAddSet = (exerciseId: string) => {
        // Finden des letzten Satzes dieser Übung für Standardwerte
        const setsOfEx = exerciseSets.filter(s => s.exerciseId === exerciseId);
        const lastSet = setsOfEx[setsOfEx.length - 1];

        const newSet: ExerciseSet = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            exerciseId: exerciseId,
            exerciseName: lastSet.exerciseName,
            image: lastSet.image,
            weight: lastSet.weight,
            reps: lastSet.reps,
            breaktime: lastSet.breaktime,
            order: exerciseSets.length,
            isDone: false,
        };
        setExerciseSets([...exerciseSets, newSet]);
    };

    const handleRemoveSet = (setId: string)=> {
        setExerciseSets(prev => prev.filter(s => s.id !== setId));
    };

    const openEditModal = (set: ExerciseSet) => {
        setEditingSet(set);
        setTempWeight(set.weight.toString());
        setTempReps(set.reps.toString());
        setIsModalVisible(true);
    };

    const saveEdit = () => {
        if (editingSet){
            setExerciseSets(prev => prev.map(s =>
                s.id === editingSet.id
                ? { ...s, weight: parseFloat(tempWeight) || 0, reps: parseInt(tempReps) || 0}
                : s
            ));
            setIsModalVisible(false);
        }
    }

    const handleExit = () => {
        temporarySets = [];
        temporaryName = "";
        router.replace("/(tabs)/WorkoutScreenProxy");
    }

    const handleSave = async () => {
        // Logik zum Speichern via WorkoutService
        if (!name.trim()){
            Alert.alert("Fehler", "Bitte gib einen Namen an.");
            return;
        }

        if (exerciseSets.length === 0){
            Alert.alert("Fehler", "Bitte gib mindestens eine Übung an.");
            return;
        }

        setLoading(true);
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            await WorkoutService.createTemplate(userId, name.trim(), exerciseSets);

            temporarySets = [];

            router.replace("/(tabs)/WorkoutScreenProxy");
        } catch (er) {
            Alert.alert("Fehler", "Trainingsplan konnte nicht gespeichert werden.")
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={workoutStyles.container}>
            <TopBar
                titleText="Neuer Plan"
                leftButtonText="Abbrechen"
                onLeftPress={handleExit}
                rightButtonText="Speichern"
                onRightPress={handleSave}
            />

            <ScrollView contentContainerStyle={{ padding: 16 }}>

                {/* Name */}
                <View style={workoutStyles.nameInputWrapper}>
                    <Text style={workoutStyles.nameText}>Name des Trainingsplans</Text>

                    <View style={workoutStyles.fieldWrapper}>
                        <TextInput
                            style={workoutStyles.nameInput}
                            placeholder={"z.B. Oberkörper"}
                            value={name}
                            onChangeText={setName}/>
                    </View>
                </View>

                {Object.entries(groupSetsByExercise(exerciseSets)).map(([exId, sets]) => (
                    <ExerciseCard
                        key={exId}
                        exerciseId={exId}
                        sets={sets}
                        isEditMode={true}
                        onAddSet={(id) => handleAddSet(id)}
                        onRemoveSet={(indexInGroup) => handleRemoveSet(sets[indexInGroup].id)}
                        onEditSet={(indexInGroup) => openEditModal(sets[indexInGroup])}
                    />
                ))}

                {/* add new exercise */}
                <Pressable
                    style={workoutStyles.startButton}
                    onPress={() => router.push({
                        pathname: "/screens/exercise/ExerciseScreen",
                        params: { mode: "select" }
                    })}
                >
                    <Text style={workoutStyles.addExerciseButtonText}>+ Übung hinzufügen</Text>

                </Pressable>
            </ScrollView>

            {/* EDIT MODAL */}
            <Modal visible={isModalVisible} transparent animationType="fade">
                <View style={workoutStyles.modalOverlay}>
                    <View style={workoutStyles.modalContent}>
                        <Text style={workoutStyles.modalTitle}>{editingSet?.exerciseName} bearbeiten</Text>

                        <Text style={workoutStyles.label}>Gewicht (kg)</Text>
                        <TextInput
                            style={workoutStyles.modalInput}
                            keyboardType="numeric"
                            value={tempWeight}
                            onChangeText={setTempWeight}
                            //TODO: erstes select bleibt für die eingabe
                            selectTextOnFocus={true}
                        />

                        <Text style={workoutStyles.label}>Wiederholungen</Text>
                        <TextInput
                            style={workoutStyles.modalInput}
                            keyboardType="numeric"
                            value={tempReps}
                            onChangeText={setTempReps}
                            selectTextOnFocus={true}
                        />

                        <View style={workoutStyles.modalButtons}>
                            <Pressable onPress={() => setIsModalVisible(false)} style={workoutStyles.cancelButton}>
                                <Text style={workoutStyles.cancelText}>Abbrechen</Text>
                            </Pressable>
                            <Pressable onPress={saveEdit} style={workoutStyles.saveButton}>
                                <Text style={workoutStyles.confirmText}>Speichern</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Loading Overlay */}
            <LoadingOverlay visible={loading}/>
        </View>
    );
}