// utils/workoutHelpers.ts
import { ExerciseSet } from "@/types/ExerciseSet";

export const groupSetsByExercise = (sets: ExerciseSet[] | undefined) => {
    // Falls sets undefined oder null sind, gib ein leeres Objekt zurück
    if (!sets) return {};

    return sets.reduce((acc, set) => {
        const { exerciseId } = set;
        if (!acc[exerciseId]) {
            acc[exerciseId] = [];
        }
        acc[exerciseId].push(set);
        return acc;
    }, {} as Record<string, ExerciseSet[]>);
};