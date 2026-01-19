import { ExerciseSet } from "@/types/ExerciseSet"

export type WorkoutTemplate = {
    id: string;
    name: string;
    exerciseSets?: ExerciseSet[];
    createdAt?: string;
}