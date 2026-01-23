type WorkoutDraft = any;
const store: Record<string, WorkoutDraft> = {};

export const setEditingWorkout = (key: string, workout: WorkoutDraft) => {
    if (!key) return;
    store[key] = workout;
};

export const getEditingWorkout = (key: string) => {
    if (!key) return null;
    return store[key] ?? null;
};

export const clearEditingWorkout = (key: string) => {
    if (!key) return;
    delete store[key];
};
