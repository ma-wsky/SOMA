import {
  View,
  Text,
  BackHandler
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { workoutStyles as styles } from "@/styles/workoutStyles";
import LoadingOverlay from "@/components/LoadingOverlay";
import { TopBar } from "@/components/TopBar";
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { minSecToSeconds } from "@/components/NumberStepper";
import { vibrate } from "@/utils/helper/vibrationHelper";

import type { Workout, ExerciseSet } from "@/types/workoutTypes";
import { useOverlayHandlers } from "@/hooks/useOverlayHandlers";
import { useWorkoutTimer, useRestTimer } from "@/hooks/useWorkoutTimer";
import { useActiveWorkoutData } from "@/hooks/useActiveWorkoutData";
import { useWorkoutLoader } from "@/hooks/useWorkoutLoader";
import {
  renderActiveViewMode,
  renderActiveEditMode,
  renderActiveOverlays,
  renderActiveRestTimerBar,
} from "@/utils/renderWorkout";
import { setActiveWorkout } from "@/utils/store/activeWorkoutStore";
import { formatTime, formatTimeShort } from "@/utils/helper/formatTimeHelper";

export default function ActiveWorkoutScreen() {
  const { id, selectedExerciseId, selectedExerciseName, workoutEditId, selectedBreakTime } = useLocalSearchParams();
  
  const {
    workout,
    exercises,
    isEditMode,
    loading,
    setWorkout,
    setOriginalWorkout,
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
    handleCancel,
  } = useActiveWorkoutData();

  const { elapsedTime, timerRef } = useWorkoutTimer(workout?.id);
  const { restTimeRemaining, restTimerRef, startRestTimer, stopRestTimer } = useRestTimer();
  
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

  useWorkoutLoader({
    id: id as string,
    workoutEditId: workoutEditId as string,
    setWorkout,
    setOriginalWorkout,
    setExercises,
    setLoading,
    setEditIdRef,
  });
  


  useEffect(() => {
    if (workout && isEditMode && workoutEditId) {
      require("@/utils/store/workoutEditingStore").setEditingWorkout(workoutEditId as string, workout);
    }
  }, [workout, isEditMode, workoutEditId]);

  // Handle Return (AddExercise)
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



  // Back Handler
  useEffect(() => {
    const onBackPress = () => {
      router.navigate("/(tabs)/HomeScreenProxy");
      
      setActiveWorkout({
          id: workout?.id ?? null,
          startTime: workout?.startTime ?? Date.now(),
          setsCount: workout?.exerciseSets.length ?? 0,
      });

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandler.remove();
  }, [workout]);



  const [isMinimized, setIsMinimized] = useState(false);
  // Memoize snapPoints to prevent re-renders
  const snapPoints = useMemo(() => ["99%"], []);
  

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        setIsMinimized(true);
        try {
          router.navigate("/(tabs)/HomeScreenProxy");
        } catch (e) {
          console.warn('Navigation failed', e);
        }
        
        setActiveWorkout({
          id: workout?.id ?? null,
          startTime: workout?.startTime ?? Date.now(),
          setsCount: workout?.exerciseSets.length ?? 0,
        });
      } else {
        setIsMinimized(false);
      }
    },
    [workout]
  );

  const handleSetCheckWithTimer = useCallback(
    (setIndex: number, breaktime: number) => {
      vibrate(50);
      handleSetCheck(setIndex);
      if (workout?.exerciseSets[setIndex].isDone === false && breaktime > 0) {
        startRestTimer(breaktime);
      }
    },
    [workout, handleSetCheck, startRestTimer]
  );

  const handleSaveModalChanges = useCallback(() => {
    if (activeOverlay === "breaktime" && targetExerciseId) {
      const secs = minSecToSeconds(tempBreakTime.mins, tempBreakTime.secs);
      saveBreakTime(targetExerciseId, secs);
    } else {
      saveSetData(tempSetData, activeOverlay, targetSetIndex, targetExerciseId, targetExerciseName);
    }
    closeOverlay();
  }, [activeOverlay, targetExerciseId, targetSetIndex, targetExerciseName, tempSetData, tempBreakTime, saveBreakTime, saveSetData, closeOverlay]);

  const handleSaveChangesWithTimer = useCallback(() => {
    handleSaveChanges(elapsedTime);
  }, [elapsedTime, handleSaveChanges]);

  const handleAddExercise = useCallback(() => {
    if (!workout) return;
    
    const idToUse = (workoutEditId as string) || workout.id || `active_temp_${Date.now()}`;
    require("@/utils/store/workoutEditingStore").setEditingWorkout(idToUse, workout);
    setEditIdRef(idToUse);

    router.push({
      pathname: "/screens/exercise/AddExerciseToWorkoutScreen",
      params: { returnTo: "active", workoutEditId: idToUse },
    });
  }, [workout, workoutEditId, setEditIdRef]);

  
  const timerString = activeOverlay === 'restTimer'
    ? `  Pausenzeit\n${formatTimeShort(restTimeRemaining)}`
    : `  Dauer\n${formatTime(elapsedTime)}`;

  const renderProps = useMemo(() => ({
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
    onEditModeToggle: (enabled: boolean) => {
      if (enabled && workout) setOriginalWorkout(workout);
      setIsEditMode(enabled);
    },
    onAddExercise: handleAddExercise,
    onSaveModalChanges: handleSaveModalChanges,
    onCloseOverlay: closeOverlay,
    onRestTimerClose: stopRestTimer,
    onWorkoutNameChange: (name: string) => setWorkout((prev) => prev ? { ...prev, name } : null),
    // Neue Setter für Overlay-Daten
    onSetTempSetData: setTempSetData,
    onSetTempBreakTime: setTempBreakTime,
    isFromActiveWorkout: true,
  }), [workout, isEditMode, activeOverlay, restTimeRemaining, tempBreakTime, tempSetData, 
    openBreakTimeOverlay, openEditSetOverlay, openAddSetOverlay, 
    handleSetCheckWithTimer, handleRemoveSet, handleAddExercise, handleSaveModalChanges, 
    closeOverlay, stopRestTimer, setOriginalWorkout, setWorkout, setTempSetData, setTempBreakTime]);


  if (!workout) {
    return (
      <GestureHandlerRootView style={styles.sheetContainer}>
        <BottomSheet snapPoints={snapPoints} enablePanDownToClose={true}>
          <BottomSheetView style={styles.sheetContainerContent}>
            <LoadingOverlay visible={loading} />
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.sheetContainer}>
      <BottomSheet
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
      >
        
          <BottomSheetView style={styles.sheetContainerContent}>
          <TopBar
            leftButtonText={isEditMode ? "Abbrechen" : "Verwerfen"}
            titleText={isEditMode ? "Training bearbeiten" : timerString}
            rightButtonText={isEditMode ? "Speichern" : "Fertig"}
            onLeftPress={() => (isEditMode ? handleCancel() : handleDiscardWorkout())}
            onRightPress={() => (isEditMode ? handleSaveChangesWithTimer() : handleFinishWorkout())}
          />
          

          {isEditMode ? renderActiveEditMode(renderProps as any) : renderActiveViewMode(renderProps as any)}
          <LoadingOverlay visible={loading} />
          {renderActiveOverlays(renderProps as any)}
          {renderActiveRestTimerBar(restTimeRemaining, stopRestTimer)}


        </BottomSheetView>
          
      </BottomSheet>
    </GestureHandlerRootView>
  );
}
