import { useState, useRef, useCallback, Dispatch, SetStateAction } from "react";
import type { Workout } from "@/types/workoutTypes";
import { Exercise } from "@/types/Exercise"

export interface BaseWorkoutState {
    workout: Workout | null;
    originalWorkout: Workout | null;
    exercises: Map<string, Exercise>;
    isEditMode: boolean;
    loading: boolean;
}

export interface BaseWorkoutActions {
    setWorkout: Dispatch<SetStateAction<Workout | null>>;
    setOriginalWorkout: Dispatch<SetStateAction<Workout | null>>;
    setExercises: Dispatch<SetStateAction<Map<string, Exercise>>>;
    setIsEditMode: Dispatch<SetStateAction<boolean>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
    setEditIdRef: (id: string) => void;
    handleRemoveSet: (index: number) => void;
    handleCancel: () => void;
    saveBreakTime: (exerciseId: string, newSeconds: number) => void;
    saveSetData: (
        tempSetData: { weight: number; reps: number; isDone?: boolean },
        activeOverlay: string,
        targetSetIndex: number | null,
        targetExerciseId: string | null,
        targetExerciseName: string | null
        ) => void;
    updateWorkoutState: (newWorkout: Workout) => void;
}

export const useBaseWorkoutData = (initialWorkout?: Workout | null): BaseWorkoutState & BaseWorkoutActions => {
    const [workout, setWorkout] = useState<Workout | null>(initialWorkout || null);
    const [originalWorkout, setOriginalWorkout] = useState<Workout | null>(null);
    const [exercises, setExercises] = useState<Map<string, Exercise>>(new Map());
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const editIdRef = useRef<string | null>(null);

    //Syncs EditingStore
    const updateWorkoutState = useCallback((newW: Workout) => {
    setWorkout(newW);
        if (editIdRef.current) {
            require("@/utils/store/workoutEditingStore").setEditingWorkout(editIdRef.current, newW);
        }
    }, []);


    const setEditIdRef = useCallback((id: string) => {
        editIdRef.current = id;
    }, []);


    const handleCancel = useCallback(() => {
        if (originalWorkout) {
            setWorkout(originalWorkout);
            if (editIdRef.current) {
                require("@/utils/store/workoutEditingStore").setEditingWorkout(editIdRef.current, originalWorkout);
            }
        }
    setIsEditMode(false);
    }, [originalWorkout]);

    const handleRemoveSet = useCallback(
        (index: number) => {
            setWorkout((prev) => {
                if (!prev) return null;
                const newSets = prev.exerciseSets.filter((_, i) => i !== index);
                const newWorkout = { ...prev, exerciseSets: newSets };
        
                //Sync
                if (editIdRef.current) {
                    require("@/utils/store/workoutEditingStore").setEditingWorkout(editIdRef.current, newWorkout);
                }
            
                return newWorkout;
            });
        },[]
    );

    const saveBreakTime = useCallback(
        (exerciseId: string, newSeconds: number) => {
            setWorkout((prev) => {
                if (!prev) return null;
                const newSets = prev.exerciseSets.map((s) =>
                    s.exerciseId === exerciseId ? { ...s, breaktime: newSeconds } : s
                );
                const newWorkout = { ...prev, exerciseSets: newSets };
        
                if (editIdRef.current) {
                    require("@/utils/store/workoutEditingStore").setEditingWorkout(editIdRef.current, newWorkout);
                }
        
                return newWorkout;
            });
        },[]
    );


    const saveSetData = useCallback(
        (tempSetData: { weight: number; reps: number; isDone?: boolean },
        activeOverlay: string,
        targetSetIndex: number | null,
        targetExerciseId: string | null,
        targetExerciseName: string | null
        ) => {
        setWorkout((prev) => {
        if (!prev) return null;
        let newSets = [...prev.exerciseSets];

        if (activeOverlay === "editSet" && targetSetIndex !== null) {
            // Bestehender Satz
            newSets[targetSetIndex] = { ...newSets[targetSetIndex], ...tempSetData };
        } else if (activeOverlay === "addSet" && targetExerciseId) {
            // Neuer Satz
            newSets.push({
            id: `set_${Date.now()}`,
            exerciseId: targetExerciseId,
            exerciseName: targetExerciseName || "Unbekannt",
            weight: tempSetData.weight,
            reps: tempSetData.reps,
            isDone: tempSetData.isDone || false,
            breaktime: 30,
            });
        }

        const newWorkout = { ...prev, exerciseSets: newSets };
        
        if (editIdRef.current) {
            require("@/utils/store/workoutEditingStore").setEditingWorkout(editIdRef.current, newWorkout);
        }
        
        return newWorkout;
        });
        },[]
    );

    return {
    workout,
    originalWorkout,
    exercises,
    isEditMode,
    loading,
    setWorkout,
    setOriginalWorkout,
    setExercises,
    setIsEditMode,
    setLoading,
    setEditIdRef,
    handleRemoveSet,
    handleCancel,
    saveBreakTime,
    saveSetData,
    updateWorkoutState,
    };
};
