import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { workoutStyles as styles } from "@/styles/workoutStyles";
import LoadingOverlay from "@/components/LoadingOverlay";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TopBar } from "@/components/TopBar";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { minSecToSeconds } from "@/components/NumberStepper";
import { Colors } from "@/styles/theme";

// Imports for extracted hooks and utils
import type { Workout, ExerciseSet, Exercise } from "@/types/workoutTypes";
import { useOverlayHandlers } from "@/hooks/useOverlayHandlers";
import { useWorkoutTimer, useRestTimer } from "@/hooks/useWorkoutTimer";
import { useActiveWorkoutData } from "@/hooks/useActiveWorkoutData";
import { useWorkoutLoader } from "@/hooks/useWorkoutLoader";
import { groupSetsByExercise } from "@/utils/workoutExerciseHelper";
import {
  renderActiveViewMode,
  renderActiveEditMode,
  renderActiveOverlays,
  renderActiveRestTimerBar,
} from "@/utils/renderWorkout";
import { setActiveWorkout, clearActiveWorkout } from "@/utils/activeWorkoutStore";

export default function ActiveWorkoutScreen() {
  const { id, selectedExerciseId, selectedExerciseName, workoutEditId, selectedBreakTime } = useLocalSearchParams();
  
  // Data Management
  const {
    workout,
    exercises,
    isEditMode,
    loading,
    setWorkout,
    setExercises,
    setIsEditMode,
    setLoading,
    setEditIdRef,
    handleSetCheck,
    handleRemoveSet,
    handleDiscardWorkout,
    handleFinishWorkout,
    saveWorkoutToDatabase,
    handleSaveChanges,
    saveBreakTime,
    saveSetData,
  } = useActiveWorkoutData();

  // Timer Management
  const { elapsedTime, timerRef } = useWorkoutTimer(workout?.id);
  const { restTimeRemaining, restTimerRef, startRestTimer, stopRestTimer } = useRestTimer();

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
    openBreakTimeOverlay,
    openEditSetOverlay,
    openAddSetOverlay,
    closeOverlay,
  } = useOverlayHandlers();

  // Load Workout Data
  useWorkoutLoader({
    id: id as string,
    workoutEditId: workoutEditId as string,
    setWorkout,
    setExercises,
    setLoading,
    setEditIdRef,
  });
  


  // Handle Return from AddExercise
  useEffect(() => {
    if (selectedExerciseId && workout) {
      const foundName = selectedExerciseName || exercises.get(selectedExerciseId as string)?.name || "Unbekannte Übung";

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
      });
    }
  }, [selectedExerciseId, workout, exercises, setWorkout, setIsEditMode]);



  // Bottom Sheet Management
  const snapPoints = ['99%'];
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        setIsMinimized(true);
        try {
          router.push({
            pathname: '/(tabs)/HomeScreenProxy',
            params: {
              activeOverlayWorkout: JSON.stringify({
                id: workout?.id ?? null,
                setsCount: workout?.exerciseSets.length ?? 0,
                startTime: workout?.startTime ?? Date.now(),
              }),
            },
          });
        } catch (e) {
          console.warn('Navigation to home failed', e);
        }
        setActiveWorkout({
          id: workout?.id ?? null,
          startTime: workout?.startTime ?? Date.now(),
          setsCount: workout?.exerciseSets.length ?? 0,
        });
      } else {
        setIsMinimized(false);
        clearActiveWorkout();
      }
    },
    [workout]
  );

  // Handle Set Check - Enhanced with rest timer
  const handleSetCheckWithTimer = useCallback(
    (setIndex: number, breaktime: number) => {
      handleSetCheck(setIndex);
      if (workout?.exerciseSets[setIndex].isDone === false && breaktime > 0) {
        startRestTimer(breaktime);
      }
    },
    [workout, handleSetCheck, startRestTimer]
  );

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

  // Handle Save Changes with Timer
  const handleSaveChangesWithTimer = useCallback(() => {
    handleSaveChanges(elapsedTime);
  }, [elapsedTime, handleSaveChanges]);

  // Navigate to Add Exercise
  const handleAddExercise = useCallback(() => {
    router.push({
      pathname: "/screens/exercise/AddExerciseToWorkoutScreen",
      params: { returnTo: "active", workoutEditId },
    });
  }, [workoutEditId]);

  if (!workout) {
    return (
      <GestureHandlerRootView style={styles.sheetContainer}>
        <BottomSheet snapPoints={['99%']} enablePanDownToClose={true}>
          <BottomSheetView style={styles.sheetContainerContent}>
            <Text>Workout wird geladen...</Text>
            <LoadingOverlay visible={loading} />
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    );
  }

  const timerString = activeOverlay === 'restTimer'
    ? `  Pausenzeit\n${Math.floor(restTimeRemaining / 60)}:${(restTimeRemaining % 60).toString().padStart(2, '0')}`
    : `  Dauer\n${Math.floor(elapsedTime / 3600).toString().padStart(2, '0')}:${Math.floor((elapsedTime % 3600) / 60).toString().padStart(2, '0')}:${(elapsedTime % 60).toString().padStart(2, '0')}`;

  const renderProps = {
    workout,
    isEditMode,
    activeOverlay,
    restTimeRemaining,
    tempBreakTime,
    tempSetData,
    onOpenBreakTime: openBreakTimeOverlay,
    onOpenEditSet: openEditSetOverlay,
    onOpenAddSet: openAddSetOverlay,
    onSetCheck: handleSetCheckWithTimer,
    onRemoveSet: handleRemoveSet,
    onEditModeToggle: setIsEditMode,
    onAddExercise: handleAddExercise,
    onSaveModalChanges: handleSaveModalChanges,
    onCloseOverlay: closeOverlay,
    onRestTimerClose: stopRestTimer,
    onWorkoutNameChange: (name: string) => setWorkout((prev) => prev ? { ...prev, name } : null),
  };

  return (
    <GestureHandlerRootView style={styles.sheetContainer}>
      <BottomSheet
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
      >
        <BottomSheetView style={styles.sheetContainerContent}>
          <TopBar
            leftButtonText={isEditMode ? "Abbrechen" : "Verwerfen"}
            titleText={isEditMode ? "Training bearbeiten" : timerString}
            rightButtonText={isEditMode ? "Speichern" : "Fertig"}
            onLeftPress={() => (isEditMode ? setIsEditMode(false) : handleDiscardWorkout())}
            onRightPress={() => (isEditMode ? handleSaveChangesWithTimer() : handleFinishWorkout())}
          />

          {isEditMode ? renderActiveEditMode(renderProps) : renderActiveViewMode(renderProps)}
          <LoadingOverlay visible={loading} />
          {renderActiveOverlays(renderProps)}
          {renderActiveRestTimerBar(restTimeRemaining, stopRestTimer)}
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}
