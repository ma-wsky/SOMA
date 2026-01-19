export type ExerciseSet = {
    id: string;
    exerciseId: string;
    exerciseName: string;
    order: number;
    weight: number;
    reps: number;
    breaktime: number;
    isDone: boolean;
    name?: string;
    image?: string | null;
};