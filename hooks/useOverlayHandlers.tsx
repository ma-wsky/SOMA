import { useState } from "react";
import type { ExerciseSet, OverlayTypes } from "@/types/workoutTypes";
import { secondsToMinSec, minSecToSeconds } from "@/components/NumberStepper";

export interface OverlayState {
  activeOverlay: OverlayTypes;
  targetSetIndex: number | null;
  targetExerciseId: string | null;
  targetExerciseName: string | null;
  tempSetData: { weight: number | null; reps: number | null; isDone?: boolean };
  tempBreakTime: { mins: number | null; secs: number | null };
}

export const useOverlayHandlers = () => {
  const [activeOverlay, setActiveOverlay] = useState<OverlayTypes>("none");
  const [targetSetIndex, setTargetSetIndex] = useState<number | null>(null);
  const [targetExerciseId, setTargetExerciseId] = useState<string | null>(null);
  const [targetExerciseName, setTargetExerciseName] = useState<string | null>(null);
  const [tempSetData, setTempSetData] = useState<{ weight: number | null; reps: number | null; isDone?: boolean }>({ weight: null, reps: null, isDone: false });
  const [tempBreakTime, setTempBreakTime] = useState<{ mins: number | null; secs: number | null }>({ mins: null, secs: null });


  const openBreakTimeOverlay = (exerciseId: string, currentSeconds: number) => {
    setTargetExerciseId(exerciseId);
    setTempBreakTime(secondsToMinSec(currentSeconds));
    setActiveOverlay("breaktime");
  };


  const openEditSetOverlay = (index: number, set: ExerciseSet) => {
    setTargetSetIndex(index);
    setTempSetData({ weight: set.weight, reps: set.reps, isDone: !!set.isDone });
    setActiveOverlay("editSet");
  };


  const openAddSetOverlay = (exerciseId: string, exerciseName: string) => {
    setTargetExerciseId(exerciseId);
    setTargetExerciseName(exerciseName);
    setTempSetData({ weight: 20, reps: 10, isDone: false });
    setActiveOverlay("addSet");
  };

  const closeOverlay = () => {
    setActiveOverlay("none");
  };

  const closeRestTimer = () => {
    setActiveOverlay("none");
    require("@/utils/store/restTimerStore").clearRestTimer();
  };

  return {
    activeOverlay,
    targetSetIndex,
    targetExerciseId,
    targetExerciseName,
    tempSetData,
    tempBreakTime,
    setActiveOverlay,
    setTargetSetIndex,
    setTargetExerciseId,
    setTargetExerciseName,
    setTempSetData,
    setTempBreakTime,
    openBreakTimeOverlay,
    openEditSetOverlay,
    openAddSetOverlay,
    closeOverlay,
    closeRestTimer,
  };
};
