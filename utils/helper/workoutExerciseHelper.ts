import type {ExerciseSet} from "@/types/workoutTypes";

export {formatTime, formatTimeShort, formatTimeDynamic} from "@/utils/helper/formatTimeHelper";


export const groupSetsByExercise = (sets: ExerciseSet[]): { [exerciseId: string]: ExerciseSet[] } => {
    const map: { [exerciseId: string]: ExerciseSet[] } = {};
    sets.forEach((set) => {
        if (!map[set.exerciseId]) {
            map[set.exerciseId] = [];
        }
        map[set.exerciseId].push(set);
    });
    return map;
};


export const formatDate = (dateString?: string): string => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
        weekday: "short",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
};
