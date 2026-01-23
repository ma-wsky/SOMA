export type ExerciseSet = {
    id?: string;
    exerciseId: string;
    exerciseName: string;
    name?: string;
    weight: number;
    reps: number;
    isDone?: boolean;
    breaktime?: number;
    restStartedAt?: number;
};

export type Workout = {
    id?: string;
    date: string;
    name?: string;
    exerciseSets: ExerciseSet[];
    startTime?: number;
    duration?: number;
    type?: "template" | "history";
};

export type Exercise = {
    id: string;
    name: string;
    muscleGroup?: string;
};

export type ListItem = { type: "workout"; data: Workout };


export type OverlayTypes = "none" | "breaktime" | "editSet" | "addSet" | "restTimer";
