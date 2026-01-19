import { ExerciseSet } from "@/types/ExerciseSet"


export type Workout = {
    id: string;
    name: string;
    date: string;
    duration: number;
    exerciseSets: ExerciseSet[];
};