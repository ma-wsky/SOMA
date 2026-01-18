import { TopBar } from "@/components/TopBar";
import { workoutStyles } from "@/styles/workoutStyles";
import { View, Text, FlatList, TextInput, Pressable, ScrollView, Modal } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";
import Ionicons from "@expo/vector-icons/Ionicons";
import { showAlert, showConfirm } from "@/utils/alertHelper";
import { workoutStyles as styles } from "@/styles/workoutStyles";
import { Colors } from "@/styles/theme";
import { minSecToSeconds } from "@/components/NumberStepper";

// Imports for extracted hooks and utils
import type { Workout, ExerciseSet, Exercise } from "@/types/workoutTypes";
import { useOverlayHandlers } from "@/hooks/useOverlayHandlers";
import { useSingleWorkoutData } from "@/hooks/useSingleWorkoutData";
import { useSingleWorkoutLoader } from "@/hooks/useWorkoutLoader";
import { groupSetsByExercise } from "@/utils/workoutExerciseHelper";
import {
  renderSingleCard,
  renderSingleOverlays,
} from "@/utils/renderWorkout";


export default function SingleWorkoutInfoScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const workoutEditId = Array.isArray(params.workoutEditId) ? params.workoutEditId[0] : params.workoutEditId;
  const { selectedExerciseId, selectedExerciseName, selectedBreakTime } = params;

  // Data Management
  const {
    workout,
    exercisesMap,
    isEditMode,
    loading,
    setWorkout,
    setOriginalWorkout,
    setExercisesMap,
    setIsEditMode,
    setLoading,
    setEditIdRef,
    handleRemoveSet,
    handleSaveWorkout,
    saveBreakTime,
    saveSetData,
    handleCancel,
  } = useSingleWorkoutData();

  const isCreateMode = !id && !!workoutEditId;

  // Overlay Management
  const {
    activeOverlay,
    targetSetIndex,
    targetExerciseId,
    targetExerciseName,
    tempSetData,
    tempBreakTime,
    setActiveOverlay,
    setTempSetData,
    setTempBreakTime,
    openBreaktime,
    openEditSet,
    openAddSet,
    closeOverlay,
  } = useOverlayHandlers();

  // Load Workout Data
  useSingleWorkoutLoader({
    id: id as string,
    workoutEditId: workoutEditId as string,
    setWorkout,
    setOriginalWorkout,
    setExercises: setExercisesMap,
    setLoading,
    setEditIdRef,
    isCreateMode,
  });

  // Initialize edit mode for new workouts
  useEffect(() => {
    if (isCreateMode) {
      setIsEditMode(true);
    }
  }, [isCreateMode, setIsEditMode]);

  // Persist workout changes to draft store
  useEffect(() => {
    if (workout && isEditMode && workoutEditId) {
      const editId = Array.isArray(workoutEditId) ? workoutEditId[0] : workoutEditId;
      require("@/utils/workoutEditingStore").setEditingWorkout(editId, workout);
    }
  }, [workout, isEditMode, workoutEditId]);

  // Handle Return from AddExercise
  useEffect(() => {
    if (selectedExerciseId && workout) {
      const foundName = selectedExerciseName || exercisesMap.get(selectedExerciseId as string)?.name || "Unbekannte Übung";

      const newSet: ExerciseSet = {
        id: `set_${Date.now()}`,
        exerciseId: selectedExerciseId as string,
        exerciseName: foundName as string,
        weight: 20,
        reps: 10,
        breaktime: Number(selectedBreakTime) || 30,
        isDone: false,
      };

      const newWorkout = { ...workout, exerciseSets: [...workout.exerciseSets, newSet] };
      setWorkout(newWorkout);
      setIsEditMode(true);

      router.setParams({
        selectedExerciseId: undefined,
        selectedExerciseName: undefined,
        selectedBreakTime: undefined,
        _t: undefined,
      });
    }
  }, [selectedExerciseId, workout, exercisesMap, setWorkout, setIsEditMode]);



  // Save Modal Changes Handler
  const handleSaveModalChanges = useCallback(() => {
    if (activeOverlay === "breaktime" && targetExerciseId) {
      const secs = minSecToSeconds(tempBreakTime.mins, tempBreakTime.secs);
      saveBreakTime(targetExerciseId, secs);
    } else {
      saveSetData(tempSetData, activeOverlay, targetSetIndex, targetExerciseId, targetExerciseName);
    }
    closeOverlay();
  }, [activeOverlay, targetExerciseId, targetSetIndex, targetExerciseName, tempSetData, tempBreakTime, saveBreakTime, saveSetData, closeOverlay]);

  // Add Exercise navigation
  const handleAddExercise = useCallback(() => {
    router.push({
      pathname: "/screens/exercise/AddExerciseToWorkoutScreen",
      params: {
        returnTo: "edit",
        workoutEditId: workoutEditId,
      },
    });
  }, [workoutEditId]);

  // Handle Save Workout
  const handleSaveWorkoutPressed = useCallback(() => {
    handleSaveWorkout(id, (newId) => {
      setIsEditMode(false);
      if (!id && newId) {
        router.setParams({ id: newId });
      }
    });
  }, [id, handleSaveWorkout, setIsEditMode]);

  const handleCancelPressed = useCallback(() => {
    handleCancel();
    // Wenn kein existierendes Workout (keine ID in Params), gehen wir zurück
    if (!id) {
        router.navigate("/(tabs)/WorkoutScreenProxy")
      } else {
      setIsEditMode(false);
    }
  }, [id, handleCancel, setIsEditMode]);

  if (!workout) {
    return (
      <View style={styles.itemContainer}>
        <TopBar leftButtonText="Zurück" onLeftPress={() => router.back()} />
        <LoadingOverlay visible={true} />
      </View>
    );
  }

  const renderProps = {
    workout,
    isEditMode,
    activeOverlay,
    tempBreakTime,
    tempSetData,
    onOpenBreakTime: openBreaktime,
    onOpenEditSet: openEditSet,
    onOpenAddSet: openAddSet,
    onRemoveSet: handleRemoveSet,
    onSaveModalChanges: handleSaveModalChanges,
    onCloseOverlay: closeOverlay,
  };

  return (
    <View style={styles.container}>
      <TopBar
        leftButtonText={isEditMode ? "Abbrechen" : "Zurück"}
        titleText={workout.name || "Training Info"}
        rightButtonText={isEditMode ? "Speichern" : "Bearbeiten"}
        onLeftPress={() => (isEditMode ? handleCancelPressed() : router.navigate("/(tabs)/WorkoutScreenProxy"))}
        onRightPress={() => (isEditMode ? handleSaveWorkoutPressed() : setIsEditMode(true))}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {isEditMode && (
          <View style={{ padding: 16 }}>
            <Text style={{ color: Colors.black, width: 800, marginBottom: 4, fontSize: 24 }}>
              Trainingsname:
            </Text>
            <TextInput
              value={workout.name || ""}
              onChangeText={(t) => setWorkout((prev) => (prev ? { ...prev, name: t } : null))}
              style={{
                backgroundColor: Colors.background,
                color: Colors.black,
                padding: 10,
                borderRadius: 8,
                borderColor: Colors.black,
                borderWidth: 1,
              }}
            />
          </View>
        )}

        {!isEditMode && workout.duration && (
          <View style={{ padding: 12, marginBottom: 16, backgroundColor: Colors.black, borderRadius: 8 }}>
            <Text style={{ color: Colors.white, fontSize: 14, marginBottom: 4 }}>Letzte Dauer:</Text>
            <Text style={{ color: Colors.primary, fontSize: 18, fontWeight: "bold" }}>
              {Math.floor((workout.duration || 0) / 3600)
                .toString()
                .padStart(2, "0")}
              :{Math.floor(((workout.duration || 0) % 3600) / 60)
                .toString()
                .padStart(2, "0")}
              :{((workout.duration || 0) % 60)
                .toString()
                .padStart(2, "0")}
            </Text>
          </View>
        )}

        {Object.entries(groupSetsByExercise(workout.exerciseSets)).map(([exerciseId, sets]) =>
          renderSingleCard(exerciseId, sets, isEditMode, renderProps)
        )}

        {isEditMode && (
          <Pressable onPress={handleAddExercise} style={[styles.addExerciseButton, { marginTop: 20 }]}>
            <Text style={styles.addExerciseButtonText}>Übung hinzufügen +</Text>
          </Pressable>
        )}
      </ScrollView>

      {renderSingleOverlays(renderProps)}
      <LoadingOverlay visible={loading} />
    </View>
  );
}
