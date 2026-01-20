type ActiveWorkout = { id?: string | null; startTime?: number; setsCount?: number } | null;

let activeWorkout: ActiveWorkout = null;
const listeners = new Set<(workout: ActiveWorkout) => void>();

export const setActiveWorkout = (val: ActiveWorkout) => {
  activeWorkout = val;
  listeners.forEach(l => l(activeWorkout));
};

export const clearActiveWorkout = () => {
  activeWorkout = null;
  listeners.forEach(l => l(null));
};

export const getActiveWorkout = (): ActiveWorkout => activeWorkout;

export const subscribeToActiveWorkout = (listener: (workout: ActiveWorkout) => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
