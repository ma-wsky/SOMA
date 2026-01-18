type ActiveWorkout = { id?: string | null; startTime?: number; setsCount?: number } | null;

let activeWorkout: ActiveWorkout = null;

export const setActiveWorkout = (val: ActiveWorkout) => {
  activeWorkout = val;
};

export const clearActiveWorkout = () => {
  activeWorkout = null;
};

export const getActiveWorkout = (): ActiveWorkout => activeWorkout;
